const mongoose = require('mongoose');
const Category = require('../models/Category');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedCategories = async () => {
  try {
    await connectDB();

    // Check if categories already exist
    const existingMen = await Category.findOne({ name: 'Men' });
    const existingWomen = await Category.findOne({ name: 'Women' });

    if (existingMen && existingWomen) {
      console.log('Default categories already exist. Skipping seed.');
      process.exit(0);
    }

    // Get admin user ID (first admin user or create a system user)
    const User = require('../models/User');
    let adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.log('No admin user found. Creating system user for seeding...');
      // Create a temporary system user for seeding
      adminUser = { _id: new mongoose.Types.ObjectId() };
    }

    const categories = [];

    // Create Men category if it doesn't exist
    if (!existingMen) {
      const menCategory = await Category.create({
        name: 'Men',
        description: 'Men\'s fashion and accessories',
        parentId: null,
        priority: 1,
        status: 'active',
        createdBy: adminUser._id,
      });
      categories.push(menCategory);
      console.log('✓ Created Men category');
    }

    // Create Women category if it doesn't exist
    if (!existingWomen) {
      const womenCategory = await Category.create({
        name: 'Women',
        description: 'Women\'s fashion and accessories',
        parentId: null,
        priority: 2,
        status: 'active',
        createdBy: adminUser._id,
      });
      categories.push(womenCategory);
      console.log('✓ Created Women category');
    }

    console.log(`\n✅ Successfully seeded ${categories.length} default categories!`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
};

seedCategories();
