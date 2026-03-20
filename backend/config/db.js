const mongoose = require('mongoose');

const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is not set in backend/.env');
    }

    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000,
        });
        console.log('MongoDB connection SUCCESS');
        return mongoose.connection;
    } catch (error) {
        console.error('MongoDB connection FAIL');
        console.error(error.message);
        throw error;
    }
};

module.exports = connectDB;
