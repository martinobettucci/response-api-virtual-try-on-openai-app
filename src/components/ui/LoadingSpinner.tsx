import React from 'react';
import { useMotion } from '../../contexts/MotionContext';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text = 'Loading...' 
}) => {
  const { Motion } = useMotion();
  
  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'h-4 w-4';
      case 'lg': return 'h-10 w-10';
      case 'md':
      default: return 'h-6 w-6';
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center">
      <Motion.div
        className={`${getSizeClass()} rounded-full border-2 border-ivory-200 border-t-gold-500`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      {text && (
        <p className="mt-2 text-sm text-gray-600">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;