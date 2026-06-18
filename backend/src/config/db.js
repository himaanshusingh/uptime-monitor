import mongoose from 'mongoose';

/**
 * Establishes a connection to the MongoDB database.
 * @param {string} mongoUri - MongoDB Connection String
 * @returns {Promise<void>}
 */
export const connectDB = async (mongoUri) => {
  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`[Database] Error connecting to MongoDB: ${err.message}`);
    process.exit(1);
  }
};

// Graceful shutdown on process termination
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('[Database] MongoDB connection closed due to app termination');
    process.exit(0);
  } catch (err) {
    console.error(`[Database] Error during connection teardown: ${err.message}`);
    process.exit(1);
  }
});
