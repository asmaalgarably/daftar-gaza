import { describe, it, expect } from 'vitest';
import {
  calculateLedgerBalance,
  LedgerTransaction,
  validateTransactionInput,
  LedgerState,
} from '@/core/ledger/ledger';

describe('Ledger Mathematical Invariants (Superpower TDD)', () => {
  it('Invariant 1: Balance must strictly equal Sum(Approved Debts) - Sum(Approved Repayments)', () => {
    const transactions: LedgerTransaction[] = [
      {
        id: 'tx-1',
        merchantId: 'm-1',
        customerId: 'c-1',
        amount: 50,
        type: 'DEBT',
        status: 'CONFIRMED',
        timestamp: 1000,
        previousHash: 'GENESIS',
        hash: 'hash-1',
      },
      {
        id: 'tx-2',
        merchantId: 'm-1',
        customerId: 'c-1',
        amount: 25,
        type: 'DEBT',
        status: 'CONFIRMED',
        timestamp: 2000,
        previousHash: 'hash-1',
        hash: 'hash-2',
      },
      {
        id: 'tx-3',
        merchantId: 'm-1',
        customerId: 'c-1',
        amount: 30,
        type: 'REPAYMENT',
        status: 'CONFIRMED',
        timestamp: 3000,
        previousHash: 'hash-2',
        hash: 'hash-3',
      },
    ];

    const balance = calculateLedgerBalance(transactions);
    expect(balance).toBe(45); // (50 + 25) - 30 = 45
  });

  it('Invariant 2: PENDING and DISPUTED transactions must NOT affect the active balance', () => {
    const transactions: LedgerTransaction[] = [
      {
        id: 'tx-1',
        merchantId: 'm-1',
        customerId: 'c-1',
        amount: 100,
        type: 'DEBT',
        status: 'CONFIRMED',
        timestamp: 1000,
        previousHash: 'GENESIS',
        hash: 'hash-1',
      },
      {
        id: 'tx-2',
        merchantId: 'm-1',
        customerId: 'c-1',
        amount: 80,
        type: 'DEBT',
        status: 'DISPUTED', // Disputed should be frozen
        timestamp: 2000,
        previousHash: 'hash-1',
        hash: 'hash-2',
      },
      {
        id: 'tx-3',
        merchantId: 'm-1',
        customerId: 'c-1',
        amount: 40,
        type: 'DEBT',
        status: 'PENDING', // Awaiting signature
        timestamp: 3000,
        previousHash: 'hash-2',
        hash: 'hash-3',
      },
    ];

    const balance = calculateLedgerBalance(transactions);
    expect(balance).toBe(100); // Only tx-1 is confirmed
  });

  it('Invariant 3: Transaction input must strictly reject negative, zero, or non-numeric amounts', () => {
    expect(() =>
      validateTransactionInput({ amount: 0, customerPhone: '0599123456', description: 'خضار' })
    ).toThrow('المبلغ يجب أن يكون أكبر من صفر');

    expect(() =>
      validateTransactionInput({ amount: -15, customerPhone: '0599123456', description: 'طاقة شمسية' })
    ).toThrow('المبلغ يجب أن يكون أكبر من صفر');

    expect(() =>
      validateTransactionInput({ amount: NaN, customerPhone: '0599123456', description: 'مياه' })
    ).toThrow('المبلغ غير صالح');
  });
});
