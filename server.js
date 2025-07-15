require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const path = require("path");

const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/event");
const registrationRoutes = require("./routes/registration");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Database connection
mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://thanhtrung8ctv:concatre@cluster0.cde349z.mongodb.net/event_management")
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/registrations", registrationRoutes);

// Frontend routes
app.get('/', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
    }
    res.render('dashboard', { user: req.session.user });
});

app.get('/create-event', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/');
    }
    res.render('createEvent', { user: req.session.user });
});

app.get('/register-event', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'student') {
        return res.redirect('/');
    }
    res.render('registerEvent', { user: req.session.user });
});

app.get('/list-registrations', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/');
    }
    res.render('listRegistrations', { user: req.session.user });
});

app.get('/cancel-registration', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'student') {
        return res.redirect('/');
    }
    res.render('cancelRegistration', { user: req.session.user });
});

app.get('/search-registrations', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/');
    }
    res.render('searchRegistrations', { user: req.session.user });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📱 Frontend available at http://localhost:${PORT}`);
});
