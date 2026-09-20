import React, { useState, useEffect, useCallback } from 'react';
import { authService } from '../../services/authService';
import { storeDb } from '../../services/storeDb';
import { AdminUser, DashboardMetrics, Order } from '../../types';
import { AdminLogin } from './AdminLogin';
import { AdminLayout, AdminTab } from './AdminLayout';
import { AdminDashboard } from './AdminDashboard';
import { AdminProducts } from './AdminProducts';
import { AdminOrders } from './AdminOrders';
import { AdminCustomers } from './AdminCustomers';
import { AdminSettings } from './AdminSettings';
import { ErrorBoundary } from '../../components/admin/ErrorBoundary';
import { FortiMozLogo } from '../../components/CategoryIcon';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { useSEO } from '../../hooks/useSEO';
import { getSafeErrorMessage } from '../../utils/error';

interface AdminPortalProps {
  onNavigateToStore: () => void;
  initialTab?: AdminTab;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  onNavigateToStore,
  initialTab = 'dashboard',
}) => {
  // Admin route MUST have strict noindex, nofollow to protect administrative areas
  useSEO({
    title: 'Portal Administrativo | FortiMoz',
    description: 'Área de administração restrita e gestão de encomendas da FortiMoz.',
    canonicalPath: '/admin',
    noindex: true,
  });

  const [isCheckingSession, setIsCheckingSession] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => authService.isAuthenticated());
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => authService.getAdminUser());
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const [metrics, setMetrics] = useState<DashboardMetrics>(() => storeDb.getDashboardMetrics());
  
  // Specific order selected from Dashboard to view in Orders tab
  const [selectedOrderToView, setSelectedOrderToView] = useState<Order | null>(null);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: unknown) => {
    const safeMsg = getSafeErrorMessage(msg, 'Notificação');
    setToastMessage(safeMsg);
    setTimeout(() => {
      setToastMessage((current) => (current === safeMsg ? null : current));
    }, 4000);
  }, []);

  const refreshMetrics = useCallback(() => {
    setMetrics(storeDb.getDashboardMetrics());
  }, []);

  useEffect(() => {
    // Verificar e sincronizar sessão ativa com Supabase Auth
    authService
      .checkSession()
      .then((user) => {
        if (user) {
          setIsAuthenticated(true);
          setAdminUser(user);
        } else {
          setIsAuthenticated(false);
          setAdminUser(null);
        }
      })
      .catch((err) => {
        console.warn('[AdminPortal] Aviso ao sincronizar sessão inicial:', err);
        setIsAuthenticated(false);
        setAdminUser(null);
      })
      .finally(() => {
        setIsCheckingSession(false);
      });

    // Subscrever a eventos de alteração de autenticação via onAuthStateChange
    const unsubAuth = authService.subscribeAuthState((user) => {
      if (user) {
        setIsAuthenticated(true);
        setAdminUser(user);
      } else {
        setIsAuthenticated(false);
        setAdminUser(null);
      }
    });

    // Subscribe to changes in storeDb
    const unsubscribeDb = storeDb.subscribe(() => {
      refreshMetrics();
    });

    return () => {
      unsubAuth();
      unsubscribeDb();
    };
  }, [refreshMetrics]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setAdminUser(authService.getAdminUser());
    refreshMetrics();
    showToast('Sessão de administrador iniciada com sucesso.');
  };

  const handleLogout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
    setAdminUser(null);
    showToast('Sessão terminada em segurança.');
  };

  const handleProfileUpdated = () => {
    setAdminUser(authService.getAdminUser());
  };

  const handleViewOrderDetailsFromDashboard = (order: Order) => {
    setSelectedOrderToView(order);
    setActiveTab('orders');
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <FortiMozLogo className="h-10 w-auto animate-pulse" />
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <span>A carregar painel de gestão...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AdminLogin
        onLoginSuccess={handleLoginSuccess}
        onNavigateToStore={onNavigateToStore}
      />
    );
  }

  return (
    <div className="relative">
      {/* Toast Overlay */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom duration-300 pointer-events-none">
          <div className="bg-slate-900 border border-amber-400/40 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-xl">
            <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <span className="text-xs font-semibold">{toastMessage}</span>
          </div>
        </div>
      )}

      <AdminLayout
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab !== 'orders') {
            setSelectedOrderToView(null);
          }
        }}
        adminUser={adminUser}
        metrics={metrics}
        onLogout={handleLogout}
        onNavigateToStore={onNavigateToStore}
      >
        <ErrorBoundary
          fallbackTitle="Ocorreu um erro ao carregar o Painel Administrativo."
          fallbackMessage="Não foi possível renderizar este módulo do painel. Clique em Tentar Novamente para restaurar a visualização."
          onReset={refreshMetrics}
          showHomeButton={false}
        >
          {activeTab === 'dashboard' && (
            <AdminDashboard
              metrics={metrics}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onViewOrderDetails={handleViewOrderDetailsFromDashboard}
            />
          )}

          {activeTab === 'products' && (
            <AdminProducts
              onProductChanged={refreshMetrics}
              showToast={showToast}
            />
          )}

          {activeTab === 'orders' && (
            <AdminOrders
              initialSelectedOrder={selectedOrderToView}
              onClearInitialSelectedOrder={() => setSelectedOrderToView(null)}
              showToast={showToast}
            />
          )}

          {activeTab === 'customers' && (
            <AdminCustomers
              onViewOrderDetails={handleViewOrderDetailsFromDashboard}
              showToast={showToast}
            />
          )}

          {activeTab === 'settings' && (
            <AdminSettings
              adminUser={adminUser}
              onProfileUpdated={handleProfileUpdated}
              showToast={showToast}
            />
          )}
        </ErrorBoundary>
      </AdminLayout>
    </div>
  );
};
