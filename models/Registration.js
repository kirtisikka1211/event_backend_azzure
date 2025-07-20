import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
  event_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  registration_data: { type: Object, default: {} },
  status: { type: String, default: 'registered' },
  registered_at: { type: Date, default: Date.now },
  checked_in_at: Date,
  last_modified_at: { type: Date, default: Date.now },
  full_name: String,
  email: String
});

const Registration = mongoose.model('Registration', registrationSchema);
export default Registration; 