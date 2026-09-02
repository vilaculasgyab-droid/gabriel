import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Phone, 
  MessageSquare, 
  Mail, 
  Building2, 
  MapPin, 
  ShoppingBag, 
  DollarSign, 
  Calendar, 
  X, 
  Eye, 
  ChevronRight,
  TrendingUp,
  Award,
  ExternalLink
} from 'lucide-react';
import { Customer, Order } from '../../types';
import { formatCurrency } from '../../utils/whatsapp';
import { storeDb } from '../../services/storeDb';

interface AdminCustomersProps {
  onViewOrderDetails?: (order: Order) => void;
  showToast: (msg: string) => void;
}

export const AdminCustomers: React.FC<AdminCustomersProps> = ({ onViewOrderDetails, showToast }) => {
  const [customers, setCustomers] = useState<Customer[]>(() => storeDb.getCustomers());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const q = searchQuery.toLowerCase();
      return (
        customer.name.toLowerCase().includes(q) ||
        customer.phone.includes(searchQuery) ||
        (customer.email && customer.email.toLowerCase().includes(q)) ||
        (customer.companyName && customer.companyName.toLowerCase().includes(q)) ||
        customer.cityProvince.toLowerCase().includes(q)
      );
    });
  }, [customers, searchQuery]);

  const customerOrders = useMemo(() => {
    if (!selectedCustomer) return [];
    const allOrders = storeDb.getOrders();
    const cleanPhone = selectedCustomer.phone.replace(/\D/g, '');
    return allOrders.filter(
      (o) =>
        o.phone.replace(/\D/g, '') === cleanPhone ||
        o.customerName.toLowerCase().trim() === selectedCustomer.name.toLowerCase().trim()
    );
  }, [selectedCustomer]);

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('pt-MZ', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  const openCustomerWhatsApp = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('258') ? cleanPhone : `258${cleanPhone}`;
    const msg = encodeURIComponent(
      `Olá ${name},\nEntramos em contacto a partir da ProSegurança Moçambique. Como podemos ajudar com as suas necessidades de EPIs e equipamentos industriais?`
    );
    window.open(`https://wa.me/${phoneWithCountry}?text=${msg}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Gestão de Relacionamento (CRM)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Clientes & Empresas
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Visualize o histórico de compras, contactos directos de WhatsApp e volume de investimento por cliente.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
            Total de Clientes: <strong className="text-amber-400">{customers.length}</strong>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-lg flex items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar por nome, empresa, telefone ou província..."
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
          A apresentar <strong>{filteredCustomers.length}</strong> de {customers.length} clientes
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/70 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Cliente / Responsável</th>
                <th className="py-3.5 px-3">Empresa / Província</th>
                <th className="py-3.5 px-3">Telefone & WhatsApp</th>
                <th className="py-3.5 px-3">E-mail</th>
                <th className="py-3.5 px-3">Nº Pedidos</th>
                <th className="py-3.5 px-3">Total Gasto</th>
                <th className="py-3.5 px-3">Último Pedido</th>
                <th className="py-3.5 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    Nenhum cliente registado.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    onClick={() => setSelectedCustomer(customer)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    {/* Name */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-800 text-amber-400 font-bold flex items-center justify-center text-xs">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <span>{customer.name}</span>
                      </div>
                    </td>

                    {/* Company / City */}
                    <td className="py-3.5 px-3">
                      <div className="text-slate-200 font-semibold">
                        {customer.companyName || 'Particular / Individual'}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>{customer.cityProvince}</span>
                      </div>
                    </td>

                    {/* Phone & WhatsApp */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5 font-mono text-slate-300">
                        <Phone className="w-3 h-3 text-slate-500" />
                        <span>{customer.phone}</span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-3 text-slate-400">
                      {customer.email || '—'}
                    </td>

                    {/* Total Orders */}
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 font-bold text-slate-200 text-xs">
                        <ShoppingBag className="w-3 h-3 text-amber-400" />
                        {customer.totalOrders}
                      </span>
                    </td>

                    {/* Total Spent */}
                    <td className="py-3.5 px-3 font-black text-white whitespace-nowrap">
                      {formatCurrency(customer.totalSpent)}
                    </td>

                    {/* Last Order Date */}
                    <td className="py-3.5 px-3 text-slate-400 whitespace-nowrap">
                      {formatDate(customer.lastOrderDate)}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCustomer(customer);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-amber-400 border border-slate-700 text-xs font-semibold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Histórico</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Profile & History Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6">
            
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 font-black text-lg flex items-center justify-center shadow-lg">
                  {selectedCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">
                    {selectedCustomer.name}
                  </h3>
                  <div className="text-xs text-amber-400 font-semibold">
                    {selectedCustomer.companyName || 'Cliente Individual'} • {selectedCustomer.cityProvince}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-7 max-h-[75vh] overflow-y-auto space-y-6">
              
              {/* Stats Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="text-[11px] text-slate-400 font-bold uppercase">Total Investido em EPIs</div>
                  <div className="text-xl font-black text-white mt-1">
                    {formatCurrency(selectedCustomer.totalSpent)}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="text-[11px] text-slate-400 font-bold uppercase">Total de Encomendas</div>
                  <div className="text-xl font-black text-amber-400 mt-1">
                    {selectedCustomer.totalOrders} pedidos
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="text-[11px] text-slate-400 font-bold uppercase">Primeira Compra</div>
                  <div className="text-base font-bold text-slate-300 mt-1">
                    {formatDate(selectedCustomer.firstOrderDate)}
                  </div>
                </div>
              </div>

              {/* Direct Contact Row */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-400" />
                    <span className="font-mono font-bold text-white">{selectedCustomer.phone}</span>
                  </div>
                  {selectedCustomer.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-400" />
                      <span>{selectedCustomer.email}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => openCustomerWhatsApp(selectedCustomer.phone, selectedCustomer.name)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 fill-white/20" />
                  <span>Conversar no WhatsApp</span>
                </button>
              </div>

              {/* Orders History Timeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Histórico de Pedidos ({customerOrders.length})
                </h4>

                <div className="space-y-2.5">
                  {customerOrders.length === 0 ? (
                    <div className="p-6 rounded-2xl bg-slate-950 text-center text-xs text-slate-500">
                      Nenhum detalhe de pedido encontrado.
                    </div>
                  ) : (
                    customerOrders.map((order) => (
                      <div
                        key={order.id}
                        className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-amber-400 text-sm">
                              {order.orderNumber}
                            </span>
                            <span className="text-slate-500">•</span>
                            <span className="text-xs text-slate-400">
                              {formatDate(order.createdAt)}
                            </span>
                          </div>
                          <div className="text-xs text-slate-300 mt-1">
                            {order.items.map((it) => `${it.quantity}x ${it.productName}`).join(', ')}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-sm font-black text-white">
                              {formatCurrency(order.totalAmount)}
                            </div>
                            <div className="text-[10px] text-slate-400 capitalize">
                              {order.orderStatus.replace('_', ' ')}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
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
