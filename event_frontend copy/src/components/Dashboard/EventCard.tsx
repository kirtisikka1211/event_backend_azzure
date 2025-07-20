import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Clock, DollarSign, Trash2, CheckCircle, List } from 'lucide-react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import RegistrationsModal from './RegistrationsModal';

interface EventCardProps {
  event: any;
  isAdmin: boolean;
  isRegistered?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onRegister?: () => void;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  isAdmin,
  isRegistered,
  onEdit,
  onDelete,
  onRegister,
}) => {
  const [showRegistrations, setShowRegistrations] = useState(false);
  const eventDate = new Date(event.date);
  const isPastEvent = eventDate < new Date();
  const isFullyBooked = event.current_attendees >= event.max_attendees;

  return (
    <>
      <Card className={isAdmin ? 'cursor-pointer h-full min-h-[280px]' : ''} onClick={isAdmin ? onEdit : undefined}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-semibold text-gray-900 line-clamp-1">
              {event.title}
            </h3>
            {isAdmin && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.();
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {!isAdmin && (
            <p className="text-gray-600 mb-4 line-clamp-2">
              {event.description}
            </p>
          )}

          <div className="space-y-2 mb-4">
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-2 text-primary-500" />
              <span>{eventDate.toLocaleDateString()}</span>
            </div>
            
            {/* Location is now shown for both admin and non-admin views */}
            <div className="flex items-center text-gray-600">
              <MapPin className="w-4 h-4 mr-2 text-primary-500" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
            
            {/* Other details only for non-admin view */}
            {!isAdmin && (
              <>
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-2 text-primary-500" />
                  <span>{event.time}</span>
                </div>
                {event.registration_fee > 0 && (
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2 text-primary-500" />
                    <span>${event.registration_fee}</span>
                  </div>
                )}
              </>
            )}
            
            <div className="flex items-center text-gray-600">
              <Users className="w-4 h-4 mr-2 text-primary-500" />
              <span>{event.current_attendees} / {event.max_attendees} attendees</span>
            </div>
          </div>

          {/* Push button to bottom with flex-grow */}
          <div className="flex-grow"></div>

          {isAdmin ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowRegistrations(true);
              }}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
            >
              <List className="w-4 h-4" />
              <span>View Registrations</span>
            </button>
          ) : (
            <div className="space-y-2">
              {isRegistered ? (
                <div className="flex items-center justify-center py-2 px-4 bg-green-50 text-green-700 rounded-lg">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span className="font-medium">Registered</span>
                </div>
              ) : isPastEvent ? (
                <Button variant="outline" className="w-full" disabled>
                  Event Ended
                </Button>
              ) : isFullyBooked ? (
                <Button variant="outline" className="w-full" disabled>
                  Fully Booked
                </Button>
              ) : (
                <Button onClick={onRegister} className="w-full">
                  Register Now
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>

      {showRegistrations && (
        <RegistrationsModal
          event={event}
          onClose={() => setShowRegistrations(false)}
        />
      )}
    </>
  );
};

export default EventCard;