import mongoose from 'mongoose';
import { connectDB } from '../lib/db';
import User from '../models/User';

async function deduplicateHistoricalData() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    const users = await User.find({});
    console.log(`Found ${users.length} users`);

    for (const user of users) {
      if (!user.historicalValues || user.historicalValues.length === 0) {
        continue;
      }

      // Create a map to store unique values by date
      const uniqueValues = new Map();
      
      // Process each historical value
      user.historicalValues.forEach(value => {
        const dateStr = value.date.toISOString().split('T')[0];
        if (!uniqueValues.has(dateStr)) {
          uniqueValues.set(dateStr, value);
        }
      });

      // Convert map back to array and sort by date
      const deduplicatedValues = Array.from(uniqueValues.values())
        .sort((a, b) => a.date - b.date);

      // Update the user's historical values
      user.historicalValues = deduplicatedValues;
      await user.save();

      console.log(`User ${user._id}:`);
      console.log(`Original values: ${user.historicalValues.length}`);
      console.log(`Deduplicated values: ${deduplicatedValues.length}`);
      console.log('Sample of deduplicated values:');
      deduplicatedValues.slice(0, 5).forEach(value => {
        console.log(`Date: ${value.date.toISOString().split('T')[0]}, Value: ${value.value}`);
      });
      console.log('\n');
    }

    console.log('Deduplication complete');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

deduplicateHistoricalData(); 