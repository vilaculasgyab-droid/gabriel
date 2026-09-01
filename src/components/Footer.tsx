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
    onNavigate('/');
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
            <div onClick={() => onNavigate('/')} className="cursor-pointer inline-block">
              <ProSegurancaLogo inverted={true} />
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-amber-400 font-semibold italic">
              “Proteção e Segurança para o seu Trabalho”
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Loja e distribuidora especializada no fornecimento de Equipamentos de Proteção Individual (EPIs) e segurança industrial em Moçambique. Atendimento a trabalhadores, empresas, construção civil e indústrias.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <a
                href={getGeneralWhatsAppChatUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all"
              >
                <MessageSquare className="w-4 h-4 fill-white/20" />
                <span>{WHATSAPP_PHONE_DISPLAY}</span>
              </a>

              <button
                onClick={onOpenQuoteModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs border border-slate-700 transition-all cursor-pointer"
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
                <button
                  onClick={() => handleLinkClick('/')}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                >
                  Página Inicial
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('/', true)}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                >
                  Catálogo de Produtos
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('/', true)}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                >
                  Categorias de EPIs
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('/sobre-nos')}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                >
                  Sobre Nós
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('/vantagens')}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                >
                  Vantagens
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('/contactos')}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                >
                  Contactos & Localização
                </button>
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
                  <button
                    onClick={() => handleCategoryClick(cat.id)}
                    className="hover:text-amber-400 transition-colors text-left flex items-center justify-between w-full group cursor-pointer"
                  >
                    <span className="truncate group-hover:translate-x-0.5 transition-transform">
                      {cat.name}
                    </span>
                    <span className="text-[10px] text-slate-600 font-mono">
                      {cat.productCount}
                    </span>
                  </button>
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
                  <div className="text-white font-bold">{WHATSAPP_PHONE_DISPLAY}</div>
                  <div className="text-[11px]">Linha de Apoio e Pedidos</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-slate-300">{EMAIL_DISPLAY}</div>
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
