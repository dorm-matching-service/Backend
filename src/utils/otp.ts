// src/utils/otp.ts
import crypto from 'crypto';

export function generateNumericCode(len = 6): string {
  const n = crypto.randomInt(0, 10 ** len);
  return n.toString().padStart(len, '0');
}

export function hashCode(code: string): string {
  const pepper = process.env.OTP_PEPPER ?? '';
  return crypto
    .createHash('sha256')
    .update(code + pepper)
    .digest('hex');
}

export function addMinutes(date: Date, mins: number): Date {
  return new Date(date.getTime() + mins * 60 * 1000);
}
