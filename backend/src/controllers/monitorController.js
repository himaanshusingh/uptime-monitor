import Monitor from '../models/Monitor.js';
import PingLog from '../models/PingLog.js';
import { pingMonitor } from '../services/scheduler.js';

// Helper function to normalize and validate URL
function normalizeUrl(urlStr) {
  if (!urlStr) return null;
  let cleanUrl = urlStr.trim();
  if (!/^https?:\/\//i.test(cleanUrl)) {
    cleanUrl = 'http://' + cleanUrl;
  }
  try {
    new URL(cleanUrl);
    return cleanUrl;
  } catch (err) {
    return null;
  }
}

// GET all monitors with last 10 ping logs
export const getMonitors = async (req, res) => {
  try {
    const monitors = await Monitor.find().sort({ createdAt: -1 });
    
    const monitorsWithHistory = await Promise.all(
      monitors.map(async (monitor) => {
        const history = await PingLog.find({ monitorId: monitor._id })
          .sort({ timestamp: -1 })
          .limit(10);
        
        return {
          ...monitor.toObject(),
          history: history.reverse(),
        };
      })
    );
    
    res.json(monitorsWithHistory);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch monitors', details: err.message });
  }
};

// POST add new monitor URL
export const createMonitor = async (req, res) => {
  try {
    const { url, name } = req.body;
    const normalized = normalizeUrl(url);

    if (!normalized) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    const existing = await Monitor.findOne({ url: normalized });
    if (existing) {
      return res.status(400).json({ error: 'This URL is already being monitored' });
    }

    const monitor = new Monitor({
      url: normalized,
      name: name ? name.trim() : new URL(normalized).hostname,
      status: 'pending',
    });

    await monitor.save();

    // Trigger immediate ping in the background
    pingMonitor(monitor).catch(err => console.error('Initial ping error:', err));

    res.status(201).json({
      ...monitor.toObject(),
      history: []
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create monitor', details: err.message });
  }
};

// DELETE a monitor and its log history
export const deleteMonitor = async (req, res) => {
  try {
    const { id } = req.params;
    
    const monitor = await Monitor.findByIdAndDelete(id);
    if (!monitor) {
      return res.status(404).json({ error: 'Monitor not found' });
    }

    await PingLog.deleteMany({ monitorId: id });

    res.json({ message: 'Monitor and history deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete monitor', details: err.message });
  }
};

// POST manually check monitor health status
export const triggerPing = async (req, res) => {
  try {
    const { id } = req.params;
    const monitor = await Monitor.findById(id);

    if (!monitor) {
      return res.status(404).json({ error: 'Monitor not found' });
    }

    const updatedMonitor = await pingMonitor(monitor);
    
    const history = await PingLog.find({ monitorId: id })
      .sort({ timestamp: -1 })
      .limit(10);

    res.json({
      ...updatedMonitor.toObject(),
      history: history.reverse(),
    });
  } catch (err) {
    res.status(500).json({ error: 'Manual ping check failed', details: err.message });
  }
};
