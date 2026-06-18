import React, { useState } from 'react';

export default function MonitorCard({ monitor, onDelete, onManualCheck }) {
  const [checking, setChecking] = useState(false);

  const handlePing = async () => {
    setChecking(true);
    await onManualCheck(monitor._id);
    setChecking(false);
  };

  const { name, url, status, lastResponseTime, lastChecked, history = [] } = monitor;

  // Calculate success rate from history
  const totalPings = history.length;
  const successfulPings = history.filter(h => h.status === 'up').length;
  const successRate = totalPings > 0 ? Math.round((successfulPings / totalPings) * 100) : 100;

  // Format date
  const formatTime = (dateStr) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // SVG Sparkline Math
  const renderSparkline = () => {
    if (history.length < 2) {
      return (
        <div className="h-10 flex items-center justify-center text-xs text-gray-500 italic">
          Waiting for history...
        </div>
      );
    }

    const svgWidth = 140;
    const svgHeight = 40;
    const values = history.map(h => h.responseTime || 0);
    const maxVal = Math.max(...values, 100); // scale up, minimum 100ms height
    const minVal = Math.min(...values, 0); // baseline at 0ms
    const range = maxVal - minVal;

    // Build SVG points
    const points = values.map((val, i) => {
      const x = (i / (values.length - 1)) * svgWidth;
      const y = svgHeight - 4 - ((val - minVal) / (range || 1)) * (svgHeight - 8);
      return { x, y, value: val };
    });

    const pathD = `M ${points.map(p => `${p.x} ${p.y}`).join(' L ')}`;
    const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight} L ${points[0].x} ${svgHeight} Z`;

    return (
      <div className="flex flex-col items-end">
        <div className="relative group">
          <svg width={svgWidth} height={svgHeight} className="overflow-visible">
            {/* Area Gradient */}
            <defs>
              <linearGradient id={`gradient-${monitor._id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={status === 'up' ? '#10b981' : '#ef4444'} stopOpacity="0.25" />
                <stop offset="100%" stopColor={status === 'up' ? '#10b981' : '#ef4444'} stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Area */}
            <path d={areaD} fill={`url(#gradient-${monitor._id})`} />
            {/* Line */}
            <path
              d={pathD}
              fill="none"
              stroke={status === 'up' ? '#10b981' : '#ef4444'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Dots */}
            {points.map((p, idx) => (
              <circle
                key={idx}
                cx={p.x}
                cy={p.y}
                r="3"
                className="fill-slate-900 stroke-2 cursor-pointer hover:r-4 transition-all"
                stroke={status === 'up' ? '#10b981' : '#ef4444'}
              >
                <title>{`${p.value}ms`}</title>
              </circle>
            ))}
          </svg>
        </div>
        <span className="text-[10px] text-gray-500 mt-1 uppercase font-semibold tracking-wider">
          Latency (last {values.length} checks)
        </span>
      </div>
    );
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all duration-300 shadow-lg group">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* URL and Name Info */}
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          {/* Status Glow Dot Indicator */}
          <div className="pt-1.5 shrink-0">
            {status === 'up' && (
              <span className="relative flex h-3.5 w-3.5">
                <span className="pulse-glowing-up absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
              </span>
            )}
            {status === 'down' && (
              <span className="relative flex h-3.5 w-3.5">
                <span className="pulse-glowing-down absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
              </span>
            )}
            {status === 'pending' && (
              <span className="relative flex h-3.5 w-3.5">
                <span className="pulse-glowing-pending absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500"></span>
              </span>
            )}
          </div>
          
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-gray-100 truncate tracking-wide">
              {name || 'Unnamed'}
            </h3>
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-sm text-gray-400 hover:text-blue-400 truncate block mt-0.5 transition-colors font-mono"
            >
              {url}
            </a>
          </div>
        </div>

        {/* Latency History Sparkline */}
        <div className="shrink-0">
          {renderSparkline()}
        </div>
      </div>

      <div className="h-px bg-slate-800/80 my-4" />

      {/* Grid of Stats and Meta */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
        <div>
          <span className="text-[10px] text-gray-500 block uppercase font-bold tracking-wider">Status</span>
          <span className={`text-sm font-semibold capitalize ${
            status === 'up' ? 'text-emerald-400' : 
            status === 'down' ? 'text-red-400' : 'text-amber-400'
          }`}>
            {status === 'up' ? 'Online' : status === 'down' ? 'Offline' : 'Checking'}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-gray-500 block uppercase font-bold tracking-wider">Latency</span>
          <span className="text-sm font-semibold text-gray-200">
            {status === 'pending' ? '—' : `${lastResponseTime || 0} ms`}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-gray-500 block uppercase font-bold tracking-wider">Uptime Rate</span>
          <span className="text-sm font-semibold text-gray-200">
            {successRate}%
          </span>
        </div>

        <div>
          <span className="text-[10px] text-gray-500 block uppercase font-bold tracking-wider">Last Check</span>
          <span className="text-sm font-medium text-gray-300">
            {formatTime(lastChecked)}
          </span>
        </div>
      </div>

      {/* Hover Panel Action Buttons */}
      <div className="flex justify-end gap-2.5 mt-4 pt-3 border-t border-slate-800/50">
        <button
          onClick={handlePing}
          disabled={checking}
          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-gray-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1.5 border border-slate-700/50 cursor-pointer"
        >
          <svg className={`h-3 w-3 ${checking ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3 3L22 4" />
          </svg>
          {checking ? 'Checking...' : 'Check Now'}
        </button>

        <button
          onClick={() => onDelete(monitor._id)}
          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-red-950/20 text-red-400 hover:bg-red-950/50 border border-red-900/30 transition-all duration-200 cursor-pointer"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
