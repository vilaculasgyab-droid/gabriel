import React, { useState } from 'react';
import { WifiOff, RefreshCw, X } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [dismissed, setDismissed] = useState(false);

  // If online, reset dismissed state and don't render anything
  if (isOnline) {
    if (dismissed) setDismissed(false);
    return null;
  }

  if (dismissed) {
    return (
      <button
        onClick={() => setDismissed(false)}
        className="fixed bottom-4 left-4 z-50 flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-full shadow-lg cursor-pointer transition-all animate-pulse"
        title="Você está offline"
      >
        <WifiOff className="w-3.5 h-3.5" />
        <span>Offline</span>
      </button>
    );
  }

  return (
    <div 
      className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-50 bg-slate-900/95 backdrop-blur-md border border-rose-500/40 text-white rounded-xl p-3.5 shadow-2xl shadow-black/50 animate-in slide-in-from-bottom-3 duration-300"
      id="pwa-offline-indicator"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center flex-shrink-0 mt-0.5">
          <WifiOff className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              Você está offline
            </span>
            <button
              onClick={() => setDismissed(true)}
              className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
              aria-label="Fechar aviso de offline"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[11px] text-slate-300 mt-1 leading-snug">
            A ligação à internet foi interrompida. O catálogo já visualizado continua disponível offline.
          </p>

          <div className="mt-2.5 flex items-center gap-2">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-md border border-slate-700 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              Tentar reconectar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
