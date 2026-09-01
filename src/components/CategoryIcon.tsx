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
  Sparkles 
} from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-6 h-6' }) => {
  switch (name) {
    case 'HardHat':
      return <HardHat className={className} />;
    case 'Glasses':
      return <Glasses className={className} />;
    case 'HandMetal':
      return <HandMetal className={className} />;
    case 'Footprints':
      return <Footprints className={className} />;
    case 'ShieldAlert':
      return <ShieldAlert className={className} />;
    case 'Headphones':
      return <Headphones className={className} />;
    case 'Anchor':
      return <Anchor className={className} />;
    case 'Shirt':
      return <Shirt className={className} />;
    case 'Flame':
      return <Flame className={className} />;
    case 'TriangleAlert':
      return <TriangleAlert className={className} />;
    default:
      return <Shield className={className} />;
  }
};

export const ProSegurancaLogo: React.FC<{ className?: string; inverted?: boolean }> = ({ 
  className = '', 
  inverted = false 
}) => {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Shield Icon Badge */}
      <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 ring-2 ring-amber-400/40">
        <Shield className="w-6 h-6 stroke-[2.2]" />
        <HardHat className="w-3.5 h-3.5 absolute bottom-1 right-1 text-slate-950 stroke-[2.5]" />
      </div>

      {/* Brand Text */}
      <div className="flex flex-col">
        <div className="flex items-center tracking-tight font-extrabold text-xl leading-none">
          <span className={inverted ? 'text-white' : 'text-slate-950'}>PRO</span>
          <span className="text-amber-500">SEGURANÇA</span>
        </div>
        <span className={`text-[10px] tracking-wider uppercase font-semibold mt-0.5 ${
          inverted ? 'text-slate-400' : 'text-slate-500'
        }`}>
          Proteção & EPIs Moçambique
        </span>
      </div>
    </div>
  );
};
