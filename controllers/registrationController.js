import Registration from '../models/Registration.js';
import Event from '../models/Event.js';
import User from '../models/User.js';
import { sendEventRegistrationEmail } from '../services/emailService.js';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { uploadBufferToGridFS } from '../config/gridfs.js';

export const createRegistration = async (req, res) => {
  try {
    let event_id, registration_data;
    if (req.body.data) {
      try {
        const parsedData = JSON.parse(req.body.data);
        event_id = parsedData.event_id;
        registration_data = parsedData;
      } catch (error) {
        return res.status(400).json({ error: 'Invalid registration data format' });
      }
    } else {
      event_id = req.body.event_id;
      registration_data = req.body;
    }
    if (!event_id) {
      return res.status(400).json({ error: 'Event ID is required' });
    }
    const event = await Event.findById(event_id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    if (event.current_attendees >= event.max_attendees) {
      return res.status(400).json({ error: 'Event is full' });
    }
    console.log('Incoming files:', req.files);
    let screenshotFileId = null;
    if (req.files?.payment_screenshot) {
      console.log('Payment screenshot found, uploading to GridFS...');
      screenshotFileId = await uploadBufferToGridFS(req.files.payment_screenshot);
      console.log('GridFS screenshot file id:', screenshotFileId);
    } else {
      console.log('No payment screenshot found in request.');
    }
    const registration = await Registration.create({
      event_id,
      user_id: req.user.userId,
      registration_data: {
        ...registration_data,
        payment_details: {
          ...registration_data.payment_details,
          screenshot_file_id: screenshotFileId
        }
      }
    });
    event.current_attendees += 1;
    await event.save();
    const user = await User.findById(req.user.userId);
    try {
      await sendEventRegistrationEmail(user.email, event);
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
    }
    res.status(201).json(registration);
  } catch (error) {
    console.error('Create registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ user_id: req.user.userId }).populate('event_id');
    // Always set events field, even if event_id is null
    const mapped = registrations.map(reg => {
      const obj = reg.toObject();
      return {
        ...obj,
        events: obj.event_id || null,
      };
    });
    res.json(mapped);
  } catch (error) {
    console.error('Get registrations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getEventRegistrations = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    if (req.user.role !== 'admin' && event.created_by.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const registrations = await Registration.find({ event_id: eventId }).populate('user_id');
    const formattedRegistrations = registrations.map(reg => ({
      ...reg.toObject(),
      full_name: reg.user_id?.full_name || 'N/A',
      email: reg.user_id?.email || 'N/A'
    }));
    res.json(formattedRegistrations);
  } catch (error) {
    console.error('Get event registrations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateRegistration = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const { registration_data } = req.body;
    const registration = await Registration.findOne({ _id: registrationId, user_id: req.user.userId });
    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }
    registration.registration_data = registration_data;
    registration.last_modified_at = new Date();
    await registration.save();
    res.json(registration);
  } catch (error) {
    console.error('Update registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const checkIn = async (req, res) => {
  try {
    const { registrationId } = req.params;
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const registration = await Registration.findById(registrationId);
    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }
    registration.checked_in_at = new Date();
    registration.status = 'checked_in';
    await registration.save();
    res.json(registration);
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};