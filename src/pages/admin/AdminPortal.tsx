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
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface AdminPortalProps {
  onNavigateToStore: () => void;
  initialTab?: AdminTab;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  onNavigateToStore,
  initialTab = 'dashboard',
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => authService.isAuthenticated());
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => authService.getAdminUser());
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const [metrics, setMetrics] = useState<DashboardMetrics>(() => storeDb.getDashboardMetrics());
  
  // Specific order selected from Dashboard to view in Orders tab
  const [selectedOrderToView, setSelectedOrderToView] = useState<Order | null>(null);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 4000);
  }, []);

  const refreshMetrics = useCallback(() => {
    setMetrics(storeDb.getDashboardMetrics());
  }, []);

  useEffect(() => {
    // Subscribe to changes in storeDb
    const unsubscribe = storeDb.subscribe(() => {
      refreshMetrics();
    });
    return () => unsubscribe();
  }, [refreshMetrics]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setAdminUser(authService.getAdminUser());
    refreshMetrics();
    showToast('Sessão de administrador iniciada com sucesso.');
  };

  const handleLogout = () => {
    authService.logout();
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
      </AdminLayout>
    </div>
  );
};
