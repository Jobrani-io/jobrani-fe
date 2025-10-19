import { useState, useEffect, useCallback } from 'react';

interface PersistedStateConfig<T> {
  key: string;
  defaultValue: T;
  expirationHours?: number; // Optional expiration time
  validator?: (value: unknown) => value is T; // Optional validation function
}

interface StoredData<T> {
  value: T;
  timestamp: number;
  version: string;
}

const STORAGE_VERSION = '1.0';

function usePersistedState<T>(config: PersistedStateConfig<T>) {
  const { key, defaultValue, expirationHours, validator } = config;

  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return defaultValue;

      const parsed: StoredData<T> = JSON.parse(stored);
      
      // Check version compatibility
      if (parsed.version !== STORAGE_VERSION) {
        console.log(`Storage version mismatch for ${key}, using default value`);
        localStorage.removeItem(key);
        return defaultValue;
      }

      // Check expiration
      if (expirationHours && parsed.timestamp) {
        const expirationTime = parsed.timestamp + (expirationHours * 60 * 60 * 1000);
        if (Date.now() > expirationTime) {
          console.log(`Stored data for ${key} has expired, using default value`);
          localStorage.removeItem(key);
          return defaultValue;
        }
      }

      // Validate data structure
      if (validator && !validator(parsed.value)) {
        console.log(`Invalid data structure for ${key}, using default value`);
        localStorage.removeItem(key);
        return defaultValue;
      }

      return parsed.value;
    } catch (error) {
      console.error(`Error loading persisted state for ${key}:`, error);
      localStorage.removeItem(key);
      return defaultValue;
    }
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      const dataToStore: StoredData<T> = {
        value: state,
        timestamp: Date.now(),
        version: STORAGE_VERSION
      };
      localStorage.setItem(key, JSON.stringify(dataToStore));
    } catch (error) {
      console.error(`Error saving persisted state for ${key}:`, error);
    }
  }, [key, state]);

  // Clear stored data
  const clearPersistedState = useCallback(() => {
    localStorage.removeItem(key);
    setState(defaultValue);
  }, [key, defaultValue]);

  return [state, setState, clearPersistedState] as const;
}

// Helper function to clear all app storage data
export const clearAllPersistedState = () => {
  const keysToRemove = Object.keys(localStorage).filter(key => 
    key.startsWith('matchModule-') || 
    key.startsWith('createModule-') ||
    key.startsWith('writeModule-')
  );
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
};

// Helper validators
export const validators = {
  isSet: (value: unknown): value is Set<string> => {
    if (Array.isArray(value)) {
      // Convert array to Set if needed (for backward compatibility)
      return value.every(item => typeof item === 'string');
    }
    return false;
  },
  
  isMap: (value: unknown): value is Map<string, any> => {
    if (Array.isArray(value)) {
      // Convert array of [key, value] pairs to Map if needed
      return value.every(item => Array.isArray(item) && item.length === 2);
    }
    return false;
  },

  isArray: (value: unknown): value is any[] => Array.isArray(value),
  
  isObject: (value: unknown): value is Record<string, any> => 
    typeof value === 'object' && value !== null && !Array.isArray(value)
};

export default usePersistedState;