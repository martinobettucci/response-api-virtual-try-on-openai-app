import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  element: HTMLDivElement;
}

interface ParticleEffectProps {
  type?: 'wardrobe' | 'profile' | 'composition';
  active: boolean;
}

const ParticleEffect: React.FC<ParticleEffectProps> = ({ type = 'wardrobe', active }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | null>(null);
  
  // Create particles based on effect type
  useEffect(() => {
    if (!active || !containerRef.current) return;
    
    const container = containerRef.current;
    const width = container.offsetWidth;
    const height = container.offsetHeight;
    
    // Clear any existing particles
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    
    // Determine particle properties based on effect type
    let particleCount: number;
    let particleColors: string[];
    let particleSizes: number[];
    
    switch (type) {
      case 'wardrobe':
        particleCount = 15;
        particleColors = ['rgba(255, 195, 0, 0.2)', 'rgba(255, 255, 255, 0.1)'];
        particleSizes = [4, 8];
        break;
      case 'profile':
        particleCount = 20;
        particleColors = ['rgba(0, 64, 204, 0.15)', 'rgba(255, 255, 255, 0.15)'];
        particleSizes = [3, 7];
        break;
      case 'composition':
        particleCount = 25;
        particleColors = ['rgba(240, 0, 102, 0.1)', 'rgba(255, 195, 0, 0.15)', 'rgba(255, 255, 255, 0.2)'];
        particleSizes = [3, 10];
        break;
      default:
        particleCount = 15;
        particleColors = ['rgba(255, 195, 0, 0.2)'];
        particleSizes = [4, 8];
    }
    
    // Create particles
    const particles: Particle[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      const particleElement = document.createElement('div');
      particleElement.className = 'particle';
      
      const size = Math.random() * (particleSizes[1] - particleSizes[0]) + particleSizes[0];
      const colorIndex = Math.floor(Math.random() * particleColors.length);
      
      particleElement.style.width = `${size}px`;
      particleElement.style.height = `${size}px`;
      particleElement.style.background = particleColors[colorIndex];
      particleElement.style.boxShadow = `0 0 ${size * 2}px ${particleColors[colorIndex]}`;
      
      // Set initial position
      const x = Math.random() * width;
      const y = Math.random() * height;
      
      particleElement.style.left = `${x}px`;
      particleElement.style.top = `${y}px`;
      
      // Add to container
      container.appendChild(particleElement);
      
      // Create particle object
      particles.push({
        x,
        y,
        size,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.3,
        element: particleElement
      });
    }
    
    particlesRef.current = particles;
    
    // Start animation
    const animate = () => {
      particles.forEach(particle => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Boundary check
        if (particle.x < -particle.size) particle.x = width + particle.size;
        if (particle.x > width + particle.size) particle.x = -particle.size;
        if (particle.y < -particle.size) particle.y = height + particle.size;
        if (particle.y > height + particle.size) particle.y = -particle.size;
        
        // Update opacity for shimmer effect
        particle.opacity = 0.3 + Math.sin(Date.now() / 1000 * particle.speedX) * 0.2;
        
        // Update element
        particle.element.style.left = `${particle.x}px`;
        particle.element.style.top = `${particle.y}px`;
        particle.element.style.opacity = particle.opacity.toString();
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [active, type]);
  
  return (
    <div ref={containerRef} className={`particles-container ${active ? 'opacity-50' : 'opacity-0'}`}></div>
  );
};

export default ParticleEffect;