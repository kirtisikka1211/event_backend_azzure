import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit2, Trash2, Calendar, Users, Clock, MapPin, Eye, Share2 } from 'lucide-react';
import { apiClient } from '../../lib/api';
import Button from '../UI/Button';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import EventDetailsModal from './EventDetailsModal';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  max_attendees: number;
  current_attendees: number;
  bank_details?: any;
  registration_fee?: number;
}

const ManageEvents: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'attendees'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const data = await apiClient.getEvents();
      setEvents(data);
    } catch (error) {
      toast.error('Failed to fetch events');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await apiClient.deleteEvent(eventId);
        toast.success('Event deleted successfully');
        fetchEvents();
      } catch (error) {
        toast.error('Failed to delete event');
      }
    }
  };

  const handleEditEvent = (event: Event) => {
    navigate(`/admin/create-event?id=${event.id}`);
  };

  const handleViewDetails = (event: Event) => {
    setSelectedEvent(event);
    setShowDetailsModal(true);
  };

  const sortedEvents = [...events].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    } else {
      return sortOrder === 'asc'
        ? a.current_attendees - b.current_attendees
        : b.current_attendees - a.current_attendees;
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">
          Manage Events
        </h1>
        <div className="flex items-center space-x-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'attendees')}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="date">Sort by Date</option>
            <option value="attendees">Sort by Attendees</option>
          </select>
          <Button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            variant="secondary"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </Button>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attendees
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedEvents.map((event) => (
                <motion.tr
                  key={event.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {event.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {event.description.substring(0, 100)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                      <Clock className="w-4 h-4 text-gray-400 ml-2" />
                      <span className="text-sm text-gray-900">{event.time}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {event.location}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {event.current_attendees} / {event.max_attendees}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditEvent(event)}
                        className="text-indigo-600 hover:text-indigo-800"
                        title="Edit Event"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleViewDetails(event)}
                        className="text-blue-600 hover:text-blue-800"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                        {event.share_id && (
                        <button
                          onClick={() => {
                            const url = `${window.location.origin}/share/${event.share_id}`;
                            navigator.clipboard.writeText(url);
                            toast.success('Shareable URL copied to clipboard!');
                          }}
                          className="text-green-600 hover:text-green-800"
                          title="Copy Shareable URL"
                        >
                          <Share2 className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete Event"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Event Details Modal */}
      {showDetailsModal && selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedEvent(null);
          }}
        />
      )}

      {/* Admin Dashboard Footer */}
      <footer className="mt-12 border-t border-gray-200 pt-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-500 mb-4 md:mb-0">
            © {new Date().getFullYear()} Admin Dashboard. All rights reserved.
          </div>
          <div className="flex items-center space-x-6">
            <a
              href="/admin/help"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Help Center
            </a>
            <a
              href="/admin/settings"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Settings
            </a>
            <a
              href="/admin/support"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ManageEvents;