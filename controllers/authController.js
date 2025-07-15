const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModels');

class AuthController {
    // Register new user
    static async register(req, res) {
        try {
            const { username, password, role } = req.body;
            
            // Check if user already exists
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res.status(400).json({ message: 'Username already exists' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // Create new user
            const user = new User({
                username,
                password: hashedPassword,
                role: role || 'student' // Default role is student
            });

            await user.save();
            res.status(201).json({ message: 'User registered successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Login user
    static async login(req, res) {
        try {
            const { username, password } = req.body;
            const user = await User.findOne({ username });
            
            if (!user) {
                return res.status(401).json({ message: 'Username does not exist' });
            }
            
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                return res.status(401).json({ message: 'Wrong password' });
            }
            
            const token = jwt.sign(
                { id: user._id, username: user.username, role: user.role },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '24h' }
            );

            // Store user info in session for frontend
            req.session.user = {
                id: user._id,
                username: user.username,
                role: user.role
            };

            res.json({ 
                token, 
                user: {
                    id: user._id,
                    username: user.username,
                    role: user.role
                },
                message: 'Login successful'
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Logout user
    static async logout(req, res) {
        try {
            req.session.destroy((err) => {
                if (err) {
                    return res.status(500).json({ message: 'Error logging out' });
                }
                res.json({ message: 'Logged out successfully' });
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Get current user info
    static async getCurrentUser(req, res) {
        try {
            if (!req.session.user) {
                return res.status(401).json({ message: 'Not authenticated' });
            }
            res.json(req.session.user);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = AuthController; 