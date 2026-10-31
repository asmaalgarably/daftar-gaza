/**
 * Generates an SVG string representing a dynamic cryptographic QR code payload.
 * Encodes: Transaction Type, Amount, Party, Nonce, and Expiration Timestamp.
 */
export interface QRPayload {
  id: string;
  type: 'DEBT' | 'REPAYMENT';
  amount: number;
  party: string;
  nonce: string;
  expiresAt: number;
  hash: string;
}

export function generateQRPayload(
  type: 'DEBT' | 'REPAYMENT',
  amount: number,
  party: string,
  nonce: string
): QRPayload {
  const expiresAt = Date.now() + 120 * 1000; // 2 minutes
  const payloadString = `${type}:${amount}:${party}:${nonce}:${expiresAt}`;

  // Simple deterministic signature simulation
  let hash = 0;
  for (let i = 0; i < payloadString.length; i++) {
    hash = (hash << 5) - hash + payloadString.charCodeAt(i);
    hash |= 0;
  }

  return {
    id: `qr-${Math.abs(hash).toString(16)}`,
    type,
    amount,
    party,
    nonce,
    expiresAt,
    hash: `0x${Math.abs(hash).toString(16)}`,
  };
}
