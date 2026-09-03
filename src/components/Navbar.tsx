import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Phone, 
  MessageSquare, 
  Menu, 
  X, 
  Building2, 
  ShieldCheck, 
  ChevronDown,
  Sparkles,
  ExternalLink,
  Mail
} from 'lucide-react';
import { ProSegurancaLogo } from './CategoryIcon';
import { PWAInstallButton } from './PWAInstallButton';
import { CATEGORIES } from '../data/categories';
import { 
  WHATSAPP_PHONE_DISPLAY, 
  WHATSAPP_PHONE_RAW, 
  EMAIL_DISPLAY,
  formatCurrency, 
  getGeneralWhatsAppChatUrl 
} from '../utils/whatsapp';

interface NavbarProps {
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  onOpenQuoteModal: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectCategory: (categoryId: string) => void;
  selectedCategory: string;
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  cartTotal,
  onOpenCart,
  onOpenQuoteModal,
  searchQuery,
  onSearchChange,
  onSelectCategory,
  selectedCategory,
  currentPath,
  onNavigate,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (path: string, scrollToCatalog = false) => {
    setMobileMenuOpen(false);
    setCategoriesDropdownOpen(false);
    onNavigate(path);
    if (scrollToCatalog) {
      setTimeout(() => {
        const el = document.getElementById('catalogo-produtos');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    onSelectCategory(categoryId);
    setCategoriesDropdownOpen(false);
    setMobileMenuOpen(false);
    if (categoryId === 'all') {
      onNavigate('/produtos');
    } else {
      onNavigate(`/categoria/${categoryId}`);
    }
    setTimeout(() => {
      const catalogElement = document.getElementById('catalogo-produtos');
      if (catalogElement) {
        catalogElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300">
      {/* Top Banner / Informational strip */}
      <div className="bg-slate-950 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          {/* Trust badges */}
          <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start">
            <span className="flex items-center gap-1.5 text-amber-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              EPIs Certificados (EN / OSHA)
            </span>
            <span className="hidden md:inline-block text-slate-600">•</span>
            <span className="hidden md:inline-flex items-center gap-1 text-slate-300">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              Fornecimento para Empresas, Obras e Indústrias
            </span>
            <span className="hidden lg:inline-block text-slate-600">•</span>
            <span className="hidden lg:inline text-slate-300">
              Entregas em Maputo, Matola e Províncias de Moçambique
            </span>
          </div>

          {/* Quick Contacts */}
          <div className="flex items-center gap-4">
            <a
              href="tel:+258846159254"
              className="hidden md:flex items-center gap-1.5 text-slate-300 hover:text-amber-400 font-semibold transition-colors text-xs"
              title="Ligar para +258 84 615 9254"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>Ligar: {WHATSAPP_PHONE_DISPLAY}</span>
            </a>
            <a
              href={`mailto:${EMAIL_DISPLAY}`}
              className="hidden xl:flex items-center gap-1.5 text-slate-300 hover:text-amber-400 font-semibold transition-colors text-xs"
              title={`Enviar e-mail para ${EMAIL_DISPLAY}`}
            >
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>E-mail: {EMAIL_DISPLAY}</span>
            </a>
            <a
              href={`https://wa.me/${WHATSAPP_PHONE_RAW}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              WhatsApp: {WHATSAPP_PHONE_DISPLAY}
            </a>
            <button
              onClick={onOpenQuoteModal}
              className="hidden sm:inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 font-medium underline underline-offset-2 transition-colors cursor-pointer"
            >
              Pedir Cotação Formal
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav
        className={`w-full transition-all duration-200 ${
          isScrolled
            ? 'bg-slate-900/95 backdrop-blur-md shadow-lg border-b border-slate-800 py-3'
            : 'bg-slate-900 border-b border-slate-800 py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick('/');
              }}
              className="cursor-pointer flex-shrink-0"
              id="nav-logo"
            >
              <ProSegurancaLogo inverted={true} />
            </a>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-semibold text-slate-200">
              <a
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick('/');
                }}
                className={`px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                  currentPath === '/'
                    ? 'bg-amber-400/15 text-amber-400 font-bold'
                    : 'hover:text-amber-400 hover:bg-slate-800/60 text-slate-200'
                }`}
                id="nav-link-inicio"
              >
                Início
              </a>

              <a
                href="/produtos"
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick('/produtos', true);
                }}
                className={`px-3 py-2 rounded-lg transition-colors cursor-pointer text-slate-200 ${
                  currentPath === '/produtos'
                    ? 'bg-amber-400/15 text-amber-400 font-bold'
                    : 'hover:text-amber-400 hover:bg-slate-800/60'
                }`}
                id="nav-link-produtos"
              >
                Produtos
              </a>

              {/* Categorias Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
                  onBlur={() => setTimeout(() => setCategoriesDropdownOpen(false), 200)}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg hover:text-amber-400 hover:bg-slate-800/60 transition-colors cursor-pointer text-slate-200"
                  id="nav-link-categorias"
                >
                  <span>Categorias</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      categoriesDropdownOpen ? 'rotate-180 text-amber-400' : ''
                    }`}
                  />
                </button>

                {categoriesDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider px-3 py-1.5 border-b border-slate-800">
                      Categorias de EPIs
                    </div>
                    <div className="max-h-80 overflow-y-auto py-1 space-y-0.5">
                      <a
                        href="/produtos"
                        onClick={(e) => {
                          e.preventDefault();
                          handleCategoryClick('all');
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between hover:bg-slate-800 transition-colors cursor-pointer ${
                          selectedCategory === 'all'
                            ? 'bg-amber-400/10 text-amber-400 font-bold'
                            : 'text-slate-300'
                        }`}
                      >
                        <span>Todos os Produtos</span>
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                          Ver Tudo
                        </span>
                      </a>
                      {CATEGORIES.map((cat) => (
                        <a
                          key={cat.id}
                          href={`/categoria/${cat.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            handleCategoryClick(cat.id);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between hover:bg-slate-800 transition-colors cursor-pointer ${
                            selectedCategory === cat.id
                              ? 'bg-amber-400/10 text-amber-400 font-bold'
                              : 'text-slate-300'
                          }`}
                        >
                          <span className="truncate">{cat.name}</span>
                          <span className="text-[10px] text-slate-500">{cat.productCount}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <a
                href="/sobre-nos"
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick('/sobre-nos');
                }}
                className={`px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                  currentPath === '/sobre-nos'
                    ? 'bg-amber-400/15 text-amber-400 font-bold'
                    : 'hover:text-amber-400 hover:bg-slate-800/60 text-slate-200'
                }`}
                id="nav-link-sobre"
              >
                Sobre Nós
              </a>

              <a
                href="/vantagens"
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick('/vantagens');
                }}
                className={`px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                  currentPath === '/vantagens'
                    ? 'bg-amber-400/15 text-amber-400 font-bold'
                    : 'hover:text-amber-400 hover:bg-slate-800/60 text-slate-200'
                }`}
                id="nav-link-vantagens"
              >
                Vantagens
              </a>

              <a
                href="/contactos"
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick('/contactos');
                }}
                className={`px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                  currentPath === '/contactos'
                    ? 'bg-amber-400/15 text-amber-400 font-bold'
                    : 'hover:text-amber-400 hover:bg-slate-800/60 text-slate-200'
                }`}
                id="nav-link-contactos"
              >
                Contactos
              </a>
            </div>

            {/* Search Input */}
            <div className="hidden md:flex items-center flex-1 max-w-xs xl:max-w-sm relative">
              <div
                className={`relative w-full rounded-xl transition-all duration-200 ${
                  searchFocused
                    ? 'ring-2 ring-amber-400 shadow-md shadow-amber-400/10'
                    : 'border border-slate-700'
                }`}
              >
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Pesquisar capacetes, luvas, botas..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="w-full bg-slate-800/90 text-slate-100 text-xs sm:text-sm pl-10 pr-8 py-2 rounded-xl placeholder:text-slate-400 focus:outline-none"
                  id="navbar-search-input"
                />
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Action Buttons: Cart & WhatsApp CTA */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Cart Button */}
              <button
                onClick={onOpenCart}
                className="relative flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-100 px-3.5 py-2 rounded-xl border border-slate-700 hover:border-amber-400/50 transition-all shadow-sm cursor-pointer group"
                id="navbar-cart-button"
                aria-label="Abrir Carrinho de Compras"
              >
                <div className="relative">
                  <ShoppingCart className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2.5 -right-2.5 flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-amber-500 text-slate-950 font-extrabold text-[11px] ring-2 ring-slate-900 animate-pulse">
                      {cartCount}
                    </span>
                  )}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold leading-none">
                    Carrinho
                  </span>
                  <span className="text-xs font-bold text-slate-100 leading-tight">
                    {cartTotal > 0 ? formatCurrency(cartTotal) : '0 MT'}
                  </span>
                </div>
              </button>

              {/* PWA Install Button (desktop) */}
              <PWAInstallButton variant="navbar" />

              {/* Direct WhatsApp CTA Button */}
              <a
                href={getGeneralWhatsAppChatUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-md shadow-emerald-700/30 transition-all hover:shadow-emerald-600/40 cursor-pointer"
                id="navbar-whatsapp-button"
              >
                <MessageSquare className="w-4 h-4 fill-white/20" />
                <span>WhatsApp</span>
              </a>

              {/* Quote CTA Button */}
              <button
                onClick={onOpenQuoteModal}
                className="hidden xl:inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                id="navbar-quote-button"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Cotação para Obras</span>
              </button>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
                id="mobile-menu-toggle"
                aria-label="Abrir Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Search input */}
          <div className="mt-3 md:hidden">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Pesquisar capacetes, luvas, botas..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-slate-800 text-slate-100 text-xs pl-10 pr-8 py-2.5 rounded-xl border border-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-amber-400"
                id="mobile-search-input"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-slate-950 border-t border-slate-800 px-4 pt-3 pb-6 space-y-3 mt-3 animate-in slide-in-from-top-4 duration-200">
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-300">
              <a
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick('/');
                }}
                className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                  currentPath === '/'
                    ? 'bg-amber-400 text-slate-950 font-bold border-amber-400'
                    : 'bg-slate-900 border-slate-800 text-slate-200 hover:text-amber-400'
                }`}
                id="mobile-nav-inicio"
              >
                Início
              </a>
              <a
                href="/produtos"
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick('/produtos', true);
                }}
                className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                  currentPath === '/produtos'
                    ? 'bg-amber-400 text-slate-950 font-bold border-amber-400'
                    : 'bg-slate-900 border-slate-800 text-slate-200 hover:text-amber-400'
                }`}
                id="mobile-nav-produtos"
              >
                Ver Produtos
              </a>
              <a
                href="/sobre-nos"
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick('/sobre-nos');
                }}
                className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                  currentPath === '/sobre-nos'
                    ? 'bg-amber-400 text-slate-950 font-bold border-amber-400'
                    : 'bg-slate-900 border-slate-800 text-slate-200 hover:text-amber-400'
                }`}
                id="mobile-nav-sobre"
              >
                Sobre a ProSegurança
              </a>
              <a
                href="/vantagens"
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick('/vantagens');
                }}
                className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                  currentPath === '/vantagens'
                    ? 'bg-amber-400 text-slate-950 font-bold border-amber-400'
                    : 'bg-slate-900 border-slate-800 text-slate-200 hover:text-amber-400'
                }`}
                id="mobile-nav-vantagens"
              >
                Vantagens
              </a>
              <a
                href="/contactos"
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick('/contactos');
                }}
                className={`p-2.5 rounded-lg border text-left transition-colors col-span-2 cursor-pointer ${
                  currentPath === '/contactos'
                    ? 'bg-amber-400 text-slate-950 font-bold border-amber-400'
                    : 'bg-slate-900 border-slate-800 text-slate-200 hover:text-amber-400'
                }`}
                id="mobile-nav-contactos"
              >
                Contactos & Localização
              </a>
            </div>

            {/* Mobile Categories Accordion */}
            <div className="border-t border-slate-800 pt-3">
              <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-2">
                Filtrar por Categoria:
              </div>
              <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                <a
                  href="/produtos"
                  onClick={(e) => {
                    e.preventDefault();
                    handleCategoryClick('all');
                  }}
                  className={`p-2 rounded-lg text-left text-xs ${
                    selectedCategory === 'all'
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'bg-slate-900 text-slate-300'
                  }`}
                >
                  Todos os Produtos
                </a>
                {CATEGORIES.map((cat) => (
                  <a
                    key={cat.id}
                    href={`/categoria/${cat.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleCategoryClick(cat.id);
                    }}
                    className={`p-2 rounded-lg text-left text-xs truncate ${
                      selectedCategory === cat.id
                        ? 'bg-amber-400 text-slate-950 font-bold'
                        : 'bg-slate-900 text-slate-300'
                    }`}
                  >
                    {cat.name}
                  </a>
                ))}
              </div>
            </div>

            {/* Mobile CTA buttons */}
            <div className="pt-2 flex flex-col gap-2">
              <PWAInstallButton variant="mobile" />

              <a
                href="tel:+258846159254"
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors"
                id="mobile-nav-call-btn"
              >
                <Phone className="w-4 h-4 text-amber-400" />
                <span>Ligar Agora ({WHATSAPP_PHONE_DISPLAY})</span>
              </a>

              <a
                href={`mailto:${EMAIL_DISPLAY}`}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors"
                id="mobile-nav-email-btn"
              >
                <Mail className="w-4 h-4 text-amber-400" />
                <span>E-mail: {EMAIL_DISPLAY}</span>
              </a>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenQuoteModal();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2"
              >
                <Building2 className="w-4 h-4" />
                Solicitar Cotação para Empresa
              </button>

              <a
                href={getGeneralWhatsAppChatUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Falar pelo WhatsApp ({WHATSAPP_PHONE_DISPLAY})
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
