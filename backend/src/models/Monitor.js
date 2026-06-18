import mongoose from 'mongoose';

const monitorSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['up', 'down', 'pending'],
    default: 'pending',
  },
  lastChecked: {
    type: Date,
  },
  lastResponseTime: {
    type: Number, // in ms
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Monitor', monitorSchema);
