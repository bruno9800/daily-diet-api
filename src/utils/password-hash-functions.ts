import { randomBytes, pbkdf2Sync } from 'node:crypto'
import { env } from '../env';

export async function setPasswordHash(password: string): Promise<string> {
  const hash = pbkdf2Sync(password, env.SALT, 1000, 64, 'sha512').toString('hex');

  return hash;
}

export async function verifyPasswordHash(password: string, hash: string) {
  const passwordToVerify = pbkdf2Sync(password, env.SALT, 1000, 64, 'sha512').toString('hex');

  return passwordToVerify === hash;
}
