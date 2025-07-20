import Event from '../models/Event.js';
import User from '../models/User.js';
import Registration from '../models/Registration.js';
import { sendBroadcastEmail } from '../services/emailService.js';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { uploadBufferToGridFS } from '../config/gridfs.js';
import { gfs } from '../config/gridfs.js';

// Remove uploadQRCode helper and all fs/path logic for QR codes
// In createEvent and updateEvent, handle QR code upload using req.files and GridFS
// Store the resulting file id in bank_details.qr_code_file_id

const generateUniqueId = () => {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
};

export const getAllEvents = async (req, res) => {
  try {
    const { q: searchQuery } = req.query;
    let filter = {};
    if (req.user.role === 'admin') {
      filter.created_by = req.user.userId;
    } else {
      filter.date = { $gte: new Date() };
    }
    if (searchQuery) {
      filter.$or = [
        { title: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } }
      ];
    }
    const events = await Event.find(filter).sort({ date: 1 });
    // Map _id to id for frontend compatibility
    const eventsWithId = events.map(event => ({
      ...event.toObject(),
      id: event._id.toString(),
    }));
    res.json(eventsWithId);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createEvent = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    console.log('Incoming files:', req.files);
    let eventData;
    try {
      eventData = JSON.parse(req.body.data);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid event data format' });
    }
    const {
      title, description, date, time, location, max_attendees, bank_details,
      requires_checkin, registration_fields, registration_fee
    } = eventData;
    let qrCodeFileId = null;
    if (req.files?.qr_code) {
      console.log('QR file found, uploading to GridFS...');
      qrCodeFileId = await uploadBufferToGridFS(req.files.qr_code);
      console.log('GridFS file id:', qrCodeFileId);
    } else {
      console.log('No QR file found in request.');
    }
    if (bank_details && typeof bank_details === 'object') {
      const requiredFields = ['account_holder', 'account_number', 'ifsc_code', 'bank_name'];
      const missingFields = requiredFields.filter(field => !bank_details[field]);
      if (missingFields.length > 0) {
        return res.status(400).json({ error: `Missing required bank details fields: ${missingFields.join(', ')}` });
      }
    }
    if (registration_fee !== null && registration_fee !== undefined) {
      const fee = parseFloat(registration_fee);
      if (isNaN(fee) || fee < 0) {
        return res.status(400).json({ error: 'Registration fee must be a non-negative number' });
      }
    }
    const share_id = generateUniqueId();
    const eventObj = {
      title,
      description,
      date,
      time,
      location,
      max_attendees,
      registration_fee: registration_fee || null,
      bank_details: bank_details ? { ...bank_details, qr_code_file_id: qrCodeFileId } : null,
      requires_checkin,
      registration_fields: registration_fields || [],
      created_by: req.user.userId,
      share_id
    };
    console.log('Event object to be saved:', eventObj);
    const event = await Event.create(eventObj);
    const shareableUrl = `${req.protocol}://${req.get('host')}/event/${share_id}`;
    event.shareableUrl = shareableUrl;
    res.status(201).json(event);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    if (req.user.role !== 'admin' && event.created_by.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    if (event.share_id) {
      event.shareableUrl = `${req.protocol}://${req.get('host')}/event/${event.share_id}`;
    }
    res.json(event);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getEventByShareId = async (req, res) => {
  try {
    const { shareId } = req.params;
    const event = await Event.findOne({ share_id: shareId });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    console.error('Get event by share ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    let updateData;
    try {
      updateData = JSON.parse(req.body.data);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid event data format' });
    }
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    if (req.user.role !== 'admin' || event.created_by.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    let qrCodeFileId = updateData.bank_details?.qr_code_file_id;
    if (req.files?.qr_code) {
      // Delete old QR code if it exists
      if (event.bank_details?.qr_code_file_id) {
        try {
          await gfs.delete(new mongoose.Types.ObjectId(event.bank_details.qr_code_file_id));
        } catch (err) {
          console.error('Error deleting old QR code from GridFS:', err);
        }
      }
      qrCodeFileId = await uploadBufferToGridFS(req.files.qr_code);
    }
    if (updateData.bank_details && typeof updateData.bank_details === 'object') {
      const requiredFields = ['account_holder', 'account_number', 'ifsc_code', 'bank_name'];
      const missingFields = requiredFields.filter(field => !updateData.bank_details[field]);
      if (missingFields.length > 0) {
        return res.status(400).json({ error: `Missing required bank details fields: ${missingFields.join(', ')}` });
      }
    }
    if (updateData.registration_fee !== null && updateData.registration_fee !== undefined) {
      const fee = parseFloat(updateData.registration_fee);
      if (isNaN(fee) || fee < 0) {
        return res.status(400).json({ error: 'Registration fee must be a non-negative number' });
      }
    }
    const share_id = event.share_id || generateUniqueId();
    Object.assign(event, {
      ...updateData,
      bank_details: updateData.bank_details ? {
        ...updateData.bank_details,
        qr_code_file_id: qrCodeFileId || updateData.bank_details.qr_code_file_id
      } : null,
      registration_fee: updateData.registration_fee || null,
      updated_at: new Date(),
      share_id
    });
    await event.save();
    const shareableUrl = `${req.protocol}://${req.get('host')}/event/${share_id}`;
    event.shareableUrl = shareableUrl;
    res.json(event);
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    if (req.user.role !== 'admin' || event.created_by.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    // Delete QR code file if exists
    if (event.bank_details?.qr_code_file_id) {
      try {
        await gfs.delete(new mongoose.Types.ObjectId(event.bank_details.qr_code_file_id));
      } catch (err) {
        console.error('Error deleting old QR code from GridFS:', err);
      }
    }
    await event.deleteOne();
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const broadcastEmail = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { subject, message, includeEventDetails } = req.body;
    if (!subject || !message) {
      return res.status(400).json({ error: 'Subject and message are required' });
    }
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    if (req.user.role !== 'admin' && event.created_by.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const registrations = await Registration.find({ event_id: eventId }).populate('user_id');
    const recipients = registrations.map(reg => reg.user_id?.email).filter(email => email);
    if (recipients.length === 0) {
      return res.status(400).json({ error: 'No registered users found' });
    }
    await sendBroadcastEmail(recipients, event, subject, message, includeEventDetails);
    res.json({ message: `Broadcast email sent to ${recipients.length} recipients` });
  } catch (error) {
    console.error('Broadcast email error:', error);
    res.status(500).json({ error: 'Failed to send broadcast email' });
  }
};