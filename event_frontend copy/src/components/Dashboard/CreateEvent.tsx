import React, { useEffect, useState } from 'react';
import EventForm from './EventForm';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '../../lib/api';
import toast from 'react-hot-toast';
import { Link, Share2 } from 'lucide-react';

const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('id');
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(!!eventId);
  const [shareableUrl, setShareableUrl] = useState<string>('');

  useEffect(() => {
    if (eventId) {
      apiClient.getEvent(eventId)
        .then((eventData) => {
          setEvent(eventData);
        })
        .catch(() => {
          toast.error('Failed to load event');
          navigate('/admin/events');
        })
        .finally(() => setLoading(false));
    }
  }, [eventId, navigate]);

  const handleSave = async (data: any) => {
    let success = false;
    try {
      let response;
      if (eventId) {
        response = await apiClient.updateEvent(eventId, data);
        toast.success('Event updated successfully');
      } else {
        response = await apiClient.createEvent(data);
        toast.success('Event created successfully');
      }
      
      // Set the shareable URL if available in the response
      if (response && response.shareableUrl) {
        setShareableUrl(response.shareableUrl);
      }
      
      success = true;
    } catch {
      toast.error('Failed to save event');
    }
    // Don't navigate away immediately if we have a shareable URL to display
    if (success && !shareableUrl) navigate('/admin/events');
  };
  
  const handleCopyShareableUrl = () => {
    if (shareableUrl) {
      navigator.clipboard.writeText(shareableUrl);
      toast.success('Shareable URL copied to clipboard!');
    }
  };

  if (loading) return <div className="py-8">Loading...</div>;

  return (
    <div className="py-2">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{eventId ? 'Edit Event' : 'Create New Event'}</h1>
        <p className="text-gray-500 max-w-2xl">
          {eventId
            ? 'Update the details of your event below. Make sure all information is accurate before saving.'
            : 'Fill out the form below to create a new event. You can specify registration fields, fees, and more.'}
        </p>
      </div>
      
      {/* Shareable URL Section */}
      {shareableUrl && (
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Share2 className="text-blue-500 w-5 h-5" />
              <h3 className="font-medium text-blue-700">Shareable Event URL</h3>
            </div>
            <button 
              onClick={() => navigate('/admin/events')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Done
            </button>
          </div>
          <div className="mt-3 flex items-center space-x-2">
            <div className="flex-1 p-2 bg-white border border-gray-200 rounded text-sm text-gray-800 overflow-x-auto">
              {shareableUrl}
            </div>
            <button 
              onClick={handleCopyShareableUrl}
              className="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
            >
              Copy
            </button>
          </div>
          <p className="mt-2 text-sm text-blue-600">
            <Link className="inline-block w-4 h-4 mr-1" />
            Share this URL with users to let them register for this event directly.
          </p>
        </div>
      )}
      
      <section className="">
        <EventForm
          event={event}
          onClose={() => navigate('/admin/events')}
          onSave={handleSave}
          isEdit={!!eventId}
        />
      </section>
    </div>
  );
};

export default CreateEvent;