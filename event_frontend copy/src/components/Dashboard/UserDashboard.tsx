import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Users, CheckCircle, Bell, Search, Filter, ChevronDown, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../UI/Card';
import Button from '../UI/Button';
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
  };
  registered_at: string;
}

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
    fetchRegistrations();
  }, []);

  const fetchEvents = async () => {
    try {
      const data = await apiClient.getEvents();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  }; 

  const fetchRegistrations = async () => {
    try {
      const data = await apiClient.getRegistrations();
      setRegistrations(data);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    }
  };

  const upcomingRegistrations = registrations.filter(reg => reg.events && reg.events.date && new Date(reg.events.date) > new Date());
  const upcomingEvents = events.filter(event => event.date && new Date(event.date) > new Date());

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Available Events',
      value: upcomingEvents.length,
      icon: Calendar,
      color: 'from-primary-600 to-blue-300',
    },
    {
      title: 'My Registrations',
      value: registrations.length,
      icon: CheckCircle,
      color: 'from-primary-600 to-blue-300',
    },
  ];

  return (
<div className="space-y-8">
  {/* Welcome Section */}
   <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 p-8 text-white shadow-lg">
    <div className="relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl"
      >
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.full_name}!</h1>
        <p className="text-blue-100 text-sm">
          Discover and join exciting events happening around you.
        </p>
      </motion.div>
    </div>
  </div>



      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden"
          >
            <div className="p-6">
              <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">
                {stat.value}
              </h3>
              <p className="text-gray-500 text-sm">{stat.title}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Events Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Recent Events</h2>
          <Link
            to="/dashboard/browse-events"
            className="inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            View all events
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingEvents.slice(0, 3).map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to="/dashboard/browse-events" className="block">
                <Card className="group hover:shadow-lg transition-all duration-300">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                      {event.title}
                    </h3>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 text-primary-500" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Registrations Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">My Recent Registrations</h2>
          <Link
            to="/dashboard/registrations"
            className="inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            View all registrations
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingRegistrations.slice(0, 3).map((registration, index) => (
            <motion.div
              key={registration.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group hover:shadow-lg transition-all duration-300">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {registration.events.title}
                  </h3>
                  <div className="space-y-2">
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
                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-2 text-primary-500" />
                      <span>{registration.events.current_attendees} / {registration.events.max_attendees} spots</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default UserDashboard;