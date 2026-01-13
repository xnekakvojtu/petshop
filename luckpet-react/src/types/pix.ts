// src/types/pix.ts
export interface PixPayment {
  qrCode: string;
  code: string;
  expiresAt: string;
  amount: number;
}