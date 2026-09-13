import crypto from 'crypto';
import { CONFIG } from './config';

/**
 * Encrypts sensitive data using AES-256-CBC with the AES_ENCRYPTION_KEY from the environment
 * 
 * @param text The plain text to encrypt
 * @returns The encrypted text as a Base64 string with IV prepended
 */
export function encrypt(text: string): string {
  // Generate a random initialization vector
  const iv = crypto.randomBytes(16);
  
  // Create a cipher using the environment key and IV
  // Ensure the key is exactly 32 bytes (256 bits) as required by AES-256-CBC
  let key = Buffer.from(CONFIG.aesKey);
  
  // If key is not provided in base64 format, try using it directly
  if (key.length !== 32) {
    // Try to derive a 32-byte key using SHA-256
    key = crypto.createHash('sha256').update(String(CONFIG.aesKey)).digest();
  }
  
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  
  // Encrypt the data
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  // Prepend the IV to the encrypted data (so we can decrypt it later)
  return iv.toString('base64') + ':' + encrypted;
}

/**
 * Decrypts data encrypted by the encrypt function
 * 
 * @param encryptedText The encrypted text (Base64 with IV prepended)
 * @returns The decrypted plain text
 */
export function decrypt(encryptedText: string): string {
  // Split the IV and encrypted data
  const parts = encryptedText.split(':');
  if (parts.length !== 2) {
    throw new Error('Invalid encrypted text format');
  }
  
  const iv = Buffer.from(parts[0], 'base64');
  const encryptedData = parts[1];
  
  // Create a decipher using the environment key and extracted IV
  // Ensure the key is exactly 32 bytes (256 bits) as required by AES-256-CBC
  let key = Buffer.from(CONFIG.aesKey);
  
  // If key is not provided in base64 format, try using it directly
  if (key.length !== 32) {
    // Try to derive a 32-byte key using SHA-256
    key = crypto.createHash('sha256').update(String(CONFIG.aesKey)).digest();
  }
  
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  
  // Decrypt the data
  let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
} 