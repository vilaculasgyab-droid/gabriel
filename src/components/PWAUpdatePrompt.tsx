import React from 'react';
import { Sparkles, RefreshCw, X } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export const PWAUpdatePrompt: React.FC = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      if (r) {
        console.log('Service Worker registered successfully for ProSegurança PWA');
      }
    },
    onRegisterError(error) {
      console.warn('Service Worker registration error:', error);
    },
  });

  if (!needRefresh) {
    return null;
  }

  return (
    <div 
      className="fixed bottom-4 right-4 z-50 max-w-sm w-[calc(100%-2rem)] bg-slate-900/95 backdrop-blur-md border border-amber-500/40 text-white rounded-2xl p-4 shadow-2xl shadow-black/60 animate-in slide-in-from-bottom-4 duration-300"
      id="pwa-update-prompt"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center flex-shrink-0 shadow-sm shadow-amber-500/20 mt-0.5">
          <Sparkles className="w-5 h-5 stroke-[2.2]" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs font-bold text-amber-400 tracking-wide uppercase">
              Atualização Disponível
            </h4>
            <button
              onClick={() => setNeedRefresh(false)}
              className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
              aria-label="Dispensar atualização"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-200 mt-1 leading-snug">
            Uma nova versão da ProSegurança com novidades no catálogo está disponível.
          </p>

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => updateServiceWorker(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-bold rounded-lg shadow-sm shadow-amber-500/20 transition-all cursor-pointer"
              id="btn-update-pwa-now"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Atualizar agora
            </button>

            <button
              onClick={() => setNeedRefresh(false)}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors cursor-pointer"
              id="btn-update-pwa-later"
            >
              Mais tarde
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
