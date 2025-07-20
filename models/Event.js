import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  date: { type: Date, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true },
  max_attendees: { type: Number, default: 50 },
  current_attendees: { type: Number, default: 0 },
  registration_fee: { type: Number, default: 0 },
  bank_details: {
    account_holder: String,
    account_number: String,
    ifsc_code: String,
    bank_name: String,
    qr_code_file_id: String,
    upi_id: String
  },
  requires_checkin: { type: Boolean, default: true },
  registration_fields: { type: Array, default: [] },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  image_url: String,
  share_id: String,
  meet_link: String
});

const Event = mongoose.model('Event', eventSchema);
export default Event; 