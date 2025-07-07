import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ isAdmin: true });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const adminData = {
      voterId: 'ADMIN001',
      name: 'System Administrator',
      email: 'admin@evoting.com',
      password: 'Admin@123',
      gender: 'other',
      dateOfBirth: new Date('1990-01-01'),
      phone: '0000000000',
      address: 'System Address',
      isAdmin: true,
      isEmailVerified: true,
      isActive: true
    };

    // Hash password
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
    adminData.password = await bcrypt.hash(adminData.password, salt);

    // Create admin user
    const admin = await User.create(adminData);

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Password: Admin@123');
    console.log('⚠️  Please change the password after first login');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
};

// Run the script
createAdminUser(); 