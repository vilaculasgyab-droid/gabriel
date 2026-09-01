import React, { useEffect } from 'react';
import { 
  Award, 
  ShieldCheck, 
  Users, 
  Truck, 
  Building2, 
  MessageSquare, 
  CheckCircle2, 
  ArrowLeft,
  FileCheck,
  Zap,
  Clock,
  Sparkles,
  Layers,
  Check
} from 'lucide-react';
import { 
  WHATSAPP_PHONE_DISPLAY, 
  getGeneralWhatsAppChatUrl 
} from '../utils/whatsapp';

interface AdvantagesPageProps {
  onNavigate: (path: string) => void;
  onOpenQuoteModal: () => void;
}

export const AdvantagesPage: React.FC<AdvantagesPageProps> = ({ onNavigate, onOpenQuoteModal }) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  const advantages = [
    {
      icon: Award,
      badge: 'Qualidade Máxima',
      title: 'Produtos de Qualidade',
      description:
        'Trabalhamos exclusivamente com marcas e fabricantes de comprovada durabilidade. Nossos materiais resistem a impactos mecânicos, desgaste químico, cortes e condições climáticas adversas em Moçambique.',
      highlights: [
        'Materiais duráveis de alto rendimento',
        'Acabamentos ergonómicos e confortáveis',
        'Resistência comprovada em estaleiros de obra'
      ],
      color: 'amber',
    },
    {
      icon: ShieldCheck,
      badge: 'Conformidade Legal',
      title: 'Equipamentos Certificados',
      description:
        'Todos os nossos EPIs cumprem integralmente as exigências regulatórias internacionais (EN, ANSI, ISO e OSHA), garantindo a proteção jurídica e a segurança operacional da sua empresa.',
      highlights: [
        'Homologação segundo normas EN e ANSI',
        'Fichas técnicas e certificados disponíveis',
        'Aprovados pelos padrões de HST moçambicanos'
      ],
      color: 'emerald',
    },
    {
      icon: Users,
      badge: 'Consultoria Especializada',
      title: 'Atendimento Profissional',
      description:
        'Nossa equipa conta com profissionais experientes prontos para orientar a escolha do EPI ideal para cada função, evitando compras inadequadas e otimizando o orçamento de proteção da sua equipa.',
      highlights: [
        'Apoio técnico para gestores de HST',
        'Recomendação por matriz de riscos',
        'Respostas rápidas e sem complicação'
      ],
      color: 'blue',
    },
    {
      icon: Truck,
      badge: 'Logística Ágil',
      title: 'Entrega em Todo Moçambique',
      description:
        'Entregamos com agilidade no Grande Maputo e Matola, além de despachos diários estruturados para as 11 províncias de Moçambique, garantindo que a sua obra nunca fique paralisada por falta de equipamento.',
      highlights: [
        'Entregas prioritárias no Grande Maputo e Matola',
        'Despachos seguros para todas as províncias',
        'Rastreio e pontualidade no prazo acordado'
      ],
      color: 'amber',
    },
    {
      icon: Building2,
      badge: 'Soluções Corporativas',
      title: 'Atendimento para Empresas (B2B)',
      description:
        'Condições especiais para construtoras, indústrias, minas e instituições públicas: cotações formais com NUIT em tempo recorde, faturação transparente e descontos progressivos por volume.',
      highlights: [
        'Cotações formais emitidas em até 2 horas',
        'Emissão de faturas com NUIT',
        'Descontos progressivos para compras em quantidade'
      ],
      color: 'blue',
    },
    {
      icon: MessageSquare,
      badge: 'Sem Burocracia',
      title: 'Compra Fácil pelo WhatsApp',
      description:
        'Compre ou solicite orçamentos diretamente pelo WhatsApp (+258 85 645 0275). Você escolhe os produtos na loja, envia o pedido ou lista de requisição e recebe atendimento imediato.',
      highlights: [
        'Atendimento direto e humano no telemóvel',
        'Envio de fotos, tamanhos e quantidades pelo chat',
        'Pagamento fácil via M-Pesa, E-Mola ou Transferência'
      ],
      color: 'emerald',
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-10 sm:py-14 animate-in fade-in duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs & Back button */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
            <button
              onClick={() => onNavigate('/')}
              className="text-slate-700 hover:text-amber-600 font-semibold cursor-pointer transition-colors"
            >
              Início
            </button>
            <span>/</span>
            <span className="text-amber-600 font-bold">Vantagens</span>
          </div>

          <button
            onClick={() => onNavigate('/')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 hover:border-slate-400 text-slate-800 text-xs sm:text-sm font-bold shadow-sm hover:shadow transition-all cursor-pointer"
            id="back-to-home-btn"
          >
            <ArrowLeft className="w-4 h-4 text-amber-500" />
            <span>Voltar à Loja</span>
          </button>
        </div>

        {/* Hero Header */}
        <div className="relative rounded-3xl bg-slate-900 text-white p-8 sm:p-12 overflow-hidden shadow-xl border border-slate-800 mb-12">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3.5 py-1.5 rounded-full mb-4">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Diferenciais & Vantagens</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
              Por Que Escolher a ProSegurança?
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6">
              Descubra os motivos pelos quais dezenas de empresas e milhares de profissionais confiam na ProSegurança para proteger o seu recurso mais valioso: a vida dos trabalhadores.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenQuoteModal}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                <FileCheck className="w-4 h-4" />
                <span>Pedir Cotação Formal</span>
              </button>
              <a
                href={getGeneralWhatsAppChatUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Falar no WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* 6 Key Advantages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {advantages.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm hover:border-amber-400/80 transition-all hover:shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center shadow-md">
                      <Icon className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                      {item.badge}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-slate-900 mb-3">
                    {item.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
                    {item.description}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    {item.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                        <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-amber-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Garantia de Satisfação ProSegurança</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Corporate Support Banner Box */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/50 rounded-3xl p-8 sm:p-10 text-white border border-slate-800 shadow-xl mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <FileCheck className="w-4 h-4" />
                <span>Atendimento Corporativo Personalizado</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Precisa de uma proposta formal com NUIT para a sua empresa?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Nossa equipa de cotações B2B responde com rapidez, fornecendo fichas técnicas completas, discriminação de impostos, NUIT e prazos de entrega garantidos.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
              <button
                onClick={onOpenQuoteModal}
                className="w-full py-3.5 px-5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs sm:text-sm text-center shadow-md transition-all cursor-pointer"
              >
                Solicitar Cotação Formal
              </button>
              <a
                href={getGeneralWhatsAppChatUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm text-center shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp: {WHATSAPP_PHONE_DISPLAY}</span>
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
