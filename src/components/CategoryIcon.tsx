import React from 'react';
import { 
  Shield, 
  HardHat, 
  Glasses, 
  HandMetal, 
  Footprints, 
  ShieldAlert, 
  Headphones, 
  Anchor, 
  Shirt, 
  Flame, 
  TriangleAlert, 
  Package, 
  Sparkles,
  Radio,
  Zap
} from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-6 h-6' }) => {
  switch (name) {
    case 'Shirt':
      return <Shirt className={className} />;
    case 'Footprints':
      return <Footprints className={className} />;
    case 'ShieldAlert':
      return <ShieldAlert className={className} />;
    case 'Radio':
      return <Radio className={className} />;
    case 'Zap':
      return <Zap className={className} />;
    case 'HardHat':
      return <HardHat className={className} />;
    case 'Glasses':
      return <Glasses className={className} />;
    case 'HandMetal':
      return <HandMetal className={className} />;
    case 'Headphones':
      return <Headphones className={className} />;
    case 'Anchor':
      return <Anchor className={className} />;
    case 'Flame':
      return <Flame className={className} />;
    case 'TriangleAlert':
      return <TriangleAlert className={className} />;
    default:
      return <Shield className={className} />;
  }
};

/**
 * Logótipo Oficial da marca Z FORÇA E PROTEÇÃO
 * Inspirado fielmente na identidade visual: Escudo Dourado Metálico com "Z",
 * Preto Ônix e Branco com o lema "SEGURANÇA EM PRIMEIRO LUGAR".
 */
export const ZForcaEProtecaoLogo: React.FC<{ className?: string; inverted?: boolean; showTagline?: boolean }> = ({ 
  className = '', 
  inverted = true,
  showTagline = true 
}) => {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Golden Metallic Shield with 'Z' Symbol */}
      <div className="relative flex-shrink-0 flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-b from-[#1c1a17] to-[#0a0a0a] border border-amber-500/40 shadow-lg shadow-black/40 ring-1 ring-amber-400/30 overflow-hidden group">
        <svg 
          viewBox="0 0 100 100" 
          className="w-8 h-8 sm:w-9 sm:h-9 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="shieldGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF2B2" />
              <stop offset="30%" stopColor="#E5B94E" />
              <stop offset="70%" stopColor="#B38018" />
              <stop offset="100%" stopColor="#F5D875" />
            </linearGradient>
            <linearGradient id="zGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="35%" stopColor="#F5D061" />
              <stop offset="75%" stopColor="#C89222" />
              <stop offset="100%" stopColor="#FFE58F" />
            </linearGradient>
          </defs>

          {/* Outer Shield Outline */}
          <path 
            d="M50 10 L84 22 C84 60 70 82 50 94 C30 82 16 60 16 22 Z" 
            stroke="url(#shieldGoldGrad)" 
            strokeWidth="4.5" 
            strokeLinejoin="round" 
            fill="#0f0f12" 
          />

          {/* Inner Golden Contour */}
          <path 
            d="M50 16 L78 26 C78 57 66 76 50 86 C34 76 22 57 22 26 Z" 
            stroke="url(#shieldGoldGrad)" 
            strokeWidth="1.5" 
            fill="#08080a" 
          />

          {/* Central Bold Geometric 'Z' */}
          <path 
            d="M34 32 L66 32 L66 42 L47 62 L66 62 L66 72 L34 72 L34 62 L53 42 L34 42 Z" 
            fill="url(#zGoldGrad)" 
            stroke="#634509" 
            strokeWidth="0.8" 
          />
        </svg>

        {/* Subtle light reflection sheen */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-400/10 to-transparent pointer-events-none" />
      </div>

      {/* Typography: Z FORÇA E PROTEÇÃO + SEGURANÇA EM PRIMEIRO LUGAR */}
      <div className="flex flex-col justify-center">
        <div className="flex items-baseline gap-1.5 leading-none">
          <span className="font-extrabold text-xl sm:text-2xl tracking-tight bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent font-['Outfit',sans-serif]">
            Z
          </span>
          <span className={`font-black text-sm sm:text-base tracking-wider uppercase ${
            inverted ? 'text-white' : 'text-slate-900'
          } font-['Outfit',sans-serif]`}>
            FORÇA E
          </span>
        </div>

        <div className={`font-black text-sm sm:text-base tracking-wider uppercase leading-tight ${
          inverted ? 'text-white' : 'text-slate-950'
        } font-['Outfit',sans-serif]`}>
          PROTECÇÃO
        </div>

        {showTagline && (
          <span className="text-[8px] sm:text-[9px] font-bold tracking-[0.2em] uppercase text-amber-500/90 mt-0.5 whitespace-nowrap">
            SEGURANÇA EM PRIMEIRO LUGAR
          </span>
        )}
      </div>
    </div>
  );
};

// Aliases for seamless backwards compatibility
export const FortiMozLogo = ZForcaEProtecaoLogo;
export const ProSegurancaLogo = ZForcaEProtecaoLogo;
