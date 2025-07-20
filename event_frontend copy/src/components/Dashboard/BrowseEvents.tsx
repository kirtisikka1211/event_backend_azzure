import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Search, Filter, ChevronDown, Users, Tag, Check, Ticket } from 'lucide-react';
import { apiClient } from '../../lib/api';
import Card from '../UI/Card';
import toast from 'react-hot-toast';
import RegistrationModal from './RegistrationModal';
import { useLocation } from 'react-router-dom';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  max_attendees: number;
  current_attendees: number;
  registration_fee: number;
  registration_fields?: Array<{
    key: string;
    label: string;
    type: string;
    required: boolean;
    options?: string[];
  }>;
  bank_details?: {
    account_holder: string;
    bank_name: string;
    account_number: string;
    ifsc_code: string;
    qr_code_url?: string;
  };
  image_url?: string;
}

interface Registration {
  id: string;
  event_id: string;
  events: Event;
}

const BrowseEvents: React.FC = () => {
  const location = useLocation();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [userRegistrations, setUserRegistrations] = useState<Registration[]>([]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchEvents(searchQuery);
    }, 300); // 300ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  useEffect(() => {
    fetchUserRegistrations();
  }, []);

  // Handle selectedEventId from location state (for shared event links)
  useEffect(() => {
    const state = location.state as { selectedEventId?: string } | null;
    const selectedEventId = state?.selectedEventId;
    
    if (selectedEventId && events.length > 0) {
      const eventToSelect = events.find(event => event.id === selectedEventId);
      if (eventToSelect) {
        setSelectedEvent(eventToSelect);
        // Clear the state to prevent reopening on navigation
        window.history.replaceState({}, document.title);
      }
    }
  }, [events, location.state]);

  const fetchUserRegistrations = async () => {
    try {
      const registrations = await apiClient.getRegistrations();
      setUserRegistrations(registrations);
    } catch (error) {
      console.error('Error fetching user registrations:', error);
    }
  };

  const fetchEvents = async (query = '') => {
    setLoading(true);
    try {
      const response = await apiClient.getEvents(query);
      console.log('Fetched events:', response); // <-- Add this line
      setEvents(response);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = (event: Event) => {
    setSelectedEvent(event);
  };

  const handleRegistrationComplete = () => {
    setSelectedEvent(null);
    fetchEvents();
    fetchUserRegistrations();
  };

  const isRegistered = (eventId: string) => {
    return userRegistrations.some(reg =>
      (reg.event_id && typeof reg.event_id === 'object' && reg.event_id._id === eventId) ||
      (reg.event_id && typeof reg.event_id === 'string' && reg.event_id === eventId) ||
      (reg.events && reg.events._id === eventId)
    );
  };

  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    const now = new Date();
    const matchesSearch = (event.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                         (event.location?.toLowerCase() || '').includes(searchQuery.toLowerCase());

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        {/* Header Section */}
         <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-700 to-primary-500 p-8 text-white shadow-lg">
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-xl"
            >
              <h1 className="text-2xl font-semibold mb-2">Browse Events</h1>
              <p className="text-blue-100 text-sm">Discover and register for exciting upcoming events</p>
            </motion.div>
          </div>
         
        </div>

        {/* Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col md:flex-row gap-4"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search events by title or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="appearance-none w-full md:w-48 px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
            >
              <option value="all">All Events</option>
              <option value="upcoming">Upcoming Events</option>
              <option value="past">Past Events</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>
        </motion.div>

        {/* Events List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {filteredEvents.length === 0 ? (
            <div className="w-full">
              <Card className="p-12 text-center">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                <p className="text-sm text-gray-500">Try adjusting your search or filter settings</p>
              </Card>
            </div>
          ) : (
            filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleRegister(event)}
                className="cursor-pointer"
              >
                <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <div className="flex items-start space-x-6 p-6">
                    {/* Event Image or Placeholder */}
                    <div className="relative w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50">
                      {event.image_url ? (
                        <img
                          src={event.image_url}
                          alt={event.title}
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="flex flex-col items-center">
                            <Ticket className="w-10 h-10 text-blue-500/50" />
                            <span className="mt-1 text-xs text-blue-500/50">Event</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Event Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                            {event.title}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{event.description}</p>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          {event.registration_fee > 0 && (
                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
                              ₹{event.registration_fee}
                            </span>
                          )}
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            new Date(event.date) > new Date()
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {new Date(event.date) > new Date() ? 'Upcoming' : 'Past'}
                          </span>
                        </div>
                      </div>

                      {/* Event Info */}
                      <div className="mt-4 flex items-center flex-wrap gap-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                          <span>{new Date(event.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-2 text-blue-500" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="w-4 h-4 mr-2 text-blue-500" />
                          <span>{event.current_attendees} / {event.max_attendees} spots</span>
                        </div>
                      </div>

                      {/* Register Button */}
                      <div className="mt-4">
                        {new Date(event.date) > new Date() && (
                          isRegistered(event.id) ? (
                            <div className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-green-50 text-green-700 border border-green-100">
                              <Check className="w-4 h-4 mr-2" />
                              Registered
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRegister(event);
                              }}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                event.current_attendees >= event.max_attendees
                                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-blue-600 hover:to-blue-800 focus:ring-blue-500 shadow-lg hover:shadow-xl'
                              }`}
                              disabled={event.current_attendees >= event.max_attendees}
                            >
                              {event.current_attendees >= event.max_attendees ? 'Full' : 'Register'}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>

      {/* Registration Modal */}
      {selectedEvent && (
        <RegistrationModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onRegistrationComplete={handleRegistrationComplete}
        />
      )}
    </div>
  );
};

export default BrowseEvents;