import CryptoJS from 'crypto-js';

export interface EncryptionResult {
  encryptedContent: string;
  iv: string;
  salt: string;
  key: string; // This will be used in the URL fragment
}

export function generateKey(): string {
  return CryptoJS.lib.WordArray.random(256/8).toString();
}

export function encryptNote(content: string, key?: string): EncryptionResult {
  const encryptionKey = key || generateKey();
  const salt = CryptoJS.lib.WordArray.random(128/8);
  const iv = CryptoJS.lib.WordArray.random(128/8);
  
  // Derive key from the provided key and salt
  const derivedKey = CryptoJS.PBKDF2(encryptionKey, salt, {
    keySize: 256/32,
    iterations: 10000
  });
  
  // Encrypt the content
  const encrypted = CryptoJS.AES.encrypt(content, derivedKey, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  
  return {
    encryptedContent: encrypted.toString(),
    iv: iv.toString(),
    salt: salt.toString(),
    key: encryptionKey
  };
}

export function decryptNote(
  encryptedContent: string,
  key: string,
  iv: string,
  salt: string
): string {
  try {
    // Derive the same key using the salt
    const derivedKey = CryptoJS.PBKDF2(key, CryptoJS.enc.Hex.parse(salt), {
      keySize: 256/32,
      iterations: 10000
    });
    
    // Decrypt the content
    const decrypted = CryptoJS.AES.decrypt(encryptedContent, derivedKey, {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    throw new Error('Failed to decrypt note. Invalid key or corrupted data.');
  }
}
