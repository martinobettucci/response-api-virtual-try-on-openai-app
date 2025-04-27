import React, { useState } from 'react';
import { Sparkles, Key, ExternalLink } from 'lucide-react';
import { useApiKeyContext } from '../contexts/ApiKeyContext';
import { useMotion } from '../contexts/MotionContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ParticleEffect from '../components/ui/ParticleEffect';

const ApiKeySetup: React.FC = () => {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const { validateAndSaveApiKey, isLoading, error } = useApiKeyContext();
  const { Motion, pageTransition } = useMotion();
  const [isValidating, setIsValidating] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) return;
    
    setIsValidating(true);
    await validateAndSaveApiKey(apiKeyInput.trim());
    setIsValidating(false);
  };
  
  return (
    <Motion.div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      exit={pageTransition.exit}
      transition={pageTransition.transition}
    >
      <ParticleEffect type="wardrobe" active={true} />
      
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Motion.div
            className="inline-block mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ duration: 0.6, type: 'spring' }}
          >
            <Sparkles className="h-16 w-16 text-gold-500" />
          </Motion.div>
          <h1 className="font-display text-4xl mb-2">Miroir</h1>
          <p className="text-gray-600">AI Virtual Try-On Experience</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-elegant p-8">
          <h2 className="font-display text-2xl mb-6 text-center">
            Enter Your OpenAI API Key
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="apiKey" className="block text-sm text-gray-600 mb-2">
                API Key
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  id="apiKey"
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="sk-..."
                  className="input-field pl-10"
                  disabled={isLoading || isValidating}
                  autoFocus
                />
              </div>
              {error && (
                <Motion.p 
                  className="mt-2 text-red-500 text-sm"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </Motion.p>
              )}
            </div>
            
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isLoading || isValidating || !apiKeyInput.trim()}
            >
              {isValidating ? (
                <LoadingSpinner size="sm" text="" />
              ) : (
                'Validate & Continue'
              )}
            </button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Don't have an API key?
            </h3>
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-sm text-navy-500 hover:text-navy-700 transition-colors"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Get one from OpenAI
            </a>
          </div>
        </div>
        
        <p className="text-center text-xs text-gray-500 mt-6">
          Your API key is stored only in your browser's local storage and is never sent to our servers.
        </p>
      </div>
    </Motion.div>
  );
};

export default ApiKeySetup;