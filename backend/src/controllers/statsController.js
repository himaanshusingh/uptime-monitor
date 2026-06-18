import Monitor from '../models/Monitor.js';

export const getStats = async (req, res) => {
  try {
    const monitors = await Monitor.find();
    const totalCount = monitors.length;
    const upCount = monitors.filter(m => m.status === 'up').length;
    const downCount = monitors.filter(m => m.status === 'down').length;
    
    const upMonitors = monitors.filter(m => m.status === 'up' && m.lastResponseTime > 0);
    const avgResponseTime = upMonitors.length > 0 
      ? Math.round(upMonitors.reduce((sum, m) => sum + m.lastResponseTime, 0) / upMonitors.length)
      : 0;

    res.json({
      totalCount,
      upCount,
      downCount,
      avgResponseTime,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch global stats', details: err.message });
  }
};
