import React, { useState } from 'react';
import { Download, X, Smartphone, ShieldCheck, Share, PlusSquare, ArrowRight } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, isDismissed, install, dismissPrompt } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [installing, setInstalling] = useState(false);

  // If already installed in standalone mode, or dismissed this session, don't show the banner
  if (isInstalled || isDismissed) {
    return null;
  }

  // Only show if installable (Chrome/Android/Edge) or on iOS Safari
  if (!isInstallable && !isIOS) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    setInstalling(true);
    try {
      await install();
    } finally {
      setInstalling(false);
    }
  };

  return (
    <>
      <div 
        className="relative z-30 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white border-b border-amber-500/25 shadow-md px-4 py-2.5 transition-all duration-300"
        id="pwa-smart-install-banner"
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Left badge & copy */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center shadow-sm shadow-amber-500/20">
              <Smartphone className="w-5 h-5 stroke-[2.2]" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900" />
            </div>

            <div className="flex flex-col text-left">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-amber-400 tracking-wide uppercase">
                  App ProSegurança
                </span>
                <span className="hidden xs:inline-block text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-medium border border-slate-700">
                  Acesso Direto
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-200 line-clamp-1 sm:line-clamp-none">
                <strong>Tenha a ProSegurança sempre consigo.</strong> Instale a nossa loja no seu telemóvel para acesso rápido.
              </p>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
            <button
              onClick={handleInstallClick}
              disabled={installing}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-sm shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              id="btn-install-pwa-banner"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{installing ? 'A instalar...' : 'Instalar ProSegurança'}</span>
            </button>

            <button
              onClick={dismissPrompt}
              aria-label="Dispensar banner de instalação"
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              id="btn-dismiss-pwa-banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Safari Installation Guide Modal */}
      {showIOSModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setShowIOSModal(false)}
        >
          <div 
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-white relative"
            onClick={(e) => e.stopPropagation()}
            id="ios-pwa-guide-modal"
          >
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center shadow-md shadow-amber-500/20">
                <ShieldCheck className="w-7 h-7 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Instalar ProSegurança no iPhone / iPad</h3>
                <p className="text-xs text-slate-400">Instalação direta no Safari em 2 passos simples:</p>
              </div>
            </div>

            <div className="space-y-3.5 my-5 text-sm text-slate-300">
              <div className="flex items-start gap-3 bg-slate-800/60 p-3 rounded-xl border border-slate-800">
                <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-amber-400/15 text-amber-400 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <div className="leading-snug">
                  Toque no botão <strong className="text-white inline-flex items-center gap-1 mx-1 px-1.5 py-0.5 bg-slate-700/70 rounded text-xs"><Share className="w-3.5 h-3.5 text-blue-400 inline" /> Partilhar</strong> na barra de ferramentas inferior do Safari.
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-800/60 p-3 rounded-xl border border-slate-800">
                <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-amber-400/15 text-amber-400 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <div className="leading-snug">
                  Deslize para baixo e selecione <strong className="text-white inline-flex items-center gap-1 mx-1 px-1.5 py-0.5 bg-slate-700/70 rounded text-xs"><PlusSquare className="w-3.5 h-3.5 text-amber-400 inline" /> Ecrã Principal</strong> (Add to Home Screen).
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm rounded-xl transition-colors cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
