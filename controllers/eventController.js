const Event = require('../models/eventModel');

class EventController {
    // Create new event (admin only)
    static async createEvent(req, res) {
        try {
            const { name, maxCapacity, description, date, endDate, location } = req.body;
            if (endDate && date && new Date(endDate) <= new Date(date)) {
                return res.status(400).json({ message: 'End date must be after start date.' });
            }
            const event = new Event({
                name,
                maxCapacity,
                description,
                date,
                endDate,
                location
            });
            await event.save();
            res.status(201).json(event);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    // Get all events
    static async getAllEvents(req, res) {
        try {
            const events = await Event.find().sort({ date: 1 });
            res.json(events);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Get event by ID
    static async getEventById(req, res) {
        try {
            const event = await Event.findById(req.params.id);
            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }
            res.json(event);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Update event (admin only)
    static async updateEvent(req, res) {
        try {
            const { name, maxCapacity, description, date, endDate, location } = req.body;
            if (endDate && date && new Date(endDate) <= new Date(date)) {
                return res.status(400).json({ message: 'End date must be after start date.' });
            }
            const event = await Event.findByIdAndUpdate(
                req.params.id,
                { name, maxCapacity, description, date, endDate, location },
                { new: true }
            );
            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }
            res.json(event);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    // Delete event (admin only)
    static async deleteEvent(req, res) {
        try {
            const event = await Event.findByIdAndDelete(req.params.id);
            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }
            res.json({ message: 'Event deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Get events with registration count
    static async getEventsWithRegistrationCount(req, res) {
        try {
            const events = await Event.find().sort({ date: 1 });
            
            // For each event, get the registration count
            const eventsWithCount = await Promise.all(
                events.map(async (event) => {
                    const Registration = require('../models/registrationModel');
                    const registrationCount = await Registration.countDocuments({ 
                        eventId: event._id 
                    });
                    
                    return {
                        ...event.toObject(),
                        registeredCount: registrationCount,
                        availableSpots: event.maxCapacity - registrationCount,
                        isFull: registrationCount >= event.maxCapacity
                    };
                })
            );
            
            res.json(eventsWithCount);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Search events by date range (overlap logic)
    static async searchEventsByDate(req, res) {
        try {
            const { start, end } = req.query;
            if (!start || !end) {
                return res.status(400).json({ message: 'Start and end date are required.' });
            }
            const startDate = new Date(start);
            const endDate = new Date(end);
            // Only match events that have endDate
            const events = await Event.find({
                endDate: { $exists: true, $ne: null, $gte: startDate },
                date: { $lte: endDate }
            }).sort({ date: 1 });
            res.json(events);
        } catch (error) {
            console.error('searchEventsByDate error:', error);
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = EventController; 