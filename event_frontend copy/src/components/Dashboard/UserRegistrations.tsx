import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Search, Filter, ChevronDown, Check, AlertCircle, CreditCard } from 'lucide-react';
import { apiClient } from '../../lib/api';
import Card from '../UI/Card';
import toast from 'react-hot-toast';

interface Registration {
  id: string;
  event_id: string;
  events: {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    max_attendees: number;
    current_attendees: number;
    registration_fee: number;
  };
  registered_at: string;
  payment_verified?: boolean;
  payment_details?: {
    transaction_id: string;
    
   
    amount: number;
  };
}

const UserRegistrations: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const response = await apiClient.getRegistrations();
      console.log('Fetched registrations:', response); // Debug log
      setRegistrations(response);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast.error('Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  const filteredRegistrations = registrations.filter(reg => {
    if (!reg.events || !reg.events.date) return false;
    const eventDate = new Date(reg.events.date);
    const now = new Date();
    const matchesSearch = (reg.events.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                         (reg.events.location?.toLowerCase() || '').includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    switch (filterType) {
      case 'upcoming':
        return eventDate > now;
      case 'past':
        return eventDate <= now;
      default:
        return true;
    }
  });

  const upcomingRegistrations = registrations.filter(reg => reg.events && reg.events.date && new Date(reg.events.date) > new Date());
  const pastRegistrations = registrations.filter(reg => reg.events && reg.events.date && new Date(reg.events.date) <= new Date());

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
       <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-700 to-primary-500 p-8 text-white shadow-lg">
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl"
          >
            <h1 className="text-2xl font-semibold mb-2">My Registrations</h1>
            <p className="text-blue-100 text-sm">View and manage your event registrations</p>
          </motion.div>
        </div>
        
      </div>

      {/* Search and Filter Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col md:flex-row gap-4 mb-8"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search registrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="appearance-none w-full md:w-48 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
          >
            <option value="all">All Registrations</option>
            <option value="upcoming">Upcoming Events</option>
            <option value="past">Past Events</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
        </div>
      </motion.div>

      {/* Registrations Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Registered Events</h2>
          <span className="text-sm text-gray-500">
            {upcomingRegistrations.length} upcoming • {pastRegistrations.length} past
          </span>
        </div>

        {filteredRegistrations.length === 0 ? (
          <Card className="p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No registrations found</h3>
            <p className="text-gray-600">Try adjusting your search or filter settings</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRegistrations.map((registration, index) => (
              <motion.div
                key={registration.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="group hover:shadow-lg transition-all duration-300">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {registration.events.title}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        new Date(registration.events.date) > new Date()
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {new Date(registration.events.date) > new Date() ? 'Upcoming' : 'Past'}
                      </span>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 text-primary-500" />
                        <span>{new Date(registration.events.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2 text-primary-500" />
                        <span>{registration.events.time}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 text-primary-500" />
                        <span>{registration.events.location}</span>
                      </div>
                      
                      {/* Payment Status */}
                      {registration.events.registration_fee > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-gray-600">
                              <CreditCard className="w-4 h-4 mr-2 text-primary-500" />
                              <span>₹{registration.events.registration_fee}</span>
                            </div>
                            
                            {registration.payment_verified ? (
                              <span className="flex items-center text-green-600 text-xs font-medium">
                                <Check className="w-3 h-3 mr-1" /> Payment Verified
                              </span>
                            ) : (
                              <span className="flex items-center text-amber-600 text-xs font-medium">
                                <AlertCircle className="w-3 h-3 mr-1" /> Verification Pending
                              </span>
                            )}
                          </div>
                          
                          {registration.payment_details && (
                            <div className="mt-2 text-xs text-gray-500">
                              <p>Transaction ID: {registration.payment_details.transaction_id}</p>
                              <p>Method: {registration.payment_details.payment_method}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default UserRegistrations;