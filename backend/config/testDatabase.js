import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectTestDB = async () => {
  try {
    const testDB = process.env.MONGODB_URI_TEST;
    await mongoose.connect(testDB);
    console.log('Test MongoDB connected successfully');
  } catch (error) {
    console.error('Test Database connection error:', error);
    process.exit(1);
  }
};

export default connectTestDB;