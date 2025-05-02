import { connectDB } from '../lib/db';

async function migrateHistoricalValues() {
  try {
    await connectDB();

    process.exit(0);
  } catch (error) {
    console.error('Error migrating historical values:', error);
    process.exit(1);
  }
}

migrateHistoricalValues(); 