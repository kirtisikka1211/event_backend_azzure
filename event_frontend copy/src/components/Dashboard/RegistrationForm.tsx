import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { apiClient } from '../../lib/api';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Card from '../UI/Card';
import toast from 'react-hot-toast';

interface RegistrationFormProps {
  event: any;
  existingRegistration?: any;
  onClose: () => void;
  onSave: () => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({
  event,
  existingRegistration,
  onClose,
  onSave,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (existingRegistration?.registration_data) {
      setFormData(existingRegistration.registration_data);
    }
  }, [existingRegistration]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (existingRegistration) {
        await apiClient.updateRegistration(event.id, formData);
        toast.success('Registration updated successfully!');
      } else {
        await apiClient.registerForEvent(event.id, formData);
        toast.success('Successfully registered for the event!');
      }
      onSave();
    } catch (error: any) {
      console.error('Error saving registration:', error);
      toast.error(error.message || 'Failed to save registration');
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field: any) => {
    switch (field.type) {
      case 'select':
        return (
          <div key={field.key} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <select
              name={field.key}
              value={formData[field.key] || ''}
              onChange={handleInputChange}
              required={field.required}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select an option</option>
              {field.options?.map((option: string) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );
      
      case 'textarea':
        return (
          <div key={field.key} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <textarea
              name={field.key}
              value={formData[field.key] || ''}
              onChange={handleInputChange}
              required={field.required}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
          </div>
        );
      
      default:
        return (
          <Input
            key={field.key}
            label={field.label}
            name={field.key}
            type={field.type}
            value={formData[field.key] || ''}
            onChange={handleInputChange}
            required={field.required}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card hover={false} className="relative">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              {existingRegistration ? 'Update Registration' : 'Register for Event'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-4">
              {event.registration_fields?.map((field: any) => renderField(field))}
            </div>

            {event.registration_fee > 0 && (
              <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-yellow-800 font-medium">Registration Fee: ₹{event.registration_fee}</p>
              </div>
            )}

            {event.bank_details?.account_number && (
              <div className="bg-yellow-50 p-4 rounded-lg space-y-3">
                <div className="space-y-2">
                  <p className="text-sm text-yellow-800 font-medium">Payment Details:</p>
                  <div className="grid grid-cols-1 gap-2 text-sm text-yellow-800">
                    <p>Account Holder: {event.bank_details.account_holder}</p>
                    <p>Bank Name: {event.bank_details.bank_name}</p>
                    <p>Account Number: {event.bank_details.account_number}</p>
                    <p>IFSC Code: {event.bank_details.ifsc_code}</p>
                    <p>UPI ID: {event.bank_details.upi_id}</p>
                  </div>
                  {event.bank_details?.qr_code_file_id || event.bank_details?.qr_code_url ? (
                    <div className="mt-3">
                      <p className="text-sm text-yellow-800 font-medium mb-2">Scan QR Code to Pay:</p>
                      <img
                        src={event.bank_details.qr_code_file_id ? `/api/files/${event.bank_details.qr_code_file_id}` : event.bank_details.qr_code_url}
                        alt="Payment QR Code"
                        className="h-48 w-48 object-contain bg-white p-2 rounded-lg"
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            <div className="flex space-x-4 pt-4">
              <Button type="submit" loading={loading} className="flex-1">
                {existingRegistration ? 'Update Registration' : 'Register'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default RegistrationForm; 