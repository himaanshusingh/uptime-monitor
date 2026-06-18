import app from './app.js';
import { connectDB } from './config/db.js';
import { startScheduler } from './services/scheduler.js';

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/uptimemonitor';

const startServer = async () => {
  try {
    // 1. Establish connection to Database
    await connectDB(MONGO_URI);

    // 2. Start HTTP server listener
    app.listen(PORT, () => {
      console.log(`[Server] Antigravity Uptime API active on port ${PORT}`);
      
      // 3. Launch background url checks
      startScheduler(60000);
    });
  } catch (err) {
    console.error(`[Server] Boot error: ${err.message}`);
    process.exit(1);
  }
};

startServer();
