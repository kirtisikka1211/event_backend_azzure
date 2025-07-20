import React, { useState, useEffect } from 'react';
import { Mail, ChevronDown } from 'lucide-react';
import { apiClient } from '../../lib/api';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Card from '../UI/Card';
import toast from 'react-hot-toast';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  meet_link?: string;
  current_attendees: number;
}

const SendMessages: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [messageForm, setMessageForm] = useState({
    subject: '',
    message: '',
    includeEventDetails: false
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getEvents();
      console.log('Fetched events:', response); // Debug log
      const eventsData = Array.isArray(response) ? response : response.events || [];
      console.log('Processed events:', eventsData); // Debug log
      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleEventChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    console.log('Selected ID:', selectedId); // Debug log
    const selected = events.find(evt => String(evt.id) === String(selectedId));
    console.log('Found event:', selected); // Debug log
    setSelectedEvent(selected || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) {
      toast.error('Please select an event');
      return;
    }

    if (!messageForm.subject.trim() || !messageForm.message.trim()) {
      toast.error('Please fill in both subject and message');
      return;
    }

    setSending(true);
    try {
      await apiClient.broadcastEmail(selectedEvent.id, messageForm);
      toast.success('Broadcast email sent successfully');
      setMessageForm({ subject: '', message: '', includeEventDetails: false });
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error sending broadcast:', error);
      toast.error('Failed to send broadcast email');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Send Messages</h1>
        <p className="text-gray-600 max-w-3xl">
          Send broadcast emails to event participants. Select an event from the dropdown below to send messages to all registered attendees. 
          You can include event details in your message and customize the content for your audience.
        </p>
      </div>

      <Card className="max-w-3xl mx-auto">
        <div className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Event
            </label>
            <div className="relative">
              <select
                value={selectedEvent?.id || ''}
                onChange={handleEventChange}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md cursor-pointer"
              >
                <option value="">Choose an event...</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title} ({new Date(event.date).toLocaleDateString()}) - {event.location} - {event.current_attendees || 0} attendees
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
            {/* Debug info */}
            <div className="mt-2 text-xs text-gray-500">
              {`Total events: ${events.length}`}
            </div>
          </div>

          {selectedEvent && (
            <div className="bg-primary-50 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-primary-900 mb-2">Selected Event Details:</h3>
              <div className="text-sm text-primary-800">
                <p><strong>Date:</strong> {new Date(selectedEvent.date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {selectedEvent.time}</p>
                <p><strong>Location:</strong> {selectedEvent.location}</p>
                <p><strong>Registered Attendees:</strong> {selectedEvent.current_attendees}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Subject"
              value={messageForm.subject}
              onChange={(e) => setMessageForm(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Enter email subject"
              required
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                value={messageForm.message}
                onChange={(e) => setMessageForm(prev => ({ ...prev, message: e.target.value }))}
                className="w-full h-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter your message here..."
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeEventDetails"
                checked={messageForm.includeEventDetails}
                onChange={(e) => setMessageForm(prev => ({ ...prev, includeEventDetails: e.target.checked }))}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="includeEventDetails" className="text-sm text-gray-700">
                Include event details in the email
              </label>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!selectedEvent}
                loading={sending}
                className="flex items-center space-x-2"
              >
                <Mail className="w-4 h-4" />
                <span>Send Message</span>
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default SendMessages; 