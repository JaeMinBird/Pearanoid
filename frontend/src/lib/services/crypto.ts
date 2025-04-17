// Crypto service for password encryption and decryption
import type { Vault } from './api';
import AES from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';
import PBKDF2 from 'crypto-js/pbkdf2';
import CryptoJS from 'crypto-js';
import HexEncoding from 'crypto-js/enc-hex';

/**
 * Constants for crypto operations
 */
const ITERATIONS = 100000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const KEY_LENGTH = 256;
const ALGORITHM = 'AES-GCM';

// Constants
const PBKDF2_ITERATIONS = 100000;
const SALT_SIZE = 16;
const KEY_SIZE = 32;

/**
 * Generate a key from a master password
 */
async function deriveKey(masterPassword: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(masterPassword);
  
  // Import the password as a key
  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    passwordData,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  
  // Derive the actual encryption key using PBKDF2
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: ITERATIONS,
      hash: 'SHA-256'
    },
    passwordKey,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Generate a random salt
 */
function generateSalt(): Uint8Array {
  return window.crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
}

/**
 * Generate a random initialization vector
 */
function generateIV(): Uint8Array {
  return window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
}

/**
 * Encrypt a vault using a master password
 */
export async function encryptVault(vault: Vault, masterPassword: string): Promise<string> {
  // Generate salt and IV
  const salt = generateSalt();
  const iv = generateIV();
  
  // Derive key from master password
  const key = await deriveKey(masterPassword, salt);
  
  // Convert vault to string
  const encoder = new TextEncoder();
  const vaultData = encoder.encode(JSON.stringify(vault));
  
  // Encrypt vault
  const encryptedContent = await window.crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv
    },
    key,
    vaultData
  );
  
  // Combine salt, IV, and encrypted content
  const encryptedVault = new Uint8Array(salt.length + iv.length + encryptedContent.byteLength);
  encryptedVault.set(salt, 0);
  encryptedVault.set(iv, salt.length);
  encryptedVault.set(new Uint8Array(encryptedContent), salt.length + iv.length);
  
  // Convert to base64 for storage
  return arrayBufferToBase64(encryptedVault);
}

/**
 * Decrypt a vault using a master password
 */
export async function decryptVault(encryptedVault: string, masterPassword: string): Promise<Vault> {
  // Convert base64 to array buffer
  const encryptedData = base64ToArrayBuffer(encryptedVault);
  
  // Extract salt, IV, and encrypted content
  const salt = encryptedData.slice(0, SALT_LENGTH);
  const iv = encryptedData.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const ciphertext = encryptedData.slice(SALT_LENGTH + IV_LENGTH);
  
  // Derive key from master password
  const key = await deriveKey(masterPassword, salt);
  
  try {
    // Decrypt vault
    const decryptedContent = await window.crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv
      },
      key,
      ciphertext
    );
    
    // Convert to string and parse as JSON
    const decoder = new TextDecoder();
    const vaultJson = decoder.decode(decryptedContent);
    return JSON.parse(vaultJson) as Vault;
  } catch (error) {
    throw new Error('Invalid master password or corrupted vault');
  }
}

/**
 * Generate a random secure password
 */
export function generatePassword(
  length = 16,
  includeUppercase = true,
  includeLowercase = true,
  includeNumbers = true, 
  includeSymbols = true
): string {
  if (length < 4) {
    throw new Error('Password length must be at least 4 characters');
  }
  
  // Define character sets
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const numberChars = '0123456789';
  const symbolChars = '!@#$%^&*()_-+=<>?/[]{}|~';
  
  // Create array for chosen character sets
  const charSets = [];
  if (includeUppercase) charSets.push(uppercaseChars);
  if (includeLowercase) charSets.push(lowercaseChars);
  if (includeNumbers) charSets.push(numberChars);
  if (includeSymbols) charSets.push(symbolChars);
  
  if (charSets.length === 0) {
    throw new Error('At least one character set must be selected');
  }
  
  // Create the combined character set
  let allChars = '';
  charSets.forEach(set => {
    allChars += set;
  });
  
  // Generate the password
  let password = '';
  
  // First, ensure at least one character from each selected set
  charSets.forEach(set => {
    const randomIndex = Math.floor(Math.random() * set.length);
    password += set[randomIndex];
  });
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * allChars.length);
    password += allChars[randomIndex];
  }
  
  // Shuffle the password (Fisher-Yates algorithm)
  const passwordArray = password.split('');
  for (let i = passwordArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
  }
  
  return passwordArray.join('');
}

/**
 * Generate cryptographically secure salt for string-based operations
 */
export function generateSaltString(): string {
  const array = new Uint8Array(SALT_SIZE);
  window.crypto.getRandomValues(array);
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Derive a key from the master password for string-based operations
 */
export function deriveKeyString(password: string, salt: string): string {
  // Use crypto-js for PBKDF2
  const key = PBKDF2(password, salt, {
    keySize: KEY_SIZE / 4, // keySize is in words (32 bits), so divide by 4
    iterations: PBKDF2_ITERATIONS,
    hasher: CryptoJS.algo.SHA256
  });
  return key.toString(HexEncoding);
}

/**
 * Encrypt data with the derived key
 */
export function encrypt(data: any, key: string): string {
  const jsonData = JSON.stringify(data);
  return AES.encrypt(jsonData, key).toString();
}

/**
 * Decrypt data with the derived key
 */
export function decrypt(encryptedData: string, key: string): any {
  const decrypted = AES.decrypt(encryptedData, key);
  const jsonData = decrypted.toString(Utf8);
  return JSON.parse(jsonData);
}

/**
 * Convert an array buffer to a base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert a base64 string to an array buffer
 */
function base64ToArrayBuffer(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
} 