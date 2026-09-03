import React, { useEffect } from 'react';
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
  CheckCircle2,
  ArrowLeft,
  PhoneCall,
  MessageSquare,
  MapPin,
  Sparkles,
  Eye,
  HeartHandshake,
  Mail
} from 'lucide-react';
import { ProSegurancaLogo } from '../components/CategoryIcon';
import { 
  WHATSAPP_PHONE_DISPLAY, 
  EMAIL_DISPLAY,
  ADDRESS_DISPLAY, 
  getGeneralWhatsAppChatUrl 
} from '../utils/whatsapp';
import { useSEO } from '../hooks/useSEO';

interface AboutPageProps {
  onNavigate: (path: string) => void;
  onOpenQuoteModal: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate, onOpenQuoteModal }) => {
  useSEO({
    title: 'Sobre a ProSegurança | Fornecedor de EPIs em Moçambique',
    description: 'Conheça a ProSegurança, distribuidora de Equipamentos de Proteção Individual (EPIs) e segurança no trabalho para indústrias, construtoras e profissionais em Moçambique.',
    canonicalPath: '/sobre-nos',
    breadcrumbs: [
      { name: 'Início', path: '/' },
      { name: 'Sobre Nós', path: '/sobre-nos' },
    ],
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  const sectors = [
    {
      icon: Construction,
      name: 'Construção Civil & Obras',
      desc: 'Capacetes de alta resistência, botas com biqueira e palmilha de aço, arneses para trabalho em altura e coletes de alta visibilidade.',
    },
    {
      icon: Factory,
      name: 'Indústrias & Manufatura',
      desc: 'Proteção auricular tipo concha, proteção respiratória contra poeiras/gases e luvas mecânicas anticorte de precisão.',
    },
    {
      icon: Pickaxe,
      name: 'Mineração & Pedreiras',
      desc: 'EPIs para ambiente de trabalho severo, botas impermeabilizadas S3, proteção facial e filtros especiais de respiração.',
    },
    {
      icon: Fuel,
      name: 'Petróleo, Gás & Energia',
      desc: 'Fatos ignífugos retardantes de chama, vestuário antiestático e luvas químicas de nitrilo de cano longo.',
    },
    {
      icon: Truck,
      name: 'Logística, Portos & Transportes',
      desc: 'Sinalização viária refletora, coletes classe 2/3, calçado leve e antiderrapante para armazéns e estivadores.',
    },
    {
      icon: Building2,
      name: 'Comércio, Serviços & Manutenção',
      desc: 'Kits de proteção para manutenção predial, hotelaria, limpeza técnica e instalações elétricas.',
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-10 sm:py-14 animate-in fade-in duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb & Back Button */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
            <button
              onClick={() => onNavigate('/')}
              className="text-slate-700 hover:text-amber-600 font-semibold cursor-pointer transition-colors"
            >
              Início
            </button>
            <span>/</span>
            <span className="text-amber-600 font-bold">Sobre Nós</span>
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

        {/* Page Header Banner */}
        <div className="relative rounded-3xl bg-slate-900 text-white p-8 sm:p-12 overflow-hidden shadow-xl border border-slate-800 mb-12">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3.5 py-1.5 rounded-full mb-4">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Conheça a ProSegurança</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
              Proteção e Segurança para o seu Trabalho em Moçambique
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6">
              A <strong>ProSegurança</strong> é referência no fornecimento de Equipamentos de Proteção Individual (EPIs) e soluções de segurança ocupacional, atendendo profissionais, construtoras e indústrias em todo o território moçambicano.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={getGeneralWhatsAppChatUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-700/30 transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Falar com a Nossa Equipa</span>
              </a>
              <button
                onClick={onOpenQuoteModal}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                <Building2 className="w-4 h-4" />
                <span>Cotação para Empresas</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mission, Vision, Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* Missão */}
          <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm hover:border-amber-400/60 transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-5">
              <Target className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Nossa Missão</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Proteger a vida e a integridade física dos trabalhadores em Moçambique, fornecendo EPIs de padrão internacional, com durabilidade, conforto e pontualidade na entrega.
            </p>
          </div>

          {/* Visão */}
          <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm hover:border-amber-400/60 transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-5">
              <Eye className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Nossa Visão</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Ser o parceiro de fornecimento de equipamentos de segurança mais confiável e eficiente de Moçambique, reconhecido pela excelência do serviço e compromisso com o cliente.
            </p>
          </div>

          {/* Compromisso com Segurança */}
          <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm hover:border-amber-400/60 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-5">
              <HeartHandshake className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Compromisso com Segurança</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Segurança em primeiro lugar em tudo o que fazemos. Todos os nossos produtos cumprem rigorosamente com as normas EN, ANSI, OSHA e ISO aplicáveis ao mercado moçambicano.
            </p>
          </div>
        </div>

        {/* Company Overview & Presence in Mozambique */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-md mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                <MapPin className="w-3.5 h-3.5" />
                <span>Atendimento & Logística em Moçambique</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Presença Nacional e Suporte Direto
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                Com sede e armazém em <strong>{ADDRESS_DISPLAY}</strong>, operamos com stock real para atender prontamente a pequenas e grandes requisições em todo o país.
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Contamos com logística organizada para entregas rápidas na região do Grande Maputo e Matola, além de despachos rodoviários e aéreos diários para as 11 províncias de Moçambique: Gaza, Inhambane, Sofala, Manica, Tete, Zambézia, Nampula, Cabo Delgado e Niassa.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Stock com Pronta-Entrega</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Cotações Rápidas por WhatsApp</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Faturação com NUIT para Empresas</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Atendimento Personalizado para HST</span>
                </div>
              </div>
            </div>

            {/* Quick Stats Card */}
            <div className="lg:col-span-5">
              <div className="bg-slate-900 rounded-2xl p-7 text-white space-y-6 shadow-xl border border-slate-800">
                <div className="border-b border-slate-800 pb-4">
                  <div className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                    Localização Principal
                  </div>
                  <div className="text-base font-bold text-white mt-1">
                    {ADDRESS_DISPLAY}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700">
                    <div className="text-3xl font-black text-amber-400">100%</div>
                    <div className="text-[11px] text-slate-300 font-semibold mt-1">
                      EPIs Homologados
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700">
                    <div className="text-3xl font-black text-emerald-400">11</div>
                    <div className="text-[11px] text-slate-300 font-semibold mt-1">
                      Províncias Atendidas
                    </div>
                  </div>
                </div>

                <a
                  href="tel:+258846159254"
                  className="p-4 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700 flex items-center gap-3 transition-colors group cursor-pointer"
                  title="Ligar para +258 84 615 9254"
                >
                  <PhoneCall className="w-5 h-5 text-emerald-400 group-hover:text-amber-400 flex-shrink-0 transition-colors" />
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">
                      Linha Direta de Atendimento (Chamadas ou WhatsApp)
                    </div>
                    <div className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                      {WHATSAPP_PHONE_DISPLAY}
                    </div>
                  </div>
                </a>

                <a
                  href={`mailto:${EMAIL_DISPLAY}`}
                  className="p-4 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700 flex items-center gap-3 transition-colors group cursor-pointer"
                  title={`Enviar e-mail para ${EMAIL_DISPLAY}`}
                >
                  <Mail className="w-5 h-5 text-blue-400 group-hover:text-amber-400 flex-shrink-0 transition-colors" />
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">
                      E-mail Institucional & Cotações
                    </div>
                    <div className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                      {EMAIL_DISPLAY}
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Sectors Served Section */}
        <div className="mb-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Setores & Áreas que Atendemos
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Fornecemos pacotes completos de segurança adequados às necessidades regulatórias de cada indústria.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sectors.map((sec, i) => {
              const Icon = sec.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-amber-400/80 transition-all hover:shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center mb-4 shadow-sm">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1.5">{sec.name}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{sec.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 border border-slate-800 shadow-xl">
          <div>
            <h3 className="text-xl font-bold text-white">Pronto para equipar a sua equipa?</h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Explore o catálogo completo de produtos ou fale diretamente com a nossa equipa técnica.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => onNavigate('/')}
              className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs sm:text-sm cursor-pointer shadow-md transition-all"
            >
              Ver Catálogo de Produtos
            </button>
            <button
              onClick={() => onNavigate('/contactos')}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm border border-slate-700 cursor-pointer transition-all"
            >
              Página de Contactos
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
