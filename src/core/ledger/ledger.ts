export type TransactionType = 'DEBT' | 'REPAYMENT';
export type TransactionStatus = 'PENDING' | 'CONFIRMED' | 'DISPUTED' | 'CANCELLED';

export interface LedgerTransaction {
  id: string;
  merchantId: string;
  customerId: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  timestamp: number;
  previousHash: string;
  hash: string;
  description?: string;
}

export interface NewTransactionInput {
  amount: number;
  customerPhone: string;
  description?: string;
}

export interface LedgerState {
  totalDebt: number;
  totalRepaid: number;
  netBalance: number;
  transactionCount: number;
}

/**
 * Invariant Balance Calculator:
 * Strictly computes Net Balance = Sum(CONFIRMED DEBTS) - Sum(CONFIRMED REPAYMENTS).
 * Excludes PENDING, DISPUTED, or CANCELLED transactions.
 */
export function calculateLedgerBalance(transactions: LedgerTransaction[]): number {
  let net = 0;

  for (const tx of transactions) {
    if (tx.status !== 'CONFIRMED') {
      continue; // Frozen or unconfirmed
    }

    if (tx.type === 'DEBT') {
      net += tx.amount;
    } else if (tx.type === 'REPAYMENT') {
      net -= tx.amount;
    }
  }

  // Prevent JavaScript floating point inaccuracy (e.g. 0.1 + 0.2 = 0.30000000000000004)
  return Math.round((net + Number.EPSILON) * 100) / 100;
}

/**
 * Validates transaction numerical input strictly.
 */
export function validateTransactionInput(input: NewTransactionInput): void {
  if (typeof input.amount !== 'number' || Number.isNaN(input.amount)) {
    throw new Error('المبلغ غير صالح');
  }

  if (input.amount <= 0) {
    throw new Error('المبلغ يجب أن يكون أكبر من صفر');
  }
}
