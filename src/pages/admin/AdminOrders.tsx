import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  Package, 
  Truck, 
  X, 
  Eye, 
  Phone, 
  MessageSquare, 
  MapPin, 
  Building2, 
  DollarSign, 
  Calendar, 
  User, 
  CreditCard,
  FileText,
  Printer,
  ChevronDown,
  AlertCircle
} from 'lucide-react';
import { Order, OrderStatus, PaymentStatus, PaymentMethod } from '../../types';
import { formatCurrency } from '../../utils/whatsapp';
import { storeDb } from '../../services/storeDb';

interface AdminOrdersProps {
  initialSelectedOrder?: Order | null;
  onClearInitialSelectedOrder?: () => void;
  showToast: (msg: string) => void;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({
  initialSelectedOrder,
  onClearInitialSelectedOrder,
  showToast,
}) => {
  const [orders, setOrders] = useState<Order[]>(() => storeDb.getOrders());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(initialSelectedOrder || null);

  const reloadOrders = () => {
    const list = storeDb.getOrders();
    setOrders(list);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchSearch =
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.phone.includes(searchQuery) ||
        (order.companyName && order.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        order.cityProvince.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === 'all' || order.orderStatus === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    storeDb.updateOrderStatus(orderId, newStatus);
    reloadOrders();
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({
        ...selectedOrder,
        orderStatus: newStatus,
        paymentStatus: newStatus === 'paid' ? 'paid' : selectedOrder.paymentStatus,
      });
    }
    showToast(`Estado do pedido atualizado para "${getStatusLabel(newStatus)}"`);
  };

  const handleUpdatePaymentStatus = (orderId: string, newStatus: PaymentStatus) => {
    storeDb.updatePaymentStatus(orderId, newStatus);
    reloadOrders();
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({
        ...selectedOrder,
        paymentStatus: newStatus,
      });
    }
    showToast(`Estado de pagamento atualizado.`);
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case 'awaiting_payment':
        return 'Aguardando Pagamento';
      case 'paid':
        return 'Pago';
      case 'in_preparation':
        return 'Em Preparação';
      case 'shipped':
        return 'Enviado';
      case 'delivered':
        return 'Entregue';
      case 'cancelled':
        return 'Cancelado';
    }
  };

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
            Enviado
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

  const getPaymentMethodBadge = (method: PaymentMethod) => {
    switch (method) {
      case 'mpesa':
        return <span className="font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 text-[10px]">M-Pesa</span>;
      case 'emola':
        return <span className="font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20 text-[10px]">e-Mola</span>;
      case 'transfer':
        return <span className="font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 text-[10px]">BIM/BCI</span>;
      case 'cash_delivery':
        return <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-[10px]">POS/Entrega</span>;
      case 'visa':
        return <span className="font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 text-[10px]">Visa</span>;
      default:
        return <span className="text-slate-400 text-[10px]">{method}</span>;
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

  const openWhatsAppNotification = (order: Order) => {
    const cleanPhone = order.phone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('258') ? cleanPhone : `258${cleanPhone}`;
    const statusText = getStatusLabel(order.orderStatus);
    const msg = encodeURIComponent(
      `Olá ${order.customerName},\n\nInformamos que o seu pedido *${order.orderNumber}* na *ProSegurança* foi atualizado para o estado: *${statusText}*.\n\nValor total: *${formatCurrency(order.totalAmount)}*\n\nEstamos à disposição para qualquer esclarecimento!\nProSegurança Moçambique`
    );
    window.open(`https://wa.me/${phoneWithCountry}?text=${msg}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShoppingBag className="w-4 h-4" />
            <span>Processamento & Vendas</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Gestão de Pedidos
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Acompanhe pagamentos, altere estados de preparação e envie atualizações via WhatsApp para os clientes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
            Total: <strong className="text-amber-400">{orders.length} pedidos</strong>
          </div>
        </div>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="space-y-3">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'Todos os Pedidos' },
            { id: 'awaiting_payment', label: 'Aguardando Pagamento' },
            { id: 'paid', label: 'Pagos' },
            { id: 'in_preparation', label: 'Em Preparação' },
            { id: 'shipped', label: 'Enviados' },
            { id: 'delivered', label: 'Entregues' },
            { id: 'cancelled', label: 'Cancelados' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-lg flex items-center justify-between gap-3">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Pesquisar por nº pedido, cliente, telefone ou província..."
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

          <div className="text-xs text-slate-400 hidden sm:block">
            A apresentar <strong>{filteredOrders.length}</strong> de {orders.length} pedidos
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/70 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Nº Pedido</th>
                <th className="py-3.5 px-3">Cliente / Empresa</th>
                <th className="py-3.5 px-3">Contacto / WhatsApp</th>
                <th className="py-3.5 px-3">Data</th>
                <th className="py-3.5 px-3">Valor Total</th>
                <th className="py-3.5 px-3">Método</th>
                <th className="py-3.5 px-3">Estado do Pedido</th>
                <th className="py-3.5 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-500">
                    <div className="max-w-sm mx-auto flex flex-col items-center gap-2">
                      <ShoppingBag className="w-10 h-10 text-slate-600 stroke-[1.5]" />
                      <div className="text-slate-300 font-bold text-sm">Nenhum pedido registado ainda</div>
                      <div className="text-xs text-slate-500 leading-normal">
                        {searchQuery || statusFilter !== 'all'
                          ? 'Nenhum pedido corresponde aos filtros ou pesquisa selecionada.'
                          : 'Assim que um cliente realizar uma compra pelo WhatsApp ou checkout, o pedido aparecerá aqui automaticamente.'}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    {/* Order Number */}
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                      {order.orderNumber}
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-white">{order.customerName}</div>
                      {order.companyName && (
                        <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                          {order.companyName}
                        </div>
                      )}
                    </td>

                    {/* Phone */}
                    <td className="py-3.5 px-3 text-slate-300 font-mono">
                      {order.phone}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-3 text-slate-400 whitespace-nowrap">
                      {formatDate(order.createdAt)}
                    </td>

                    {/* Total */}
                    <td className="py-3.5 px-3 font-black text-white whitespace-nowrap">
                      {formatCurrency(order.totalAmount)}
                    </td>

                    {/* Payment Method */}
                    <td className="py-3.5 px-3">
                      {getPaymentMethodBadge(order.paymentMethod)}
                    </td>

                    {/* Order Status */}
                    <td className="py-3.5 px-3">
                      {getOrderStatusBadge(order.orderStatus)}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(order);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-amber-400 border border-slate-700 text-xs font-semibold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-400/15 text-amber-400 flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-white font-mono">
                      {selectedOrder.orderNumber}
                    </h3>
                    {getOrderStatusBadge(selectedOrder.orderStatus)}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Registado em {formatDate(selectedOrder.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Imprimir Pedido"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setSelectedOrder(null);
                    if (onClearInitialSelectedOrder) onClearInitialSelectedOrder();
                  }}
                  className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-7 max-h-[75vh] overflow-y-auto space-y-6">
              
              {/* Order Status Management Section */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5">
                    Alterar Estado do Pedido
                  </label>
                  <select
                    value={selectedOrder.orderStatus}
                    onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, e.target.value as OrderStatus)}
                    className="w-full text-xs font-bold bg-slate-900 text-amber-400 px-3 py-2.5 rounded-xl border border-amber-500/30 focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="awaiting_payment">Aguardando Pagamento</option>
                    <option value="paid">Pago (Confirmado)</option>
                    <option value="in_preparation">Em Preparação</option>
                    <option value="shipped">Enviado / Em Trânsito</option>
                    <option value="delivered">Entregue com Sucesso</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5">
                    Estado do Pagamento
                  </label>
                  <select
                    value={selectedOrder.paymentStatus}
                    onChange={(e) => handleUpdatePaymentStatus(selectedOrder.id, e.target.value as PaymentStatus)}
                    className="w-full text-xs font-bold bg-slate-900 text-emerald-400 px-3 py-2.5 rounded-xl border border-emerald-500/30 focus:outline-none focus:border-emerald-400 cursor-pointer"
                  >
                    <option value="pending">Pendente</option>
                    <option value="paid">Pago</option>
                    <option value="failed">Falhou / Não Efetuado</option>
                    <option value="refunded">Reembolsado</option>
                  </select>
                </div>
              </div>

              {/* Customer & Delivery Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Customer Box */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    <span>Dados do Cliente</span>
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">{selectedOrder.customerName}</div>
                    {selectedOrder.companyName && (
                      <div className="text-xs text-amber-400 font-semibold">{selectedOrder.companyName}</div>
                    )}
                  </div>
                  <div className="space-y-1 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>{selectedOrder.phone}</span>
                    </div>
                    {selectedOrder.email && (
                      <div className="text-slate-400">{selectedOrder.email}</div>
                    )}
                  </div>

                  <button
                    onClick={() => openWhatsAppNotification(selectedOrder)}
                    className="mt-2 w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 fill-white/20" />
                    <span>Notificar via WhatsApp</span>
                  </button>
                </div>

                {/* Delivery & Payment Box */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>Entrega & Pagamento</span>
                  </div>
                  <div className="text-xs space-y-1.5 text-slate-300">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">Província / Cidade:</span>
                      <strong className="text-white">{selectedOrder.cityProvince}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">Endereço de Entrega:</span>
                      <span>{selectedOrder.deliveryLocation}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">Método Escolhido:</span>
                      {getPaymentMethodBadge(selectedOrder.paymentMethod)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Itens do Pedido ({selectedOrder.items.length})
                </h4>

                <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950/60">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 border-b border-slate-800 text-[11px] text-slate-400 uppercase">
                      <tr>
                        <th className="py-2.5 px-3">Item</th>
                        <th className="py-2.5 px-3">Preço Unit.</th>
                        <th className="py-2.5 px-3">Qtd</th>
                        <th className="py-2.5 px-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {selectedOrder.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-10 h-10 rounded-lg bg-white p-1 flex-shrink-0 flex items-center justify-center">
                                <img src={item.productImage} alt={item.productName} className="w-full h-full object-contain" />
                              </div>
                              <div>
                                <div className="font-bold text-white">{item.productName}</div>
                                {(item.selectedSize || item.selectedColor) && (
                                  <div className="text-[10px] text-amber-400">
                                    {item.selectedSize ? `Tam: ${item.selectedSize}` : ''}
                                    {item.selectedSize && item.selectedColor ? ' • ' : ''}
                                    {item.selectedColor ? `Cor: ${item.selectedColor}` : ''}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-slate-300">
                            {formatCurrency(item.price)}
                          </td>
                          <td className="py-3 px-3 font-bold text-white">
                            {item.quantity} un.
                          </td>
                          <td className="py-3 px-3 text-right font-black text-amber-400">
                            {formatCurrency(item.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Notes & Total Summary */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-800">
                <div className="text-xs text-slate-400 max-w-sm">
                  {selectedOrder.notes ? (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <strong className="text-slate-300 block mb-1">Notas do Pedido:</strong>
                      {selectedOrder.notes}
                    </div>
                  ) : (
                    <span className="italic text-slate-500">Sem observações adicionais.</span>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Total a Pagar:</span>
                  <span className="text-2xl font-black text-white font-mono">
                    {formatCurrency(selectedOrder.totalAmount)}
                  </span>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                ID do Sistema: {selectedOrder.id}
              </span>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
