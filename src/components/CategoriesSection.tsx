import React from 'react';
import { CATEGORIES } from '../data/categories';
import { CategoryIcon } from './CategoryIcon';
import { ArrowRight, Layers } from 'lucide-react';

interface CategoriesSectionProps {
  onSelectCategory: (categoryId: string) => void;
  selectedCategory: string;
}

export const CategoriesSection: React.FC<CategoriesSectionProps> = ({
  onSelectCategory,
  selectedCategory,
}) => {
  const handleCategoryClick = (categoryId: string) => {
    onSelectCategory(categoryId);
    const catalogElement = document.getElementById('catalogo-produtos');
    if (catalogElement) {
      catalogElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="categorias" className="py-16 bg-slate-100 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-100 px-3 py-1 rounded-full mb-2">
              <Layers className="w-3.5 h-3.5" />
              <span>Gama Completa de EPIs</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Categorias em Destaque
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-2xl">
              Equipamentos certificados para todas as áreas de risco ocupacional. Selecione uma categoria para visualizar os produtos disponíveis.
            </p>
          </div>

          <button
            onClick={() => handleCategoryClick('all')}
            className="self-start md:self-auto inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-900 hover:text-amber-600 bg-white px-4 py-2.5 rounded-xl border border-slate-300 shadow-sm transition-all hover:shadow cursor-pointer"
          >
            <span>Ver Todas as Categorias</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Categories Grid (10 categories) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
          {CATEGORIES.map((cat, index) => {
            const isSelected = selectedCategory === cat.id;

            return (
              <div
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`group relative rounded-2xl bg-white p-4 border transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md ${
                  isSelected
                    ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20'
                    : 'border-slate-200 hover:border-amber-400'
                }`}
                id={`category-card-${cat.id}`}
              >
                {/* Top: Icon + Count */}
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                          : 'bg-slate-900 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950'
                      }`}
                    >
                      <CategoryIcon name={cat.iconName} className="w-6 h-6 stroke-[2]" />
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      {cat.productCount} itens
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors leading-tight mb-1.5">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                    {cat.description}
                  </p>
                </div>

                {/* Subcategories tags preview & action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
                  <span className="text-[11px] font-semibold text-slate-700 truncate pr-2">
                    {cat.featuredItems[0]}
                  </span>
                  <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-amber-500 group-hover:text-slate-950 text-slate-400 flex items-center justify-center transition-colors flex-shrink-0">
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
