import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Download, Mail, Calendar, Clock } from 'lucide-react';
import { apiClient } from '../../lib/api';
import Card from '../UI/Card';
import Button from '../UI/Button';
import toast from 'react-hot-toast';

interface RegistrationsModalProps {
  event: any;
  onClose: () => void;
}

const RegistrationsModal: React.FC<RegistrationsModalProps> = ({ event, onClose }) => {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegistrations();
  }, [event.id]);

  const fetchRegistrations = async () => {
    try {
      console.log('Fetching registrations for eventId:', event?.id);
const data = await apiClient.getEventRegistrations(event.id);
      setRegistrations(data);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast.error('Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    // Create CSV content
    // Get all custom registration fields from the event
    const customFields = event.registration_fields?.map(field => field.label) || [];
    
    // Create headers including standard and custom fields
    const headers = ['Full Name', 'Email', 'Status', 'Registered At',  'Transaction ID', 'Payment Screenshot', ...customFields];
    
    const rows = registrations.map(reg => {
      // Standard fields
      const standardFields = [
        reg.full_name,
        reg.email,
        reg.status,
        new Date(reg.registered_at).toLocaleDateString(),
       
        reg.registration_data?.payment_details?.transaction_id || 'N/A',
        reg.registration_data?.payment_details?.screenshot_url || 'N/A'
      ];
      
      // Add custom fields if they exist
      const customFieldValues = customFields.map(fieldLabel => {
        // Find the field key from the event registration fields
        const fieldKey = event.registration_fields?.find(field => field.label === fieldLabel)?.key;
        return fieldKey && reg.registration_data?.[fieldKey] ? reg.registration_data[fieldKey] : 'N/A';
      });
      
      return [...standardFields, ...customFieldValues];
    });
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title}-registrations.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl"
      >
        <Card hover={false} className="relative max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Event Registrations
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(event.date).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {event.time}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={downloadCSV}
                className="flex items-center space-x-1"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </Button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              </div>
            ) : registrations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No registrations yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {registrations.map((registration) => (
                  <Card key={registration.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {registration.full_name}
                        </h3>
                        <div className="flex items-center text-gray-500 text-sm">
                          <Mail className="w-4 h-4 mr-1" />
                          {registration.email}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-sm text-gray-500">
                          Registered: {new Date(registration.registered_at).toLocaleString()}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          registration.status === 'checked_in'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {registration.status === 'checked_in' ? 'Checked In' : 'Registered'}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default RegistrationsModal;