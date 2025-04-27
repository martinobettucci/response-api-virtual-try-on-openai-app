import React, { createContext, useContext, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MotionContextType {
  pageTransition: {
    initial: object;
    animate: object;
    exit: object;
    transition: object;
  };
  Motion: typeof motion;
  AnimatePresence: typeof AnimatePresence;
}

const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { 
    duration: 0.5,
    ease: [0.645, 0.045, 0.355, 1.000]
  }
};

const MotionContext = createContext<MotionContextType | undefined>(undefined);

export function MotionProvider({ children }: { children: ReactNode }) {
  const value = {
    pageTransition,
    Motion: motion,
    AnimatePresence
  };

  return (
    <MotionContext.Provider value={value}>
      {children}
    </MotionContext.Provider>
  );
}

export function useMotion() {
  const context = useContext(MotionContext);
  if (context === undefined) {
    throw new Error('useMotion must be used within a MotionProvider');
  }
  return context;
}