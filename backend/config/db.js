const mongoose = require('mongoose');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');
const Event = require('../models/Event');

const seedDatabase = async () => {
    try {
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
            console.log('✅ Menu items seeded');
        }

        const userCount = await User.countDocuments();
        if (userCount === 0) {
            const testUser = new User({ name: 'Test Student', email: 'test@university.edu', password: 'password123', role: 'student' });
            await testUser.save();
            const adminUser = new User({ name: 'Admin User', email: 'admin@university.edu', password: 'password123', role: 'organizer' });
            await adminUser.save();

            const day = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);
            const eventsToSeed = [
                { title: 'Annual Tech Symposium 2026', description: 'The biggest technology gathering on campus! Featuring keynote speakers from Google, Microsoft and Meta.', date: day(7), location: 'Main Auditorium', category: 'Academic', capacity: 500, registrationDeadline: day(5), status: 'Approved', image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80' },
                { title: 'Campus Music Festival', description: 'A vibrant night of live performances by student bands and guest artists.', date: day(14), location: 'Open Air Theater', category: 'Music', capacity: 1000, registrationDeadline: day(10), status: 'Approved', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80' },
                { title: 'Spring Career Fair 2026', description: 'Connect with 80+ top companies recruiting fresh graduates and interns.', date: day(20), location: 'Student Center Hall', category: 'Career', capacity: 600, registrationDeadline: day(17), status: 'Approved', image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80' },
                { title: 'Intramural Basketball Finals', description: 'Watch the top two campus teams battle it out for the championship trophy!', date: day(28), location: 'Sports Complex Arena', category: 'Sports', capacity: 800, registrationDeadline: day(26), status: 'Approved', image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80' },
                { title: 'Hackathon 2026: Build for Impact', description: '24-hour coding marathon! Form teams of up to 4 and build solutions for real-world problems.', date: day(60), location: 'Faculty of Computing Labs', category: 'Tech', capacity: 250, registrationDeadline: day(55), status: 'Approved', image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80' },
                { title: 'AI & Machine Learning Conference 2026', description: 'A premium 2-day conference with international AI researchers and live demos.', date: day(15), location: 'Convention Centre, Block A', category: 'Tech', capacity: 300, registrationDeadline: day(12), status: 'Approved', image: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80', ticketing: { regularPrice: 1500, vipPrice: 3500 } },
                { title: 'Electronic Music & Arts Festival', description: '6-hour outdoor EDM festival featuring 3 stages, 10 DJs and immersive art installations.', date: day(55), location: 'University Sports Grounds', category: 'Music', capacity: 2000, registrationDeadline: day(50), status: 'Approved', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80', ticketing: { regularPrice: 2000, vipPrice: 4500 } },
            ];

            for (const ev of eventsToSeed) {
                await new Event({ ...ev, organizer: adminUser._id }).save();
            }
            console.log('✅ Users and Events seeded');
        }
    } catch (err) {
        console.warn('⚠️ Background seeder warning:', err.message);
    }
};

// ── Main DB Connect ─────────────────────────────────────────────────────────
const connectDB = async () => {
    let uri = process.env.MONGO_URI;

    if (!uri || uri.includes('127.0.0.1') || uri.includes('localhost')) {
        console.log('No MongoDB Atlas URI found or using local/localhost. Defaulting to in-memory/temporary database.');

        const path = require('path');
        const fs = require('fs');
        const { MongoMemoryServer } = require('mongodb-memory-server');

        const mongoServer = await MongoMemoryServer.create({
            instance: {
                storageEngine: 'ephemeralForTest'
            }
        });
        uri = mongoServer.getUri();
        console.log('Using in-memory MongoDB (D: drive):', uri);
    } else {
        console.log('🔌 Connecting to MongoDB Atlas...');
    }

    await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 8000,
        connectTimeoutMS: 10000,
    });

    console.log('🍃 MongoDB connected successfully');

    // Run seeding in background — server is ready IMMEDIATELY
    setImmediate(() => seedDatabase());

    return mongoose.connection;
};

module.exports = connectDB;
