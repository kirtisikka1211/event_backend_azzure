import React from 'react';
import { motion } from 'framer-motion';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../UI/Logo';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white/95 backdrop-blur-sm border-b border-gray-200 fixed top-0 w-full z-40"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center h-16">
          <Logo className="h-8" />
          
          {user && (
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{user.full_name}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  user.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {user.role}
                </span>
              </div>
              <button
                onClick={signOut}
                className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default Header;