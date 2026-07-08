import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, Program } from '../models/index.ts';

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI is missing from environment variables.');
    throw new Error('MONGO_URI is required');
  }

  try {
    await mongoose.connect(uri);
    console.log('MongoDB database connected successfully!');

    // Run seeding logic
    await seedUsers();
    await seedPrograms();
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

async function seedUsers() {
  try {
    // 1. Seed Admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@university.edu';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await User.create({
        name: 'System Administrator',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin'
      });
      console.log(`Seeded System Administrator account: ${adminEmail}`);
    }

    // 2. Seed Admissions Officer for testing
    const officerEmail = 'officer@university.edu';
    const existingOfficer = await User.findOne({ email: officerEmail });
    if (!existingOfficer) {
      const hashedPassword = await bcrypt.hash('officer123', 10);
      await User.create({
        name: 'Admissions Officer (Bachelors/Masters)',
        email: officerEmail,
        password: hashedPassword,
        role: 'officer'
      });
      console.log(`Seeded Admissions Officer account: ${officerEmail}`);
    }

    // 3. Seed Academic Department Head for testing
    const deptHeadEmail = 'depthead@university.edu';
    const existingDeptHead = await User.findOne({ email: deptHeadEmail });
    if (!existingDeptHead) {
      const hashedPassword = await bcrypt.hash('depthead123', 10);
      await User.create({
        name: 'CS Department Head',
        email: deptHeadEmail,
        password: hashedPassword,
        role: 'dept_head'
      });
      console.log(`Seeded Department Head account: ${deptHeadEmail}`);
    }
  } catch (err) {
    console.error('Error seeding users:', err);
  }
}

async function seedPrograms() {
  try {
    const count = await Program.countDocuments();
    if (count === 0) {
      const defaultPrograms = [
        {
          name: 'BS Software Engineering',
          degreeLevel: 'Bachelors',
          department: 'Computer Science',
          capacity: 60,
          weightageCriteria: {
            entryTestWeight: 50,
            academicWeight: 50
          },
          minimumCriteria: {
            minAcademicScore: 60, // Minimum HSSC %
            minEntryTestScore: 50  // Minimum Entry Test marks (out of 100)
          }
        },
        {
          name: 'BS Computer Science',
          degreeLevel: 'Bachelors',
          department: 'Computer Science',
          capacity: 80,
          weightageCriteria: {
            entryTestWeight: 40,
            academicWeight: 60
          },
          minimumCriteria: {
            minAcademicScore: 60,
            minEntryTestScore: 50
          }
        },
        {
          name: 'MS Data Science',
          degreeLevel: 'Masters',
          department: 'Computer Science',
          capacity: 30,
          weightageCriteria: {
            entryTestWeight: 50,
            academicWeight: 50
          },
          minimumCriteria: {
            minAcademicScore: 2.5, // Minimum CGPA
            minEntryTestScore: 50
          }
        },
        {
          name: 'MS Electrical Engineering',
          degreeLevel: 'Masters',
          department: 'Electrical Engineering',
          capacity: 25,
          weightageCriteria: {
            entryTestWeight: 40,
            academicWeight: 60
          },
          minimumCriteria: {
            minAcademicScore: 2.5,
            minEntryTestScore: 50
          }
        },
        {
          name: 'PhD Computer Science',
          degreeLevel: 'PhD',
          department: 'Computer Science',
          capacity: 10,
          weightageCriteria: {
            entryTestWeight: 30,
            academicWeight: 70
          },
          minimumCriteria: {
            minAcademicScore: 3.0, // Minimum CGPA
            minEntryTestScore: 60
          }
        }
      ];

      await Program.insertMany(defaultPrograms);
      console.log('Seeded default academic programs.');
    }
  } catch (err) {
    console.error('Error seeding programs:', err);
  }
}
