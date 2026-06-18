import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import monitorRoutes from './routes/monitorRoutes.js';
import statsRoutes from './routes/statsRoutes.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes mounting
app.use('/api/monitors', monitorRoutes);
app.use('/api/stats', statsRoutes);

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('[Error Handler]', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred on the server.'
  });
});

export default app;
