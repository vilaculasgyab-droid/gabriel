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
import { AboutPage } from './pages/AboutPage';
import { AdvantagesPage } from './pages/AdvantagesPage';
import { ContactPage } from './pages/ContactPage';
import { AdminPortal } from './pages/admin/AdminPortal';

export default function App() {
  // Routing state
  const getValidPath = (pathname: string) => {
    if (!pathname) return '/';
    // Normalize path by stripping query parameters and trailing slashes
    const normalized = pathname.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
    if (normalized === '/admin' || normalized.startsWith('/admin/')) {
      return '/admin';
    }
    if (
      normalized === '/sobre-nos' ||
      normalized === '/vantagens' ||
      normalized === '/contactos' ||
      normalized === '/produtos' ||
      normalized === '/categorias'
    ) {
      return normalized;
    }
    return '/';
  };

  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return getValidPath(window.location.pathname);
    }
    return '/';
  });

  // Dynamic Products state synchronized with storeDb
  const [products, setProducts] = useState<Product[]>(() => storeDb.getProducts());

  useEffect(() => {
    const unsubscribe = storeDb.subscribe(() => {
      setProducts(storeDb.getProducts());
    });
    return () => unsubscribe();
  }, []);

  const handleNavigate = (path: string) => {
    const validPath = getValidPath(path);
    setCurrentPath(validPath);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', validPath);
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
  };

  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(getValidPath(window.location.pathname));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeProductModal, setActiveProductModal] = useState<Product | null>(null);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
      <AdminPortal
        onNavigateToStore={() => handleNavigate('/')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
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
        {currentPath === '/sobre-nos' ? (
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
            <Hero
              onExploreClick={handleExploreClick}
              onOpenQuoteModal={() => setQuoteModalOpen(true)}
            />

            {/* Featured Products Section (Main Showcase) */}
            <ProductCatalog
              products={products}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onAddToCart={handleAddToCart}
              onViewProductDetails={(p) => setActiveProductModal(p)}
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
        onClose={() => setActiveProductModal(null)}
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

