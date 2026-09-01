import React, { useState } from 'react';
import { MessageSquare, X, ShoppingBag, FileText, HelpCircle, ChevronRight } from 'lucide-react';
import { WHATSAPP_PHONE_DISPLAY, WHATSAPP_QUICK_ACTIONS, getGeneralWhatsAppChatUrl } from '../utils/whatsapp';

interface FloatingWhatsAppProps {
  onOpenQuoteModal?: () => void;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ onOpenQuoteModal }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2">
      {/* Quick Action Popup Menu */}
      {isOpen && (
        <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 w-72 sm:w-80 overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* Header */}
          <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Atendimento ProSegurança</h4>
                <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online • {WHATSAPP_PHONE_DISPLAY}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Action Buttons */}
          <div className="p-3 space-y-2 bg-slate-50 text-xs">
            <p className="text-[11px] text-slate-500 font-medium px-1">Como podemos ajudar hoje?</p>
            
            {/* 1. Comprar produto */}
            <a
              href={WHATSAPP_QUICK_ACTIONS.buyProduct()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <ShoppingBag className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-800 group-hover:text-emerald-700">Comprar produto</p>
                  <p className="text-[10px] text-slate-500">Consultar stock e fazer pedido</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
            </a>

            {/* 2. Solicitar cotação */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                if (onOpenQuoteModal) {
                  onOpenQuoteModal();
                } else {
                  window.open(WHATSAPP_QUICK_ACTIONS.requestQuote(), '_blank');
                }
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-colors group cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 group-hover:text-emerald-700">Solicitar cotação</p>
                  <p className="text-[10px] text-slate-500">Para obras e empresas com NUIT</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
            </button>

            {/* 3. Tirar dúvidas */}
            <a
              href={WHATSAPP_QUICK_ACTIONS.askQuestions()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <HelpCircle className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-800 group-hover:text-emerald-700">Tirar dúvidas</p>
                  <p className="text-[10px] text-slate-500">Normas, tamanhos e especificações</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
            </a>
          </div>

          <div className="bg-slate-100 p-2.5 text-center border-t border-slate-200">
            <a
              href={getGeneralWhatsAppChatUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-bold text-emerald-700 hover:underline"
            >
              Abrir conversa direta no WhatsApp →
            </a>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative w-14 h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-2xl shadow-emerald-700/40 hover:scale-105 active:scale-95 transition-all ring-4 ring-emerald-500/20 cursor-pointer"
        id="floating-whatsapp-btn"
        aria-label="Abrir opções de atendimento WhatsApp"
      >
        <MessageSquare className="w-7 h-7 fill-white/20" />
        
        {/* Pulsing online badge */}
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-400 text-slate-950 text-[9px] font-black items-center justify-center">
            !
          </span>
        </span>
      </button>
    </div>
  );
};

