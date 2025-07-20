import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  CreditCard,
  QrCode,
  User,
  Building2,
  Hash,
  Calendar,
  Clock,
  MapPin,
  Users,
  ClipboardList,  CheckCircle,
  Info,
  Share2,
  Download,
  Link,
  Mail
} from 'lucide-react';
import Card from '../UI/Card';
import { apiClient } from '../../lib/api';
import toast from 'react-hot-toast';
import Button from '../UI/Button';
import Input from '../UI/Input';

interface EventDetailsModalProps {
  event: any;
  onClose: () => void;
}

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({ event, onClose }) => {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'details' | 'registrations' | 'payment' | 'broadcast'>('details');
  const [broadcastForm, setBroadcastForm] = useState({
    subject: '',
    message: '',
    includeEventDetails: false
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!event?.id) {
      console.warn('No event id provided to RegistrationsModal');
      return;
    }
    fetchRegistrations();
  }, [event?.id]);

  const fetchRegistrations = async () => {
    if (!event?.id) {
      console.warn('fetchRegistrations called with undefined event id');
      return;
    }
    try {
      console.log('Fetching registrations for eventId:', event.id);
const data = await apiClient.getEventRegistrations(event.id);
      setRegistrations(data);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    }
  };

  const handleBroadcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastForm.subject.trim() || !broadcastForm.message.trim()) {
      toast.error('Please fill in both subject and message');
      return;
    }

    setSending(true);
    try {
      await apiClient.broadcastEmail(event.id, broadcastForm);
      toast.success('Broadcast email sent successfully');
      setBroadcastForm({ subject: '', message: '', includeEventDetails: false });
      setActiveTab('details');
    } catch (error) {
      console.error('Error sending broadcast:', error);
      toast.error('Failed to send broadcast email');
    } finally {
      setSending(false);
    }
  };

  const TabButton = ({ tab, label, icon: Icon }: { tab: typeof activeTab, label: string, icon: any }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
        activeTab === tab
          ? 'bg-blue-50 text-blue-600'
          : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );

  const downloadCSV = () => {
    // Get all custom registration fields from the event
    const customFields = event.registration_fields?.map((field: any) => field.label) || [];
    
    // Create headers including standard and custom fields
    const headers = ['Full Name', 'Email', 'Status', 'Registered At','Transaction ID', 'Payment Screenshot', ...customFields];
    
    const rows = registrations.map((reg: any) => {
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
        const fieldKey = event.registration_fields?.find((field: any) => field.label === fieldLabel)?.key;
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-6xl my-8"
      >
        <Card hover={false} className="relative flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-primary-700 to-primary-600">
            <h2 className="text-2xl font-bold text-white">{event.title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-2 p-4 border-b border-gray-200">
            <TabButton tab="details" label="Event Details" icon={Info} />
            <TabButton tab="registrations" label="Registrations" icon={ClipboardList} />
            <TabButton tab="broadcast" label="Send Email" icon={Mail} />
            {event.bank_details && (
              <TabButton tab="payment" label="Payment Details" icon={CreditCard} />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gradient-to-b [&::-webkit-scrollbar-thumb]:from-blue-500 [&::-webkit-scrollbar-thumb]:to-indigo-600 [&::-webkit-scrollbar-thumb]:rounded-full">
            {activeTab === 'details' && (
              <div className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-3 bg-white/50 p-4 rounded-lg">
                      <Calendar className="w-5 h-5 text-blue-500" />
                      <div>
                        <div className="text-sm font-medium text-gray-500">Date</div>
                        <div className="text-base font-medium text-gray-900">
                          {new Date(event.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 bg-white/50 p-4 rounded-lg">
                      <MapPin className="w-5 h-5 text-blue-500" />
                      <div>
                        <div className="text-sm font-medium text-gray-500">Location</div>
                        <div className="text-base font-medium text-gray-900">{event.location}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 bg-white/50 p-4 rounded-lg">
                      <Users className="w-5 h-5 text-blue-500" />
                      <div>
                        <div className="text-sm font-medium text-gray-500">Attendees</div>
                        <div className="text-base font-medium text-gray-900">
                          {event.current_attendees} / {event.max_attendees}
                        </div>
                      </div>
                    </div>
                    {event.meet_link && (
                      <div className="flex items-center space-x-3 bg-white/50 p-4 rounded-lg">
                        <Link className="w-5 h-5 text-blue-500" />
                        <div>
                          <div className="text-sm font-medium text-gray-500">Meeting Link</div>
                          <a 
                            href={event.meet_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-base font-medium text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            Join Meeting
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Shareable URL */}
                {event.share_id && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Shareable URL</h3>
                    <div className="flex items-center space-x-3 bg-white/50 p-4 rounded-lg">
                      <Share2 className="w-5 h-5 text-amber-500" />
                      <div className="flex-1 overflow-hidden">
                        <div className="text-sm font-medium text-gray-500">Share this event with others</div>
                        <div className="text-base font-medium text-gray-900 truncate">
                          {`${window.location.origin}/share/${event.share_id}`}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const url = `${window.location.origin}/share/${event.share_id}`;
                          navigator.clipboard.writeText(url);
                          toast.success('URL copied to clipboard!');
                        }}
                        className="px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-md text-sm font-medium transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Description */}
                 <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                  <div className="bg-white/50 rounded-lg p-4">
                    <p className="text-gray-600 whitespace-pre-wrap">{event.description}</p>
                  </div>
                </div>

                {/* Registration Fields */}
                {event.registration_fields?.length > 0 && (
                   <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration Fields</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {event.registration_fields.map((field: any, index: number) => (
                        <div key={index} className="bg-white/60 p-4 rounded-lg border border-teal-100/50">
                          <div className="font-medium text-gray-900 mb-1">{field.label}</div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span className="px-2 py-1 bg-teal-50 rounded text-teal-700">
                              {field.type}
                            </span>
                            {field.required && (
                              <span className="px-2 py-1 bg-red-50 rounded text-red-700">
                                Required
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'registrations' && (
              <div className="p-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">Registrations</h3>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-500">
                        Total: {registrations.length}
                      </span>
                      <Button
                        variant="outline"
                        onClick={downloadCSV}
                        className="flex items-center space-x-1"
                        disabled={registrations.length === 0}
                      >
                        <Download className="w-4 h-4" />
                        <span>Export CSV</span>
                      </Button>
                    </div>
                  </div>
                  <div className="overflow-x-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gradient-to-r [&::-webkit-scrollbar-thumb]:from-blue-500 [&::-webkit-scrollbar-thumb]:to-indigo-600 [&::-webkit-scrollbar-thumb]:rounded-full">
                    <div className="inline-block min-w-full align-middle">
                      <table className="min-w-full divide-y divide-gray-200 bg-white rounded-lg">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registered At</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {registrations.map((reg: any) => (
                            <tr key={reg.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{reg.full_name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reg.email}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  reg.checked_in_at
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-primary-600 text-white'
                                }`}>
                                  {reg.checked_in_at ? 'Checked In' : 'Registered'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-white-500">
                                {new Date(reg.registered_at).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'payment' && event.bank_details && (
              <div className="flex flex-col lg:flex-row">
                {/* Left Side - Bank Details */}
                <div className="flex-1 p-6">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 space-y-6">
                    {event.registration_fee > 0 && (
                      <div className="flex items-center space-x-2">
                        <CreditCard className="w-5 h-5 text-green-600" />
                        <span className="text-green-800 font-medium">
                          Registration Fee: ₹{event.registration_fee}
                        </span>
                      </div>
                    )}

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Bank Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3">
                          <User className="w-5 h-5 text-gray-400" />
                          <div>
                            <div className="text-sm text-gray-500">Account Holder</div>
                            <div className="font-medium text-gray-900">{event.bank_details.account_holder}</div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Building2 className="w-5 h-5 text-gray-400" />
                          <div>
                            <div className="text-sm text-gray-500">Bank Name</div>
                            <div className="font-medium text-gray-900">{event.bank_details.bank_name}</div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <CreditCard className="w-5 h-5 text-gray-400" />
                          <div>
                            <div className="text-sm text-gray-500">Account Number</div>
                            <div className="font-medium text-gray-900">{event.bank_details.account_number}</div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Hash className="w-5 h-5 text-gray-400" />
                          <div>
                            <div className="text-sm text-gray-500">IFSC Code</div>
                            <div className="font-medium text-gray-900">{event.bank_details.ifsc_code}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Hash className="w-5 h-5 text-gray-400" />
                          <div>
                            <div className="text-sm text-gray-500">UPI ID</div>
                            <div className="font-medium text-gray-900">{event.bank_details.upi_id}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side - QR Code */}
                {(event.bank_details.qr_code_file_id || event.bank_details.qr_code_url) && (
                  <div className="w-full lg:w-80 p-6 lg:border-l border-gray-200">
                    <div className="sticky top-0">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                        <div className="flex flex-col items-center space-y-4">
                          <div className="flex items-center space-x-2 text-gray-700">
                            <QrCode className="w-5 h-5" />
                            <span className="font-medium">Scan QR Code to Pay</span>
                          </div>
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <img
                              src={event.bank_details.qr_code_file_id ? `/api/files/${event.bank_details.qr_code_file_id}` : event.bank_details.qr_code_url}
                              alt="Payment QR Code"
                              className="w-full h-auto"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'broadcast' && (
              <div className="p-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Email to All Registrants</h3>
                  <form onSubmit={handleBroadcastSubmit} className="space-y-4">
                    <Input
                      label="Subject"
                      value={broadcastForm.subject}
                      onChange={(e) => setBroadcastForm(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Enter email subject"
                      required
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Message
                      </label>
                      <textarea
                        value={broadcastForm.message}
                        onChange={(e) => setBroadcastForm(prev => ({ ...prev, message: e.target.value }))}
                        className="w-full h-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your message here..."
                        required
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="includeEventDetails"
                        checked={broadcastForm.includeEventDetails}
                        onChange={(e) => setBroadcastForm(prev => ({ ...prev, includeEventDetails: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="includeEventDetails" className="text-sm text-gray-700">
                        Include event details in the email
                      </label>
                    </div>
                    <div className="flex justify-end space-x-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveTab('details')}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        loading={sending}
                      >
                        Send Broadcast
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default EventDetailsModal;