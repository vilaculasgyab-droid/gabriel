import React from 'react';
import { 
  ArrowRight, 
  MessageSquare, 
  Truck, 
  Award, 
  Building2
} from 'lucide-react';
import { getGeneralWhatsAppChatUrl } from '../utils/whatsapp';

const HERO_CATALOG_IMAGE = '/hero-epi-catalog.jpg';

interface HeroProps {
  onExploreClick: () => void;
  onOpenQuoteModal: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreClick, onOpenQuoteModal }) => {
  return (
    <section id="inicio" className="relative overflow-hidden bg-slate-950 text-white pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-slate-800">
      {/* Subtle industrial grid and ambient light background */}
      <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Copywriting & CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Slogan pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-400 text-xs sm:text-sm font-bold tracking-wide mb-5 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
              <span>PROSEGURANÇA</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-200">“Proteção e Segurança para o seu Trabalho”</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] mb-5">
              PROTEJA O QUE <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500">
                MAIS IMPORTA
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-2xl leading-relaxed mb-8 font-normal">
              Equipamentos de Proteção Individual de qualidade para profissionais, empresas, construção civil, indústrias e instituições em Moçambique.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto mb-10">
              <button
                onClick={onExploreClick}
                className="inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-sm sm:text-base px-7 py-3.5 rounded-xl shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                id="hero-cta-ver-produtos"
              >
                <span>Ver Produtos em Destaque</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <a
                href={getGeneralWhatsAppChatUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm sm:text-base px-6 py-3.5 rounded-xl shadow-lg shadow-emerald-700/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                id="hero-cta-whatsapp"
              >
                <MessageSquare className="w-5 h-5 fill-white/20" />
                <span>Falar no WhatsApp</span>
              </a>

              <button
                onClick={onOpenQuoteModal}
                className="inline-flex items-center justify-center gap-2 bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs sm:text-sm px-5 py-3.5 rounded-xl border border-slate-700 hover:border-slate-600 transition-all cursor-pointer"
              >
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>Cotação para Empresas</span>
              </button>
            </div>

            {/* Key Assurance Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 w-full text-slate-300 text-xs sm:text-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center text-amber-400 flex-shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white leading-tight">100% Normas</div>
                  <div className="text-[11px] text-slate-400">EN / ANSI / ISO</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-400/10 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white leading-tight">Entrega Rápida</div>
                  <div className="text-[11px] text-slate-400">Maputo & Províncias</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 col-span-2 sm:col-span-1">
                <div className="w-8 h-8 rounded-lg bg-blue-400/10 flex items-center justify-center text-blue-400 flex-shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white leading-tight">Cotação & NUIT</div>
                  <div className="text-[11px] text-slate-400">Atendimento Formal</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Visual Image Display */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Outer subtle glow */}
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-amber-500/20 via-blue-500/20 to-amber-500/30 blur-lg opacity-70 pointer-events-none" />

              <div className="relative rounded-2xl bg-slate-900 border border-slate-800 p-2 sm:p-2.5 shadow-2xl overflow-hidden">
                <div className="w-full rounded-xl overflow-hidden bg-white flex items-center justify-center">
                  <img
                    src={HERO_CATALOG_IMAGE}
                    alt=""
                    className="w-full h-auto object-contain max-h-[460px] sm:max-h-[520px] transition-transform duration-300 hover:scale-[1.01]"
                    referrerPolicy="no-referrer"
                    loading="eager"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
