import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from '../config/db';
// Make sure this points to your SuperAdmin model file!
import {SuperAdmin} from '../models/SuperAdmin'; 

const seedSuperAdmin = async () => {
  try {
    await connectDB();

    const existingSuperAdmin = await SuperAdmin.findOne({ email: 'superadmin@platform.com' });

    if (existingSuperAdmin) {
      console.log('[Seeder] Super Admin already exists!');
      console.log('Email: admin@gmail.com');
      console.log('Password: Password123');
    } else {
      const hashedPassword = await bcrypt.hash('Password123', 10);

      await SuperAdmin.create({
        name: 'Platform Owner',
        email: 'admin@gmail.com',
        passwordHash: hashedPassword, // <-- Matched to schema!
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
      });

      console.log('[Seeder] Super Admin created successfully!');
      console.log('Email: admin@gmail.com');
      console.log('Password: Password123');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[Seeder Error]:', error);
    process.exit(1);
  }
};

seedSuperAdmin();