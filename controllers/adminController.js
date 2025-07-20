import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

export const getStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }
    // Get total events count
    const events = await Event.find({ created_by: req.user.userId });
    // Get total registrations across all events
    const eventIds = events.map(e => e._id);
    const registrations = await Registration.find({ event_id: { $in: eventIds } }).populate('event_id user_id');
    // Get upcoming events
    const today = new Date();
    const upcomingEvents = await Event.find({ created_by: req.user.userId, date: { $gte: today } }).sort({ date: 1 });
    // Calculate check-in stats
    const checkedInCount = registrations.filter(reg => reg.checked_in_at).length;
    // Get recent registrations
    const recentRegistrations = await Registration.find({ event_id: { $in: eventIds } })
      .populate('event_id user_id')
      .sort({ registered_at: -1 })
      .limit(5);
    const stats = {
      totalEvents: events.length,
      totalRegistrations: registrations.length,
      upcomingEvents: upcomingEvents.length,
      checkedInCount,
      checkInRate: registrations.length ? (checkedInCount / registrations.length * 100).toFixed(1) : 0,
      recentRegistrations: recentRegistrations.map(reg => ({
        id: reg._id,
        eventTitle: reg.event_id?.title,
        userName: reg.user_id?.full_name,
        userEmail: reg.user_id?.email,
        registeredAt: reg.registered_at,
        status: reg.status
      })),
      upcomingEventsList: upcomingEvents.map(event => ({
        id: event._id,
        title: event.title,
        date: event.date,
        time: event.time,
        location: event.location,
        registrationCount: event.current_attendees,
        maxAttendees: event.max_attendees
      }))
    };
    res.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 