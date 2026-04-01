const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');
const Event = require('../models/Event');

const connectDB = async () => {
    try {
        const mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        console.log('Using in-memory MongoDB:', uri);

        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log('MongoDB connection SUCCESS');
        console.log('MongoDB connection SUCCESS');
        
        // Seed database
        const count = await MenuItem.countDocuments();
        if (count === 0) {
            await MenuItem.insertMany([
              { name: 'Vegan Burger', category: 'Meals', price: 1500, stockCount: 10, ecoScore: 90, image: '/images/vegan_burger.png', stallNumber: 'Stall 1 (Hot Meals)' },
              { name: 'Margherita Pizza', category: 'Meals', price: 1800, stockCount: 5, ecoScore: 60, image: '/images/margherita_pizza.png', stallNumber: 'Stall 1 (Hot Meals)' },
              { name: 'Sushi Platter', category: 'Meals', price: 2400, stockCount: 8, ecoScore: 80, image: '/images/sushi_platter.png', stallNumber: 'Stall 1 (Hot Meals)' },
              { name: 'Premium Steak', category: 'Meals', price: 4500, stockCount: 3, ecoScore: 30, image: '/images/premium_steak.png', stallNumber: 'Stall 1 (Hot Meals)' },
              { name: 'Caesar Salad', category: 'Meals', price: 1200, stockCount: 15, ecoScore: 95, image: '/images/caesar_salad.png', stallNumber: 'Stall 1 (Hot Meals)' },

              { name: 'Truffle Fries', category: 'Snacks', price: 800, stockCount: 20, ecoScore: 40, image: '/images/truffle_fries.png', stallNumber: 'Stall 2 (Quick Bites)' },
              { name: 'Loaded Nachos', category: 'Snacks', price: 1100, stockCount: 10, ecoScore: 50, image: '/images/loaded_nachos.png', stallNumber: 'Stall 2 (Quick Bites)' },
              { name: 'Caramel Popcorn', category: 'Snacks', price: 600, stockCount: 30, ecoScore: 85, image: '/images/caramel_popcorn.png', stallNumber: 'Stall 3 (Desserts & Sweets)' },
              { name: 'Soft Pretzel', category: 'Snacks', price: 500, stockCount: 25, ecoScore: 70, image: '/images/soft_pretzel.png', stallNumber: 'Stall 3 (Desserts & Sweets)' },
              { name: 'Chips & Guac', category: 'Snacks', price: 900, stockCount: 12, ecoScore: 80, image: '/images/loaded_nachos.png', stallNumber: 'Stall 2 (Quick Bites)' },

              { name: 'Artisan Coffee', category: 'Beverages', price: 450, stockCount: 50, ecoScore: 65, image: '/images/artisan_coffee.png', stallNumber: 'Stall 4 (Beverages Bar)' },
              { name: 'Iced Lemon Tea', category: 'Beverages', price: 500, stockCount: 40, ecoScore: 90, image: '/images/iced_lemon_tea.png', stallNumber: 'Stall 4 (Beverages Bar)' },
              { name: 'Classic Cola', category: 'Beverages', price: 300, stockCount: 100, ecoScore: 30, image: '/images/classic_cola.png', stallNumber: 'Stall 4 (Beverages Bar)' },
              { name: 'Berry Smoothie', category: 'Beverages', price: 700, stockCount: 15, ecoScore: 85, image: '/images/berry_smoothie.png', stallNumber: 'Stall 4 (Beverages Bar)' },
              { name: 'Fresh Lemonade', category: 'Beverages', price: 600, stockCount: 30, ecoScore: 95, image: '/images/fresh_lemonade.png', stallNumber: 'Stall 4 (Beverages Bar)' }
            ]);
            console.log('Database seeded with MenuItems');
        }

        // Seed users
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            const testUser = new User({
                name: 'Test Student',
                email: 'test@university.edu',
                password: 'password123',
                role: 'student'
            });
            await testUser.save();
            
            const adminUser = new User({
                name: 'Admin User',
                email: 'admin@university.edu',
                password: 'password123',
                role: 'organizer'
            });
            await adminUser.save();
            console.log('Database seeded with Users');
            
            // Seed Events linked to the Admin
            const sampleEvent = new Event({
                title: 'Annual Tech Symposium 2026',
                description: 'Join us for the biggest technology gathering on campus featuring expert speakers, workshops, and food!',
                date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                location: 'Main Auditorium',
                organizer: adminUser._id,
                category: 'Academic',
                capacity: 500,
                registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                status: 'Approved'
            });
            await sampleEvent.save();
            
            const sampleEvent2 = new Event({
                title: 'Campus Flow Music Festival',
                description: 'A night of incredible live music exclusively for students!',
                date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                location: 'Open Air Theater',
                organizer: adminUser._id,
                category: 'Social',
                capacity: 1000,
                registrationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
                status: 'Pending'
            });
            await sampleEvent2.save();
            console.log('Database seeded with Events');

            // Seed Mock Parking Reservation
            const ParkingReservation = require('../models/ParkingReservation');
            const QRCode = require('qrcode');
            const qrData = JSON.stringify({
                id: 'mock_park_123',
                slot: 'N1',
                plate: 'WP ABC-1234',
                zone: 'North'
            });
            const qrCodeData = await QRCode.toDataURL(qrData);

            const mockParking = new ParkingReservation({
                event: sampleEvent._id,
                student: adminUser._id,
                vehiclePlate: 'WP ABC-1234',
                zone: 'North',
                slotNumber: 'N1',
                paymentStatus: 'Paid',
                stripeSessionId: 'MOCK_SESSION_123',
                qrCodeData
            });
            await mockParking.save();
            console.log('Database seeded with Mock Parking Reservation');
        }

        return mongoose.connection;
    } catch (error) {
        console.error('MongoDB connection FAIL');
        console.error(error.message);
        throw error;
    }
};

module.exports = connectDB;
