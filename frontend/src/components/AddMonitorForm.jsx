import React, { useState } from 'react';

export default function AddMonitorForm({ onAddMonitor, actionLoading }) {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    
    const success = await onAddMonitor(url, name);
    if (success) {
      setUrl('');
      setName('');
    }
  };

  return (
    <section className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 mb-10 shadow-lg">
      <h2 className="text-lg font-bold text-gray-100 mb-4 flex items-center gap-2">
        <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Register New Monitor Endpoint
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider mb-1.5">Friendly Name (Optional)</label>
          <input
            type="text"
            placeholder="e.g. My Website"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="flex-2 w-full">
          <label className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider mb-1.5">Monitor Destination URL (Required)</label>
          <input
            type="text"
            required
            placeholder="e.g. https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={actionLoading}
          className="w-full md:w-auto bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm px-6 py-2.5 rounded-xl border border-blue-500/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
        >
          {actionLoading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3 3L22 4" />
              </svg>
              Registering...
            </>
          ) : 'Add Monitor'}
        </button>
      </form>
    </section>
  );
}
