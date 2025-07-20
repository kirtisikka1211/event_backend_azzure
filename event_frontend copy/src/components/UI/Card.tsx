import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', hover = true, onClick }) => {
  return (
    <motion.div
      whileHover={hover ? { y: -5, scale: 1.02 } : {}}
      className={`bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 ${
        hover ? 'hover:shadow-xl' : ''
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

export default Card;