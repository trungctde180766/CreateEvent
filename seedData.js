const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/userModels');
const Event = require('./models/eventModel');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/event_management')
  .then(() => console.log('✅ Connected to MongoDB for seeding'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Sample users data
const sampleUsers = [
  {
    username: 'admin',
    password: 'admin123',
    role: 'admin'
  },
  {
    username: 'student',
    password: 'student123',
    role: 'student'
  },
  {
    username: 'john_doe',
    password: 'password123',
    role: 'student'
  },
  {
    username: 'jane_smith',
    password: 'password123',
    role: 'student'
  }
];

// Sample events data
const sampleEvents = [
  {
    name: 'Node.js Workshop',
    maxCapacity: 30,
    description: 'Learn the fundamentals of Node.js development including Express.js, MongoDB, and RESTful APIs.',
    date: new Date('2024-07-15T09:00:00.000Z'),
    location: 'Room B201, Building B'
  },
  {
    name: 'Web Development Bootcamp',
    maxCapacity: 25,
    description: 'Intensive 3-day bootcamp covering HTML, CSS, JavaScript, and modern web development tools.',
    date: new Date('2024-07-20T10:00:00.000Z'),
    location: 'Computer Lab A, Building A'
  },
  {
    name: 'Database Design Workshop',
    maxCapacity: 20,
    description: 'Learn database design principles, SQL, and NoSQL databases with hands-on projects.',
    date: new Date('2024-07-25T14:00:00.000Z'),
    location: 'Room C305, Building C'
  },
  {
    name: 'Mobile App Development',
    maxCapacity: 35,
    description: 'Introduction to React Native and mobile app development for iOS and Android.',
    date: new Date('2024-08-01T13:00:00.000Z'),
    location: 'Innovation Lab, Building D'
  },
  {
    name: 'Cybersecurity Seminar',
    maxCapacity: 40,
    description: 'Learn about cybersecurity threats, prevention methods, and ethical hacking basics.',
    date: new Date('2024-08-05T15:00:00.000Z'),
    location: 'Auditorium, Main Building'
  },
  {
    name: 'AI and Machine Learning',
    maxCapacity: 30,
    description: 'Introduction to artificial intelligence, machine learning algorithms, and practical applications.',
    date: new Date('2024-08-10T11:00:00.000Z'),
    location: 'AI Lab, Building E'
  }
];

// Seed function
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Event.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users
    console.log('👥 Creating users...');
    for (const userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = new User({
        username: userData.username,
        password: hashedPassword,
        role: userData.role
      });
      await user.save();
      console.log(`✅ Created user: ${userData.username} (${userData.role})`);
    }

    // Create events
    console.log('📅 Creating events...');
    for (const eventData of sampleEvents) {
      const event = new Event(eventData);
      await event.save();
      console.log(`✅ Created event: ${eventData.name}`);
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Sample Data Summary:');
    console.log(`- Users: ${sampleUsers.length} (${sampleUsers.filter(u => u.role === 'admin').length} admin, ${sampleUsers.filter(u => u.role === 'student').length} students)`);
    console.log(`- Events: ${sampleEvents.length}`);
    console.log('\n🔑 Demo Accounts:');
    console.log('- Admin: admin / admin123');
    console.log('- Student: student / student123');
    console.log('- Student: john_doe / password123');
    console.log('- Student: jane_smith / password123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the seed function
seedDatabase(); 