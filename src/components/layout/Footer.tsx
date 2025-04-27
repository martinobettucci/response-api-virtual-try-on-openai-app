import React from 'react';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="py-6 border-t border-gray-100 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Miroir — AI Virtual Try-On by{' '}
              <a
                href="https://p2enjoy.studio"
                target="_blank"
                rel="noopener noreferrer"
                className="text-navy-500 hover:text-navy-600"
              >
                P2Enjoy SAS
              </a>
            </p>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-blush-500 fill-blush-500" />
            <span>by</span>
            <a
              href="https://p2enjoy.studio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-navy-500 hover:text-navy-600"
            >
              P2Enjoy Studio
            </a>
          </div>
        </div>
        
        <div className="mt-4 text-center text-xs text-gray-400">
          <p>This application uses browser-local data storage only. No data is uploaded to any server.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;