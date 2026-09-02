import React from 'react';
import { 
  ArrowRight, 
  MessageSquare, 
  Truck, 
  Award, 
  Building2
} from 'lucide-react';
import { getGeneralWhatsAppChatUrl } from '../utils/whatsapp';

const HERO_EPI_IMAGE = '/hero-epi-catalog.jpg';

interface HeroProps {
  onExploreClick: () => void;
  onOpenQuoteModal: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreClick, onOpenQuoteModal }) => {
  return (
    <section 
      id="inicio" 
      className="relative overflow-hidden bg-slate-950 text-white pt-8 pb-14 lg:pt-14 lg:pb-20 border-b border-slate-800 bg-cover bg-center bg-no-repeat min-h-[540px] lg:min-h-[600px] flex items-center"
      style={{
        backgroundImage: "url('/hero-bg-epi.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Light semi-transparent overlay to keep the background image crisp, vibrant and clearly visible while preserving text contrast */}
      <div className="absolute inset-0 bg-slate-950/45 sm:bg-slate-950/40 lg:bg-gradient-to-r lg:from-slate-950/70 lg:via-slate-950/40 lg:to-slate-950/20 pointer-events-none" />
      
      {/* Ambient decorative lighting */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left Column: Copywriting, CTAs & Highlights */}
          <div className="lg:col-span-6 xl:col-span-7 flex flex-col items-start text-left drop-shadow-sm">
            {/* Slogan pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-amber-400/40 text-amber-400 text-xs sm:text-sm font-bold tracking-wide mb-5 shadow-lg">
              <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
              <span>PROSEGURANÇA</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-200">“Proteção e Segurança para o seu Trabalho”</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-white leading-[1.1] mb-4 sm:mb-5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              PROTEJA O QUE <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500">
                MAIS IMPORTA
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base md:text-lg text-slate-100 max-w-2xl leading-relaxed mb-6 sm:mb-8 font-normal drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
              Equipamentos de Proteção Individual de qualidade para profissionais, empresas, construção civil, indústrias e instituições em Moçambique.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto mb-8 sm:mb-10">
              <button
                onClick={onExploreClick}
                className="inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs sm:text-sm md:text-base px-6 py-3.5 rounded-xl shadow-xl shadow-amber-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                id="hero-cta-ver-produtos"
              >
                <span>Ver Produtos em Destaque</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <a
                href={getGeneralWhatsAppChatUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm md:text-base px-5 py-3.5 rounded-xl shadow-xl shadow-emerald-700/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                id="hero-cta-whatsapp"
              >
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 fill-white/20" />
                <span>Falar no WhatsApp</span>
              </a>

              <button
                onClick={onOpenQuoteModal}
                className="inline-flex items-center justify-center gap-2 bg-slate-950/85 backdrop-blur-md hover:bg-slate-900 text-slate-200 hover:text-white font-semibold text-xs sm:text-sm px-4 py-3.5 rounded-xl border border-slate-700 hover:border-slate-600 transition-all cursor-pointer shadow-lg"
              >
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>Cotação para Empresas</span>
              </button>
            </div>

            {/* Key Assurance Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 pt-5 sm:pt-6 border-t border-slate-800/80 w-full text-slate-200 text-xs sm:text-sm">
              <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/60 backdrop-blur-sm border border-slate-800/50">
                <div className="w-8 h-8 rounded-lg bg-amber-400/15 flex items-center justify-center text-amber-400 flex-shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white leading-tight">100% Normas</div>
                  <div className="text-[11px] text-slate-300">EN / ANSI / ISO</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/60 backdrop-blur-sm border border-slate-800/50">
                <div className="w-8 h-8 rounded-lg bg-emerald-400/15 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white leading-tight">Entrega Rápida</div>
                  <div className="text-[11px] text-slate-300">Maputo & Províncias</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 col-span-2 sm:col-span-1 p-2 rounded-lg bg-slate-950/60 backdrop-blur-sm border border-slate-800/50">
                <div className="w-8 h-8 rounded-lg bg-blue-400/15 flex items-center justify-center text-blue-400 flex-shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white leading-tight">Cotação & NUIT</div>
                  <div className="text-[11px] text-slate-300">Atendimento Formal</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: EPI Showcase Image with Frame and Badges */}
          <div className="lg:col-span-6 xl:col-span-5 relative w-full mt-4 lg:mt-0">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              
              {/* Outer decorative ambient glow */}
              <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-tr from-amber-500/25 via-blue-500/20 to-amber-400/30 blur-xl opacity-75 pointer-events-none" />

              {/* Main Image Container Card */}
              <div className="relative rounded-2xl sm:rounded-3xl bg-slate-900 border border-slate-700/80 p-2 sm:p-2.5 shadow-2xl overflow-hidden group">
                
                {/* Image frame */}
                <div className="relative w-full rounded-xl sm:rounded-2xl overflow-hidden bg-white flex items-center justify-center">
                  <img
                    src={HERO_EPI_IMAGE}
                    alt="Equipamentos de Proteção Individual (EPIs) - Catálogo ProSegurança Moçambique"
                    className="w-full h-auto max-h-[480px] object-contain transition-transform duration-300 group-hover:scale-[1.01]"
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

