import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import GlobalStats from '../components/GlobalStats';
import AddMonitorForm from '../components/AddMonitorForm';
import MonitorList from '../components/MonitorList';
import { api } from '../services/api';

export default function Dashboard() {
  const [monitors, setMonitors] = useState([]);
  const [stats, setStats] = useState({ totalCount: 0, upCount: 0, downCount: 0, avgResponseTime: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshCountdown, setRefreshCountdown] = useState(10);
  
  const countdownTimer = useRef(null);

  // Fetch data via the API service layer
  const fetchData = async () => {
    try {
      const [monitorsData, statsData] = await Promise.all([
        api.getMonitors(),
        api.getStats()
      ]);

      setMonitors(monitorsData);
      setStats(statsData);
      setError(null);
    } catch (err) {
      console.error('[Dashboard] Fetch error:', err);
      setError('Could not connect to the monitoring API server.');
    } finally {
      setLoading(false);
    }
  };

  // Setup initial fetch and periodic 10-second polling
  useEffect(() => {
    fetchData();

    countdownTimer.current = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          fetchData();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownTimer.current) clearInterval(countdownTimer.current);
    };
  }, []);

  // Force an immediate refresh
  const handleForceRefresh = async () => {
    setLoading(true);
    await fetchData();
    setRefreshCountdown(10);
  };

  // Add new monitor URL
  const handleAddMonitor = async (url, name) => {
    setActionLoading(true);
    setError(null);

    try {
      const newMonitor = await api.addMonitor(url, name);
      setMonitors(prev => [newMonitor, ...prev]);
      
      // Update statistics
      fetchData();
      return true; // Indicates success to form to clear inputs
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  // Delete a monitor
  const handleDeleteMonitor = async (id) => {
    if (!window.confirm('Are you sure you want to stop monitoring this URL?')) return;

    try {
      await api.deleteMonitor(id);
      setMonitors(prev => prev.filter(m => m._id !== id));
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  // Manual Ping Check for a single monitor card
  const handleManualCheck = async (id) => {
    try {
      const updatedMonitor = await api.triggerManualCheck(id);
      setMonitors(prev => prev.map(m => m._id === id ? updatedMonitor : m));
      
      // Update stats
      const statsData = await api.getStats();
      setStats(statsData);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <Header 
        refreshCountdown={refreshCountdown} 
        onForceRefresh={handleForceRefresh} 
      />

      {/* Global Alerts */}
      {error && (
        <div className="mb-8 p-4 rounded-xl bg-red-950/20 border border-red-900/40 text-red-300 text-sm flex items-start gap-3 shadow-lg">
          <svg className="h-5 w-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="font-semibold">Service Incident</p>
            <p className="text-xs text-red-400/90 mt-0.5">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300 cursor-pointer">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Global Metrics Row */}
      <GlobalStats stats={stats} />

      {/* Add Monitor Form Panel */}
      <AddMonitorForm 
        onAddMonitor={handleAddMonitor} 
        actionLoading={actionLoading} 
      />

      {/* Main List Section */}
      <main>
        <MonitorList 
          monitors={monitors} 
          loading={loading} 
          onDelete={handleDeleteMonitor} 
          onManualCheck={handleManualCheck} 
        />
      </main>
    </div>
  );
}
