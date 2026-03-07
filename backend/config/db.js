const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connection SUCCESS');
    } catch (error) {
        console.error(`MongoDB connection FAIL: ${error.message}`);
        console.warn('⚠️  Server running WITHOUT database. Fix your MONGO_URI in backend/.env');
    }
};

module.exports = connectDB;
