import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useMotion } from '../../contexts/MotionContext';

const Layout = () => {
  const { Motion, pageTransition } = useMotion();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Motion.div
          className="container mx-auto px-4 py-8"
          initial={pageTransition.initial}
          animate={pageTransition.animate}
          exit={pageTransition.exit}
          transition={pageTransition.transition}
        >
          <Outlet />
        </Motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;