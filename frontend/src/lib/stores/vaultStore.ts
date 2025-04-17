// Vault store for managing the password vault
import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import { getEncryptedVault, saveEncryptedVault } from '$lib/services/api';
import { encryptVault, decryptVault } from '$lib/services/crypto';
import type { Vault, CredentialEntry } from '$lib/services/api';

// Session timeout in milliseconds (10 minutes)
const SESSION_TIMEOUT = 10 * 60 * 1000;

// Default empty vault
const DEFAULT_VAULT: Vault = {
  version: 1,
  entries: []
};

// Define the vault store
function createVaultStore() {
  // Initialize store
  const { subscribe, set, update } = writable<{
    isLocked: boolean;
    isInitialized: boolean;
    vault: Vault | null;
    error: string | null;
    loading: boolean;
    sections: string[];
    masterPassword: string | null;
    lastActivity: number;
  }>({
    isLocked: true,
    isInitialized: false,
    vault: null,
    error: null,
    loading: false,
    sections: [],
    masterPassword: null,
    lastActivity: Date.now()
  });

  // Timer for auto-lock
  let autoLockTimer: number | null = null;

  // Store actions
  return {
    subscribe,
    
    // Initialize the vault
    initialize: async () => {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        const response = await getEncryptedVault();
        
        if (response.error) {
          // If there's an error, but it's just that the vault doesn't exist yet, 
          // we consider this initialized but locked
          if (response.error.includes('404') || response.error.includes('not found')) {
            update(state => ({ 
              ...state, 
              isInitialized: true, 
              loading: false 
            }));
          } else {
            update(state => ({ 
              ...state, 
              error: response.error, 
              loading: false 
            }));
          }
        } else {
          // Vault exists, still locked
          update(state => ({ 
            ...state, 
            isInitialized: true, 
            loading: false 
          }));
        }
      } catch (err) {
        update(state => ({ 
          ...state, 
          error: err instanceof Error ? err.message : String(err), 
          loading: false 
        }));
      }
    },
    
    // Unlock the vault with master password
    unlock: async (masterPassword: string) => {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        const response = await getEncryptedVault();
        
        if (response.error) {
          // If vault doesn't exist, create a new one
          if (response.error.includes('404') || response.error.includes('not found')) {
            // Create a new vault
            const newVault = DEFAULT_VAULT;
            
            // Save the encrypted vault
            const encryptedVault = await encryptVault(newVault, masterPassword);
            await saveEncryptedVault(encryptedVault);
            
            // Update store
            const sections = extractSections(newVault.entries);
            update(state => ({ 
              ...state, 
              vault: newVault, 
              isLocked: false, 
              masterPassword, 
              sections,
              lastActivity: Date.now(),
              loading: false 
            }));
            
            // Start auto-lock timer
            startAutoLockTimer();
          } else {
            throw new Error(response.error);
          }
        } else {
          // Vault exists, try to decrypt
          try {
            const vault = await decryptVault(response.data || '', masterPassword);
            const sections = extractSections(vault.entries);
            
            update(state => ({ 
              ...state, 
              vault, 
              isLocked: false, 
              masterPassword, 
              sections,
              lastActivity: Date.now(),
              loading: false 
            }));
            
            // Start auto-lock timer
            startAutoLockTimer();
          } catch (decryptErr) {
            update(state => ({ 
              ...state, 
              error: 'Invalid master password', 
              loading: false 
            }));
          }
        }
      } catch (err) {
        update(state => ({ 
          ...state, 
          error: err instanceof Error ? err.message : String(err), 
          loading: false 
        }));
      }
    },
    
    // Lock the vault
    lock: () => {
      // Clear the auto-lock timer
      stopAutoLockTimer();
      
      update(state => ({ 
        ...state, 
        isLocked: true, 
        vault: null,
        masterPassword: null
      }));
    },
    
    // Add a new entry
    addEntry: async (entry: Omit<CredentialEntry, 'id'>) => {
      update(state => {
        if (!state.vault || !state.masterPassword) return state;
        
        // Create a new entry with a unique ID
        const newEntry: CredentialEntry = {
          ...entry,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Add to vault
        const updatedVault: Vault = {
          ...state.vault,
          entries: [...state.vault.entries, newEntry]
        };
        
        // Update sections
        const sections = extractSections(updatedVault.entries);
        
        return { 
          ...state, 
          vault: updatedVault, 
          sections,
          lastActivity: Date.now()
        };
      });
      
      // Save changes
      await saveChanges();
    },
    
    // Update an existing entry
    updateEntry: async (id: string, updates: Partial<Omit<CredentialEntry, 'id'>>) => {
      update(state => {
        if (!state.vault || !state.masterPassword) return state;
        
        // Update the entry
        const updatedEntries = state.vault.entries.map(entry => {
          if (entry.id === id) {
            return { 
              ...entry, 
              ...updates,
              updatedAt: new Date().toISOString()
            };
          }
          return entry;
        });
        
        // Update vault
        const updatedVault: Vault = {
          ...state.vault,
          entries: updatedEntries
        };
        
        // Update sections
        const sections = extractSections(updatedVault.entries);
        
        return { 
          ...state, 
          vault: updatedVault, 
          sections,
          lastActivity: Date.now()
        };
      });
      
      // Save changes
      await saveChanges();
    },
    
    // Delete an entry
    deleteEntry: async (id: string) => {
      update(state => {
        if (!state.vault || !state.masterPassword) return state;
        
        // Remove the entry
        const updatedEntries = state.vault.entries.filter(entry => entry.id !== id);
        
        // Update vault
        const updatedVault: Vault = {
          ...state.vault,
          entries: updatedEntries
        };
        
        // Update sections
        const sections = extractSections(updatedVault.entries);
        
        return { 
          ...state, 
          vault: updatedVault, 
          sections,
          lastActivity: Date.now()
        };
      });
      
      // Save changes
      await saveChanges();
    },
    
    // Update activity timestamp to prevent auto-locking
    updateActivity: () => {
      update(state => ({
        ...state,
        lastActivity: Date.now()
      }));
    }
  };

  // Helper function to save vault changes
  async function saveChanges() {
    let currentState: {
      vault: Vault | null;
      masterPassword: string | null;
    } | undefined;
    
    // Get the current state
    subscribe(state => {
      currentState = state;
    })();
    
    // Skip if vault is locked or state undefined
    if (!currentState || !currentState.vault || !currentState.masterPassword) return;
    
    try {
      // Encrypt and save the vault
      const encryptedVault = await encryptVault(currentState.vault, currentState.masterPassword);
      await saveEncryptedVault(encryptedVault);
    } catch (err) {
      // Update error state
      update(state => ({ 
        ...state, 
        error: err instanceof Error ? err.message : String(err)
      }));
    }
  }
  
  // Helper to extract unique sections from entries
  function extractSections(entries: CredentialEntry[]): string[] {
    const sectionsSet = new Set<string>();
    
    entries.forEach(entry => {
      if (entry.section) {
        sectionsSet.add(entry.section);
      }
    });
    
    return Array.from(sectionsSet).sort();
  }
  
  // Start auto-lock timer
  function startAutoLockTimer() {
    // Clear existing timer if any
    stopAutoLockTimer();
    
    // Only run in browser
    if (!browser) return;
    
    // Check every minute
    autoLockTimer = window.setInterval(() => {
      let currentState: {
        isLocked: boolean;
        lastActivity: number;
      } | undefined;
      
      // Get the current state
      subscribe(state => {
        currentState = state;
      })();
      
      // If state is undefined or vault is already locked, do nothing
      if (!currentState || currentState.isLocked) return;
      
      // Lock if inactive for SESSION_TIMEOUT
      const now = Date.now();
      if (now - currentState.lastActivity > SESSION_TIMEOUT) {
        update(state => ({ 
          ...state, 
          isLocked: true, 
          vault: null,
          masterPassword: null
        }));
        
        // Clear the timer
        stopAutoLockTimer();
      }
    }, 60000); // Check every minute
  }
  
  // Stop auto-lock timer
  function stopAutoLockTimer() {
    if (autoLockTimer !== null) {
      window.clearInterval(autoLockTimer);
      autoLockTimer = null;
    }
  }
}

// Create and export the vault store
export const vaultStore = createVaultStore();

// Derived stores for convenience
export const entries = derived(vaultStore, $vaultStore => $vaultStore.vault?.entries || []);
export const sections = derived(vaultStore, $vaultStore => $vaultStore.sections);
export const isLocked = derived(vaultStore, $vaultStore => $vaultStore.isLocked);
export const isInitialized = derived(vaultStore, $vaultStore => $vaultStore.isInitialized);
export const vaultError = derived(vaultStore, $vaultStore => $vaultStore.error);
export const isLoading = derived(vaultStore, $vaultStore => $vaultStore.loading); 