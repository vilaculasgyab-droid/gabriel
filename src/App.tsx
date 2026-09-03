import React, { useState, useEffect, useMemo } from 'react';
import { Product, CartItem } from './types';
import { PRODUCTS } from './data/products';
import { CATEGORIES } from './data/categories';
import { storeDb } from './services/storeDb';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProductCatalog } from './components/ProductCatalog';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { WhatsAppCheckoutModal } from './components/WhatsAppCheckoutModal';
import { QuoteModal } from './components/QuoteModal';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAUpdatePrompt } from './components/PWAUpdatePrompt';
import { AboutPage } from './pages/AboutPage';
import { AdvantagesPage } from './pages/AdvantagesPage';
import { ContactPage } from './pages/ContactPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AdminPortal } from './pages/admin/AdminPortal';
import { useSEO } from './hooks/useSEO';

export default function App() {
  // Routing state
  const parseRoute = (pathname: string) => {
    if (!pathname) return { path: '/', is404: false };
    const normalized = pathname.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';

    if (normalized === '/') {
      return { path: '/', is404: false };
    }
    if (normalized === '/admin' || normalized.startsWith('/admin/')) {
      return { path: '/admin', is404: false };
    }
    if (
      normalized === '/sobre-nos' ||
      normalized === '/vantagens' ||
      normalized === '/contactos' ||
      normalized === '/produtos'
    ) {
      return { path: normalized, is404: false };
    }
    if (normalized === '/categorias') {
      return { path: '/produtos', is404: false };
    }

    // Category route: /categoria/:id or /categorias/:id
    const catMatch = normalized.match(/^\/(?:categoria|categorias)\/([a-zA-Z0-9_-]+)$/);
    if (catMatch) {
      const catId = catMatch[1];
      const catExists = CATEGORIES.some((c) => c.id === catId);
      if (catExists) {
        return { path: `/categoria/${catId}`, categoryId: catId, is404: false };
      }
      return { path: normalized, is404: true };
    }

    // Product route: /produto/:id or /produtos/:id
    const prodMatch = normalized.match(/^\/(?:produto|produtos)\/([a-zA-Z0-9_-]+)$/);
    if (prodMatch) {
      const prodId = prodMatch[1];
      const prodExists = storeDb.getProducts().some((p) => p.id === prodId);
      if (prodExists) {
        return { path: `/produto/${prodId}`, productId: prodId, is404: false };
      }
      return { path: normalized, is404: true };
    }

    return { path: normalized, is404: true };
  };

  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const parsed = parseRoute(window.location.pathname);
      return parsed.path;
    }
    return '/';
  });

  const currentRoute = useMemo(() => parseRoute(currentPath), [currentPath]);

  // Dynamic Products state synchronized with storeDb
  const [products, setProducts] = useState<Product[]>(() => storeDb.getProducts());

  useEffect(() => {
    const unsubscribe = storeDb.subscribe(() => {
      setProducts(storeDb.getProducts());
    });
    return () => unsubscribe();
  }, []);

  // Cart state persisted to localStorage
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('proseguranca_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // UI state
  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const parsed = parseRoute(window.location.pathname);
      if (parsed.categoryId) return parsed.categoryId;
    }
    return 'all';
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeProductModal, setActiveProductModal] = useState<Product | null>(() => {
    if (typeof window !== 'undefined') {
      const parsed = parseRoute(window.location.pathname);
      if (parsed.productId) {
        return storeDb.getProducts().find((p) => p.id === parsed.productId) || null;
      }
    }
    return null;
  });
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleOpenProductDetails = (product: Product) => {
    setActiveProductModal(product);
    const newPath = `/produto/${product.id}`;
    setCurrentPath(newPath);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', newPath);
    }
  };

  const handleCloseProductDetails = () => {
    setActiveProductModal(null);
    let fallbackPath = '/';
    if (selectedCategory && selectedCategory !== 'all') {
      fallbackPath = `/categoria/${selectedCategory}`;
    } else {
      fallbackPath = '/produtos';
    }
    setCurrentPath(fallbackPath);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', fallbackPath);
    }
  };

  const handleNavigate = (path: string) => {
    const parsed = parseRoute(path);
    setCurrentPath(parsed.path);
    if (parsed.categoryId) {
      setSelectedCategory(parsed.categoryId);
    } else if (parsed.path === '/produtos' || parsed.path === '/') {
      setSelectedCategory('all');
    }
    if (parsed.productId) {
      const p = storeDb.getProducts().find((prod) => prod.id === parsed.productId);
      if (p) {
        setActiveProductModal(p);
      }
    } else {
      setActiveProductModal(null);
    }
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', parsed.path);
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
  };

  useEffect(() => {
    const onPopState = () => {
      const parsed = parseRoute(window.location.pathname);
      setCurrentPath(parsed.path);
      if (parsed.categoryId) {
        setSelectedCategory(parsed.categoryId);
      }
      if (parsed.productId) {
        const found = storeDb.getProducts().find((p) => p.id === parsed.productId);
        if (found) {
          setActiveProductModal(found);
        } else {
          setActiveProductModal(null);
        }
      } else {
        setActiveProductModal(null);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // SEO Management for Home, Catalog, and Category views
  const isBasePage =
    currentPath === '/' ||
    currentPath === '/produtos' ||
    currentPath.startsWith('/categoria/');

  const currentCategory = useMemo(() => {
    if (selectedCategory && selectedCategory !== 'all') {
      return CATEGORIES.find((c) => c.id === selectedCategory);
    }
    return undefined;
  }, [selectedCategory]);

  const baseSeoProps = useMemo(() => {
    if (!isBasePage || activeProductModal || currentRoute.is404) {
      return null;
    }

    if (currentPath.startsWith('/categoria/') && currentCategory) {
      return {
        title: `${currentCategory.name} | ProSegurança Moçambique`,
        description: `Comprar ${currentCategory.name.toLowerCase()} em Moçambique com qualidade certificada e pronta entrega. ${currentCategory.description}`,
        canonicalPath: `/categoria/${currentCategory.id}`,
        category: currentCategory,
        breadcrumbs: [
          { name: 'Início', path: '/' },
          { name: 'Produtos', path: '/produtos' },
          { name: currentCategory.name, path: `/categoria/${currentCategory.id}` },
        ],
      };
    }

    if (currentPath === '/produtos') {
      return {
        title: 'Catálogo de EPIs e Equipamentos de Segurança | ProSegurança',
        description: 'Consulte o catálogo completo de Equipamentos de Proteção Individual (EPIs) em Moçambique. Capacetes, luvas, calçado de segurança e vestuário de proteção.',
        canonicalPath: '/produtos',
        breadcrumbs: [
          { name: 'Início', path: '/' },
          { name: 'Produtos', path: '/produtos' },
        ],
      };
    }

    // Default Home ('/')
    return {
      title: 'ProSegurança | Equipamentos de Segurança e EPI em Moçambique',
      description: 'Loja online de Equipamentos de Proteção Individual (EPI) em Moçambique. Calçado de segurança, capacetes, proteção respiratória, luvas e vestuário profissional.',
      canonicalPath: '/',
      breadcrumbs: [
        { name: 'Início', path: '/' },
      ],
    };
  }, [isBasePage, activeProductModal, currentRoute.is404, currentPath, currentCategory]);

  useSEO(baseSeoProps || { title: '', description: '' });

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('proseguranca_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cartItems]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  // Cart total calculations
  const totalCartCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const totalCartValue = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
  }, [cartItems]);

  // Cart actions
  const handleAddToCart = (
    product: Product,
    quantity = 1,
    selectedSize?: string,
    selectedColor?: string
  ) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedSize === selectedSize &&
          item.selectedColor === selectedColor
      );

      if (existingIndex > -1) {
        const copy = [...prev];
        copy[existingIndex].quantity += quantity;
        return copy;
      } else {
        return [
          ...prev,
          {
            product,
            quantity,
            selectedSize,
            selectedColor,
          },
        ];
      }
    });

    showToast(`${quantity}x "${product.name}" adicionado ao carrinho.`);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('Item removido do carrinho.');
  };

  const handleClearCart = () => {
    setCartItems([]);
    showToast('Carrinho limpo com sucesso.');
  };

  const handleProceedToCheckout = () => {
    setCartDrawerOpen(false);
    setCheckoutModalOpen(true);
  };

  const handleOrderCompleted = () => {
    // Keep cart or clear on confirmation
    setCheckoutModalOpen(false);
    showToast('Pedido preparado com sucesso para o WhatsApp!');
  };

  const handleExploreClick = () => {
    const el = document.getElementById('catalogo-produtos');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // If in Admin Portal route, render the isolated, protected Admin portal
  if (currentPath === '/admin') {
    return (
      <>
        <OfflineIndicator />
        <AdminPortal
          onNavigateToStore={() => handleNavigate('/')}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* PWA Smart Install Banner */}
      <PWAInstallBanner />

      {/* Offline Connectivity Indicator */}
      <OfflineIndicator />

      {/* PWA New Version Update Prompt */}
      <PWAUpdatePrompt />

      {/* Toast Notification */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

      {/* Main Navigation Header */}
      <Navbar
        cartCount={totalCartCount}
        cartTotal={totalCartValue}
        onOpenCart={() => setCartDrawerOpen(true)}
        onOpenQuoteModal={() => setQuoteModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectCategory={setSelectedCategory}
        selectedCategory={selectedCategory}
        currentPath={currentPath}
        onNavigate={handleNavigate}
      />

      {/* Main Content Areas based on current route */}
      <main className="flex-1">
        {currentRoute.is404 ? (
          <NotFoundPage
            onNavigate={handleNavigate}
            onSearch={(q) => {
              setSearchQuery(q);
              handleNavigate('/produtos');
            }}
            onSelectCategory={(catId) => {
              setSelectedCategory(catId);
              handleNavigate(`/categoria/${catId}`);
            }}
          />
        ) : currentPath === '/sobre-nos' ? (
          <AboutPage
            onNavigate={handleNavigate}
            onOpenQuoteModal={() => setQuoteModalOpen(true)}
          />
        ) : currentPath === '/vantagens' ? (
          <AdvantagesPage
            onNavigate={handleNavigate}
            onOpenQuoteModal={() => setQuoteModalOpen(true)}
          />
        ) : currentPath === '/contactos' ? (
          <ContactPage
            onNavigate={handleNavigate}
            onOpenQuoteModal={() => setQuoteModalOpen(true)}
          />
        ) : (
          <>
            {/* Hero Section */}
            {currentPath === '/' && (
              <Hero
                onExploreClick={handleExploreClick}
                onOpenQuoteModal={() => setQuoteModalOpen(true)}
              />
            )}

            {/* Featured Products Section (Main Showcase) */}
            <ProductCatalog
              products={products}
              selectedCategory={selectedCategory}
              onSelectCategory={(catId) => {
                setSelectedCategory(catId);
                if (catId === 'all') {
                  handleNavigate('/produtos');
                } else {
                  handleNavigate(`/categoria/${catId}`);
                }
              }}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onAddToCart={handleAddToCart}
              onViewProductDetails={handleOpenProductDetails}
            />
          </>
        )}
      </main>

      {/* Footer */}
      <Footer
        onSelectCategory={setSelectedCategory}
        onOpenQuoteModal={() => setQuoteModalOpen(true)}
        onNavigate={handleNavigate}
      />

      {/* Floating WhatsApp Action Button */}
      <FloatingWhatsApp />

      {/* Modals & Drawers */}
      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onProceedToCheckout={handleProceedToCheckout}
      />

      <WhatsAppCheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        items={cartItems}
        onOrderCompleted={handleOrderCompleted}
      />

      <ProductDetailModal
        product={activeProductModal}
        onClose={handleCloseProductDetails}
        onAddToCart={handleAddToCart}
        onOpenQuoteModal={() => setQuoteModalOpen(true)}
      />

      <QuoteModal
        isOpen={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
      />
    </div>
  );
}

