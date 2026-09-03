import React, { useState } from 'react';
import { Product } from '../types';
import { 
  X, 
  ShoppingCart, 
  MessageSquare, 
  Check, 
  Truck, 
  Building2, 
  Plus, 
  Minus, 
  Award,
  Layers,
  AlertCircle
} from 'lucide-react';
import { formatCurrency, getProductWhatsAppInquiryUrl } from '../utils/whatsapp';
import { useSEO } from '../hooks/useSEO';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, selectedSize?: string, selectedColor?: string) => void;
  onOpenQuoteModal: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onOpenQuoteModal,
}) => {
  if (!product) return null;

  useSEO({
    title: `${product.name} | ProSegurança`,
    description: `${product.shortDescription || product.description} Preço: ${product.price} MZN. Disponibilidade: ${product.inStock ? 'Em Stock' : 'Sob Encomenda'}. Encomende via WhatsApp com entrega em Moçambique.`,
    canonicalPath: `/produto/${product.id}`,
    ogType: 'product',
    ogImage: product.image,
    product,
    breadcrumbs: [
      { name: 'Início', path: '/' },
      { name: 'Produtos', path: '/produtos' },
      { name: product.categoryName, path: `/categoria/${product.categoryId}` },
      { name: product.name, path: `/produto/${product.id}` },
    ],
  });

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.availableSizes && product.availableSizes.length > 0 ? product.availableSizes[0] : undefined
  );
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product.availableColors && product.availableColors.length > 0 ? product.availableColors[0] : undefined
  );
  const [addedSuccess, setAddedSuccess] = useState(false);

  const isAvailable = product.inStock !== false;

  const handleAddToCart = () => {
    if (!isAvailable) return;
    onAddToCart(product, quantity, selectedSize, selectedColor);
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white transition-colors cursor-pointer"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 max-h-[85vh] overflow-y-auto">
          {/* Left Column: Image & Badges */}
          <div className="md:col-span-5 bg-slate-100 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200">
            <div>
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white shadow-inner mb-4 border border-slate-200">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                {product.badge && (
                  <span className="absolute top-3 left-3 text-xs font-extrabold uppercase px-3 py-1 rounded-lg bg-amber-500 text-slate-950 shadow-md">
                    {product.badge}
                  </span>
                )}
                {!isAvailable && (
                  <span className="absolute top-3 right-3 text-xs font-extrabold uppercase px-3 py-1 rounded-lg bg-rose-600 text-white shadow-md">
                    Esgotado
                  </span>
                )}
              </div>

              {/* Technical Norm Badge */}
              {product.norm && (
                <div className="rounded-xl bg-slate-900 text-slate-200 p-3 mb-3 text-xs flex items-center gap-2.5">
                  <Award className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-white leading-tight">Certificação Oficial</div>
                    <div className="text-amber-400 font-mono text-[11px]">{product.norm}</div>
                  </div>
                </div>
              )}

              {/* Delivery guarantee info */}
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>Entrega rápida em Maputo, Matola e províncias</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>Fatura com NUIT para empresas e construtoras</span>
                </div>
              </div>
            </div>

            {/* Corporate bulk quote prompt */}
            <div className="mt-6 pt-4 border-t border-slate-200">
              <div className="text-[11px] font-semibold text-slate-500 mb-1">
                Precisa em grande quantidade para sua equipa ou obra?
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenQuoteModal();
                }}
                className="text-xs font-bold text-amber-600 hover:text-amber-700 underline cursor-pointer"
              >
                Solicitar Cotação para Obras
              </button>
            </div>
          </div>

          {/* Right Column: Information & Options */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Semantic Breadcrumbs */}
              <nav aria-label="Navegação estrutural do produto" className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mb-3">
                <span>Início</span>
                <span className="text-slate-300">/</span>
                <span>Produtos</span>
                <span className="text-slate-300">/</span>
                <span className="text-amber-600 font-semibold">{product.categoryName}</span>
              </nav>

              {/* Category & Stock Availability */}
              <div className="flex items-center justify-between text-xs font-bold mb-2">
                <span className="text-amber-600 uppercase tracking-wider">{product.categoryName}</span>
                {isAvailable ? (
                  <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Disponível {product.stockCount ? `(${product.stockCount} em stock)` : 'em Stock'}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 font-bold">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                    Esgotado (Sob Encomenda)
                  </span>
                )}
              </div>

              {/* Product Title */}
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight mb-3">
                {product.name}
              </h2>

              {/* Price Row */}
              <div className="flex items-baseline gap-3 mb-4 pb-4 border-b border-slate-100">
                <span className="text-2xl sm:text-3xl font-black text-slate-950">
                  {formatCurrency(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-sm text-slate-400 line-through">
                    {formatCurrency(product.originalPrice)}
                  </span>
                )}
                <span className="text-xs font-medium text-slate-500">
                  / unidade
                </span>
              </div>

              {/* Full Description */}
              <div className="mb-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Descrição do Produto:
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Size Selector if available */}
              {product.availableSizes && product.availableSizes.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs font-bold text-slate-700 mb-1.5">Selecione o Tamanho:</div>
                  <div className="flex flex-wrap gap-2">
                    {product.availableSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          selectedSize === size
                            ? 'bg-amber-500 text-slate-950 shadow-sm ring-2 ring-amber-500/30'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selector if available */}
              {product.availableColors && product.availableColors.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs font-bold text-slate-700 mb-1.5">Cor / Variante:</div>
                  <div className="flex flex-wrap gap-2">
                    {product.availableColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          selectedColor === color
                            ? 'bg-slate-900 text-amber-400 shadow-sm'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Specifications Table */}
              <div className="mb-5 bg-slate-50 rounded-2xl p-3.5 border border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-500" />
                  Características & Especificações:
                </h4>
                <div className="grid grid-cols-1 gap-1.5 text-xs">
                  {product.specifications.map((spec, i) => (
                    <div key={i} className="flex justify-between py-1 border-b border-slate-200/60 last:border-0">
                      <span className="font-semibold text-slate-500">{spec.label}:</span>
                      <span className="font-bold text-slate-800 text-right">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Applications */}
              {product.applications && product.applications.length > 0 && (
                <div className="mb-6">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Aplicações Recomendadas:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {product.applications.map((app, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200"
                      >
                        {app}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions: Quantity, Add to Cart & WhatsApp */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              {/* Quantity Picker */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Quantidade:</span>
                <div className="flex items-center gap-2.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-lg bg-white text-slate-700 hover:bg-slate-200 flex items-center justify-center font-bold transition-colors cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center text-sm font-extrabold text-slate-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-lg bg-white text-slate-700 hover:bg-slate-200 flex items-center justify-center font-bold transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Total Calculation Preview */}
              <div className="flex items-center justify-between text-xs py-1 text-slate-600">
                <span>Subtotal ({quantity}x):</span>
                <span className="font-black text-base text-slate-900">
                  {formatCurrency(product.price * quantity)}
                </span>
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  onClick={handleAddToCart}
                  disabled={!isAvailable}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
                    !isAvailable
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : addedSuccess
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-900 hover:bg-slate-800 text-amber-400'
                  }`}
                  id="modal-btn-add-cart"
                >
                  {!isAvailable ? (
                    <span>Produto Esgotado</span>
                  ) : addedSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Adicionado ao Carrinho!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      <span>Adicionar ao Carrinho</span>
                    </>
                  )}
                </button>

                <a
                  href={getProductWhatsAppInquiryUrl(product, quantity, selectedSize)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 shadow-md shadow-emerald-700/30 transition-all cursor-pointer"
                  id="modal-btn-whatsapp-buy"
                >
                  <MessageSquare className="w-4 h-4 fill-white/20" />
                  <span>Comprar pelo WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

