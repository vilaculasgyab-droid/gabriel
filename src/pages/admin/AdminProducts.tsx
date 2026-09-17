import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Star, 
  AlertTriangle, 
  Package, 
  Image as ImageIcon, 
  DollarSign, 
  ShieldCheck, 
  Sparkles,
  Layers,
  ArrowUpDown,
  Eye,
  CheckCircle2,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { Product, ProductSpecification } from '../../types';
import { CATEGORIES } from '../../data/categories';
import { formatCurrency } from '../../utils/whatsapp';
import { storeDb } from '../../services/storeDb';
import { ProductImageManager } from '../../components/admin/ProductImageManager';
import { DEFAULT_EPI_PLACEHOLDER, imageStorage } from '../../services/imageStorage';
import { resolveProductImageUrl } from '../../utils/imageUtils';

// Preset gallery images for quick selection when adding/editing
const PRESET_IMAGES = [
  { label: 'Capacete Amarelo', url: '/products/prod_capacete_amarelo_1788241366367.jpg' },
  { label: 'Colete Laranja Refletor', url: '/products/prod_colete_laranja_1788241390542.jpg' },
  { label: 'Luvas de Proteção PU/Nitrílicas', url: '/products/prod_luvas_pu_1788241516995.jpg' },
  { label: 'Botas de Segurança S3', url: '/products/prod_botas_s3_preta_1788241571160.jpg' },
  { label: 'Máscara N95 c/ Válvula', url: '/products/prod_mascara_n95_valvula_1788241626119.jpg' },
  { label: 'Abafador de Ruído Concha', url: '/products/prod_abafador_concha_1788241666782.jpg' },
  { label: 'Arnês Paraquedista', url: '/products/prod_arnes_seguranca_1788241690396.jpg' },
  { label: 'Óculos Transparentes', url: '/products/prod_oculos_transparente_1788241457094.jpg' },
  { label: 'Cone de Sinalização', url: '/products/prod_cone_sinalizacao_1788241721417.jpg' },
  { label: 'Fato Ignífugo', url: '/products/prod_fato_ignifugo.jpg' },
];

interface AdminProductsProps {
  onProductChanged?: () => void;
  showToast: (msg: string) => void;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({ onProductChanged, showToast }) => {
  const [products, setProducts] = useState<Product[]>(() => storeDb.getProducts());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'out_of_stock' | 'featured'>('all');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Image tracking states
  const [imageWasChanged, setImageWasChanged] = useState(false);
  const [imageWasRemoved, setImageWasRemoved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State for Add / Edit
  const [formData, setFormData] = useState<{
    name: string;
    categoryId: string;
    subcategory: string;
    price: number;
    originalPrice: string;
    image: string;
    norm: string;
    badge: string;
    shortDescription: string;
    description: string;
    stockCount: number;
    inStock: boolean;
    featured: boolean;
    sizes: string;
    colors: string;
  }>({
    name: '',
    categoryId: CATEGORIES[0].id,
    subcategory: '',
    price: 0,
    originalPrice: '',
    image: PRESET_IMAGES[0].url,
    norm: '',
    badge: '',
    shortDescription: '',
    description: '',
    stockCount: 20,
    inStock: true,
    featured: false,
    sizes: '',
    colors: '',
  });

  const reloadProducts = () => {
    const list = storeDb.getProducts();
    setProducts(list);
    if (onProductChanged) onProductChanged();
  };

  // Subscrição em tempo real aos dados do Supabase via storeDb
  useEffect(() => {
    // Sincroniza imediatamente com o Supabase ao abrir a aba de produtos
    storeDb
      .syncWithServer(true)
      .catch((err) => {
        console.warn('[AdminProducts] Falha ao sincronizar produtos com o servidor:', err);
      })
      .finally(() => {
        try {
          setProducts(storeDb.getProducts() || []);
        } catch {
          setProducts([]);
        }
      });

    const unsubscribe = storeDb.subscribe(() => {
      try {
        setProducts(storeDb.getProducts() || []);
      } catch {
        setProducts([]);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Filtered products
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    return products.filter((product) => {
      if (!product) return false;
      const q = (searchQuery || '').toLowerCase().trim();
      const pName = String(product.name || '').toLowerCase();
      const pCatName = String(product.categoryName || '').toLowerCase();
      const pNorm = String(product.norm || '').toLowerCase();
      const pSub = String(product.subcategory || '').toLowerCase();

      const matchSearch =
        !q ||
        pName.includes(q) ||
        pCatName.includes(q) ||
        pNorm.includes(q) ||
        pSub.includes(q);

      const matchCategory = selectedCategory === 'all' || product.categoryId === selectedCategory;

      let matchStock = true;
      if (stockFilter === 'in_stock') {
        matchStock = !!product.inStock && (product.stockCount === undefined || product.stockCount > 0);
      } else if (stockFilter === 'out_of_stock') {
        matchStock = !product.inStock || (product.stockCount !== undefined && product.stockCount <= 0);
      } else if (stockFilter === 'featured') {
        matchStock = !!product.featured;
      }

      return matchSearch && matchCategory && matchStock;
    });
  }, [products, searchQuery, selectedCategory, stockFilter]);

  const handleOpenAddModal = () => {
    setImageWasChanged(false);
    setImageWasRemoved(false);
    setFormData({
      name: '',
      categoryId: CATEGORIES[0].id,
      subcategory: 'Equipamento de Proteção',
      price: 500,
      originalPrice: '',
      image: PRESET_IMAGES[0].url,
      norm: 'EN 397 / ISO',
      badge: 'Novo',
      shortDescription: '',
      description: '',
      stockCount: 25,
      inStock: true,
      featured: false,
      sizes: 'M, L, XL',
      colors: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setImageWasChanged(false);
    setImageWasRemoved(false);
    setFormData({
      name: product.name,
      categoryId: product.categoryId,
      subcategory: product.subcategory || '',
      price: product.price,
      originalPrice: product.originalPrice ? product.originalPrice.toString() : '',
      image: product.image || '',
      norm: product.norm || '',
      badge: product.badge || '',
      shortDescription: product.shortDescription || '',
      description: product.description || '',
      stockCount: product.stockCount ?? (product.stock ?? 10),
      inStock: product.inStock,
      featured: !!product.featured,
      sizes: product.availableSizes ? product.availableSizes.join(', ') : '',
      colors: product.availableColors ? product.availableColors.join(', ') : '',
    });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Por favor, informe o nome do produto.');
      return;
    }
    if (formData.price <= 0) {
      showToast('O preço deve ser superior a 0 MT.');
      return;
    }

    setIsSubmitting(true);

    try {
      const catObj = CATEGORIES.find((c) => c.id === formData.categoryId);
      const categoryName = catObj ? catObj.name : 'Equipamento EPI';

      const sizesArr = formData.sizes.split(',').map((s) => s.trim()).filter(Boolean);
      const colorsArr = formData.colors.split(',').map((c) => c.trim()).filter(Boolean);
      const origPriceNum = formData.originalPrice ? parseFloat(formData.originalPrice) : undefined;

      // Determine final image path/dataUrl
      let finalImage = formData.image.trim();
      if (imageWasRemoved) {
        finalImage = DEFAULT_EPI_PLACEHOLDER;
      } else if (!finalImage) {
        finalImage = editingProduct?.image || DEFAULT_EPI_PLACEHOLDER;
      }

      // Se for uma URL blob local temporária, converte para DataURL base64 para envio seguro
      if (finalImage.startsWith('blob:')) {
        try {
          const blobRes = await fetch(finalImage);
          const blob = await blobRes.blob();
          const reader = new FileReader();
          const base64Promise = new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
          });
          reader.readAsDataURL(blob);
          finalImage = await base64Promise;
        } catch (bErr) {
          console.warn('Aviso: falha ao extrair base64 de blob URL, recorrendo à imagem existente:', bErr);
          finalImage = editingProduct?.image || DEFAULT_EPI_PLACEHOLDER;
        }
      }

      // Se for uma imagem base64 pendente de gravação no servidor, envia para Supabase Storage
      if (finalImage.startsWith('data:') && !finalImage.includes('data:image/svg+xml')) {
        try {
          const prodId = editingProduct?.id || formData.name.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 30);
          const upRes = await fetch('/api/upload-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productId: prodId,
              dataUrl: finalImage,
              fileName: `${prodId}.webp`,
              previousImageUrl: editingProduct?.image,
            }),
          });
          const upData = await upRes.json();
          if (!upRes.ok || !upData.success || !upData.url) {
            throw new Error(upData.error || 'Falha ao gravar imagem no Supabase Storage.');
          }
          finalImage = upData.url;
        } catch (upErr: any) {
          showToast(`Erro no envio da imagem: ${upErr.message}`);
          setIsSubmitting(false);
          return;
        }
      } else if (!finalImage.startsWith('data:') && !finalImage.includes('?v=') && finalImage !== DEFAULT_EPI_PLACEHOLDER) {
        // Assegura token de versionamento para cache busting em URLs normais
        finalImage = `${finalImage}${finalImage.includes('?') ? '&' : '?'}v=${Date.now()}`;
      }

      if (editingProduct) {
        const imageChanged = imageWasChanged || (finalImage !== editingProduct.image);

        // Atualização oficial no Supabase
        await storeDb.updateProductAsync(editingProduct.id, {
          name: formData.name.trim(),
          categoryId: formData.categoryId,
          categoryName,
          subcategory: formData.subcategory.trim() || 'Equipamento de Proteção',
          price: Number(formData.price),
          originalPrice: origPriceNum,
          image: finalImage,
          norm: formData.norm.trim() || undefined,
          badge: formData.badge.trim() || undefined,
          shortDescription: formData.shortDescription.trim() || formData.name,
          description: formData.description.trim() || formData.shortDescription,
          stockCount: Number(formData.stockCount),
          stock: Number(formData.stockCount),
          inStock: formData.inStock && Number(formData.stockCount) > 0,
          featured: formData.featured,
          availableSizes: sizesArr.length > 0 ? sizesArr : undefined,
          availableColors: colorsArr.length > 0 ? colorsArr : undefined,
        });

        if (imageChanged) {
          showToast('Imagem e dados do produto atualizados com sucesso no Supabase!');
        } else {
          showToast(`Produto "${formData.name}" atualizado com sucesso no Supabase!`);
        }
        setEditingProduct(null);
      } else {
        // Criação de novo produto no Supabase
        await storeDb.addProductAsync({
          name: formData.name.trim(),
          categoryId: formData.categoryId,
          categoryName,
          subcategory: formData.subcategory.trim() || 'Equipamento de Proteção',
          price: Number(formData.price),
          originalPrice: origPriceNum,
          image: finalImage || PRESET_IMAGES[0].url,
          norm: formData.norm.trim() || 'Certificado',
          badge: formData.badge.trim() || undefined,
          shortDescription: formData.shortDescription.trim() || formData.name,
          description: formData.description.trim() || formData.shortDescription,
          stockCount: Number(formData.stockCount),
          stock: Number(formData.stockCount),
          inStock: formData.inStock && Number(formData.stockCount) > 0,
          featured: formData.featured,
          availableSizes: sizesArr.length > 0 ? sizesArr : undefined,
          availableColors: colorsArr.length > 0 ? colorsArr : undefined,
          specifications: [
            { label: 'Norma de Segurança', value: formData.norm || 'EN / ISO' },
            { label: 'Material', value: 'Industrial de Alta Resistência' },
            { label: 'Garantia', value: 'Certificado de Origem' },
          ],
          applications: ['Construção Civil', 'Indústria', 'Mineração', 'Logística'],
          rating: 5.0,
          reviewsCount: 1,
        });
        showToast(`Produto "${formData.name}" adicionado e salvo com sucesso no Supabase!`);
        setIsAddModalOpen(false);
      }

      setImageWasChanged(false);
      setImageWasRemoved(false);
      await storeDb.syncWithServer(true);
      reloadProducts();
      onProductChanged?.();
    } catch (err: any) {
      console.error('Falha ao salvar produto:', err);
      showToast(`Erro no Supabase: ${err.message || 'Falha na gravação.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    const name = deletingProduct.name;
    try {
      setIsSubmitting(true);
      await storeDb.deleteProductAsync(deletingProduct.id);
      showToast(`Produto "${name}" eliminado com sucesso do Supabase.`);
      setDeletingProduct(null);
      await storeDb.syncWithServer(true);
      reloadProducts();
      onProductChanged?.();
    } catch (err: any) {
      showToast(`Erro ao eliminar no Supabase: ${err.message || err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStock = async (product: Product) => {
    try {
      await storeDb.updateProductAsync(product.id, { inStock: !product.inStock });
      showToast(`Estado de "${product.name}" alterado para ${!product.inStock ? 'Disponível' : 'Esgotado'}.`);
      reloadProducts();
      onProductChanged?.();
    } catch (err: any) {
      showToast(`Erro ao atualizar estado no Supabase: ${err.message || err}`);
    }
  };

  const handleToggleFeatured = async (product: Product) => {
    try {
      await storeDb.updateProductAsync(product.id, { featured: !product.featured });
      showToast(`Produto "${product.name}" ${!product.featured ? 'marcado como destaque' : 'removido dos destaques'}.`);
      reloadProducts();
      onProductChanged?.();
    } catch (err: any) {
      showToast(`Erro ao atualizar destaque no Supabase: ${err.message || err}`);
    }
  };

  const handleAdjustStock = async (product: Product, delta: number) => {
    const current = product.stockCount ?? (product.stock ?? 0);
    const updated = Math.max(0, current + delta);
    try {
      await storeDb.updateProductAsync(product.id, {
        stock: updated,
        stockCount: updated,
        inStock: updated > 0,
      });
      reloadProducts();
      onProductChanged?.();
    } catch (err: any) {
      showToast(`Erro ao atualizar estoque no Supabase: ${err.message || err}`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Package className="w-4 h-4" />
            <span>Inventário & Catálogo</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Gestão de Produtos & Stock
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Adicione novos EPIs, edite especificações, altere preços em Meticais e controle a quantidade em stock.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={async () => {
              showToast('A sincronizar catálogo com o Supabase...');
              const ok = await storeDb.syncWithServer(true);
              reloadProducts();
              onProductChanged?.();
              if (ok) {
                showToast('Catálogo sincronizado com o Supabase!');
              } else {
                showToast('Sincronização concluída com o servidor.');
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm border border-slate-700 transition-all cursor-pointer"
            title="Recarregar catálogo atual do Supabase"
          >
            <RefreshCw className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Sincronizar Supabase</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Novo Produto</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-lg flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar por nome, categoria ou norma..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-slate-950 text-white pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category & Stock Filter Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-slate-950 text-slate-200 px-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="all">Todas as Categorias</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Stock Filter */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setStockFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                stockFilter === 'all' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos ({products.length})
            </button>
            <button
              onClick={() => setStockFilter('in_stock')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                stockFilter === 'in_stock' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Em Stock
            </button>
            <button
              onClick={() => setStockFilter('out_of_stock')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                stockFilter === 'out_of_stock' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sem Stock
            </button>
            <button
              onClick={() => setStockFilter('featured')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                stockFilter === 'featured' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>Destaques</span>
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            A apresentar <strong>{filteredProducts.length}</strong> de {products.length} produtos
          </div>
          <div className="text-[11px] text-slate-500">
            * Alterações no stock e preços refletem imediatamente na loja pública
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/70 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Produto & Imagem</th>
                <th className="py-3.5 px-3">Categoria / Norma</th>
                <th className="py-3.5 px-3">Preço (MT)</th>
                <th className="py-3.5 px-3">Stock Atual</th>
                <th className="py-3.5 px-3">Disponibilidade</th>
                <th className="py-3.5 px-3">Destaque</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Nenhum produto encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const stock = product.stockCount ?? (product.stock ?? 0);
                  const isAvailable = product.inStock && stock > 0;

                  return (
                    <tr key={product.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Product Thumbnail & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-white p-1 border border-slate-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            <img
                              src={resolveProductImageUrl(product.image, product.updatedAt)}
                              alt={product.name}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = DEFAULT_EPI_PLACEHOLDER;
                              }}
                            />
                          </div>
                          <div className="max-w-xs sm:max-w-sm">
                            <div className="font-bold text-white leading-snug">
                              {product.name}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">
                              {product.shortDescription}
                            </div>
                            {product.badge && (
                              <span className="inline-block mt-1 text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20">
                                {product.badge}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category & Norm */}
                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-slate-200">{product.categoryName}</div>
                        <div className="text-[11px] text-amber-400/90 font-mono">
                          {product.norm || 'EN / ISO'}
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-3">
                        <div className="font-black text-white text-sm">
                          {formatCurrency(product.price)}
                        </div>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <div className="text-[10px] text-slate-500 line-through">
                            {formatCurrency(product.originalPrice)}
                          </div>
                        )}
                      </td>

                      {/* Stock Quick Controller */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleAdjustStock(product, -1)}
                            className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center cursor-pointer"
                            title="Diminuir 1"
                          >
                            -
                          </button>
                          <span
                            className={`font-mono font-bold min-w-[28px] text-center ${
                              stock <= 0
                                ? 'text-red-400'
                                : stock <= 5
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                            }`}
                          >
                            {stock}
                          </span>
                          <button
                            onClick={() => handleAdjustStock(product, 1)}
                            className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center cursor-pointer"
                            title="Aumentar 1"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* In Stock Toggle Switch */}
                      <td className="py-3.5 px-3">
                        <button
                          onClick={() => handleToggleStock(product)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                            isAvailable
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-red-500/15 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {isAvailable ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Em Stock</span>
                            </>
                          ) : (
                            <>
                              <X className="w-3 h-3" />
                              <span>Esgotado</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Featured Star Toggle */}
                      <td className="py-3.5 px-3">
                        <button
                          onClick={() => handleToggleFeatured(product)}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            product.featured
                              ? 'bg-amber-400/20 text-amber-400 border-amber-400/40'
                              : 'bg-slate-800/40 text-slate-500 border-slate-700 hover:text-amber-400'
                          }`}
                          title={product.featured ? 'Produto em destaque na Home' : 'Destacar produto'}
                        >
                          <Star className={`w-4 h-4 ${product.featured ? 'fill-amber-400' : ''}`} />
                        </button>
                      </td>

                      {/* Action Buttons: Edit & Delete */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(product)}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 border border-slate-700 transition-colors cursor-pointer"
                            title="Editar Produto"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingProduct(product)}
                            className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 transition-colors cursor-pointer"
                            title="Eliminar Produto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add or Edit Product */}
      {(isAddModalOpen || editingProduct) && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/15 text-amber-400 flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {editingProduct ? 'Editar Produto de EPI' : 'Adicionar Novo Produto de EPI'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Preencha os dados e especificações para exibição no catálogo
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingProduct(null);
                  setImageWasChanged(false);
                  setImageWasRemoved(false);
                }}
                className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProduct} className="p-5 sm:p-7 max-h-[75vh] overflow-y-auto space-y-4">
              
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Nome do Produto <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Capacete Industrial com Jugular EN 397"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Category & Subcategory */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Categoria <span className="text-amber-400">*</span>
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Subcategoria / Tipo
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Proteção da Cabeça"
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Price & Promo Price */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Preço (MZN / MT) <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="10"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Preço Original (Opcional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Ex: 1200"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Quantidade em Stock <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stockCount}
                    onChange={(e) => setFormData({ ...formData, stockCount: Number(e.target.value) })}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400 font-bold"
                  />
                </div>
              </div>

              {/* Norm & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Norma Técnica / Certificação
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: EN 397 / EN ISO 20345 S3"
                    value={formData.norm}
                    onChange={(e) => setFormData({ ...formData, norm: e.target.value })}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Etiqueta / Badge (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Mais Vendido, Pronta Entrega, Destaque"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Descrição Curta
                </label>
                <input
                  type="text"
                  placeholder="Ex: Capacete com suspensão regulável e proteção contra impactos laterais."
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Full Description */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Descrição Completa
                </label>
                <textarea
                  rows={3}
                  placeholder="Detalhes completos sobre o material, resistência, ergonomia e aplicações industriais..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Gestão Profissional da Imagem do Produto (Upload, Pré-visualização, Remover) */}
              <ProductImageManager
                currentImage={editingProduct ? editingProduct.image : formData.image}
                productName={formData.name}
                presetImages={PRESET_IMAGES}
                onImageChanged={(newImageUrl) => {
                  setFormData((prev) => ({ ...prev, image: newImageUrl }));
                  setImageWasChanged(true);
                  setImageWasRemoved(false);
                }}
                onImageRemoved={() => {
                  setFormData((prev) => ({ ...prev, image: DEFAULT_EPI_PLACEHOLDER }));
                  setImageWasChanged(true);
                  setImageWasRemoved(true);
                }}
                isSubmitting={isSubmitting}
              />

              {/* Sizes & Colors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Tamanhos (separados por vírgula)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 38, 39, 40, 41, 42, 43"
                    value={formData.sizes}
                    onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Cores (separadas por vírgula)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Amarelo, Branco, Azul"
                    value={formData.colors}
                    onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Toggles: In Stock & Featured */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.inStock}
                    onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                    className="w-4 h-4 text-amber-400 rounded focus:ring-amber-400 cursor-pointer"
                  />
                  <span>Produto Ativo / Disponível para Venda</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-amber-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 text-amber-400 rounded focus:ring-amber-400 cursor-pointer"
                  />
                  <span>Destacar na Página Inicial</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingProduct(null);
                    setImageWasChanged(false);
                    setImageWasRemoved(false);
                  }}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  id="admin-guardar-produto-btn"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />}
                  <span>
                    {isSubmitting
                      ? 'A guardar...'
                      : editingProduct
                      ? 'Guardar Alterações'
                      : 'Criar Produto'}
                  </span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Modal: Delete Confirmation */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-500/15 text-red-400 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black text-white mb-2">
              Eliminar Produto?
            </h3>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Tem a certeza de que deseja eliminar o produto{' '}
              <strong className="text-white">"{deletingProduct.name}"</strong>? Esta ação removerá o produto do catálogo da loja.
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeletingProduct(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black shadow-lg shadow-red-600/30 transition-all cursor-pointer"
              >
                Sim, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
