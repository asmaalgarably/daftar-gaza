import { useState, useEffect, useCallback } from 'react';
import { daftarDb, DEFAULT_STORE_CONFIG } from './indexedDB';
import { Customer, Transaction, StoreConfig } from './types';

export function useDaftarDb() {
  const [isReady, setIsReady] = useState(false);
  const [storeConfig, setStoreConfig] = useState<StoreConfig>(DEFAULT_STORE_CONFIG);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [cfg, custs, txs] = await Promise.all([
        daftarDb.getStoreConfig(),
        daftarDb.getAllCustomers(),
        daftarDb.getAllTransactions(),
      ]);
      setStoreConfig(cfg);
      setCustomers(custs);
      setTransactions(txs);
      setError(null);
    } catch (err: unknown) {
      console.error('Error refreshing Daftar DB:', err);
      const message = err instanceof Error ? err.message : 'خطأ في تحميل قاعدة البيانات';
      setError(message);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        await refresh();
        if (mounted) setIsReady(true);
      } catch (err: unknown) {
        if (mounted) {
          const message = err instanceof Error ? err.message : 'خطأ في تهيئة قاعدة البيانات';
          setError(message);
        }
      }
    }

    init();

    const unsubscribe = daftarDb.subscribe(() => {
      if (mounted) refresh();
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [refresh]);

  const recordTransaction = useCallback(
    async (params: {
      customerId: string;
      amount: number;
      type: 'DEBT' | 'REPAYMENT';
      details: string;
    }) => {
      return await daftarDb.recordTransaction(params);
    },
    []
  );

  const createCustomer = useCallback(
    async (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newCustomer: Customer = {
        ...customer,
        id: `cust-${Date.now()}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await daftarDb.saveCustomer(newCustomer);
      return newCustomer;
    },
    []
  );

  const deleteCustomer = useCallback(async (id: string) => {
    await daftarDb.deleteCustomer(id);
  }, []);

  const updateStoreConfig = useCallback(async (newConfig: Partial<StoreConfig>) => {
    return await daftarDb.updateStoreConfig(newConfig);
  }, []);

  const exportBackup = useCallback(async () => {
    return await daftarDb.exportBackup();
  }, []);

  const importBackup = useCallback(async (jsonString: string) => {
    return await daftarDb.importBackup(jsonString);
  }, []);

  const clearAllLedgerData = useCallback(async () => {
    return await daftarDb.clearAllLedgerData();
  }, []);

  return {
    isReady,
    storeConfig,
    customers,
    transactions,
    error,
    refresh,
    recordTransaction,
    createCustomer,
    deleteCustomer,
    updateStoreConfig,
    exportBackup,
    importBackup,
    clearAllLedgerData,
  };
}
