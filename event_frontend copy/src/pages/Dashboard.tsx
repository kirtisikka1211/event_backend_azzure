import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminDashboard from '../components/Dashboard/AdminDashboard';
import UserDashboard from '../components/Dashboard/UserDashboard';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user?.role === 'admin' ? <AdminDashboard /> : <UserDashboard />}
      </main>
    </div>
  );
};

export default Dashboard;