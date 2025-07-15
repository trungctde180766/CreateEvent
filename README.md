# Event Management System - FPT University Da Nang

## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Frontend Interface](#frontend-interface)
- [Database Schema](#database-schema)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

---

## Introduction
This is a comprehensive Event Management System built with Node.js, Express, MongoDB, and EJS for FPT University Da Nang. The system supports role-based access control (admin and student), event registration management, and real-time notifications.

### Key Features
- **Authentication & Authorization**: Secure login system with role-based access
- **Event Management**: Create, view, update, and delete events
- **Registration System**: Students can register/unregister for events
- **Admin Dashboard**: View all registrations and system statistics
- **Responsive UI**: Modern, mobile-friendly interface
- **MVC Architecture**: Clean separation of concerns

---

## Features

### For Students
- Browse available events
- Register for events (with capacity checking)
- View personal registration history
- Cancel registrations
- Real-time capacity updates

### For Administrators
- View all event registrations
- Search registrations by date range
- System statistics dashboard
- Event management (CRUD operations)
- Registration analytics

---

## Project Structure
```
ThanhTrung_event/
├── controllers/           # MVC Controllers
│   ├── authController.js
│   ├── eventController.js
│   └── registrationController.js
├── models/               # Database Models
│   ├── userModels.js
│   ├── eventModel.js
│   └── registrationModel.js
├── routes/               # API Routes
│   ├── auth.js
│   ├── event.js
│   └── registration.js
├── middlewares/          # Authentication Middleware
│   └── authMiddlewares.js
├── views/                # EJS Templates
│   ├── login.ejs
│   ├── dashboard.ejs
│   ├── registerEvent.ejs
│   ├── listRegistrations.ejs
│   ├── cancelRegistration.ejs
│   └── searchRegistrations.ejs
├── public/               # Static Files
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
├── server.js             # Main application file
├── package.json          # Dependencies
└── README.md            # This file
```

---

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Step 1: Clone and Install Dependencies
```bash
# Navigate to project directory
cd ThanhTrung_event

# Install dependencies
npm install
```

### Step 2: Database Setup
Make sure MongoDB is running on your system:
```bash
# Start MongoDB (Windows)
mongod

# Start MongoDB (macOS/Linux)
sudo systemctl start mongod
```

### Step 3: Environment Configuration
Create a `.env` file in the project root:
```env
JWT_SECRET=your_super_secret_jwt_key_here
MONGODB_URI=mongodb://localhost:27017/event_management
SESSION_SECRET=your_session_secret_here
PORT=3000
```

### Step 4: Start the Application
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The application will be available at `http://localhost:3000`

---

## Configuration

### Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `JWT_SECRET` | Secret key for JWT tokens | `your-secret-key` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/event_management` |
| `SESSION_SECRET` | Secret for session management | `your-secret-key` |
| `PORT` | Server port | `3000` |

### Database Configuration
The system uses MongoDB with the following collections:
- `users` - User accounts and authentication
- `events` - Event information
- `registrations` - Event registration records

---

## Usage

### Initial Setup
1. Start the application
2. Access `http://localhost:3000`
3. Use the demo accounts or create new ones via API

### Demo Accounts
```
Admin: username: admin, password: admin123
Student: username: student, password: student123
```

### Creating New Users
Use the registration API endpoint:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "password": "password123",
    "role": "student"
  }'
```

### Creating Events (Admin Only)
```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Workshop NodeJS",
    "maxCapacity": 30,
    "description": "Learn basic NodeJS",
    "date": "2024-06-15T09:00:00.000Z",
    "location": "Room B201"
  }'
```

---

## API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user
```json
{
  "username": "string",
  "password": "string",
  "role": "admin|student"
}
```

#### POST /api/auth/login
Login user
```json
{
  "username": "string",
  "password": "string"
}
```

#### POST /api/auth/logout
Logout user

#### GET /api/auth/me
Get current user information

### Event Endpoints

#### GET /api/events
Get all events

#### GET /api/events/with-count
Get events with registration counts

#### GET /api/events/:id
Get event by ID

#### POST /api/events (Admin only)
Create new event
```json
{
  "name": "string",
  "maxCapacity": "number",
  "description": "string",
  "date": "date",
  "location": "string"
}
```

#### PUT /api/events/:id (Admin only)
Update event

#### DELETE /api/events/:id (Admin only)
Delete event

### Registration Endpoints

#### POST /api/registrations (Student only)
Register for an event
```json
{
  "eventId": "string"
}
```

#### GET /api/registrations/my-registrations (Student only)
Get student's registrations

#### DELETE /api/registrations/:id (Student only)
Cancel registration

#### GET /api/registrations/listRegistrations (Admin only)
Get all registrations

#### GET /api/registrations/getRegistrationsByDate (Admin only)
Search registrations by date range
```
?start=YYYY-MM-DD&end=YYYY-MM-DD
```

#### GET /api/registrations/stats (Admin only)
Get registration statistics

---

## Frontend Interface

### Pages
1. **Login Page** (`/`) - User authentication
2. **Dashboard** (`/dashboard`) - Main dashboard with statistics
3. **Register Events** (`/register-event`) - Student event registration
4. **My Registrations** (`/cancel-registration`) - Student registration management
5. **All Registrations** (`/list-registrations`) - Admin view all registrations
6. **Search Registrations** (`/search-registrations`) - Admin search by date

### Features
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Live capacity indicators and registration status
- **Role-based Navigation**: Different menus for admin and student
- **Modern UI**: Clean, professional interface with smooth animations

---

## Database Schema

### User Model
```javascript
{
  username: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ['admin', 'student']),
  createdAt: Date (default: now)
}
```

### Event Model
```javascript
{
  name: String (required),
  maxCapacity: Number (required),
  description: String,
  date: Date,
  location: String,
  timestamps: true
}
```

### Registration Model
```javascript
{
  studentId: String (required),
  eventId: String (required),
  registrationDate: Date (default: now)
}
```

---

## Testing

### Manual Testing
1. **Login Test**: Try both demo accounts
2. **Role Access Test**: Verify admin/student permissions
3. **Event Registration Test**: Register for events as student
4. **Capacity Test**: Try registering when event is full
5. **Search Test**: Use date range search as admin

### API Testing with Postman
Import the following collection:
```json
{
  "info": {
    "name": "Event Management System API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "url": "http://localhost:3000/api/auth/login",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"username\": \"admin\",\n  \"password\": \"admin123\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            }
          }
        }
      ]
    }
  ]
}
```

---

## Troubleshooting

### Common Issues

#### MongoDB Connection Error
```
Error: MongoDB connection failed
```
**Solution**: Ensure MongoDB is running and the connection string is correct.

#### JWT Token Error
```
Error: JWT verification failed
```
**Solution**: Check JWT_SECRET in .env file and ensure it's consistent.

#### Port Already in Use
```
Error: EADDRINUSE
```
**Solution**: Change PORT in .env file or kill the process using the port.

#### Module Not Found
```
Error: Cannot find module
```
**Solution**: Run `npm install` to install dependencies.

### Logs
Check the console output for detailed error messages and debugging information.

### Support
For additional support, check the error logs or contact the development team.

---

## License
This project is developed for educational purposes at FPT University Da Nang.

---

**Developed by Thanh Trung - SDN302 Practical Examination** #   C r e a t e E v e n t  
 