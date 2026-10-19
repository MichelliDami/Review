import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export const passwordHash = (password: string, salt = randomBytes(16).toString('hex')) =>
  `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;

export function verifyPassword(password: string, stored: string): boolean {
  if (typeof stored !== 'string' || !/^[a-f0-9]{32}:[a-f0-9]{128}$/.test(stored)) return false;
  const [salt] = stored.split(':');
  return timingSafeEqual(Buffer.from(passwordHash(password, salt)), Buffer.from(stored));
}
