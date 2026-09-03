import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Product } from '../types';
import { CATEGORIES } from '../data/categories';
import { 
  Search, 
  ShoppingCart, 
  Eye, 
  Check, 
  Plus, 
  Minus, 
  ShieldCheck, 
  ArrowUpDown,
  X,
  PackageCheck,
  Heart,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  LayoutGrid,
  SlidersHorizontal
} from 'lucide-react';
import { formatCurrency, getProductWhatsAppInquiryUrl } from '../utils/whatsapp';

interface ProductCatalogProps {
  products: Product[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddToCart: (product: Product, quantity: number, selectedSize?: string, selectedColor?: string) => void;
  onViewProductDetails: (product: Product) => void;
}

type SortOption = 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'rating-desc' | 'name-asc';
type AvailabilityFilter = 'all' | 'in-stock' | 'out-of-stock';
type PriceRangeFilter = 'all' | 'under-500' | '500-1500' | '1500-3000' | 'above-3000';

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onAddToCart,
  onViewProductDetails,
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [availability, setAvailability] = useState<AvailabilityFilter>('all');
  const [priceRange, setPriceRange] = useState<PriceRangeFilter>('all');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [addedItemSuccess, setAddedItemSuccess] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>('carousel');

  // Favorites state persisted in localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('proseguranca_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleFavorite = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];
      try {
        localStorage.setItem('proseguranca_favorites', JSON.stringify(next));
      } catch (err) {
        console.error(err);
      }
      return next;
    });
  };

  // Carousel navigation
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    const el = carouselRef.current;
    if (el) {
      checkScroll();
      el.addEventListener('scroll', checkScroll, { passive: true });
      window.addEventListener('resize', checkScroll);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [products, selectedCategory]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.clientWidth * 0.75;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScroll, 350);
    }
  };

  // Handle quantity adjustment
  const handleQuantityChange = (productId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[productId] || 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [productId]: next };
    });
  };

  const getQuantity = (productId: string) => {
    return quantities[productId] || 1;
  };

  const handleAddWithFeedback = (product: Product) => {
    if (!product.inStock) return;
    const qty = getQuantity(product.id);
    onAddToCart(
      product,
      qty,
      product.availableSizes ? product.availableSizes[0] : undefined,
      product.availableColors ? product.availableColors[0] : undefined
    );
    setAddedItemSuccess(product.id);
    setTimeout(() => {
      setAddedItemSuccess((prev) => (prev === product.id ? null : prev));
    }, 1800);
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // Category filter
        if (selectedCategory !== 'all' && product.categoryId !== selectedCategory) {
          return false;
        }

        // Availability filter
        if (availability === 'in-stock' && !product.inStock) {
          return false;
        }
        if (availability === 'out-of-stock' && product.inStock) {
          return false;
        }

        // Price range filter
        if (priceRange === 'under-500' && product.price >= 500) {
          return false;
        }
        if (priceRange === '500-1500' && (product.price < 500 || product.price > 1500)) {
          return false;
        }
        if (priceRange === '1500-3000' && (product.price < 1500 || product.price > 3000)) {
          return false;
        }
        if (priceRange === 'above-3000' && product.price <= 3000) {
          return false;
        }

        // Search query filter
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchesName = product.name.toLowerCase().includes(query);
          const matchesDesc = product.shortDescription.toLowerCase().includes(query);
          const matchesSub = product.subcategory.toLowerCase().includes(query);
          const matchesNorm = product.norm?.toLowerCase().includes(query);
          return matchesName || matchesDesc || matchesSub || matchesNorm;
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'price-asc':
            return a.price - b.price;
          case 'price-desc':
            return b.price - a.price;
          case 'name-asc':
            return a.name.localeCompare(b.name);
          case 'rating-desc':
            return b.rating - a.rating;
          case 'newest':
            return b.id.localeCompare(a.id);
          case 'featured':
          default:
            return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        }
      });
  }, [products, selectedCategory, availability, priceRange, searchQuery, sortBy]);

  const activeCategoryObject = CATEGORIES.find((c) => c.id === selectedCategory);

  return (
    <section id="catalogo-produtos" className="py-12 sm:py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header: PRODUTOS EM DESTAQUE */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-100 px-3 py-1 rounded-full mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Vitrine Principal de EPIs</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight uppercase">
                {selectedCategory === 'all' 
                  ? 'PRODUTOS EM DESTAQUE' 
                  : `PRODUTOS EM DESTAQUE: ${activeCategoryObject?.name}`}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
                {activeCategoryObject
                  ? activeCategoryObject.description
                  : 'Equipamentos de Proteção Individual certificados para obras, mineração e indústria em Moçambique.'}
              </p>
            </div>

            {/* Navigation controls (← →) and view toggler */}
            <div className="flex items-center gap-3 self-end md:self-auto">
              <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm text-xs font-semibold text-slate-700">
                <span className="px-2.5 py-1 text-slate-500 font-medium hidden sm:inline">
                  {filteredProducts.length} itens
                </span>
                
                {/* Carousel vs Grid toggle */}
                <div className="flex items-center border-l border-slate-200 pl-1">
                  <button
                    onClick={() => setViewMode('carousel')}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewMode === 'carousel'
                        ? 'bg-slate-900 text-amber-400'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                    title="Visualização em Linha Horizontal"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewMode === 'grid'
                        ? 'bg-slate-900 text-amber-400'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                    title="Visualização em Grade"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Navigation Arrows ← → for Carousel */}
              {viewMode === 'carousel' && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleScroll('left')}
                    disabled={!canScrollLeft}
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                      canScrollLeft
                        ? 'bg-white border-slate-300 text-slate-900 hover:bg-amber-500 hover:text-slate-950 hover:border-amber-500 shadow-sm'
                        : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-50'
                    }`}
                    title="Produtos Anteriores"
                    aria-label="Rolar para a esquerda"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleScroll('right')}
                    disabled={!canScrollRight}
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                      canScrollRight
                        ? 'bg-white border-slate-300 text-slate-900 hover:bg-amber-500 hover:text-slate-950 hover:border-amber-500 shadow-sm'
                        : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-50'
                    }`}
                    title="Próximos Produtos"
                    aria-label="Rolar para a direita"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Category Pills Bar (Horizontal scrollable) */}
        <div className="mb-5 overflow-x-auto pb-2 scrollbar-thin">
          <div className="flex items-center gap-2 min-w-max">
            <a
              href="/produtos"
              onClick={(e) => {
                e.preventDefault();
                onSelectCategory('all');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-amber-400 shadow-md shadow-slate-900/20'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-amber-400 hover:text-slate-950'
              }`}
              id="filter-cat-all"
            >
              Todos ({products.length})
            </a>

            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const count = products.filter((p) => p.categoryId === cat.id).length;

              return (
                <a
                  key={cat.id}
                  href={`/categoria/${cat.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectCategory(cat.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-amber-400 hover:text-slate-950'
                  }`}
                  id={`filter-cat-${cat.id}`}
                >
                  <span>{cat.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-slate-950 text-amber-400' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                </a>
              );
            })}
          </div>
        </div>

        {/* Toolbar: Search input, Availability filter, Price filter & Sorting */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm mb-6 space-y-2.5">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search box inside toolbar */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Pesquisar em produtos em destaque por nome, tipo de EPI, norma..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 text-xs sm:text-sm pl-10 pr-8 py-2 rounded-xl border border-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
                id="catalog-search-input"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                  title="Limpar pesquisa"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Select */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
              <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Ordenar:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                id="catalog-sort-select"
              >
                <option value="featured">Mais Vendidos / Destaques</option>
                <option value="newest">Mais Recentes</option>
                <option value="price-asc">Menor Preço</option>
                <option value="price-desc">Maior Preço</option>
                <option value="rating-desc">Melhor Avaliados</option>
                <option value="name-asc">Nome (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Sub-filters row: Price Range & Availability */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              {/* Availability Filter */}
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-600">Disponibilidade:</span>
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value as AvailabilityFilter)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500 cursor-pointer"
                  id="filter-availability"
                >
                  <option value="all">Todos os Estados</option>
                  <option value="in-stock">Apenas Disponíveis</option>
                  <option value="out-of-stock">Apenas Esgotados</option>
                </select>
              </div>

              {/* Price Range Filter */}
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-600">Preço:</span>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value as PriceRangeFilter)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500 cursor-pointer"
                  id="filter-price-range"
                >
                  <option value="all">Todas as Faixas</option>
                  <option value="under-500">Até 500 MZN</option>
                  <option value="500-1500">500 a 1.500 MZN</option>
                  <option value="1500-3000">1.500 a 3.000 MZN</option>
                  <option value="above-3000">Mais de 3.000 MZN</option>
                </select>
              </div>
            </div>

            {/* Clear all active filters if any active */}
            {(selectedCategory !== 'all' || availability !== 'all' || priceRange !== 'all' || searchQuery.trim() !== '') && (
              <button
                onClick={() => {
                  onSelectCategory('all');
                  setAvailability('all');
                  setPriceRange('all');
                  onSearchChange('');
                }}
                className="text-amber-600 hover:text-amber-800 font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Limpar Filtros</span>
              </button>
            )}
          </div>
        </div>

        {/* Empty state when no products match */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 max-w-md mx-auto">
            <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Nenhum EPI encontrado</h3>
            <p className="text-xs sm:text-sm text-slate-500 mb-6">
              Não encontramos nenhum produto em destaque que coincida com a sua pesquisa ou filtros aplicados.
            </p>
            <button
              onClick={() => {
                onSearchChange('');
                onSelectCategory('all');
                setAvailability('all');
                setPriceRange('all');
              }}
              className="inline-flex items-center gap-2 bg-slate-900 text-amber-400 text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Limpar Filtros e Pesquisa</span>
            </button>
          </div>
        )}

        {/* ============================================================ */}
        {/* PRODUCTS CAROUSEL / HORIZONTAL ROW (5-6 PER ROW ON DESKTOP)  */}
        {/* ============================================================ */}
        {filteredProducts.length > 0 && (
          <div className="relative">
            {/* Left Carousel Navigation Arrow (Floating) */}
            {viewMode === 'carousel' && (
              <button
                onClick={() => handleScroll('left')}
                disabled={!canScrollLeft}
                className={`absolute -left-3.5 sm:-left-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full border flex items-center justify-center transition-all cursor-pointer shadow-lg ${
                  canScrollLeft
                    ? 'bg-white border-slate-200 text-slate-800 hover:bg-amber-500 hover:text-slate-950 hover:border-amber-500 hover:scale-105 active:scale-95'
                    : 'bg-slate-100/80 border-slate-200 text-slate-300 cursor-not-allowed opacity-40'
                }`}
                aria-label="Produtos anteriores"
                title="Rolar para a esquerda"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            )}

            {/* Right Carousel Navigation Arrow (Floating) */}
            {viewMode === 'carousel' && (
              <button
                onClick={() => handleScroll('right')}
                disabled={!canScrollRight}
                className={`absolute -right-3.5 sm:-right-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full border flex items-center justify-center transition-all cursor-pointer shadow-lg ${
                  canScrollRight
                    ? 'bg-white border-slate-200 text-slate-800 hover:bg-amber-500 hover:text-slate-950 hover:border-amber-500 hover:scale-105 active:scale-95'
                    : 'bg-slate-100/80 border-slate-200 text-slate-300 cursor-not-allowed opacity-40'
                }`}
                aria-label="Próximos produtos"
                title="Rolar para a direita"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            )}

            {/* Product Cards Container */}
            <div
              ref={carouselRef}
              className={
                viewMode === 'carousel'
                  ? 'flex gap-3 sm:gap-3.5 overflow-x-auto pb-4 pt-1 px-1 scroll-smooth snap-x snap-mandatory scrollbar-thin'
                  : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-3.5 pt-1'
              }
            >
              {filteredProducts.map((product) => {
                const qty = getQuantity(product.id);
                const isJustAdded = addedItemSuccess === product.id;
                const isAvailable = product.inStock;
                const isFav = favorites.includes(product.id);

                return (
                  <div
                    key={product.id}
                    className={`group relative rounded-xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden snap-start ${
                      viewMode === 'carousel'
                        ? 'w-[165px] min-w-[165px] sm:w-[185px] sm:min-w-[185px] md:w-[195px] md:min-w-[195px] lg:w-[calc((100%-4*14px)/5)] lg:min-w-[calc((100%-4*14px)/5)] xl:w-[calc((100%-5*14px)/6)] xl:min-w-[calc((100%-5*14px)/6)] flex-shrink-0'
                        : 'w-full'
                    }`}
                    id={`product-card-${product.id}`}
                  >
                    {/* Top Portion: Image with Favorite Button + Product Info */}
                    <div className="flex flex-col flex-1">
                      {/* 1. Large Image with Top-Right Heart Favorite */}
                      <div className="relative aspect-square w-full bg-slate-50/70 border-b border-slate-100 flex items-center justify-center p-3 overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />

                        {/* Top Left Badge (e.g. Mais Vendido / Norm) */}
                        {product.badge && (
                          <span className="absolute top-2 left-2 text-[8px] sm:text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 shadow-xs">
                            {product.badge}
                          </span>
                        )}

                        {/* 2. Top-Right Heart Favorite ❤️ Button */}
                        <button
                          onClick={(e) => toggleFavorite(product.id, e)}
                          className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer z-10 ${
                            isFav
                              ? 'bg-rose-50 text-rose-500 shadow-sm ring-1 ring-rose-200'
                              : 'bg-white/95 text-slate-400 hover:text-rose-500 hover:bg-white shadow-xs border border-slate-200/80'
                          }`}
                          title={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                          aria-label={`Favoritar ${product.name}`}
                          id={`btn-fav-${product.id}`}
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${
                              isFav ? 'fill-rose-500 text-rose-500 scale-110' : 'text-slate-400 hover:scale-110'
                            } transition-transform`}
                          />
                        </button>

                        {/* Quick View Overlay Button */}
                        <a
                          href={`/produto/${product.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            onViewProductDetails(product);
                          }}
                          className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-slate-900/80 text-white hover:bg-amber-500 hover:text-slate-950 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center shadow-md scale-75 group-hover:scale-100 cursor-pointer"
                          title={`Ver Detalhes de ${product.name}`}
                          aria-label={`Ver detalhes de ${product.name}`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      {/* Card Middle Info */}
                      <div className="p-2.5 sm:p-3 flex flex-col flex-1">
                        {/* 3. Product Name */}
                        <h3 className="text-xs sm:text-[13px] font-semibold text-slate-800 leading-snug line-clamp-2 h-8 sm:h-9 mb-1">
                          <a
                            href={`/produto/${product.id}`}
                            onClick={(e) => {
                              e.preventDefault();
                              onViewProductDetails(product);
                            }}
                            className="hover:text-amber-600 transition-colors block"
                            title={product.name}
                          >
                            {product.name}
                          </a>
                        </h3>

                        {/* 4. Price in MZN */}
                        <div className="mt-auto pt-1">
                          <div className="flex items-baseline gap-1">
                            <span className="text-xs sm:text-sm font-extrabold text-amber-600 sm:text-slate-950">
                              {formatCurrency(product.price)}
                            </span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="text-[9px] sm:text-[10px] text-slate-400 line-through">
                                {formatCurrency(product.originalPrice)}
                              </span>
                            )}
                          </div>

                          {/* 5. Availability Indicator */}
                          <div className="mt-0.5">
                            {isAvailable ? (
                              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-emerald-600">
                                <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                                <span>Disponível</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-rose-600">
                                <X className="w-3 h-3 text-rose-600 stroke-[3]" />
                                <span>Esgotado</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Area: [-] 1 [+] and Shopping Cart 🛒 */}
                    <div className="p-2.5 sm:p-3 pt-0 border-t border-slate-100 bg-white">
                      <div className="flex items-center justify-between gap-1.5 pt-2">
                        {/* 6. Quantity Stepper: [-] 1 [+] */}
                        <div className="flex items-center bg-slate-100/90 rounded-lg p-0.5 border border-slate-200">
                          <button
                            onClick={() => handleQuantityChange(product.id, -1)}
                            disabled={!isAvailable}
                            className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-white text-slate-700 hover:bg-slate-200 flex items-center justify-center text-xs font-bold transition-colors disabled:opacity-40 cursor-pointer shadow-xs"
                            aria-label="Diminuir quantidade"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="w-5 sm:w-6 text-center text-xs font-extrabold text-slate-900">
                            {qty}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(product.id, 1)}
                            disabled={!isAvailable}
                            className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-white text-slate-700 hover:bg-slate-200 flex items-center justify-center text-xs font-bold transition-colors disabled:opacity-40 cursor-pointer shadow-xs"
                            aria-label="Aumentar quantidade"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>

                        {/* 7. Shopping Cart Button 🛒 */}
                        <button
                          onClick={() => handleAddWithFeedback(product)}
                          disabled={!isAvailable}
                          className={`h-6 sm:h-7 px-2 rounded-lg flex items-center justify-center gap-1 transition-all shadow-xs cursor-pointer ${
                            !isAvailable
                              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                              : isJustAdded
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 hover:bg-amber-500 text-slate-800 hover:text-slate-950 border border-slate-200 hover:border-amber-500 active:scale-95'
                          }`}
                          id={`btn-cart-${product.id}`}
                          title={isAvailable ? `Adicionar ${qty} ao Carrinho` : "Produto Esgotado"}
                          aria-label="Adicionar ao Carrinho"
                        >
                          {isJustAdded ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <ShoppingCart className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

