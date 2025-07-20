import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Calendar, ClipboardList, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSidebar } from './Layout';

const UserSidebar: React.FC = () => {
  const location = useLocation();
  const { collapsed, setCollapsed } = useSidebar();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navigationItems = [
    {
      path: '/dashboard',
      icon: Home,
      label: 'Dashboard',
      gradient: '',
    },
    {
      path: '/dashboard/registrations',
      icon: ClipboardList,
      label: 'My Registrations',
      gradient: '',
    },
    {
      path: '/dashboard/browse-events',
      icon: Calendar,
      label: 'Browse Events',
      gradient: 'bg-gradient-to-r from-primary-600 to-primary-500 text-white',
    },
  ];

  return (
    <motion.div
      initial={false}
      animate={{ width: collapsed ? '5rem' : '16rem' }}
      className="fixed left-0 top-16 bottom-0 bg-white border-r border-gray-200 flex flex-col z-30 shadow-sm"
    >
      <div className="flex-1 py-6 flex flex-col overflow-y-auto">
        {/* Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-8 bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:shadow-md transition-shadow"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          )}
        </button>

        {/* Navigation Links */}
        <nav className="space-y-1 px-3">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                item.gradient && !collapsed ? item.gradient : ''
              } ${
                isActive(item.path)
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <span className="ml-3 text-sm font-medium">{item.label}</span>
              )}
            </Link>
          ))}
        </nav>
      </div>
    </motion.div>
  );
};

export default UserSidebar; 