import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Key, Database, Shield, X } from 'lucide-react';
import { useMotion } from '../contexts/MotionContext';

const SLIDES = [
  {
    title: 'Welcome to Miroir',
    description: 'Your personal AI-powered virtual try-on experience. Create stunning outfit visualizations using the power of artificial intelligence.',
    icon: <Key className="h-12 w-12 text-navy-500" />
  },
  {
    title: 'Your API Key, Your Control',
    description: 'Miroir uses YOUR OpenAI API key, ensuring all AI operations are processed through your personal account. You have full control over usage and costs.',
    icon: <Key className="h-12 w-12 text-gold-500" />
  },
  {
    title: 'Local-First Privacy',
    description: 'All your photos and data are stored securely in your browser\'s local database. Nothing is ever uploaded to external servers - your data stays with you.',
    icon: <Database className="h-12 w-12 text-blush-500" />
  },
  {
    title: 'Ready to Start?',
    description: 'You\'re all set to begin your virtual try-on journey. Upload clothes, add profile photos, and create amazing outfit visualizations.',
    icon: <Shield className="h-12 w-12 text-navy-500" />
  }
];

interface OnboardingCarouselProps {
  onClose: () => void;
}

const OnboardingCarousel: React.FC<OnboardingCarouselProps> = ({ onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [neverShowAgain, setNeverShowAgain] = useState(false);
  const { Motion } = useMotion();

  const handleNext = () => {
    if (currentSlide === SLIDES.length - 1) {
      if (neverShowAgain) {
        localStorage.setItem('hideOnboarding', 'true');
      }
      onClose();
    } else {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentSlide(prev => prev - 1);
  };

  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    >
      <Motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl shadow-elegant max-w-2xl w-full"
      >
        <div className="relative p-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>

          <Motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              {SLIDES[currentSlide].icon}
            </div>
            
            <h2 className="font-display text-3xl mb-4">
              {SLIDES[currentSlide].title}
            </h2>
            
            <p className="text-gray-600 mb-8 max-w-lg mx-auto">
              {SLIDES[currentSlide].description}
            </p>
          </Motion.div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {currentSlide === SLIDES.length - 1 && (
                <label className="flex items-center text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={neverShowAgain}
                    onChange={(e) => setNeverShowAgain(e.target.checked)}
                    className="mr-2"
                  />
                  Don't show this again
                </label>
              )}
            </div>

            <div className="flex items-center gap-4">
              {currentSlide > 0 && (
                <button onClick={handlePrev} className="btn btn-secondary">
                  <ChevronLeft className="h-5 w-5" /> Back
                </button>
              )}
              
              <button onClick={handleNext} className="btn btn-primary">
                {currentSlide === SLIDES.length - 1 ? (
                  'Get Started'
                ) : (
                  <>
                    Next <ChevronRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-center mt-6 gap-2">
            {SLIDES.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-navy-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </Motion.div>
    </Motion.div>
  );
};

export default OnboardingCarousel;