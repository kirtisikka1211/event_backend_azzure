import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { apiClient } from '../../lib/api';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Card from '../UI/Card';
import toast from 'react-hot-toast';

interface BankDetails {
  account_holder: string;
  account_number: string;
  ifsc_code: string;
  upi_id: string;
  bank_name: string;
  qr_code_url: string;
  qr_code_file: File | null;
  qr_code_preview: string | null;
  registration_fee?: number;
}

interface FormData {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  max_attendees: number;
  has_payment_details: boolean;
  registration_fee: number | null;
  bank_details: BankDetails;
  requires_checkin: boolean;
  registration_fields: RegistrationField[];
  meet_link: string;
}

interface EventFormProps {
  event?: any;
  onClose: () => void;
  onSave: (data: FormData | globalThis.FormData) => void;
  initialValues?: any;
  isEdit?: boolean;
}

interface RegistrationField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'tel' | 'date' | 'select';
  required: boolean;
  options?: string[];
}

const EventForm: React.FC<EventFormProps> = ({ event, onClose, onSave, isEdit }) => {
  const [loading, setLoading] = useState(false);
  const [isRegistrationFieldsOpen, setIsRegistrationFieldsOpen] = useState(false);
  const [isPaymentDetailsOpen, setIsPaymentDetailsOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    max_attendees: 50,
    has_payment_details: false,
    registration_fee: null,
    bank_details: {
      account_holder: '',
      account_number: '',
      ifsc_code: '',
      upi_id: '',
      
      bank_name: '',
      qr_code_url: '',
      qr_code_file: null,
      qr_code_preview: null
    },
    requires_checkin: true,
    registration_fields: [],
    meet_link: ''
  });

  const [newField, setNewField] = useState<RegistrationField>({
    key: '',
    label: '',
    type: 'text',
    required: false,
    options: [],
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        date: event.date || '',
        time: event.time || '',
        location: event.location || '',
        max_attendees: event.max_attendees || 50,
        has_payment_details: !!event.bank_details?.account_number,
        registration_fee: event.registration_fee || null,
        bank_details: {
          ...event.bank_details,
          qr_code_file: null,
          qr_code_preview: event.bank_details?.qr_code_file_id ? `/api/files/${event.bank_details.qr_code_file_id}` : null
        },
        requires_checkin: event.requires_checkin !== false,
        registration_fields: event.registration_fields || [],
        meet_link: event.meet_link || ''
      });
    }
  }, [event]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseFloat(value) || 0 : 
              type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              value,
    });
  };

  const handleBankDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      bank_details: {
        ...formData.bank_details,
        [name]: value
      }
    });
  };

  const handleNewFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setNewField({
      ...newField,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const addRegistrationField = () => {
    if (!newField.key || !newField.label) {
      toast.error('Field key and label are required');
      return;
    }

    if (formData.registration_fields.some(f => f.key === newField.key)) {
      toast.error('Field key must be unique');
      return;
    }

    setFormData({
      ...formData,
      registration_fields: [...formData.registration_fields, newField],
    });

    setNewField({
      key: '',
      label: '',
      type: 'text',
      required: false,
      options: [],
    });
  };

  const removeRegistrationField = (key: string) => {
    setFormData({
      ...formData,
      registration_fields: formData.registration_fields.filter(f => f.key !== key),
    });
  };

  const handleQRCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      setFormData(prev => ({
        ...prev,
        bank_details: {
          ...prev.bank_details,
          qr_code_file: file,
          qr_code_preview: URL.createObjectURL(file)
        }
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      
      // Add all the event data
      const { has_payment_details, ...eventDataWithoutHasPayment } = formData;

      // Clean up bank details by removing frontend-only fields
      const cleanBankDetails = has_payment_details ? {
        account_holder: formData.bank_details.account_holder,
        account_number: formData.bank_details.account_number,
        ifsc_code: formData.bank_details.ifsc_code,
        upi_id: formData.bank_details.upi_id,
        bank_name: formData.bank_details.bank_name
      } : null;

      const eventData = {
        ...eventDataWithoutHasPayment,
        bank_details: cleanBankDetails
      };
      
      // Log the event data before submission
      console.log('Form Data before submission:', eventData);
      console.log('Bank Details:', eventData.bank_details);
      
      // Convert event data to JSON and append to FormData
      submitData.append('data', JSON.stringify(eventData));
      
      // If there's a QR code file, append it with proper content type
      if (formData.bank_details.qr_code_file instanceof File) {
        const file = formData.bank_details.qr_code_file;
        submitData.append('qr_code', file, file.name);
        console.log('QR Code file attached:', file.name, 'type:', file.type);
      }
      
      onSave(submitData);
    } catch (error: any) {
      console.error('Error in form submission:', error);
      if (error && error.message) {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-4xl mx-auto">
      {/* Basic Info Section */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-2">
            <Input
              label="Event Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-span-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Describe your event..."
              />
            </div>
          </div>
          <Input
            label="Date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            type="date"
            required
          />
          <Input
            label="Time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            type="time"
            required
          />
          <div className="col-span-2">
            <Input
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-span-2">
            <Input
              label="Meeting Link"
              name="meet_link"
              value={formData.meet_link}
              onChange={handleChange}
              placeholder="Enter Google Meet or other meeting platform link"
            />
          </div>
          <div>
            <Input
              label="Maximum Attendees"
              name="max_attendees"
              value={formData.max_attendees}
              onChange={handleChange}
              type="number"
              required
            />
          </div>
          <div>
            <Input
              label="Registration Fee (₹)"
              name="registration_fee"
              value={formData.registration_fee || ''}
              onChange={handleChange}
              type="number"
              min="0"
              placeholder="Optional"
            />
          </div>
        </div>
      </div>

      {/* Payment Details Section */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Payment Details</h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={formData.has_payment_details}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                has_payment_details: e.target.checked
              }))}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-700">Enable Payment Details</span>
          </label>
        </div>

        {formData.has_payment_details && (
          <div className="mt-4 space-y-4">
        
            <Input
              label="Account Holder Name"
              name="account_holder"
              value={formData.bank_details.account_holder}
              onChange={handleBankDetailsChange}
              placeholder="Enter account holder name"
            />
            <Input
              label="Bank Name"
              name="bank_name"
              value={formData.bank_details.bank_name}
              onChange={handleBankDetailsChange}
              placeholder="Enter bank name"
            />
            <Input
              label="Account Number"
              name="account_number"
              value={formData.bank_details.account_number}
              onChange={handleBankDetailsChange}
              placeholder="Enter account number"
              type="text"
            />
            <Input
              label="IFSC Code"
              name="ifsc_code"
              value={formData.bank_details.ifsc_code}
              onChange={handleBankDetailsChange}
              placeholder="Enter IFSC code"
            />
             <Input
              label="UPI ID"
              name="upi_id"
              value={formData.bank_details.upi_id}
              onChange={handleBankDetailsChange}
              placeholder="Enter UPI code"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">QR Code</label>
              <input
                type="file"
                name="qr_code"
                accept="image/*"
                onChange={handleQRCodeChange}
                className="w-full"
              />
              {formData.bank_details.qr_code_preview && (
                <img
                  src={formData.bank_details.qr_code_preview}
                  alt="QR Code Preview"
                  className="mt-2 h-32 w-32 object-contain"
                />
              )}
            </div>
          </div>
        )}
      </div>
      {/* Registration Fields Section */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <button
          type="button"
          onClick={() => setIsRegistrationFieldsOpen(!isRegistrationFieldsOpen)}
          className={`w-full flex items-center justify-between text-left p-2 rounded-lg transition-colors ${isRegistrationFieldsOpen ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
        >
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-gray-900">Add registration details?</h3>
            <span className="text-sm text-gray-500">
              ({formData.registration_fields.length} field{formData.registration_fields.length !== 1 ? 's' : ''} added)
            </span>
          </div>
          {isRegistrationFieldsOpen ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>
        
        {isRegistrationFieldsOpen && (
          <div className="mt-4">
            <div className="space-y-2 mb-4">
              {formData.registration_fields.map((field) => (
                <div key={field.key} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{field.label}</p>
                    <p className="text-xs text-gray-500">
                      Type: {field.type} | Key: {field.key} | {field.required ? 'Required' : 'Optional'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeRegistrationField(field.key)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Add New Field</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  label="Field Key"
                  name="key"
                  value={newField.key}
                  onChange={handleNewFieldChange}
                  placeholder="e.g., phone_number"
                />
                <Input
                  label="Field Label"
                  name="label"
                  value={newField.label}
                  onChange={handleNewFieldChange}
                  placeholder="e.g., Phone Number"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Field Type</label>
                  <select
                    name="type"
                    value={newField.type}
                    onChange={handleNewFieldChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="email">Email</option>
                    <option value="tel">Phone</option>
                    <option value="date">Date</option>
                    <option value="select">Select</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2 mt-6">
                  <input
                    type="checkbox"
                    id="new_field_required"
                    name="required"
                    checked={newField.required}
                    onChange={handleNewFieldChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="new_field_required" className="text-sm text-gray-700">Required field</label>
                </div>
              </div>
              {newField.type === 'select' && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Options (comma-separated)</label>
                  <input
                    type="text"
                    name="options"
                    value={newField.options?.join(', ')}
                    onChange={(e) => setNewField({
                      ...newField,
                      options: e.target.value.split(',').map(o => o.trim()).filter(Boolean)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Option 1, Option 2, Option 3"
                  />
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={addRegistrationField}
                className="w-full mt-3"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Field
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="flex space-x-3">
        <Button type="submit" variant="primary" className="w-32" loading={loading}>
          {isEdit ? 'Save Changes' : 'Create Event'}
        </Button>
        <Button type="button" variant="secondary" onClick={onClose} className="w-32">Cancel</Button>
      </div>
    </form>
  );
};

export default EventForm;