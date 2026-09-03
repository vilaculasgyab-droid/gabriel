import React, { useState } from 'react';
import { Download, Smartphone, Share, PlusSquare, X, ShieldCheck } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'navbar' | 'mobile' | 'footer';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ 
  className = '', 
  variant = 'navbar' 
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [installing, setInstalling] = useState(false);

  // When already running in standalone/installed mode, hide completely
  if (isInstalled) {
    return null;
  }

  // Only display if installable or iOS device
  if (!isInstallable && !isIOS) {
    return null;
  }

  const handleClick = async () => {
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

  const renderButton = () => {
    if (variant === 'mobile') {
      return (
        <button
          onClick={handleClick}
          disabled={installing}
          className={`flex items-center justify-between w-full p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/30 text-amber-400 font-semibold text-sm transition-colors cursor-pointer ${className}`}
          id="btn-install-pwa-mobile"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
              <Download className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="text-left">
              <div className="text-white text-xs font-bold">Instalar ProSegurança</div>
              <div className="text-[10px] text-amber-400/80">Adicionar à tela inicial</div>
            </div>
          </div>
          <span className="text-xs bg-amber-400 text-slate-950 px-2 py-1 rounded-md font-bold">
            {installing ? '...' : 'Instalar'}
          </span>
        </button>
      );
    }

    if (variant === 'footer') {
      return (
        <button
          onClick={handleClick}
          disabled={installing}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer ${className}`}
          id="btn-install-pwa-footer"
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-400" />
          <span>{installing ? 'A preparar...' : 'Instalar no Telemóvel'}</span>
        </button>
      );
    }

    // Default 'navbar' variant
    return (
      <button
        onClick={handleClick}
        disabled={installing}
        title="Instalar loja ProSegurança no seu dispositivo"
        className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 hover:text-amber-300 text-xs font-bold border border-amber-400/30 transition-all cursor-pointer ${className}`}
        id="btn-install-pwa-navbar"
      >
        <Download className="w-3.5 h-3.5 stroke-[2.5]" />
        <span>{installing ? 'A instalar...' : 'Instalar App'}</span>
      </button>
    );
  };

  return (
    <>
      {renderButton()}

      {/* iOS Modal Guide */}
      {showIOSModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setShowIOSModal(false)}
        >
          <div 
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-white relative"
            onClick={(e) => e.stopPropagation()}
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
                <h3 className="text-base font-bold text-white">Instalar ProSegurança no iOS</h3>
                <p className="text-xs text-slate-400">Acesso instantâneo a partir da sua tela inicial:</p>
              </div>
            </div>

            <div className="space-y-3 my-5 text-sm text-slate-300">
              <div className="flex items-start gap-3 bg-slate-800/60 p-3 rounded-xl border border-slate-800">
                <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-amber-400/15 text-amber-400 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <div className="leading-snug">
                  No Safari, toque no ícone <strong className="text-white inline-flex items-center gap-1 mx-1 px-1.5 py-0.5 bg-slate-700/70 rounded text-xs"><Share className="w-3.5 h-3.5 text-blue-400 inline" /> Partilhar</strong> (barra inferior).
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-800/60 p-3 rounded-xl border border-slate-800">
                <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-amber-400/15 text-amber-400 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <div className="leading-snug">
                  Role a lista e selecione <strong className="text-white inline-flex items-center gap-1 mx-1 px-1.5 py-0.5 bg-slate-700/70 rounded text-xs"><PlusSquare className="w-3.5 h-3.5 text-amber-400 inline" /> Adicionar ao Ecrã Principal</strong>.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm rounded-xl transition-colors cursor-pointer"
            >
              Concluir
            </button>
          </div>
        </div>
      )}
    </>
  );
};
