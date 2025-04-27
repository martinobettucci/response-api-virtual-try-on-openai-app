import React from 'react';
import { Link } from 'react-router-dom';
import { ShirtIcon, User, Sparkles } from 'lucide-react';
import { useMotion } from '../contexts/MotionContext';
import { useDatabase } from '../contexts/DatabaseContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Dashboard: React.FC = () => {
  const { Motion, pageTransition } = useMotion();
  const { 
    wardrobeItems, 
    profilePhotos, 
    compositions,
    isLoading
  } = useDatabase();
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }
  
  const stats = [
    {
      title: 'Wardrobe Items',
      count: wardrobeItems?.length || 0,
      icon: <ShirtIcon className="h-6 w-6 text-navy-500" />,
      link: '/wardrobe',
      color: 'bg-navy-50'
    },
    {
      title: 'Profile Photos',
      count: profilePhotos?.length || 0,
      icon: <User className="h-6 w-6 text-blush-500" />,
      link: '/profile-photos',
      color: 'bg-blush-50'
    },
    {
      title: 'Virtual Try-Ons',
      count: compositions?.length || 0,
      icon: <Sparkles className="h-6 w-6 text-gold-500" />,
      link: '/compositions',
      color: 'bg-gold-50'
    }
  ];
  
  return (
    <Motion.div
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      exit={pageTransition.exit}
      transition={pageTransition.transition}
      className="max-w-5xl mx-auto"
    >
      <header className="text-center mb-12">
        <h1 className="font-display text-4xl mb-3">Welcome to Miroir</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Your AI-powered virtual try-on experience. Upload wardrobe items and profile photos, then create stunning virtual try-ons with the power of OpenAI.
        </p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {stats.map((stat, index) => (
          <Link to={stat.link} key={index}>
            <Motion.div 
              className={`card hover:scale-105 ${stat.color} h-full`}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex flex-col items-center text-center p-4">
                <div className="mb-4">
                  {stat.icon}
                </div>
                <h2 className="text-xl font-semibold mb-1">{stat.title}</h2>
                <p className="text-3xl font-display">{stat.count}</p>
              </div>
            </Motion.div>
          </Link>
        ))}
      </div>
      
      <div className="bg-white rounded-xl shadow-elegant overflow-hidden">
        <div className="p-8">
          <h2 className="font-display text-2xl mb-4">Getting Started</h2>
          <ol className="space-y-4">
            <li className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-navy-100 text-navy-600 flex items-center justify-center mr-3 mt-0.5">
                1
              </div>
              <div>
                <h3 className="font-medium">Upload Wardrobe Items</h3>
                <p className="text-gray-600 text-sm">Take photos of clothing items or accessories and upload them to your virtual wardrobe. Our AI will extract them onto a clean background.</p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-navy-100 text-navy-600 flex items-center justify-center mr-3 mt-0.5">
                2
              </div>
              <div>
                <h3 className="font-medium">Add Profile Photos</h3>
                <p className="text-gray-600 text-sm">Upload photos of yourself in different poses. These will be used as the base for your virtual try-ons.</p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-navy-100 text-navy-600 flex items-center justify-center mr-3 mt-0.5">
                3
              </div>
              <div>
                <h3 className="font-medium">Create Virtual Try-Ons</h3>
                <p className="text-gray-600 text-sm">Select a profile photo and wardrobe item, then let the AI create a realistic composition of you wearing the item.</p>
              </div>
            </li>
          </ol>
        </div>
        
        <div className="bg-ivory-50 p-8 border-t border-ivory-100">
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/wardrobe" className="btn btn-primary">
              <ShirtIcon className="h-5 w-5" />
              Start with Wardrobe
            </Link>
            <Link to="/profile-photos" className="btn btn-secondary">
              <User className="h-5 w-5" />
              Manage Profile Photos
            </Link>
          </div>
        </div>
      </div>
    </Motion.div>
  );
};

export default Dashboard;