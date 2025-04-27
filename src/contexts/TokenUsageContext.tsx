import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import TokenUsageService from '../services/TokenUsageService';

interface TokenUsage {
  inputTextTokens: number;
  inputImageTokens: number;
  outputTokens: number;
}

interface TokenUsageContextType {
  usage: TokenUsage;
  addUsage: (usage: { input_tokens_details?: { text_tokens: number; image_tokens: number }; output_tokens?: number }) => void;
  resetUsage: () => void;
}

const TokenUsageContext = createContext<TokenUsageContextType | undefined>(undefined);

export function TokenUsageProvider({ children }: { children: ReactNode }) {
  const tokenService = TokenUsageService.getInstance();
  const [usage, setUsage] = useState<TokenUsage>(() => {
    return tokenService.getUsage();
  });

  useEffect(() => {
    // Subscribe to token usage changes
    const unsubscribe = tokenService.subscribe(() => {
      setUsage(tokenService.getUsage());
    });
    
    return () => unsubscribe();
  }, []);

  const addUsage = (newUsage: { input_tokens_details?: { text_tokens: number; image_tokens: number }; output_tokens?: number }) => {
    tokenService.addUsage(newUsage);
  };

  const resetUsage = () => {
    tokenService.reset();
  };

  return (
    <TokenUsageContext.Provider value={{ usage, addUsage, resetUsage }}>
      {children}
    </TokenUsageContext.Provider>
  );
}

export function useTokenUsage() {
  const context = useContext(TokenUsageContext);
  if (context === undefined) {
    throw new Error('useTokenUsage must be used within a TokenUsageProvider');
  }
  return context;
}