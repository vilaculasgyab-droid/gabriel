import React from 'react';
import { 
  ShieldCheck, 
  Building2, 
  HardHat, 
  Target, 
  Users, 
  Award, 
  Factory, 
  Pickaxe, 
  Fuel, 
  Truck, 
  Construction,
  CheckCircle2
} from 'lucide-react';
import { ProSegurancaLogo } from './CategoryIcon';

export const AboutUs: React.FC<{ onOpenQuoteModal: () => void }> = ({ onOpenQuoteModal }) => {
  const sectors = [
    {
      icon: Construction,
      name: 'Construção Civil & Obras',
      desc: 'Capacetes, calçado com biqueira de aço, arnês para trabalho em altura e coletes de visibilidade.',
    },
    {
      icon: Factory,
      name: 'Indústrias & Manufatura',
      desc: 'Proteção auricular tipo concha, proteção respiratória contra fumos e luvas mecânicas anticorte.',
    },
    {
      icon: Pickaxe,
      name: 'Mineração & Pedreiras',
      desc: 'EPIs de alta resistência mecânica, botas hidrofugadas S3, proteção ocular e respiradores especiais.',
    },
    {
      icon: Fuel,
      name: 'Petróleo, Gás & Energia',
      desc: 'Fatos ignífugos retardantes de chama, vestuário antiestático e luvas químicas de nitrilo pesado.',
    },
    {
      icon: Truck,
      name: 'Logística, Portos & Transportes',
      desc: 'Sinalização viária, coletes classe 2, sapatos leves com palmilha anti-perfuração e calçado ergonómico.',
    },
    {
      icon: Building2,
      name: 'Comércio & Serviços Gerais',
      desc: 'Kits de proteção para manutenção predial, limpeza técnica, segurança patrimonial e hotelaria.',
    },
  ];

  return (
    <section id="sobre-nos" className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          {/* Left Column: Brand Story & Mission */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-100 px-3 py-1 rounded-full mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Sobre a ProSegurança</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight leading-tight">
                Proteção e Segurança para o seu Trabalho em Moçambique
              </h2>
            </div>

            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              A <strong>ProSegurança</strong> é uma empresa especializada no fornecimento integral de Equipamentos de Proteção Individual (EPIs) e soluções de segurança do trabalho para trabalhadores individuais, profissionais liberais, construtoras, complexos industriais, minas e instituições públicas e privadas.
            </p>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Com sede e operações em Moçambique, a nossa missão é assegurar que cada trabalhador regresse a casa com saúde e segurança todos os dias. Fornecemos apenas equipamentos rigorosamente homologados por normas internacionais, aliando alta durabilidade, ergonomia e custo-benefício.
            </p>

            {/* Value checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm font-semibold text-slate-800">
                  Conformidade com Normas Internacionais (EN / OSHA)
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm font-semibold text-slate-800">
                  Stock Real para Pronta-Entrega
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm font-semibold text-slate-800">
                  Faturação Formal com NUIT para Empresas
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm font-semibold text-slate-800">
                  Atendimento e Cotações Rápidas por WhatsApp
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Composite Box */}
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl bg-slate-900 text-white p-8 overflow-hidden shadow-2xl border border-slate-800">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-6">
                <ProSegurancaLogo inverted={true} />

                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
                    Nosso Lema
                  </div>
                  <div className="text-lg sm:text-xl font-extrabold text-white italic">
                    “Proteção e Segurança para o seu Trabalho”
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                    <div className="text-2xl sm:text-3xl font-black text-amber-400">100%</div>
                    <div className="text-xs text-slate-300 font-semibold mt-1">
                      Equipamentos Certificados
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                    <div className="text-2xl sm:text-3xl font-black text-emerald-400">11 Províncias</div>
                    <div className="text-xs text-slate-300 font-semibold mt-1">
                      Cobertura de Entrega
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Trabalhamos em parceria estreita com os departamentos de HST (Higiene e Segurança no Trabalho) e gestores de compras para equipar equipas com máxima eficiência.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sectors We Serve */}
        <div className="pt-8 border-t border-slate-200">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Setores e Áreas que Atendemos
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Soluções personalizadas de EPI para as exigências específicas de cada segmento económico.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sectors.map((sec, i) => {
              const Icon = sec.icon;
              return (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 hover:border-amber-400/80 transition-all hover:bg-white hover:shadow-md"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">{sec.name}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{sec.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
