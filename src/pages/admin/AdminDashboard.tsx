import React from 'react';
import { 
  DollarSign, 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  Package, 
  AlertTriangle, 
  Users, 
  ArrowUpRight, 
  TrendingUp, 
  Plus, 
  Search, 
  ExternalLink,
  Truck,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Eye
} from 'lucide-react';
import { DashboardMetrics, Order, OrderStatus, PaymentStatus } from '../../types';
import { formatCurrency } from '../../utils/whatsapp';
import { AdminTab } from './AdminLayout';

interface AdminDashboardProps {
  metrics: DashboardMetrics;
  onNavigateTab: (tab: AdminTab) => void;
  onViewOrderDetails: (order: Order) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  metrics,
  onNavigateTab,
  onViewOrderDetails,
}) => {
  const getOrderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'awaiting_payment':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[11px] font-bold">
            <Clock className="w-3 h-3" />
            Aguardando Pagamento
          </span>
        );
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
            <CheckCircle2 className="w-3 h-3" />
            Pago
          </span>
        );
      case 'in_preparation':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[11px] font-bold">
            <Package className="w-3 h-3" />
            Em Preparação
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-400 text-[11px] font-bold">
            <Truck className="w-3 h-3" />
            Enviado / Em Trânsito
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold">
            <CheckCircle2 className="w-3 h-3" />
            Entregue
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-[11px] font-bold">
            Cancelado
          </span>
        );
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('pt-MZ', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Painel de Controlo • ProSegurança Moçambique</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Resumo Geral das Operações
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Acompanhe pedidos em tempo real, fluxo de receita, disponibilidade de stock e encomendas de EPIs.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => onNavigateTab('products')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Gerir / Adicionar Produto</span>
          </button>
          <button
            onClick={() => onNavigateTab('orders')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span>Ver Todos os Pedidos</span>
          </button>
        </div>
      </div>

      {/* 6 Key Statistics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        
        {/* Total Revenue */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400">Receita Total</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-white leading-tight">
              {formatCurrency(metrics.totalRevenue)}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>Moeda Metical (MT)</span>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400">Total de Pedidos</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white leading-tight">
              {metrics.totalOrders}
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">
              Registados no sistema
            </div>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400">Pedidos Pendentes</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-amber-400 leading-tight">
              {metrics.pendingOrders}
            </div>
            <div className="text-[11px] text-amber-400/80 font-medium mt-1">
              Aguardando pagamento
            </div>
          </div>
        </div>

        {/* Paid Orders */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400">Pedidos Pagos</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-400 leading-tight">
              {metrics.paidOrders}
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">
              Confirmados / Processados
            </div>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400">Total de Produtos</span>
            <div className="w-8 h-8 rounded-xl bg-yellow-500/15 text-yellow-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white leading-tight">
              {metrics.totalProducts}
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">
              No catálogo ativo
            </div>
          </div>
        </div>

        {/* Out of Stock Alert */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400">Sem Stock / Baixo</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              metrics.outOfStockCount > 0 ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-slate-800 text-slate-400'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className={`text-2xl font-black leading-tight ${
              metrics.outOfStockCount > 0 ? 'text-red-400' : 'text-slate-300'
            }`}>
              {metrics.outOfStockCount}
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">
              {metrics.lowStockCount > 0 ? `+ ${metrics.lowStockCount} c/ stock baixo` : 'Necessitam reposição'}
            </div>
          </div>
        </div>

      </div>

      {/* Main Grid: Recent Sales & Operations Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Recent Orders Table (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900 rounded-3xl border border-slate-800 p-5 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                <span>Resumo das Vendas Recentes</span>
              </h2>
              <p className="text-xs text-slate-400">
                Últimos pedidos registados através da loja e WhatsApp
              </p>
            </div>

            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/60 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3 rounded-l-xl">Nº Pedido</th>
                  <th className="py-3 px-3">Cliente</th>
                  <th className="py-3 px-3">Data</th>
                  <th className="py-3 px-3">Valor Total</th>
                  <th className="py-3 px-3">Estado</th>
                  <th className="py-3 px-3 text-right rounded-r-xl">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {metrics.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      Nenhum pedido registado ainda.
                    </td>
                  </tr>
                ) : (
                  metrics.recentOrders.map((order) => (
                    <tr 
                      key={order.id} 
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => onViewOrderDetails(order)}
                    >
                      <td className="py-3.5 px-3 font-mono font-bold text-amber-400">
                        {order.orderNumber}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-white">{order.customerName}</div>
                        {order.companyName && (
                          <div className="text-[10px] text-slate-400">{order.companyName}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-slate-400">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="py-3.5 px-3 font-black text-slate-100">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="py-3.5 px-3">
                        {getOrderStatusBadge(order.orderStatus)}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewOrderDetails(order);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition-colors"
                          title="Ver Detalhes do Pedido"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Quick Controls & Payment Gateways Readiness (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Quick Shortcuts */}
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>Ações Rápidas</span>
            </h3>

            <div className="space-y-2">
              <button
                onClick={() => onNavigateTab('products')}
                className="w-full p-3 rounded-2xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 text-left flex items-center justify-between transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-amber-400">
                      Atualizar Stock de EPIs
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Modificar quantidades e preços
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => onNavigateTab('orders')}
                className="w-full p-3 rounded-2xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 text-left flex items-center justify-between transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-400/10 text-emerald-400 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-emerald-400">
                      Processar Encomendas
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Alterar estado e notificar cliente
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => onNavigateTab('customers')}
                className="w-full p-3 rounded-2xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 text-left flex items-center justify-between transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-400/10 text-blue-400 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-blue-400">
                      Histórico de Empresas
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Total gasto e contacto WhatsApp
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Payment Gateways Integration Status */}
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 sm:p-6 shadow-xl">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Preparação para Pagamentos Moçambique</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="font-bold text-slate-200">M-Pesa Moçambique</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Pronto p/ API
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="font-bold text-slate-200">E-Mola Movitel</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Pronto p/ API
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  <span className="font-bold text-slate-200">Cartões Visa / Master</span>
                </div>
                <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  Estrutura Ativa
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
