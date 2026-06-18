import React from 'react';

export default function GlobalStats({ stats }) {
  const { totalCount, upCount, downCount, avgResponseTime } = stats;

  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 shadow-md">
        <span className="text-[10px] text-gray-500 block uppercase font-bold tracking-wider mb-1">Total Services</span>
        <span className="text-3xl font-black text-gray-100">{totalCount}</span>
      </div>

      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 shadow-md">
        <span className="text-[10px] text-gray-500 block uppercase font-bold tracking-wider mb-1">Online</span>
        <span className="text-3xl font-black text-emerald-400 flex items-center gap-2">
          {upCount}
          {totalCount > 0 && upCount === totalCount && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">100% Up</span>
          )}
        </span>
      </div>

      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 shadow-md">
        <span className="text-[10px] text-gray-500 block uppercase font-bold tracking-wider mb-1">Offline</span>
        <span className={`text-3xl font-black ${downCount > 0 ? 'text-red-400' : 'text-gray-400'}`}>
          {downCount}
        </span>
      </div>

      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 shadow-md">
        <span className="text-[10px] text-gray-500 block uppercase font-bold tracking-wider mb-1">Avg Latency</span>
        <span className="text-3xl font-black text-blue-400">
          {avgResponseTime > 0 ? `${avgResponseTime} ms` : '—'}
        </span>
      </div>
    </section>
  );
}
