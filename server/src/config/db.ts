// src/config/db.ts or connectToMongo.js (wherever you have your DB connection logic)
require('dotenv').config();  // This loads environment variables from .env file
const mongoose = require('mongoose');

const DATABASE = process.env.DATABASE;

const connectToMongo = async () => {
  try {
    await mongoose.connect(DATABASE);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);  // Exit the process if DB connection fails
  }
};

module.exports = connectToMongo;
