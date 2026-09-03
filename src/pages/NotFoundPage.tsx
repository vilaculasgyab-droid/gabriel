import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Home, 
  Search, 
  ArrowRight, 
  HardHat, 
  HandMetal, 
  Footprints, 
  ShieldAlert, 
  HelpCircle,
  Phone
} from 'lucide-react';
import { useSEO } from '../hooks/useSEO';
import { CATEGORIES } from '../data/categories';
import { WHATSAPP_PHONE_DISPLAY, getGeneralWhatsAppChatUrl } from '../utils/whatsapp';

interface NotFoundPageProps {
  onNavigate: (path: string) => void;
  onSearch?: (query: string) => void;
  onSelectCategory?: (categoryId: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  onNavigate,
  onSearch,
  onSelectCategory,
}) => {
  const [searchInput, setSearchInput] = useState('');

  // SEO: 404 must strictly have noindex, nofollow
  useSEO({
    title: 'Página Não Encontrada (404) | ProSegurança',
    description: 'A página solicitada não foi encontrada ou foi movida. Explore o catálogo oficial de EPIs e equipamentos de segurança da ProSegurança.',
    canonicalPath: '/404',
    noindex: true,
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      if (onSearch) {
        onSearch(searchInput.trim());
      }
      onNavigate('/produtos');
    } else {
      onNavigate('/produtos');
    }
  };

  const handleCategoryClick = (catId: string) => {
    if (onSelectCategory) {
      onSelectCategory(catId);
    }
    onNavigate(`/categoria/${catId}`);
  };

  const popularCategories = CATEGORIES.slice(0, 4);

  return (
    <div className="min-h-[75vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-3xl mx-auto w-full text-center">
        {/* Badge & Icon */}
        <div className="inline-flex items-center justify-center p-3 bg-amber-100 text-amber-800 rounded-2xl mb-6 shadow-sm ring-8 ring-amber-50">
          <AlertTriangle className="w-10 h-10 text-amber-600 animate-pulse" />
        </div>

        <span className="block text-xs font-bold uppercase tracking-wider text-amber-600 mb-2">
          Erro 404 — Conteúdo Não Encontrado
        </span>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
          Página não encontrada
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto mb-8 leading-relaxed">
          O endereço que procurou não existe, foi movido ou está temporariamente indisponível. 
          Use a pesquisa abaixo ou navegue pelo nosso catálogo de EPIs para encontrar o equipamento de segurança ideal.
        </p>

        {/* Search Bar */}
        <div className="max-w-lg mx-auto mb-10">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center shadow-sm">
            <Search className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Pesquisar capacetes, luvas, botas, óculos..."
              className="w-full pl-12 pr-28 py-3.5 bg-white border border-slate-300 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm font-medium transition-shadow"
            />
            <button
              type="submit"
              className="absolute right-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-semibold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-sm"
            >
              Pesquisar
            </button>
          </form>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          <button
            onClick={() => onNavigate('/')}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-sm transition-all hover:scale-105"
          >
            <Home className="w-4 h-4 text-amber-400" />
            Voltar à Página Inicial
          </button>
          <button
            onClick={() => onNavigate('/produtos')}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-sm font-semibold shadow-sm transition-all hover:scale-105"
          >
            Ver Todos os Produtos
            <ArrowRight className="w-4 h-4 text-slate-500" />
          </button>
          <a
            href={getGeneralWhatsAppChatUrl('Olá, ProSegurança! Encontrei um link indisponível e gostaria de pedir informações sobre produtos.')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-all hover:scale-105"
          >
            <Phone className="w-4 h-4" />
            WhatsApp ({WHATSAPP_PHONE_DISPLAY})
          </a>
          <a
            href="tel:+258846159254"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold shadow-sm transition-all hover:scale-105"
            title="Ligar para +258 84 615 9254"
          >
            <Phone className="w-4 h-4 text-amber-400" />
            Ligar Agora
          </a>
        </div>

        {/* Popular Categories */}
        <div className="border-t border-slate-200 pt-8 text-left">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 text-center">
            Categorias em Destaque
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {popularCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                  {cat.id === 'cabeca' ? (
                    <HardHat className="w-5 h-5" />
                  ) : cat.id === 'maos' ? (
                    <HandMetal className="w-5 h-5" />
                  ) : cat.id === 'pes' ? (
                    <Footprints className="w-5 h-5" />
                  ) : (
                    <ShieldAlert className="w-5 h-5" />
                  )}
                </div>
                <div className="overflow-hidden">
                  <span className="block text-xs font-semibold text-slate-900 group-hover:text-amber-700 truncate">
                    {cat.name}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {cat.productCount} itens
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Support Help note */}
        <div className="mt-8 text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span>
            Linha de Apoio ao Cliente ProSegurança:{' '}
            <a href="tel:+258846159254" className="font-bold text-slate-700 hover:text-amber-600 underline transition-colors">
              {WHATSAPP_PHONE_DISPLAY}
            </a>
          </span>
        </div>
      </div>
    </div>
  );
};
