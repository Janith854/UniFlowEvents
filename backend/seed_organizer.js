/**
 * Seed Script: Create Default Organizer Account
 * Run: node seed_organizer.js
 * 
 * This creates an admin/organizer user if one does not already exist.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const ORGANIZER_EMAIL = 'admin@my.sliit.lk';
const ORGANIZER_PASSWORD = 'Admin@1234';
const ORGANIZER_NAME = 'UniFlow Admin';

async function seedOrganizer() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const existing = await User.findOne({ email: ORGANIZER_EMAIL });
        if (existing) {
            // Update role to organizer if it isn't already
            if (existing.role !== 'organizer') {
                existing.role = 'organizer';
                await existing.save();
                console.log(`✅ Updated existing user "${ORGANIZER_EMAIL}" role to organizer.`);
            } else {
                console.log(`ℹ️  Organizer account already exists: ${ORGANIZER_EMAIL}`);
            }
        } else {
            const organizer = new User({
                name: ORGANIZER_NAME,
                email: ORGANIZER_EMAIL,
                password: ORGANIZER_PASSWORD,
                role: 'organizer',
            });
            await organizer.save();
            console.log('✅ Organizer account created successfully!');
        }

        console.log('\n🔑 Login Credentials:');
        console.log(`   Email    : ${ORGANIZER_EMAIL}`);
        console.log(`   Password : ${ORGANIZER_PASSWORD}`);
        console.log(`   Role     : organizer\n`);

    } catch (err) {
        console.error('❌ Error seeding organizer:', err.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

seedOrganizer();
