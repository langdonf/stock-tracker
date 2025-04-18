import { connectDB } from '../lib/db';
import User from '../models/User';

async function migrateHistoricalValues() {
  try {
    await connectDB();

    // Update all users to have historicalValues array
    const result = await User.updateMany(
      { historicalValues: { $exists: false } },
      { $set: { historicalValues: [] } }
    );

    console.log(`Updated ${result.modifiedCount} users with historicalValues field`);

    process.exit(0);
  } catch (error) {
    console.error('Error migrating historical values:', error);
    process.exit(1);
  }
}

migrateHistoricalValues(); 