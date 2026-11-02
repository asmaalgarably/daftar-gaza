export interface Customer {
  id: string;
  name: string;
  phone: string;
  balance: number;
  debtCeiling: number;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Transaction {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  type: 'DEBT' | 'REPAYMENT';
  details: string;
  timestamp: number;
  previousBalance: number;
  newBalance: number;
  previousHash: string;
  hash: string;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
}

export interface StoreConfig {
  id: string; // 'CURRENT_STORE'
  storeName: string;
  ownerName: string;
  phone: string;
  location: string;
  currency: string;
  receiptFooter: string;
}

export interface BackupData {
  version: number;
  exportedAt: string;
  storeConfig: StoreConfig;
  customers: Customer[];
  transactions: Transaction[];
}
