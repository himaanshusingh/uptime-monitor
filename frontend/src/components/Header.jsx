import React from 'react';

export default function Header({ refreshCountdown, onForceRefresh }) {
  return (
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 pb-6 border-b border-slate-800/80">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
          <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-indigo-400 to-purple-400">
            Antigravity Uptime Monitor
          </h1>
          <p className="text-xs text-gray-400 font-medium mt-0.5">
            Lightweight Service Health Dashboard
          </p>
        </div>
      </div>

      {/* Live Refresh Counter */}
      <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between bg-slate-900/60 border border-slate-800 px-4 py-2 rounded-xl text-xs font-semibold text-gray-300">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-blue-500 animate-ping"></span>
          Refreshing in {refreshCountdown}s
        </span>
        <button
          onClick={onForceRefresh}
          className="text-blue-400 hover:text-blue-300 transition-colors pl-3 border-l border-slate-800 cursor-pointer"
        >
          Refresh Now
        </button>
      </div>
    </header>
  );
}
