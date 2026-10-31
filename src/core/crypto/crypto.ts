import { createHash, randomBytes } from 'crypto';

export interface NonceRecord {
  token: string;
  expiresAt: number;
  consumed: boolean;
}

export interface AuditBlock {
  index: number;
  timestamp: number;
  data: Record<string, unknown>;
  previousHash: string;
  hash: string;
}

// In-memory Nonce Cache (backed by Redis in production)
const nonceCache = new Map<string, NonceRecord>();

/**
 * Generates a cryptographically random, single-use Nonce with TTL.
 * @param ttlSeconds Lifetime in seconds (default 120s / 2 minutes)
 */
export function generateNonce(ttlSeconds: number = 120): NonceRecord {
  const token = randomBytes(24).toString('hex');
  const expiresAt = Date.now() + ttlSeconds * 1000;

  const record: NonceRecord = {
    token,
    expiresAt,
    consumed: false,
  };

  nonceCache.set(token, record);
  return record;
}

/**
 * Atomically verifies and burns a single-use Nonce.
 * Returns true if valid and burns it immediately.
 * Returns false if already consumed (Replay Attack) or expired.
 */
export function verifyAndBurnNonce(token: string): boolean {
  const record = nonceCache.get(token);

  if (!record) {
    return false;
  }

  // Check TTL
  if (Date.now() > record.expiresAt) {
    nonceCache.delete(token);
    return false;
  }

  // Check if already consumed (Replay Attack)
  if (record.consumed) {
    return false;
  }

  // Burn immediately
  record.consumed = true;
  nonceCache.set(token, record);
  return true;
}

/**
 * Calculates deterministic SHA-256 hash for an audit block.
 */
export function calculateBlockHash(block: Omit<AuditBlock, 'hash'>): string {
  const payload = JSON.stringify({
    index: block.index,
    timestamp: block.timestamp,
    data: block.data,
    previousHash: block.previousHash,
  });

  return createHash('sha256').update(payload).digest('hex');
}

/**
 * Verifies the integrity of a cryptographic hash chain.
 * Returns false if any block data was altered or previousHash pointer is broken.
 */
export function verifyAuditChain(chain: AuditBlock[]): boolean {
  for (let i = 0; i < chain.length; i++) {
    const current = chain[i];

    // Check hash integrity
    const recalculated = calculateBlockHash(current);
    if (current.hash !== recalculated) {
      return false;
    }

    // Check pointer integrity
    if (i > 0) {
      const previous = chain[i - 1];
      if (current.previousHash !== previous.hash) {
        return false;
      }
    }
  }

  return true;
}
