const Registration = require('../models/registrationModel');
const Event = require('../models/eventModel');
const User = require('../models/userModels');

class RegistrationController {
    // Register for an event (student only)
    static async registerForEvent(req, res) {
        try {
            const { eventId } = req.body;
            const studentId = req.user.id;
            
            const event = await Event.findById(eventId);
            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }

            // Check if already registered
            const existingRegistration = await Registration.findOne({ 
                studentId, 
                eventId 
            });
            if (existingRegistration) {
                return res.status(400).json({ 
                    message: 'You have already registered for this event' 
                });
            }

            // Check if event is full
            const registrationCount = await Registration.countDocuments({ eventId });
            if (registrationCount >= event.maxCapacity) {
                return res.status(400).json({ message: 'Event is full' });
            }

            const registration = new Registration({ 
                studentId, 
                eventId 
            });
            await registration.save();
            
            // Populate event information
            await registration.populate('eventId');
            res.status(201).json(registration);
        } catch (error) {
            res.status(500).json({ 
                message: 'Error registering for event', 
                error: error.message 
            });
        }
    }

    // Cancel registration (student only)
    static async cancelRegistration(req, res) {
        try {
            const registration = await Registration.findById(req.params.id);
            if (!registration) {
                return res.status(404).json({ message: 'Registration not found' });
            }

            // Check if user has permission to cancel this registration
            if (registration.studentId.toString() !== req.user.id) {
                return res.status(403).json({ 
                    message: 'Not authorized to cancel this registration' 
                });
            }

            await registration.deleteOne();
            res.json({ message: 'Registration cancelled successfully' });
        } catch (error) {
            res.status(500).json({ 
                message: 'Error cancelling registration', 
                error: error.message 
            });
        }
    }

    // Get student's registrations
    static async getMyRegistrations(req, res) {
        try {
            const registrations = await Registration.find({ 
                studentId: req.user.id 
            })
            .populate('eventId')
            .sort({ registrationDate: -1 });
            
            if (registrations.length === 0) {
                return res.json({ 
                    message: 'You haven\'t registered for any events yet',
                    registrations: []
                });
            }
            res.json(registrations);
        } catch (error) {
            res.status(500).json({ 
                message: 'Error fetching registrations', 
                error: error.message 
            });
        }
    }

    // Get all registrations (admin only)
    static async getAllRegistrations(req, res) {
        try {
            const registrations = await Registration.find()
                .populate('eventId')
                .populate('studentId', 'username')
                .sort({ registrationDate: -1 });
            
            if (registrations.length === 0) {
                return res.json({ 
                    message: 'No students have registered yet',
                    registrations: []
                });
            }
            res.json(registrations);
        } catch (error) {
            res.status(500).json({ 
                message: 'Error fetching registrations', 
                error: error.message 
            });
        }
    }

    // Search registrations by date range (admin only)
    static async searchRegistrationsByDate(req, res) {
        try {
            const { start, end } = req.query;
            if (!start || !end) {
                return res.status(400).json({ 
                    message: 'Start and end dates are required' 
                });
            }

            if (new Date(start) > new Date(end)) {
                return res.status(400).json({ message: 'Invalid date range' });
            }

            const registrations = await Registration.find({
                registrationDate: { 
                    $gte: new Date(start), 
                    $lte: new Date(end) 
                }
            })
            .populate('eventId')
            .populate('studentId', 'username')
            .sort({ registrationDate: -1 });

            res.json(registrations);
        } catch (error) {
            res.status(500).json({ 
                message: 'Error searching registrations', 
                error: error.message 
            });
        }
    }

    // Get registration statistics
    static async getRegistrationStats(req, res) {
        try {
            const totalRegistrations = await Registration.countDocuments();
            const totalEvents = await Event.countDocuments();
            const totalStudents = await User.countDocuments({ role: 'student' });

            res.json({
                totalRegistrations,
                totalEvents,
                totalStudents,
                averageRegistrationsPerEvent: totalEvents > 0 ? 
                    (totalRegistrations / totalEvents).toFixed(2) : 0
            });
        } catch (error) {
            res.status(500).json({ 
                message: 'Error fetching statistics', 
                error: error.message 
            });
        }
    }
}

module.exports = RegistrationController; 