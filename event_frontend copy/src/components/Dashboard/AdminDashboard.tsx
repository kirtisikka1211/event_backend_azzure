import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, Users, TrendingUp, Search, Filter, ChevronDown, BarChart2 } from 'lucide-react';
import { apiClient } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../UI/Button';
import Card from '../UI/Card';
import EventForm from './EventForm';
import EventCard from './EventCard';
import toast from 'react-hot-toast';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalRegistrations: 0,
    upcomingEvents: 0,
    pastEvents: 0,
  });
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchEvents(searchQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const fetchEvents = async (query = '') => {
    try {
      const data = await apiClient.getEvents(query);
      setEvents(data);
    } catch (error) {
      toast.error('Failed to fetch events');
    }
  };

  const fetchStats = async () => {
    try {
      const data = await apiClient.getAdminStats();
      setStats(data);
    } catch (error) {
      toast.error('Failed to fetch stats');
    }
  };

  const handleCreateEvent = async (eventData: any) => {
    try {
      await apiClient.createEvent(eventData);
      toast.success('Event created successfully');
      fetchEvents();
      setShowEventForm(false);
    } catch (error) {
      toast.error('Failed to create event');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await apiClient.deleteEvent(eventId);
      toast.success('Event deleted successfully');
      fetchEvents();
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    const now = new Date();

    switch (filterType) {
      case 'upcoming':
        return eventDate > now;
      case 'past':
        return eventDate <= now;
      default:
        return true;
    }
  });

  const statsCards = [
    {
      title: 'Total Events',
      value: stats.totalEvents,
      icon: Calendar,
      color: 'from-primary-600 to-primary-500',
    },
    {
      title: 'Total Registrations',
      value: stats.totalRegistrations,
      icon: Users,
      color: 'from-primary-600 to-primary-500',
    },
    {
      title: 'Upcoming Events',
      value: stats.upcomingEvents,
      icon: TrendingUp,
      color: 'from-primary-600 to-primary-500',
    },
    {
      title: 'Past Events',
      value: stats.pastEvents,
      icon: BarChart2,
      color: 'from-primary-600 to-primary-500',
    },
  ];

  return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.full_name}
              </h1>
              <p className="mt-2 text-gray-500">
                Manage your events and track registrations
              </p>
            </div>
          </div>
        </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
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
              <h3 className="mt-4 text-2xl font-semibold text-gray-900">
                {stat.value}
              </h3>
              <p className="text-gray-500">{stat.title}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

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
            placeholder="Search events..."
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
            <option value="all">All Events</option>
            <option value="upcoming">Upcoming Events</option>
            <option value="past">Past Events</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
        </div>
      </motion.div>

      {/* Events Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            isAdmin={true}
            onEdit={() => setEditingEvent(event)}
            onDelete={() => handleDeleteEvent(event.id)}
          />
        ))}
      </motion.div>

      {/* Create/Edit Event Modal */}
      {(showEventForm || editingEvent) && (
        <EventForm
          event={editingEvent}
          onSave={handleCreateEvent}
          onClose={() => {
            setShowEventForm(false);
            setEditingEvent(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;