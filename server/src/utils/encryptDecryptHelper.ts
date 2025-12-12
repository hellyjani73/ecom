import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const secretKey = '12345678901234567890123456789012';
const iv = '1234567890123456'; // 16 chars


export function encryptPassword(password: string): string {
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), Buffer.from(iv));
  let encrypted = cipher.update(password, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

export function decryptPassword(encryptedPassword: string): string {
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey), Buffer.from(iv));
  let decrypted = decipher.update(encryptedPassword, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
