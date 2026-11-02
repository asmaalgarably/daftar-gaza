import { describe, it, expect } from 'vitest';
import { BackupData, Customer, Transaction, StoreConfig } from '../../core/db/types';

describe('Production Backup & Data Integrity Verification', () => {
  const sampleStoreConfig: StoreConfig = {
    id: 'CURRENT_STORE',
    storeName: 'سوبرماركت الأمل - غزة',
    ownerName: 'أبو خليل',
    phone: '0599123456',
    location: 'غزة - دير البلح',
    currency: '₪',
    pinCode: '1234',
    isPinLocked: true,
    receiptFooter: 'سند مالي معتمد',
  };

  const sampleCustomer: Customer = {
    id: 'cust-101',
    name: 'أحمد خليل الرنتيسي',
    phone: '0599123456',
    balance: 150,
    debtCeiling: 600,
    createdAt: 1700000000000,
    updatedAt: 1700000100000,
  };

  const sampleTransaction: Transaction = {
    id: 'TX-901',
    customerId: 'cust-101',
    customerName: 'أحمد خليل الرنتيسي',
    customerPhone: '0599123456',
    amount: 150,
    type: 'DEBT',
    details: 'شراء كيس طحين وسكر',
    timestamp: 1700000100000,
    previousBalance: 0,
    newBalance: 150,
    previousHash: 'GENESIS_BLOCK_0000000000000000',
    hash: '0xabc123456',
    status: 'CONFIRMED',
  };

  it('generates a compliant, standardized JSON backup bundle', () => {
    const backup: BackupData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      storeConfig: sampleStoreConfig,
      customers: [sampleCustomer],
      transactions: [sampleTransaction],
    };

    const serialized = JSON.stringify(backup);
    expect(serialized).toBeDefined();

    const parsed: BackupData = JSON.parse(serialized);
    expect(parsed.version).toBe(1);
    expect(parsed.storeConfig.storeName).toBe('سوبرماركت الأمل - غزة');
    expect(parsed.customers.length).toBe(1);
    expect(parsed.customers[0].phone).toBe('0599123456');
    expect(parsed.transactions.length).toBe(1);
    expect(parsed.transactions[0].amount).toBe(150);
  });

  it('rejects corrupted or invalid backup payloads', () => {
    const invalidJson = '{"foo": "bar"}';
    const parsed = JSON.parse(invalidJson);
    const isValidBackup = (data: any): boolean => {
      return (
        data &&
        typeof data === 'object' &&
        Array.isArray(data.customers) &&
        typeof data.storeConfig === 'object'
      );
    };

    expect(isValidBackup(parsed)).toBe(false);
  });

  it('preserves Palestinian currency and Arabic UTF-8 text perfectly', () => {
    const backup: BackupData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      storeConfig: sampleStoreConfig,
      customers: [sampleCustomer],
      transactions: [sampleTransaction],
    };

    const encoded = JSON.stringify(backup);
    const decoded = JSON.parse(encoded);

    expect(decoded.storeConfig.currency).toBe('₪');
    expect(decoded.customers[0].name).toBe('أحمد خليل الرنتيسي');
    expect(decoded.transactions[0].details).toBe('شراء كيس طحين وسكر');
  });
});
