import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import OnboardingCarousel from './components/OnboardingCarousel';
import Layout from './components/layout/Layout';
import ApiKeySetup from './pages/ApiKeySetup';
import Dashboard from './pages/Dashboard';
import Wardrobe from './pages/Wardrobe';
import ProfilePhotos from './pages/ProfilePhotos';
import Configuration from './pages/Configuration';
import Compositions from './pages/Compositions';
import { useApiKey } from './hooks/useApiKey';
import { ApiKeyProvider } from './contexts/ApiKeyContext';
import { MotionProvider } from './contexts/MotionContext';
import { DatabaseProvider } from './contexts/DatabaseContext';
import { CategoriesProvider } from './contexts/CategoriesContext';
import { TokenUsageProvider } from './contexts/TokenUsageContext';

function AppRoutes() {
  const { apiKey, isLoading } = useApiKey();
  
  if (isLoading) {
    return null;
  }
  
  return (
    <AnimatePresence mode="wait">
      <Routes>
        {!apiKey ? (
          <>
            <Route path="/setup" element={<ApiKeySetup />} />
            <Route path="*" element={<Navigate to="/setup" replace />} />
          </>
        ) : (
          <>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="wardrobe" element={<Wardrobe />} />
              <Route path="profile-photos" element={<ProfilePhotos />} />
              <Route path="compositions" element={<Compositions />} />
              <Route path="configuration" element={<Configuration />} />
            </Route>
            <Route path="/setup" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const [key, setKey] = useState(Date.now());
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('hideOnboarding');
  });
  
  // Force remount of entire app when localStorage changes
  useEffect(() => {
    const handleStorage = () => {
      setKey(Date.now());
    };
    
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);
  
  return (
    <div key={key}>
      <DatabaseProvider>
        <TokenUsageProvider>
          <CategoriesProvider>
            <Router>
              <ApiKeyProvider>
                <MotionProvider>
                  <AnimatePresence>
                    {showOnboarding && (
                      <OnboardingCarousel onClose={() => setShowOnboarding(false)} />
                    )}
                  </AnimatePresence>
                  <AppRoutes />
                </MotionProvider>
              </ApiKeyProvider>
            </Router>
          </CategoriesProvider>
        </TokenUsageProvider>
      </DatabaseProvider>
    </div>
  );
}

export default App;