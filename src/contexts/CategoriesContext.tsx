import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const DEFAULT_CATEGORIES = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories'];
const STORAGE_KEY = 'wardrobe-categories';

interface CategoriesContextType {
  categories: string[];
  addCategory: (category: string) => void;
  removeCategory: (category: string) => void;
  reorderCategories: (categories: string[]) => void;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<string[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_CATEGORIES;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  }, [categories]);

  const addCategory = (category: string) => {
    if (!categories.includes(category)) {
      setCategories([...categories, category]);
    }
  };

  const removeCategory = (category: string) => {
    setCategories(categories.filter(c => c !== category));
  };

  const reorderCategories = (newOrder: string[]) => {
    setCategories(newOrder);
  };

  return (
    <CategoriesContext.Provider value={{
      categories,
      addCategory,
      removeCategory,
      reorderCategories
    }}>
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoriesContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return context;
}