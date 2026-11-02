import { Customer, Transaction, StoreConfig, BackupData } from './types';

const DB_NAME = 'DaftarGazaDB';
const DB_VERSION = 1;

// Default initial store profile
export const DEFAULT_STORE_CONFIG: StoreConfig = {
  id: 'CURRENT_STORE',
  storeName: 'سوبرماركت الأمل',
  ownerName: 'أبو خليل',
  phone: '0599123456',
  location: 'غزة - دير البلح (شارع النخيل)',
  currency: '₪',
  pinCode: '0000',
  isPinLocked: false,
  receiptFooter: 'شكراً لثقتكم - سجل مالي معتمد وغير قابل للتعديل',
};

// Initial seed customers for a fresh store setup
export const INITIAL_SEED_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'أحمد خليل الرنتيسي',
    phone: '0599123456',
    balance: 145,
    debtCeiling: 500,
    notes: 'زبون دائم - سداد شهري',
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 3600000 * 2,
  },
  {
    id: 'cust-2',
    name: 'محمد يوسف النجار',
    phone: '0568987654',
    balance: 35,
    debtCeiling: 300,
    notes: 'حي البركة',
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 3600000 * 5,
  },
  {
    id: 'cust-3',
    name: 'خالد عبد الرحمن (الجار)',
    phone: '0597112233',
    balance: 420,
    debtCeiling: 400,
    notes: 'متأخر أسبوعين - تم الاتصال',
    createdAt: Date.now() - 86400000 * 12,
    updatedAt: Date.now() - 86400000 * 1,
  },
];

export const INITIAL_SEED_TRANSACTIONS: Transaction[] = [
  {
    id: 'TX-101',
    customerId: 'cust-1',
    customerName: 'أحمد خليل الرنتيسي',
    customerPhone: '0599123456',
    amount: 145,
    type: 'DEBT',
    details: 'شراء مواد تموينية، طحين وسكر',
    timestamp: Date.now() - 3600000 * 2,
    previousBalance: 0,
    newBalance: 145,
    previousHash: 'GENESIS_BLOCK_0000000000000000',
    hash: '0x8f4c1e2a89c47e8b912a',
    status: 'CONFIRMED',
  },
  {
    id: 'TX-102',
    customerId: 'cust-2',
    customerName: 'محمد يوسف النجار',
    customerPhone: '0568987654',
    amount: 35,
    type: 'DEBT',
    details: 'شراء زيت نباتي وبيض',
    timestamp: Date.now() - 3600000 * 5,
    previousBalance: 0,
    newBalance: 35,
    previousHash: '0x8f4c1e2a89c47e8b912a',
    hash: '0x3a9d5e1b72c91a4f890c',
    status: 'CONFIRMED',
  },
  {
    id: 'TX-103',
    customerId: 'cust-3',
    customerName: 'خالد عبد الرحمن (الجار)',
    customerPhone: '0597112233',
    amount: 420,
    type: 'DEBT',
    details: 'شراء كرتونة تونة وجبنة معلبة',
    timestamp: Date.now() - 86400000 * 1,
    previousBalance: 0,
    newBalance: 420,
    previousHash: '0x3a9d5e1b72c91a4f890c',
    hash: '0x7e1a9c3d4f8b2e5a610d',
    status: 'CONFIRMED',
  },
];

class DaftarDatabase {
  private db: IDBDatabase | null = null;
  private listeners: Set<() => void> = new Set();
  private isInitializing: Promise<IDBDatabase> | null = null;

  public subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.error('Error executing DB listener:', e);
      }
    });
  }

  public async getDb(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    if (this.isInitializing) return this.isInitializing;

    this.isInitializing = new Promise<IDBDatabase>((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB is not available in this environment'));
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store config table
        if (!db.objectStoreNames.contains('storeConfig')) {
          db.createObjectStore('storeConfig', { keyPath: 'id' });
        }

        // Customers table
        if (!db.objectStoreNames.contains('customers')) {
          const custStore = db.createObjectStore('customers', { keyPath: 'id' });
          custStore.createIndex('phone', 'phone', { unique: false });
          custStore.createIndex('name', 'name', { unique: false });
          custStore.createIndex('balance', 'balance', { unique: false });
        }

        // Transactions table
        if (!db.objectStoreNames.contains('transactions')) {
          const txStore = db.createObjectStore('transactions', { keyPath: 'id' });
          txStore.createIndex('customerId', 'customerId', { unique: false });
          txStore.createIndex('timestamp', 'timestamp', { unique: false });
          txStore.createIndex('type', 'type', { unique: false });
        }
      };

      request.onsuccess = async (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        await this.seedInitialDataIfEmpty(this.db);
        resolve(this.db);
      };

      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };
    });

    return this.isInitializing;
  }

  private async seedInitialDataIfEmpty(db: IDBDatabase): Promise<void> {
    return new Promise((resolve) => {
      const tx = db.transaction(['storeConfig', 'customers', 'transactions'], 'readwrite');
      const storeConfigStore = tx.objectStore('storeConfig');
      const configReq = storeConfigStore.get('CURRENT_STORE');

      configReq.onsuccess = () => {
        if (!configReq.result) {
          storeConfigStore.put(DEFAULT_STORE_CONFIG);
          const custStore = tx.objectStore('customers');
          INITIAL_SEED_CUSTOMERS.forEach((c) => custStore.put(c));
          const txStore = tx.objectStore('transactions');
          INITIAL_SEED_TRANSACTIONS.forEach((t) => txStore.put(t));
        }
      };

      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve(); // Non-blocking
    });
  }

  // Store Configuration
  public async getStoreConfig(): Promise<StoreConfig> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('storeConfig', 'readonly');
      const req = tx.objectStore('storeConfig').get('CURRENT_STORE');
      req.onsuccess = () => resolve(req.result || DEFAULT_STORE_CONFIG);
      req.onerror = () => reject(req.error);
    });
  }

  public async updateStoreConfig(config: Partial<StoreConfig>): Promise<StoreConfig> {
    const db = await this.getDb();
    const current = await this.getStoreConfig();
    const updated: StoreConfig = { ...current, ...config, id: 'CURRENT_STORE' };

    return new Promise((resolve, reject) => {
      const tx = db.transaction('storeConfig', 'readwrite');
      const req = tx.objectStore('storeConfig').put(updated);
      req.onsuccess = () => {
        this.notify();
        resolve(updated);
      };
      req.onerror = () => reject(req.error);
    });
  }

  // Customers
  public async getAllCustomers(): Promise<Customer[]> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('customers', 'readonly');
      const req = tx.objectStore('customers').getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  public async getCustomerById(id: string): Promise<Customer | null> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('customers', 'readonly');
      const req = tx.objectStore('customers').get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  public async saveCustomer(customer: Customer): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('customers', 'readwrite');
      const req = tx.objectStore('customers').put(customer);
      req.onsuccess = () => {
        this.notify();
        resolve();
      };
      req.onerror = () => reject(req.error);
    });
  }

  public async deleteCustomer(id: string): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['customers', 'transactions'], 'readwrite');
      tx.objectStore('customers').delete(id);

      // Clean up customer transactions
      const txStore = tx.objectStore('transactions');
      const index = txStore.index('customerId');
      const req = index.getAllKeys(id);
      req.onsuccess = () => {
        const keys = req.result;
        keys.forEach((k) => txStore.delete(k));
      };

      tx.oncomplete = () => {
        this.notify();
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  }

  // Transactions
  public async getAllTransactions(): Promise<Transaction[]> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('transactions', 'readonly');
      const req = tx.objectStore('transactions').getAll();
      req.onsuccess = () => {
        const list = req.result || [];
        list.sort((a: Transaction, b: Transaction) => b.timestamp - a.timestamp);
        resolve(list);
      };
      req.onerror = () => reject(req.error);
    });
  }

  public async getTransactionsForCustomer(customerId: string): Promise<Transaction[]> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('transactions', 'readonly');
      const index = tx.objectStore('transactions').index('customerId');
      const req = index.getAll(customerId);
      req.onsuccess = () => {
        const list = req.result || [];
        list.sort((a: Transaction, b: Transaction) => b.timestamp - a.timestamp);
        resolve(list);
      };
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Atomically records a transaction and updates the customer's balance.
   */
  public async recordTransaction(
    params: {
      customerId: string;
      amount: number;
      type: 'DEBT' | 'REPAYMENT';
      details: string;
    }
  ): Promise<Transaction> {
    const db = await this.getDb();
    const customer = await this.getCustomerById(params.customerId);
    if (!customer) {
      throw new Error('الزبون غير موجود في قاعدة البيانات');
    }

    if (params.amount <= 0) {
      throw new Error('مبلغ العملية يجب أن يكون أكبر من صفر');
    }

    if (params.type === 'REPAYMENT' && params.amount > customer.balance) {
      throw new Error(`مبلغ السداد (${params.amount} ₪) يتجاوز إجمالي الدين (${customer.balance} ₪)`);
    }

    const previousBalance = customer.balance;
    const newBalance =
      params.type === 'DEBT'
        ? previousBalance + params.amount
        : Math.max(0, previousBalance - params.amount);

    // Get last transaction for hash chain linking
    const allTx = await this.getAllTransactions();
    const lastTx = allTx[0];
    const previousHash = lastTx ? lastTx.hash : 'GENESIS_BLOCK_0000000000000000';

    // Simple robust hash calculation for audit trail
    const payload = `${params.customerId}:${params.amount}:${params.type}:${Date.now()}:${previousHash}`;
    let hashNum = 0;
    for (let i = 0; i < payload.length; i++) {
      hashNum = (hashNum << 5) - hashNum + payload.charCodeAt(i);
      hashNum |= 0;
    }
    const hash = `0x${Math.abs(hashNum).toString(16).padStart(8, '0')}${Date.now().toString(16).slice(-6)}`;

    const newTx: Transaction = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      amount: params.amount,
      type: params.type,
      details: params.details || (params.type === 'REPAYMENT' ? 'سداد دفعة نقدية كاش' : 'شراء بضاعة على الحساب'),
      timestamp: Date.now(),
      previousBalance,
      newBalance,
      previousHash,
      hash,
      status: 'CONFIRMED',
    };

    // Update customer in same transaction
    customer.balance = newBalance;
    customer.updatedAt = Date.now();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(['customers', 'transactions'], 'readwrite');
      tx.objectStore('customers').put(customer);
      tx.objectStore('transactions').put(newTx);

      tx.oncomplete = () => {
        this.notify();
        resolve(newTx);
      };
      tx.onerror = () => reject(tx.error);
    });
  }

  // Backup & Restore
  public async exportBackup(): Promise<string> {
    const config = await this.getStoreConfig();
    const customers = await this.getAllCustomers();
    const transactions = await this.getAllTransactions();

    const backup: BackupData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      storeConfig: config,
      customers,
      transactions,
    };

    return JSON.stringify(backup, null, 2);
  }

  public async importBackup(jsonString: string): Promise<boolean> {
    try {
      const data: BackupData = JSON.parse(jsonString);
      if (!data.customers || !Array.isArray(data.customers)) {
        throw new Error('ملف النسخة الاحتياطية غير صالح أو تالف');
      }

      const db = await this.getDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(['storeConfig', 'customers', 'transactions'], 'readwrite');
        
        // Clear old data
        tx.objectStore('customers').clear();
        tx.objectStore('transactions').clear();

        // Restore config
        if (data.storeConfig) {
          tx.objectStore('storeConfig').put(data.storeConfig);
        }

        // Restore customers
        const custStore = tx.objectStore('customers');
        data.customers.forEach((c) => custStore.put(c));

        // Restore transactions
        const txStore = tx.objectStore('transactions');
        if (Array.isArray(data.transactions)) {
          data.transactions.forEach((t) => txStore.put(t));
        }

        tx.oncomplete = () => {
          this.notify();
          resolve(true);
        };
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      console.error('Backup import error:', e);
      throw e;
    }
  }

  // Reset entire database to factory settings
  public async resetFactory(): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['storeConfig', 'customers', 'transactions'], 'readwrite');
      tx.objectStore('storeConfig').clear();
      tx.objectStore('customers').clear();
      tx.objectStore('transactions').clear();

      tx.objectStore('storeConfig').put(DEFAULT_STORE_CONFIG);
      INITIAL_SEED_CUSTOMERS.forEach((c) => tx.objectStore('customers').put(c));
      INITIAL_SEED_TRANSACTIONS.forEach((t) => tx.objectStore('transactions').put(t));

      tx.oncomplete = () => {
        this.notify();
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  }
}

export const daftarDb = new DaftarDatabase();
