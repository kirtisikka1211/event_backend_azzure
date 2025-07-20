import React from 'react';
import { motion } from 'framer-motion';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "h-10" }) => {
  // Generate unique IDs for this instance
  const uniqueId = React.useId();
  const gradientId = `logoGradient-${uniqueId}`;
  
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`flex items-center space-x-3 ${className}`}
    >
      <motion.div 
        className="h-full relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <svg
          viewBox="0 0 201.56 87"
          className="h-full w-auto"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <style>
              {`.cls-1 { fill: #0060a5; } .cls-2 { fill: #80c67f; }`}
            </style>
          </defs>
          <motion.path 
            className="cls-1" 
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            d="M102.78,0h-50.21l-22.98,60.51-16.52-26.81H3.64c-2.01,0-3.64,1.63-3.64,3.64s1.63,3.64,3.64,3.64h5.36l17.34,28.14-3.62,9.51c-.71,1.86.23,3.95,2.09,4.66,1.86.71,3.95-.23,4.66-2.09l1.64-4.32.02.03L57.59,7.29h45.19c2.01,0,3.64-1.63,3.64-3.64s-1.63-3.64-3.64-3.64Z"
          />
          <g>
            <motion.path 
              className="cls-2"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              d="M65,14.52c-2.04,0-3.63,1.59-3.63,3.55v47.19c0,2.02,1.59,3.61,3.63,3.61s3.55-1.59,3.55-3.61V18.08c0-1.96-1.59-3.55-3.55-3.55Z"
            />
            <motion.path 
              className="cls-2"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              d="M90.87,32.42c-10.01,0-18.19,8.12-18.19,18.19s8.18,18.19,18.19,18.19,18.19-8.18,18.19-18.19-8.1-18.19-18.19-18.19ZM90.87,61.63c-6.09,0-11-4.99-11-11.02s4.92-11,11-11,11.02,4.92,11.02,11-4.94,11.02-11.02,11.02Z"
            />
            <motion.path 
              className="cls-2"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              d="M140.26,34.67c-2.59-1.44-5.57-2.25-8.74-2.25-10.08,0-18.19,8.12-18.19,18.19s8.1,18.19,18.19,18.19c4.13,0,7.89-1.44,11-3.76v3.99c-.13,5.93-4.99,10.79-11,10.79-4.28,0-8.05-2.4-9.93-6.22-.88-1.75-3.05-2.48-4.78-1.61-1.82.88-2.53,2.98-1.67,4.8,3.11,6.3,9.35,10.22,16.38,10.22,9.99,0,18.19-8.2,18.19-18.21v-18.19c0-6.88-3.84-12.85-9.45-15.94ZM142.01,53.93c-1.44,4.44-5.63,7.7-10.49,7.7-6.09,0-11.02-4.99-11.02-11.02s4.94-11,11.02-11c2.09,0,4.07.6,5.74,1.65,3.15,1.92,5.26,5.38,5.26,9.35,0,1.15-.19,2.29-.52,3.32Z"
            />
          </g>
          <motion.path 
            className="cls-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 1.1 }}
            d="M156.18,40.03l-.02.02s0-.02-.02-.04l.04.02Z"
          />
          <motion.path 
            className="cls-2"
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            d="M201.56,28.98c-3.46.08-6.51.89-9.12,2.06-5.07,2.21-8.49,5.72-10.08,7.64l-1.03,1.33-.03.02-5.68,7.35-1.53,1.99-.95,1.24-4.55,5.87-3.11,4.02-3.15,4.06-.77.99c-.4.52-.87,1.02-1.35,1.44-.23.25-.46.46-.69.65-.47.38-.97.74-1.47,1.06-.25.06-.51.09-.77.09-.8,0-1.53-.28-2.17-.78-1.59-1.16-1.9-3.4-.65-5l1.19-1.54c.05-.07.11-.14.17-.2.17-.22.28-.37.4-.52.06-.08.11-.15.15-.21l.12-.16c.05-.05.06-.07.08-.09,0-.01.01-.01.01-.02v-.02l5.85-7.57.84-1.09.75-.98,5.53-7.06.09-.12-.02-.02,5.84-7.55s.02-.04.04-.06l1.08-1.38v-.02c.35-.39.74-.76,1.11-1.1.19-.19.37-.34.56-.49.02-.02.05-.04.07-.06h.03c.83-.67,1.74-1.23,2.7-1.67.48-.21.98-.41,1.5-.58.4-.11.81-.23,1.21-.34.11-.04.23-.06.34-.08,7.57-1.98,17.46-1.1,17.46-1.1Z"
          />
          <motion.path 
            className="cls-2"
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1.4 }}
            d="M155.11,33.15c1.52-1.23,3.76-.94,4.99.65l7.52,9.74-4.57,5.86-8.59-11.18c-1.23-1.59-.94-3.84.65-5.07ZM173.14,50.61l1.59,2.07,7.97,10.33c1.25,1.59.94,3.84-.65,4.99-.63.5-1.36.79-2.17.79-1.08,0-2.09-.5-2.82-1.36l-6.82-8.81-1.65-2.13,4.55-5.88Z"
          />
        </svg>
      </motion.div>
    </motion.div>
  );
};

export default Logo;