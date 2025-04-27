import React, { createContext, useContext, ReactNode, useState } from 'react';
import { useApiKey } from '../hooks/useApiKey';
import { useNavigate } from 'react-router-dom';

interface ApiKeyContextType {
  apiKey: string | null;
  quality: 'low' | 'medium' | 'high';
  setQuality: (quality: 'low' | 'medium' | 'high') => void;
  isLoading: boolean;
  error: string | null;
  validateAndSaveApiKey: (key: string) => Promise<boolean>;
  clearApiKey: () => void;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export function ApiKeyProvider({ children }: { children: ReactNode }) {
  const apiKeyData = useApiKey();
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>(() => {
    return (localStorage.getItem('openai-quality') as 'low' | 'medium' | 'high') || 'low';
  });
  const navigate = useNavigate();
  
  const enhancedApiKeyData = {
    ...apiKeyData,
    quality,
    setQuality: (newQuality: 'low' | 'medium' | 'high') => {
      localStorage.setItem('openai-quality', newQuality);
      setQuality(newQuality);
    },
    validateAndSaveApiKey: async (key: string) => {
      const result = await apiKeyData.validateAndSaveApiKey(key);
      if (result) {
        navigate('/', { replace: true });
      }
      return result;
    },
    clearApiKey: () => {
      apiKeyData.clearApiKey();
      navigate('/setup', { replace: true });
    }
  };

  return (
    <ApiKeyContext.Provider value={enhancedApiKeyData}>
      {children}
    </ApiKeyContext.Provider>
  );
}

export function useApiKeyContext() {
  const context = useContext(ApiKeyContext);
  if (context === undefined) {
    throw new Error('useApiKeyContext must be used within an ApiKeyProvider');
  }
  return context;
}