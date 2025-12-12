import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User, { UserRole, UserStatus, AuthProvider } from '../models/userModel';

// Load environment variables
dotenv.config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    const DATABASE = process.env.DATABASE;
    if (!DATABASE) {
      throw new Error('DATABASE connection string is missing in environment variables');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(DATABASE);
    console.log('✅ Connected to MongoDB');

    // Admin user details (you can modify these)
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminName = process.env.ADMIN_NAME || 'Admin User';

    // Check if admin user already exists
    const existingAdmin = await User.findOne({
      email: adminEmail.toLowerCase(),
    });

    if (existingAdmin) {
      console.log(`⚠️  Admin user with email ${adminEmail} already exists.`);
      console.log('   Updating to admin role...');
      
      existingAdmin.role = UserRole.ADMIN;
      existingAdmin.status = UserStatus.ACTIVE;
      
      // Update password if provided
      if (adminPassword) {
        const salt = await bcrypt.genSalt(10);
        existingAdmin.passwordHash = await bcrypt.hash(adminPassword, salt);
      }
      
      await existingAdmin.save();
      console.log('✅ Admin user updated successfully!');
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Role: ${existingAdmin.role}`);
    } else {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(adminPassword, salt);

      // Create admin user
      const adminUser = new User({
        name: adminName,
        email: adminEmail.toLowerCase(),
        passwordHash,
        provider: AuthProvider.LOCAL,
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
      });

      await adminUser.save();
      console.log('✅ Admin user created successfully!');
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: ${adminPassword}`);
      console.log(`   Role: ${adminUser.role}`);
    }

    // Close connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error creating admin user:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the script
createAdminUser();

