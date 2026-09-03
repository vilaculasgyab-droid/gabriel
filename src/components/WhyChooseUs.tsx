import React from 'react';
import { 
  ShieldCheck, 
  Users, 
  Award, 
  Truck, 
  Building2, 
  MessageSquare, 
  CheckCircle2,
  PhoneCall,
  Clock,
  FileCheck
} from 'lucide-react';
import { WHATSAPP_PHONE_DISPLAY } from '../utils/whatsapp';

export const WhyChooseUs: React.FC<{ onOpenQuoteModal: () => void }> = ({ onOpenQuoteModal }) => {
  const pillars = [
    {
      icon: Award,
      title: 'Produtos de Qualidade',
      description:
        'Todos os nossos EPIs são testados e em rigorosa conformidade com as normas internacionais de segurança do trabalho (EN, ISO, ANSI e OSHA).',
      tag: 'Certificação Garantida',
      color: 'amber',
    },
    {
      icon: Users,
      title: 'Atendimento Profissional',
      description:
        'Consultoria técnica especializada para ajudar a sua empresa a selecionar o equipamento adequado para cada risco e função.',
      tag: 'Consultoria Especializada',
      color: 'blue',
    },
    {
      icon: ShieldCheck,
      title: 'Segurança em Primeiro Lugar',
      description:
        'Compromisso absoluto com a vida e integridade física de cada trabalhador, em pequenas obras ou em grandes complexos industriais.',
      tag: 'Missão Central',
      color: 'emerald',
    },
    {
      icon: Truck,
      title: 'Entrega Rápida',
      description:
        'Agilidade logística com entregas prioritárias no Grande Maputo e Matola, além de despachos diários para todas as províncias de Moçambique.',
      tag: 'Cobertura Nacional',
      color: 'amber',
    },
    {
      icon: Building2,
      title: 'Atendimento para Empresas',
      description:
        'Cotações formais detalhadas, faturação com NUIT, condições especiais de fornecimento contínuo e descontos progressivos por atacado.',
      tag: 'B2B & Construtoras',
      color: 'blue',
    },
    {
      icon: MessageSquare,
      title: 'Compra Fácil pelo WhatsApp',
      description:
        `Sem burocracias: monte o seu carrinho, envie a sua lista de EPIs e receba atendimento imediato no telemóvel (${WHATSAPP_PHONE_DISPLAY}).`,
      tag: 'Sem Burocracia',
      color: 'emerald',
    },
  ];

  return (
    <section id="por-que-escolher" className="py-20 bg-slate-900 text-white relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:32px_32px] opacity-5 pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3.5 py-1.5 rounded-full mb-3">
            <ShieldCheck className="w-4 h-4" />
            <span>Diferenciais ProSegurança</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Por que escolher a ProSegurança?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mt-3 leading-relaxed">
            Mais do que vender equipamentos de proteção, garantimos que a sua equipa trabalhe com máxima segurança, conformidade legal e tranquilidade.
          </p>
        </div>

        {/* 6 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;

            return (
              <div
                key={idx}
                className="group rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-amber-400/60 p-6 sm:p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
                      <Icon className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-700/80 text-amber-300 border border-slate-600">
                      {pillar.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2.5 group-hover:text-amber-400 transition-colors">
                    {pillar.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center gap-2 text-xs font-semibold text-amber-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Padrão de Excelência ProSegurança</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Corporate Banner Box */}
        <div className="rounded-3xl bg-gradient-to-r from-slate-800 via-slate-800/90 to-amber-950/40 p-6 sm:p-8 border border-amber-500/30 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-400/20">
              <FileCheck className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-lg sm:text-xl font-bold text-white">
                Sua empresa precisa de cotação formal para licitação ou compra direta?
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Emitimos propostas com especificações técnicas completas, NUIT e prazos de entrega em até 2 horas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto flex-shrink-0">
            <button
              onClick={onOpenQuoteModal}
              className="w-full lg:w-auto px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer text-center"
            >
              Pedir Cotação com NUIT
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
