import React from 'react';
import { motion } from 'framer-motion';
import { X, CreditCard, QrCode, User, Building2, Hash } from 'lucide-react';
import Card from '../UI/Card';

interface PaymentDetailsModalProps {
  event: any;
  onClose: () => void;
}

const PaymentDetailsModal: React.FC<PaymentDetailsModalProps> = ({ event, onClose }) => {
  if (!event.bank_details) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg"
      >
        <Card hover={false} className="relative overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-indigo-600">
            <h2 className="text-2xl font-bold text-white">Payment Details</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Event Title */}
            <div className="text-lg font-medium text-gray-900 mb-4">
              {event.title}
            </div>

            {/* Registration Fee if exists */}
            {event.registration_fee > 0 && (
              <div className="bg-green-50 p-4 rounded-lg mb-6">
                <div className="flex items-center">
                  <CreditCard className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-green-800 font-medium">
                    Registration Fee: ₹{event.registration_fee}
                  </span>
                </div>
              </div>
            )}

            {/* Bank Details */}
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
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
            </div>
            <div className="flex items-center space-x-3">
                            <Hash className="w-5 h-5 text-gray-400" />
                            <div>
                              <div className="text-sm text-gray-500">UPI ID</div>
                              <div className="font-medium text-gray-900">{event.bank_details.upi_id}</div>
                            </div>
                          </div>
                        </div>

      
            
   
        </Card>
      </motion.div>
    </div>
  );
};

export default PaymentDetailsModal; 