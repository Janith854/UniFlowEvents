const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');
const Event = require('../models/Event');
const Feedback = require('../models/Feedback');

const connectDB = async () => {
    try {
        let uri = process.env.MONGO_URI;

        if (!uri || uri.includes('127.0.0.1') || uri.includes('localhost')) {
            console.log('No MongoDB Atlas URI found or using local/localhost. Defaulting to in-memory/temporary database.');
            
            const path = require('path');
            const fs = require('fs');
            const dbPath = path.join('D:', 'uniflow_temp_db');
            if (!fs.existsSync(dbPath)) fs.mkdirSync(dbPath, { recursive: true });

            const mongoServer = await MongoMemoryServer.create({
                instance: {
                    dbPath: dbPath,
                    storageEngine: 'ephemeralForTest'
                }
            });
            uri = mongoServer.getUri();
            console.log('Using in-memory MongoDB (D: drive):', uri);
        } else {
            console.log('Connecting to MongoDB Atlas/External Cluster...');
        }

        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log('MongoDB connection SUCCESS');
        console.log('MongoDB connection SUCCESS');

        const cleanupFeedbackIndexes = async () => {
            try {
                const indexes = await Feedback.collection.indexes();
                const legacyIndex = indexes.find(
                    (idx) => idx.name === 'userId_1_eventId_1' || (idx.key?.userId === 1 && idx.key?.eventId === 1)
                );
                if (legacyIndex) {
                    await Feedback.collection.dropIndex(legacyIndex.name);
                    console.log(`Dropped legacy feedback index: ${legacyIndex.name}`);
                }
            } catch (err) {
                if (err.codeName === 'NamespaceNotFound') return;
                console.warn('Feedback index cleanup skipped:', err.message);
            }
        };

        await cleanupFeedbackIndexes();
        
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
            
            // Seed 10 rich events with Unsplash photos
            const day = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);
            const eventsToSeed = [
                {
                    title: 'Annual Tech Symposium 2026',
                    description: 'The biggest technology gathering on campus! Featuring keynote speakers from Google, Microsoft and Meta. Explore AI, cloud computing, and the future of software engineering.',
                    date: day(7), location: 'Main Auditorium', category: 'Academic',
                    capacity: 500, registrationDeadline: day(5), status: 'Approved',
                    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80'
                },
                {
                    title: 'Campus Music Festival',
                    description: 'A vibrant night of live performances by student bands and guest artists. Enjoy food, lights, and unforgettable music under the stars.',
                    date: day(14), location: 'Open Air Theater', category: 'Music',
                    capacity: 1000, registrationDeadline: day(10), status: 'Approved',
                    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80'
                },
                {
                    title: 'Spring Career Fair 2026',
                    description: 'Connect with 80+ top companies recruiting fresh graduates and interns. Bring your CV and dress to impress. Industry sectors: Tech, Finance, Healthcare & more.',
                    date: day(20), location: 'Student Center Hall', category: 'Career',
                    capacity: 600, registrationDeadline: day(17), status: 'Approved',
                    image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80'
                },
                {
                    title: 'Intramural Basketball Finals',
                    description: 'Watch the top two campus teams battle it out for the championship trophy! Cheerleading, live DJ, and refreshments available. Come support your faculty.',
                    date: day(28), location: 'Sports Complex Arena', category: 'Sports',
                    capacity: 800, registrationDeadline: day(26), status: 'Approved',
                    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80'
                },
                {
                    title: 'Student Art Exhibition',
                    description: 'A curated showcase of paintings, sculptures, digital art and photography by talented students from the Faculty of Fine Arts. Awards ceremony at 7 PM.',
                    date: day(35), location: 'Art Gallery, Block C', category: 'Art',
                    capacity: 300, registrationDeadline: day(32), status: 'Approved',
                    image: 'https://images.unsplash.com/photo-1595407753234-0882f1e77954?w=800&q=80'
                },
                {
                    title: 'Leadership & Entrepreneurship Workshop',
                    description: 'A full-day intensive workshop on leadership, startup thinking, and building a personal brand. Guest mentors from top Sri Lankan startups will lead breakout sessions.',
                    date: day(42), location: 'Conference Room B', category: 'Workshop',
                    capacity: 120, registrationDeadline: day(38), status: 'Approved',
                    image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80'
                },
                {
                    title: 'International Cultural Night',
                    description: 'Celebrate the diversity of our campus! Students from 20+ countries share traditional food, dances, and costumes. An unforgettable evening of culture and connection.',
                    date: day(50), location: 'Main Hall & Courtyard', category: 'Cultural',
                    capacity: 700, registrationDeadline: day(45), status: 'Approved',
                    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80'
                },
                {
                    title: 'Hackathon 2026: Build for Impact',
                    description: '24-hour coding marathon! Form teams of up to 4 and build solutions for real-world problems. LKR 500,000 in prizes. Categories: EdTech, HealthTech, FinTech & AgriTech.',
                    date: day(60), location: 'Faculty of Computing Labs', category: 'Tech',
                    capacity: 250, registrationDeadline: day(55), status: 'Approved',
                    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80'
                },
                {
                    title: 'Mental Health & Wellness Seminar',
                    description: 'A safe space to discuss mental wellbeing, stress management, and mindfulness. Features sessions with certified counsellors and a guided meditation workshop.',
                    date: day(70), location: 'Student Wellness Centre', category: 'Academic',
                    capacity: 150, registrationDeadline: day(67), status: 'Approved',
                    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80'
                },
                {
                    title: 'End of Year Gala Night',
                    description: 'Celebrate the conclusion of an amazing academic year! Formal dinner, live band, awards for outstanding students, and a night of dancing. Black-tie optional.',
                    date: day(90), location: 'Grand Ballroom, University Hotel', category: 'Social',
                    capacity: 400, registrationDeadline: day(85), status: 'Approved',
                    image: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&q=80'
                },
                // ── 5 Paid-Ticket Events ────────────────────────────────────
                {
                    title: 'AI & Machine Learning Conference 2026',
                    description: 'A premium 2-day conference with international AI researchers, live demos of cutting-edge models, and hands-on ML labs. Certificate of participation included. Lunch provided both days.',
                    date: day(15), location: 'Convention Centre, Block A', category: 'Tech',
                    capacity: 300, registrationDeadline: day(12), status: 'Approved',
                    image: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80',
                    ticketing: { regularPrice: 1500, vipPrice: 3500 }
                },
                {
                    title: 'Campus Stand-Up Comedy Night',
                    description: 'An uproarious evening featuring 5 professional comedians and campus open-mic stars. Includes a welcome drink. Strictly 18+. Limited seating — book early to avoid disappointment!',
                    date: day(22), location: 'Drama Theatre, Arts Block', category: 'Social',
                    capacity: 200, registrationDeadline: day(19), status: 'Approved',
                    image: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800&q=80',
                    ticketing: { regularPrice: 800, vipPrice: 1500 }
                },
                {
                    title: 'Inter-University Debate Championship',
                    description: 'Watch the best debaters from 12 universities clash on controversial motions. Finals streamed live. Audience members receive a commemorative programme booklet and debate evaluation sheet.',
                    date: day(38), location: 'Main Auditorium', category: 'Academic',
                    capacity: 450, registrationDeadline: day(34), status: 'Approved',
                    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80',
                    ticketing: { regularPrice: 500, vipPrice: 1200 }
                },
                {
                    title: 'Electronic Music & Arts Festival',
                    description: '6-hour outdoor EDM festival featuring 3 stages, 10 DJs, immersive art installations, food trucks, and a glow-in-the-dark zone. Wristband grants full-day access to all areas.',
                    date: day(55), location: 'University Sports Grounds', category: 'Music',
                    capacity: 2000, registrationDeadline: day(50), status: 'Approved',
                    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
                    ticketing: { regularPrice: 2000, vipPrice: 4500 }
                },
                {
                    title: 'Photography Masterclass with Pro Shooters',
                    description: 'A hands-on full-day workshop with award-winning photographers. Covers portrait, street, and landscape photography. Includes studio session, editing workshop in Lightroom, and printed certificate.',
                    date: day(75), location: 'Creative Arts Studio, Level 2', category: 'Workshop',
                    capacity: 40, registrationDeadline: day(70), status: 'Approved',
                    image: 'https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?w=800&q=80',
                    ticketing: { regularPrice: 2500, vipPrice: 0 }
                },
            ];

            for (const ev of eventsToSeed) {
                const e = new Event({ ...ev, organizer: adminUser._id });
                await e.save();
            }
            const sampleEvent = await Event.findOne({ title: 'Annual Tech Symposium 2026' });
            console.log('Database seeded with 15 Events (10 free + 5 paid)');



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
