import React from 'react';
import MonitorCard from './MonitorCard';

export default function MonitorList({ monitors, loading, onDelete, onManualCheck }) {
  if (loading && monitors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-slate-900/20 border border-slate-900/50 rounded-2xl">
        <svg className="animate-spin h-10 w-10 text-indigo-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3 3L22 4" />
        </svg>
        <p className="text-sm text-gray-400 font-semibold">Connecting to live feed...</p>
      </div>
    );
  }

  if (monitors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-slate-900/20 border border-slate-900/50 rounded-2xl text-center px-4">
        <div className="h-14 w-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
          <svg className="h-7 w-7 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </div>
        <h3 className="text-sm font-bold text-gray-300">No endpoints are currently monitored</h3>
        <p className="text-xs text-gray-500 max-w-sm mt-1 mb-5">
          Enter a web URL above to start tracking its uptime, latency performance, and availability logs.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-100 flex items-center gap-2">
          <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Monitored Target Endpoints
        </h2>
        <span className="text-xs text-gray-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full font-medium">
          {monitors.length} sites
        </span>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {monitors.map((monitor) => (
          <MonitorCard
            key={monitor._id}
            monitor={monitor}
            onDelete={onDelete}
            onManualCheck={onManualCheck}
          />
        ))}
      </div>
    </div>
  );
}
