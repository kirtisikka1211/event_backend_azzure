import * as React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/api';
import toast from 'react-hot-toast';
import { Calendar, MapPin, Clock, Users, Tag } from 'lucide-react';
import Card from './UI/Card';

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
}

const SharedEvent: React.FC = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        if (!shareId) {
          setError('Invalid event link');
          return;
        }

        const response = await apiClient.getEventByShareId(shareId);
        setEvent(response);
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Event not found or no longer available');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [shareId]);

  useEffect(() => {
    // If user is authenticated and event is loaded, redirect to registration
    if (!authLoading && user && event) {
      // Redirect to the registration page
      navigate(`/dashboard/browse-events`, { state: { selectedEventId: event.id } });
      toast.success('You\'re being redirected to register for this event');
    }
  }, [user, authLoading, event, navigate]);

  const handleLogin = () => {
    // Store the event ID in session storage to redirect after login
    if (event) {
      sessionStorage.setItem('redirectEventId', event.id);
      sessionStorage.setItem('redirectShareId', shareId || '');
    }
    navigate('/auth');
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'This event link is invalid or has expired.'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Homepage
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full overflow-hidden">
        <div className="p-6 bg-gradient-to-r  from-primary-700 to-primary-600 text-white">
          <h1 className="text-2xl font-bold mb-2">{event.title}</h1>
          <p className="text-blue-100">{event.description}</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center text-gray-700">
              <Calendar className="w-5 h-5 mr-2 text-blue-500" />
              <span>{new Date(event.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center text-gray-700">
              <Clock className="w-5 h-5 mr-2 text-blue-500" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center text-gray-700">
              <MapPin className="w-5 h-5 mr-2 text-blue-500" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center text-gray-700">
              <Users className="w-5 h-5 mr-2 text-blue-500" />
              <span>{event.current_attendees} / {event.max_attendees} spots</span>
            </div>
            {event.registration_fee > 0 && (
              <div className="flex items-center text-gray-700">
                <Tag className="w-5 h-5 mr-2 text-blue-500" />
                <span>₹{event.registration_fee}</span>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 pt-6">
            <p className="text-gray-600 mb-6">
              {user ? 
                'You\'re being redirected to the registration page...' : 
                'Please log in to register for this event.'}
            </p>
            {!user && (
              <button
                onClick={handleLogin}
                className="w-full px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:to-blue-800 focus:ring-blue-500 shadow-lg hover:shadow-xl"
              >
                Log in to Register
              </button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SharedEvent;