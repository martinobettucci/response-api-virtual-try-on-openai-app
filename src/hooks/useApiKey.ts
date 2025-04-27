import { useState, useEffect, useCallback } from 'react';
import { testApiKey } from '../services/openai';

const API_KEY_STORAGE_KEY = 'openai-api-key';

export function useApiKey() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    setApiKey(null); // Reset state first
    if (storedKey) {
      setApiKey(storedKey);
    }
    setIsLoading(false);
    
    // Listen for storage changes
    const handleStorage = (e: StorageEvent) => {
      if (e.key === API_KEY_STORAGE_KEY) {
        setApiKey(e.newValue);
      }
    };
    
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const validateAndSaveApiKey = useCallback(async (key: string) => {
    setIsLoading(true);
    setError(null);
    setApiKey(null); // Reset any existing key
    
    try {
      const isValid = await testApiKey(key);
      
      if (isValid) {
        setApiKey(key);
        // Dispatch storage event to trigger remount
        window.dispatchEvent(new StorageEvent('storage', {
          key: API_KEY_STORAGE_KEY,
          newValue: key
        }));
        localStorage.setItem(API_KEY_STORAGE_KEY, key);
        return true;
      } else {
        setError('Invalid API key. Please check and try again.');
        return false;
      }
    } catch (err) {
      setError(`Error validating API key: ${err instanceof Error ? err.message : String(err)}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearApiKey = useCallback(() => {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
    // Dispatch storage event to trigger remount
    window.dispatchEvent(new StorageEvent('storage', {
      key: API_KEY_STORAGE_KEY,
      oldValue: apiKey || undefined,
      newValue: null
    }));
    setIsLoading(false);
    setApiKey(null);
    setError(null);
  }, []);

  return {
    apiKey,
    isLoading,
    error,
    validateAndSaveApiKey,
    clearApiKey
  };
}