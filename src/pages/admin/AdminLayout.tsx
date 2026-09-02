import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  Settings, 
  LogOut, 
  ExternalLink, 
  Menu, 
  X, 
  ShieldCheck, 
  Bell, 
  Search, 
  ChevronRight,
  Sparkles,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { AdminUser, DashboardMetrics } from '../../types';
import { ProSegurancaLogo } from '../../components/CategoryIcon';

export type AdminTab = 'dashboard' | 'products' | 'orders' | 'customers' | 'settings';

interface AdminLayoutProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  adminUser: AdminUser | null;
  metrics: DashboardMetrics;
  onLogout: () => void;
  onNavigateToStore: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  activeTab,
  onTabChange,
  adminUser,
  metrics,
  onLogout,
  onNavigateToStore,
  children,
}) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const navItems: { id: AdminTab; label: string; icon: React.ElementType; badge?: number; badgeColor?: string }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard Geral',
      icon: LayoutDashboard,
    },
    {
      id: 'products',
      label: 'Gestão de Produtos & Stock',
      icon: Package,
      badge: metrics.outOfStockCount > 0 ? metrics.outOfStockCount : undefined,
      badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30',
    },
    {
      id: 'orders',
      label: 'Gestão de Pedidos',
      icon: ShoppingBag,
      badge: metrics.pendingOrders > 0 ? metrics.pendingOrders : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    },
    {
      id: 'customers',
      label: 'Clientes & Empresas',
      icon: Users,
      badge: metrics.totalCustomers > 0 ? metrics.totalCustomers : undefined,
      badgeColor: 'bg-slate-700 text-slate-300 border-slate-600',
    },
    {
      id: 'settings',
      label: 'Definições & Segurança',
      icon: Settings,
    },
  ];

  const handleSelectTab = (tab: AdminTab) => {
    onTabChange(tab);
    setMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          
          {/* Left section: Mobile toggle & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              aria-label="Abrir Menu Lateral"
            >
              {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSelectTab('dashboard')}>
              <ProSegurancaLogo inverted={true} />
              <div className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-400/30 text-amber-400 text-[10px] font-black uppercase tracking-wider">
                ADMIN
              </div>
            </div>
          </div>

          {/* Right section: Store link, notification, profile & logout */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Direct Link to Public Store */}
            <button
              onClick={onNavigateToStore}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-amber-400 text-xs font-semibold border border-slate-700 transition-all cursor-pointer shadow-sm"
              title="Ir para a loja pública"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ver Loja Pública</span>
              <span className="sm:hidden">Loja</span>
            </button>

            {/* Admin Profile Details */}
            <div className="hidden md:flex items-center gap-2.5 pl-3 border-l border-slate-800">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-md">
                AD
              </div>
              <div className="text-left text-xs">
                <div className="font-bold text-white leading-tight">
                  {adminUser?.name || 'Administrador'}
                </div>
                <div className="text-[10px] text-amber-400 font-medium">
                  {adminUser?.email || 'admin@proseguranca.co.mz'}
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Terminar Sessão Segura"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Container with Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Desktop Left Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-slate-800 p-4 justify-between flex-shrink-0">
          <div className="space-y-6">
            
            {/* Quick status widget */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-400 font-semibold">Sistema</span>
                <span className="flex items-center gap-1 text-emerald-400 font-bold text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Operacional
                </span>
              </div>
              <div className="text-[11px] text-slate-300 font-medium">
                Moçambique • Meticais (MT)
              </div>
            </div>

            {/* Nav Menu */}
            <nav className="space-y-1.5">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 px-3 mb-2">
                Módulos Principais
              </div>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full border font-black ${
                          isActive
                            ? 'bg-slate-950 text-amber-400 border-slate-900'
                            : item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

          </div>

          {/* Sidebar Footer info */}
          <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5 text-slate-400 font-semibold mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>ProSegurança v2.4</span>
            </div>
            <div>Gestão de EPIs e Cotações</div>
          </div>
        </aside>

        {/* Mobile Drawer Sidebar */}
        {mobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm flex">
            <div className="w-72 bg-slate-900 h-full p-5 border-r border-slate-800 flex flex-col justify-between animate-in slide-in-from-left duration-200">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ProSegurancaLogo inverted={true} />
                  </div>
                  <button
                    onClick={() => setMobileSidebarOpen(false)}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <div className="font-bold text-white">{adminUser?.name}</div>
                  <div className="text-[11px] text-amber-400">{adminUser?.email}</div>
                </div>

                <nav className="space-y-1.5">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelectTab(item.id)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-amber-400 text-slate-950'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge !== undefined && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-950 text-amber-400 border border-slate-800">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
                <button
                  onClick={onNavigateToStore}
                  className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Ver Loja Pública</span>
                </button>
                <button
                  onClick={onLogout}
                  className="w-full py-2.5 rounded-xl bg-red-500/10 text-red-400 text-xs font-bold flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Terminar Sessão</span>
                </button>
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileSidebarOpen(false)} />
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 bg-slate-950 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
};
