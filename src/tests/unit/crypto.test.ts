import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateNonce,
  verifyAndBurnNonce,
  calculateBlockHash,
  verifyAuditChain,
  AuditBlock,
} from '@/core/crypto/crypto';

describe('Cryptographic Invariants & Anti-Replay Protection', () => {
  it('Invariant 1: Nonce must be successfully verified within its TTL', () => {
    const nonce = generateNonce(120); // 120 seconds TTL
    const isValid = verifyAndBurnNonce(nonce.token);
    expect(isValid).toBe(true);
  });

  it('Invariant 2: Replay Attack Defense - A burned Nonce must be immediately rejected on second attempt', () => {
    const nonce = generateNonce(120);
    // First consumption succeeds
    expect(verifyAndBurnNonce(nonce.token)).toBe(true);
    // Replay attempt fails immediately
    expect(verifyAndBurnNonce(nonce.token)).toBe(false);
  });

  it('Invariant 3: Expired Nonces must be strictly rejected', () => {
    const expiredNonce = generateNonce(-5); // Expired 5 seconds ago
    expect(verifyAndBurnNonce(expiredNonce.token)).toBe(false);
  });

  it('Invariant 4: Tamper-Evident Hash Chain - Tampering with a single character breaks verification', () => {
    const block1: AuditBlock = {
      index: 1,
      timestamp: 1000,
      data: { amount: 50, note: 'طحين' },
      previousHash: 'GENESIS_BLOCK_HASH',
      hash: '',
    };
    block1.hash = calculateBlockHash(block1);

    const block2: AuditBlock = {
      index: 2,
      timestamp: 2000,
      data: { amount: 30, note: 'حليب' },
      previousHash: block1.hash,
      hash: '',
    };
    block2.hash = calculateBlockHash(block2);

    const validChain = [block1, block2];
    expect(verifyAuditChain(validChain)).toBe(true);

    // Tampering: An attacker tries to secretly change block1 amount from 50 to 500
    const tamperedChain = [
      {
        ...block1,
        data: { amount: 500, note: 'طحين' }, // Tampered data!
      },
      block2,
    ];

    expect(verifyAuditChain(tamperedChain)).toBe(false);
  });
});
