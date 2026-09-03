import React from 'react';
import { ProSegurancaLogo } from './CategoryIcon';
import { CATEGORIES } from '../data/categories';
import { 
  Phone, 
  Mail, 
  MapPin, 
  MessageSquare, 
  ShieldCheck, 
  Heart, 
  ArrowUp,
  CreditCard,
  Building2
} from 'lucide-react';
import { 
  WHATSAPP_PHONE_DISPLAY, 
  EMAIL_DISPLAY, 
  ADDRESS_DISPLAY, 
  getGeneralWhatsAppChatUrl 
} from '../utils/whatsapp';

interface FooterProps {
  onSelectCategory: (categoryId: string) => void;
  onOpenQuoteModal: () => void;
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectCategory, onOpenQuoteModal, onNavigate }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryClick = (categoryId: string) => {
    onSelectCategory(categoryId);
    onNavigate(`/categoria/${categoryId}`);
    setTimeout(() => {
      const elem = document.getElementById('catalogo-produtos');
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleLinkClick = (path: string, scrollToCatalog = false) => {
    onNavigate(path);
    if (scrollToCatalog) {
      setTimeout(() => {
        const elem = document.getElementById('catalogo-produtos');
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  return (
    <footer id="contactos-footer" className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1: Brand & Bio (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/');
              }}
              className="cursor-pointer inline-block"
            >
              <ProSegurancaLogo inverted={true} />
            </a>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-amber-400 font-semibold italic">
              “Proteção e Segurança para o seu Trabalho”
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Loja e distribuidora especializada no fornecimento de Equipamentos de Proteção Individual (EPIs) e segurança industrial em Moçambique. Atendimento a trabalhadores, empresas, construção civil e indústrias.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <a
                href={getGeneralWhatsAppChatUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all"
                title="Conversar pelo WhatsApp"
              >
                <MessageSquare className="w-4 h-4 fill-white/20" />
                <span>WhatsApp: {WHATSAPP_PHONE_DISPLAY}</span>
              </a>

              <a
                href="tel:+258846159254"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white hover:text-amber-400 font-bold text-xs border border-slate-700 transition-all"
                title="Ligar para +258 84 615 9254"
              >
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>Ligar Agora</span>
              </a>

              <a
                href={`mailto:${EMAIL_DISPLAY}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white hover:text-amber-400 font-bold text-xs border border-slate-700 transition-all"
                title={`Enviar e-mail para ${EMAIL_DISPLAY}`}
              >
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>E-mail</span>
              </a>

              <button
                onClick={onOpenQuoteModal}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-amber-400 font-bold text-xs border border-slate-700/80 transition-all cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Cotações B2B</span>
              </button>
            </div>
          </div>

          {/* Col 2: Quick Links (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">
              Navegação
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="/"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick('/');
                  }}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer block"
                >
                  Página Inicial
                </a>
              </li>
              <li>
                <a
                  href="/produtos"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick('/produtos', true);
                  }}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer block"
                >
                  Catálogo de Produtos
                </a>
              </li>
              <li>
                <a
                  href="/produtos"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick('/produtos', true);
                  }}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer block"
                >
                  Categorias de EPIs
                </a>
              </li>
              <li>
                <a
                  href="/sobre-nos"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick('/sobre-nos');
                  }}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer block"
                >
                  Sobre Nós
                </a>
              </li>
              <li>
                <a
                  href="/vantagens"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick('/vantagens');
                  }}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer block"
                >
                  Vantagens
                </a>
              </li>
              <li>
                <a
                  href="/contactos"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick('/contactos');
                  }}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer block"
                >
                  Contactos & Localização
                </a>
              </li>
              <li className="pt-1.5 border-t border-slate-900">
                <a
                  href="/admin"
                  rel="nofollow"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick('/admin');
                  }}
                  className="text-slate-500 hover:text-amber-400 text-[11px] transition-colors text-left flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-3 h-3 text-amber-500/70" />
                  <span>Área Administrativa</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Categories Links (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">
              Categorias de EPI
            </h4>
            <ul className="grid grid-cols-1 gap-1.5 text-xs">
              {CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <a
                    href={`/categoria/${cat.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleCategoryClick(cat.id);
                    }}
                    className="hover:text-amber-400 transition-colors text-left flex items-center justify-between w-full group cursor-pointer"
                  >
                    <span className="truncate group-hover:translate-x-0.5 transition-transform">
                      {cat.name}
                    </span>
                    <span className="text-[10px] text-slate-600 font-mono">
                      {cat.productCount}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contacts & Payment Methods (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">
              Contactos & Pagamentos
            </h4>

            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <a
                    href="tel:+258846159254"
                    className="text-white font-bold hover:text-amber-400 transition-colors block"
                    title="Ligar para +258 84 615 9254"
                  >
                    {WHATSAPP_PHONE_DISPLAY}
                  </a>
                  <div className="text-[11px] text-slate-400">Linha de Apoio e Pedidos (Chamadas ou WhatsApp)</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <a 
                  href={`mailto:${EMAIL_DISPLAY}`}
                  className="text-slate-300 hover:text-amber-400 font-medium transition-colors"
                  title={`Enviar e-mail para ${EMAIL_DISPLAY}`}
                >
                  {EMAIL_DISPLAY}
                </a>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="text-slate-300">{ADDRESS_DISPLAY}</div>
              </div>
            </div>

            {/* Payment badges */}
            <div className="pt-3 border-t border-slate-800">
              <div className="text-[11px] font-bold text-slate-400 mb-2">
                Métodos de Pagamento em Moçambique:
              </div>
              <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
                <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-red-400">
                  M-Pesa
                </span>
                <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-orange-400">
                  E-Mola
                </span>
                <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-blue-400">
                  BIM / BCI / Standard Bank
                </span>
                <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-emerald-400">
                  POS na Entrega
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} <strong>PROSEGURANÇA</strong>. Todos os direitos reservados.
            <span className="hidden sm:inline"> | Moçambique</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[11px] text-slate-400">
              Segurança + Confiança + Profissionalismo
            </span>
            <button
              onClick={scrollToTop}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
              aria-label="Voltar ao topo"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
