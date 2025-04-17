// API service for password manager

const API_URL = 'http://localhost:8080/api';

/**
 * Interface for Credential Entry objects
 */
export interface CredentialEntry {
  id: string;
  name: string;
  username?: string;
  email?: string;
  password: string;
  section?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Interface for the Vault
 */
export interface Vault {
  version: number;
  entries: CredentialEntry[];
}

/**
 * Interface for API responses
 */
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

/**
 * Get the encrypted vault
 */
export async function getEncryptedVault(): Promise<ApiResponse<string>> {
  try {
    const response = await fetch(`${API_URL}/vault`);
    
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    
    const jsonData = await response.json();
    // Convert to string since our encryption expects a string
    const data = JSON.stringify(jsonData);
    return { data, error: null };
  } catch (error: unknown) {
    console.error('Error fetching encrypted vault:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}

/**
 * Save the encrypted vault
 */
export async function saveEncryptedVault(encryptedVault: string): Promise<ApiResponse<void>> {
  try {
    // Parse the string to JSON before sending
    const vaultData = JSON.parse(encryptedVault);
    
    const response = await fetch(`${API_URL}/vault`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(vaultData),
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    
    return { data: null, error: null };
  } catch (error: unknown) {
    console.error('Error saving encrypted vault:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
} 