import React, { useState } from 'react';
import { Settings, Key, Sparkles, HelpCircle, GripVertical, Plus, X, GripHorizontal } from 'lucide-react';
import { useMotion } from '../contexts/MotionContext';
import { useApiKeyContext } from '../contexts/ApiKeyContext';
import { useCategories } from '../contexts/CategoriesContext'
import { useTokenUsage } from '../contexts/TokenUsageContext';
import { Reorder } from 'framer-motion';

const Configuration: React.FC = () => {
  const { Motion, pageTransition } = useMotion();
  const { quality, setQuality, clearApiKey } = useApiKeyContext();
  const { categories, addCategory, removeCategory, reorderCategories } = useCategories();
  const { usage, resetUsage } = useTokenUsage();
  const [newCategory, setNewCategory] = useState('');
  
  const handleShowOnboarding = () => {
    localStorage.removeItem('hideOnboarding');
    window.location.reload();
  };
  
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategory.trim()) {
      addCategory(newCategory.trim());
      setNewCategory('');
    }
  };
  
  return (
    <Motion.div
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      exit={pageTransition.exit}
      transition={pageTransition.transition}
      className="max-w-3xl mx-auto"
    >
      <div className="flex items-center gap-3 mb-8">
        <Settings className="h-8 w-8 text-navy-500" />
        <div>
          <h1 className="font-display text-4xl mb-2">Configuration</h1>
          <p className="text-gray-600">Manage your API settings and preferences</p>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Token Usage */}
        <div className="card">
          <div className="flex items-start gap-4">
            <Sparkles className="h-6 w-6 text-gold-500 flex-shrink-0 mt-1" />
            <div className="flex-grow">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-display">Token Usage</h2>
                <button
                  onClick={resetUsage}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Reset Counter
                </button>
              </div>
              
              <p className="text-gray-600 mb-6">
                Track your OpenAI API token usage across all operations.
              </p>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-ivory-50 rounded-lg">
                  <h3 className="font-medium mb-1">Input Text Tokens</h3>
                  <p className="text-2xl font-display text-navy-600">
                    {usage.inputTextTokens.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">Used for prompts</p>
                </div>
                
                <div className="p-4 bg-ivory-50 rounded-lg">
                  <h3 className="font-medium mb-1">Input Image Tokens</h3>
                  <p className="text-2xl font-display text-navy-600">
                    {usage.inputImageTokens.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">Used for image processing</p>
                </div>
                
                <div className="p-4 bg-ivory-50 rounded-lg">
                  <h3 className="font-medium mb-1">Output Tokens</h3>
                  <p className="text-2xl font-display text-navy-600">
                    {usage.outputTokens.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">Used for generations</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* API Quality Settings */}
        <div className="card">
          <div className="flex items-start gap-4">
            <Sparkles className="h-6 w-6 text-gold-500 flex-shrink-0 mt-1" />
            <div className="flex-grow">
              <h2 className="text-xl font-display mb-2">AI Generation Quality</h2>
              <p className="text-gray-600 mb-6">
                Control the quality level of AI-generated images. Higher quality settings will use more API tokens but produce better results.
              </p>
              
              <div className="grid md:grid-cols-3 gap-4">
                <QualityOption
                  value="low"
                  currentQuality={quality}
                  onChange={setQuality}
                  title="Low Quality"
                  description="Faster generation, fewer tokens"
                  tokenEstimate="~150-250 tokens"
                />
                <QualityOption
                  value="medium"
                  currentQuality={quality}
                  onChange={setQuality}
                  title="Medium Quality"
                  description="Balanced quality and cost"
                  tokenEstimate="~300-500 tokens"
                />
                <QualityOption
                  value="high"
                  currentQuality={quality}
                  onChange={setQuality}
                  title="High Quality"
                  description="Best possible results"
                  tokenEstimate="~600-1000 tokens"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* API Key Management */}
        <div className="card">
          <div className="flex items-start gap-4">
            <Key className="h-6 w-6 text-navy-500 flex-shrink-0 mt-1" />
            <div className="flex-grow">
              <h2 className="text-xl font-display mb-2">API Key Management</h2>
              <p className="text-gray-600 mb-6">
                Manage your OpenAI API key and access settings.
              </p>
              
              <button
                onClick={() => clearApiKey()}
                className="btn btn-secondary text-red-600 hover:bg-red-50"
              >
                Reset API Key
              </button>
            </div>
          </div>
        </div>
        
        {/* Category Management */}
        <div className="card">
          <div className="flex items-start gap-4">
            <GripVertical className="h-6 w-6 text-gold-500 flex-shrink-0 mt-1" />
            <div className="flex-grow">
              <h2 className="text-xl font-display mb-2">Wardrobe Categories</h2>
              <p className="text-gray-600 mb-6">
                Manage the categories available for organizing your wardrobe items.
              </p>
              
              <form onSubmit={handleAddCategory} className="flex gap-3 mb-6">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="New category name..."
                  className="input-field flex-grow"
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!newCategory.trim()}
                >
                  <Plus className="h-5 w-5" />
                  Add
                </button>
              </form>
              
              <Reorder.Group
                axis="y"
                values={categories}
                onReorder={reorderCategories}
                className="space-y-2"
              >
                {categories.map((category) => (
                  <Reorder.Item
                    key={category}
                    value={category}
                    className="flex items-center justify-between p-3 bg-ivory-50 rounded-lg cursor-move"
                    whileDrag={{
                      scale: 1.02,
                      boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
                      background: "white"
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <GripHorizontal className="h-5 w-5 text-gray-400" />
                      <span className="font-medium">{category}</span>
                    </div>
                    <button
                      onClick={() => removeCategory(category)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </div>
          </div>
        </div>
        
        {/* Help & Onboarding */}
        <div className="card">
          <div className="flex items-start gap-4">
            <HelpCircle className="h-6 w-6 text-blush-500 flex-shrink-0 mt-1" />
            <div className="flex-grow">
              <h2 className="text-xl font-display mb-2">Help & Onboarding</h2>
              <p className="text-gray-600 mb-6">
                Review the introduction or show the onboarding carousel again.
              </p>
              
              <button
                onClick={handleShowOnboarding}
                className="btn btn-secondary"
              >
                Show Onboarding
              </button>
            </div>
          </div>
        </div>
      </div>
    </Motion.div>
  );
};

interface QualityOptionProps {
  value: 'low' | 'medium' | 'high';
  currentQuality: string;
  onChange: (quality: 'low' | 'medium' | 'high') => void;
  title: string;
  description: string;
  tokenEstimate: string;
}

const QualityOption: React.FC<QualityOptionProps> = ({
  value,
  currentQuality,
  onChange,
  title,
  description,
  tokenEstimate
}) => (
  <button
    onClick={() => onChange(value)}
    className={`p-4 rounded-lg border-2 text-left transition-all ${
      currentQuality === value
        ? 'border-navy-500 bg-navy-50'
        : 'border-gray-200 hover:border-navy-200'
    }`}
  >
    <h3 className="font-medium mb-1">{title}</h3>
    <p className="text-sm text-gray-600 mb-2">{description}</p>
    <p className="text-xs text-gray-500">{tokenEstimate}</p>
  </button>
);

export default Configuration;