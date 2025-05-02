import mongoose from 'mongoose';
import { connectDB } from '../lib/db';
import User from '../models/User';

async function resetDatabase() {
  try {
    const db = await connectDB();

    // Drop the users collection
    await db.connection.dropCollection('users');
    // Create new users with the correct schema
    const users = [
      {
        _id: new mongoose.Types.ObjectId('67fe5f2769a2b4f38468891f'),
        name: 'Langdon',
        cashRemaining: 50,
        portfolio: [],
        historicalValues: [],
      },
      {
        _id: new mongoose.Types.ObjectId('67fe5f2769a2b4f384688921'),
        name: "J'aime",
        cashRemaining: 50,
        portfolio: [],
        historicalValues: [],
      },
      {
        _id: new mongoose.Types.ObjectId('67fe5f2769a2b4f384688920'),
        name: 'Andy',
        cashRemaining: 50,
        portfolio: [],
        historicalValues: [],
      },
    ];

    await User.insertMany(users);

    process.exit(0);
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  }
}

resetDatabase();
