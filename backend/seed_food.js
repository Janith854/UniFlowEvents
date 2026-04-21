require('dotenv').config();
const mongoose = require('mongoose');
const MenuItem = require('./models/MenuItem');

const seedItems = [
  { name: 'Vegan Burger', category: 'Meals', price: 25, stockCount: 10, ecoScore: 90 },
  { name: 'Chicken Salad', category: 'Meals', price: 18, stockCount: 0, ecoScore: 60 },
  { name: 'Potato Chips', category: 'Snacks', price: 5, stockCount: 50, ecoScore: 40 },
  { name: 'Cola', category: 'Beverages', price: 3, stockCount: 100, ecoScore: 20 },
  { name: 'Premium Steak', category: 'Meals', price: 45, stockCount: 5, ecoScore: 30 }
];

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/uniflow_events')
  .then(async () => {
    console.log('Connected to DB');
    await MenuItem.deleteMany({});
    await MenuItem.insertMany(seedItems);
    console.log('Seed successful');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
