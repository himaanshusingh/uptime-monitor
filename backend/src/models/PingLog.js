import mongoose from 'mongoose';

const pingLogSchema = new mongoose.Schema({
  monitorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Monitor',
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['up', 'down'],
    required: true,
  },
  statusCode: {
    type: Number,
  },
  responseTime: {
    type: Number, // in ms
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  error: {
    type: String,
  },
});

// Create index on monitorId and timestamp for faster chart data queries
pingLogSchema.index({ monitorId: 1, timestamp: -1 });

export default mongoose.model('PingLog', pingLogSchema);
