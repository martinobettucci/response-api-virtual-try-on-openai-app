import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Menu, X, Settings, ChevronRight } from 'lucide-react';
import ApiCostDisplay from '../ui/ApiCostDisplay';
import { useApiKeyContext } from '../../contexts/ApiKeyContext';
import { useMotion } from '../../contexts/MotionContext';

const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  const { Motion } = useMotion();
  
  return (
    <Link to={to} className="relative px-4 py-2">
      <span className={`relative z-10 transition-colors duration-300 ${isActive ? 'text-navy-600' : 'text-gray-700 hover:text-navy-500'}`}>
        {children}
      </span>
      {isActive && (
        <Motion.span
          className="absolute inset-0 bg-ivory-200 rounded-md"
          layoutId="navbar-indicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}
    </Link>
  );
};

const Navbar = () => {
  const { clearApiKey } = useApiKeyContext();
  const { quality, setQuality } = useApiKeyContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { Motion } = useMotion();
  
  // Track scroll position for navbar appearance
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-soft py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              <Sparkles className="h-6 w-6 text-gold-500" />
            </Motion.div>
            <span className="font-display text-2xl tracking-tight">Miroir</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <NavLink to="/">Dashboard</NavLink>
            <NavLink to="/wardrobe">Wardrobe</NavLink>
            <NavLink to="/profile-photos">Profile Photos</NavLink>
            <NavLink to="/compositions">Try-On</NavLink>
          </nav>
          
          {/* Settings Button */}
          <div className="hidden md:block">
            <Link
              to="/configuration"
              className="btn btn-secondary text-sm px-4 py-2 flex items-center gap-3"
            >
              <ApiCostDisplay />
              <Settings className="h-4 w-4" />
              <span>Configuration</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-1"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <Motion.nav
            className="md:hidden mt-4 pb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col space-y-3">
              <Link
                to="/"
                className="px-4 py-2 rounded-md hover:bg-ivory-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/wardrobe"
                className="px-4 py-2 rounded-md hover:bg-ivory-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Wardrobe
              </Link>
              <Link
                to="/profile-photos"
                className="px-4 py-2 rounded-md hover:bg-ivory-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Profile Photos
              </Link>
              <Link
                to="/compositions"
                className="px-4 py-2 rounded-md hover:bg-ivory-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Try-On
              </Link>
              <Link
                to="/configuration"
                className="px-4 py-2 rounded-md hover:bg-ivory-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Configuration
              </Link>
            </div>
          </Motion.nav>
        )}
      </div>
    </header>
  );
};

export default Navbar;