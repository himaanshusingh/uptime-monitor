import Monitor from '../models/Monitor.js';
import PingLog from '../models/PingLog.js';

/**
 * Pings a single monitor URL, updates its state in the database,
 * and records a ping log entry.
 * @param {Object} monitor - Mongoose Monitor document
 * @returns {Promise<Object>} The updated monitor document
 */
export async function pingMonitor(monitor) {
  const start = performance.now();
  const controller = new AbortController();
  // 10 second timeout for pings
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  let status = 'down';
  let statusCode = null;
  let responseTime = 0;
  let errorMsg = null;

  try {
    const res = await fetch(monitor.url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'UptimeMonitor/1.0 (Simple Uptime Pinger)',
      },
    });
    
    clearTimeout(timeoutId);
    const end = performance.now();
    responseTime = Math.round(end - start);
    statusCode = res.status;

    // Consider HTTP status 2xx and 3xx as "up"
    if (res.ok || (res.status >= 300 && res.status < 400)) {
      status = 'up';
    } else {
      status = 'down';
      errorMsg = `HTTP Error Code: ${res.status}`;
    }
  } catch (err) {
    clearTimeout(timeoutId);
    const end = performance.now();
    responseTime = Math.round(end - start);
    
    status = 'down';
    if (err.name === 'AbortError') {
      errorMsg = 'Request Timeout (10s)';
    } else {
      errorMsg = err.message || 'Connection Failed';
    }
  }

  // Update the Monitor document
  monitor.status = status;
  monitor.lastChecked = new Date();
  monitor.lastResponseTime = responseTime;
  await monitor.save();

  // Save detailed history log
  await PingLog.create({
    monitorId: monitor._id,
    url: monitor.url,
    status,
    statusCode,
    responseTime,
    error: errorMsg,
  });

  return monitor;
}

/**
 * Pings all registered monitors concurrently.
 */
export async function pingAll() {
  try {
    const monitors = await Monitor.find();
    if (monitors.length === 0) return;
    
    // Ping all monitors in parallel
    await Promise.allSettled(monitors.map(monitor => pingMonitor(monitor)));
  } catch (err) {
    console.error('Error running scheduler ping cycle:', err);
  }
}

/**
 * Starts the interval-based scheduler.
 * @param {number} intervalMs - Poll interval in milliseconds (default: 60000 / 1 minute)
 */
export function startScheduler(intervalMs = 60000) {
  console.log(`[Scheduler] Starting background monitor checks every ${intervalMs / 1000}s...`);
  
  // Run an initial check on startup
  pingAll();
  
  // Set up the recurring interval
  const intervalId = setInterval(pingAll, intervalMs);
  
  return intervalId;
}
