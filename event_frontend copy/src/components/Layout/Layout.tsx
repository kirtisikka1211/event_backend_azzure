import React, { useState, createContext, useContext } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';
import UserSidebar from './UserSidebar';

interface LayoutProps {
  children: React.ReactNode;
}

interface SidebarContextType {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const SidebarContext = createContext<SidebarContextType>({
  collapsed: false,
  setCollapsed: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      <div className="min-h-screen bg-gray-50">
        <Header />
        {user?.role === 'admin' ? <Sidebar /> : <UserSidebar />}
        <main
          className={`
            transition-all duration-300
            pt-16
            ${collapsed
              ? 'md:ml-20'
              : 'md:ml-64'}
          `}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </SidebarContext.Provider>
  );
};

export default Layout; 