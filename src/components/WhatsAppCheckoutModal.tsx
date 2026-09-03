import React, { useState } from 'react';
import { CartItem, CheckoutFormData } from '../types';
import { 
  X, 
  MessageSquare, 
  Mail,
  Check, 
  Copy, 
  Truck, 
  User, 
  Phone, 
  Building2, 
  MapPin, 
  CreditCard, 
  Send,
  Sparkles,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { 
  formatCurrency, 
  buildWhatsAppOrderMessage, 
  getWhatsAppOrderUrl, 
  getOrderEmailUrl,
  WHATSAPP_PHONE_DISPLAY, 
  WHATSAPP_PHONE_RAW,
  EMAIL_DISPLAY
} from '../utils/whatsapp';
import { storeDb } from '../services/storeDb';

interface WhatsAppCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onOrderCompleted?: () => void;
}

export const WhatsAppCheckoutModal: React.FC<WhatsAppCheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  onOrderCompleted,
}) => {
  if (!isOpen) return null;

  const totalAmount = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const [formData, setFormData] = useState<CheckoutFormData>({
    customerName: '',
    phone: '',
    companyName: '',
    deliveryLocation: '',
    cityProvince: 'Maputo Cidade',
    paymentMethod: 'mpesa',
    notes: '',
  });

  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg('');
  };

  const previewMessage = buildWhatsAppOrderMessage(items, totalAmount, formData);

  const validateOrderForm = (): boolean => {
    setErrorMsg(null);

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setErrorMsg('Sem ligação à internet no momento. Por favor verifique a sua ligação antes de concluir o envio do pedido.');
      return false;
    }

    if (!formData.customerName.trim()) {
      setErrorMsg('Por favor, indique o seu nome completo.');
      return false;
    }
    if (!formData.phone.trim()) {
      setErrorMsg('Por favor, informe o seu número de telefone/WhatsApp.');
      return false;
    }
    if (!formData.deliveryLocation.trim()) {
      setErrorMsg('Por favor, indique o local ou endereço para entrega.');
      return false;
    }

    // Persist order in storeDb so it immediately shows in the Admin Panel
    try {
      storeDb.createOrder({
        customerName: formData.customerName.trim(),
        phone: formData.phone.trim(),
        email: formData.email,
        companyName: formData.companyName?.trim(),
        deliveryLocation: formData.deliveryLocation.trim(),
        cityProvince: formData.cityProvince,
        items,
        totalAmount,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
      });
    } catch (err) {
      console.error('Failed to register order in store database', err);
    }

    return true;
  };

  const handleSubmitWhatsApp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateOrderForm()) return;

    const url = getWhatsAppOrderUrl(items, totalAmount, formData);
    window.open(url, '_blank');
    if (onOrderCompleted) {
      onOrderCompleted();
    }
  };

  const handleSubmitEmail = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateOrderForm()) return;

    const url = getOrderEmailUrl(items, totalAmount, formData);
    window.location.href = url;
    if (onOrderCompleted) {
      onOrderCompleted();
    }
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(previewMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
              <MessageSquare className="w-5 h-5 fill-white/20" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Finalização do Pedido (WhatsApp ou E-mail)</h3>
              <p className="text-xs text-slate-300">
                Atendimento direto via WhatsApp ({WHATSAPP_PHONE_DISPLAY}) ou por E-mail ({EMAIL_DISPLAY})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-7 max-h-[78vh] overflow-y-auto">
          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold animate-in shake">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmitWhatsApp} className="space-y-6">
            {/* Step 1: Customer & Delivery Details */}
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <User className="w-4 h-4 text-amber-500" />
                1. Seus Dados para Faturação e Entrega:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nome Completo <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    required
                    placeholder="Ex: Carlos Matsinhe"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Telefone / WhatsApp <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="Ex: +258 84 123 4567"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nome da Empresa / Obra <span className="text-slate-400 font-normal">(Opcional)</span>
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    placeholder="Ex: Construtora Moçambique Lda"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cidade / Província <span className="text-amber-500">*</span>
                  </label>
                  <select
                    name="cityProvince"
                    value={formData.cityProvince}
                    onChange={handleInputChange}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 bg-slate-50 cursor-pointer"
                  >
                    <option value="Maputo Cidade">Maputo Cidade</option>
                    <option value="Maputo Província (Matola)">Maputo Província (Matola / Boane)</option>
                    <option value="Gaza (Xai-Xai)">Gaza (Xai-Xai)</option>
                    <option value="Inhambane">Inhambane</option>
                    <option value="Sofala (Beira)">Sofala (Beira)</option>
                    <option value="Manica (Chimoio)">Manica (Chimoio)</option>
                    <option value="Tete">Tete</option>
                    <option value="Zambézia (Quelimane)">Zambézia (Quelimane)</option>
                    <option value="Nampula">Nampula</option>
                    <option value="Cabo Delgado (Pemba)">Cabo Delgado (Pemba)</option>
                    <option value="Niassa (Lichinga)">Niassa (Lichinga)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Local Exato de Entrega / Endereço <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="deliveryLocation"
                    required
                    placeholder="Ex: Av. 24 de Julho nº 1250, Bairro da Polana / Estaleiro da Obra"
                    value={formData.deliveryLocation}
                    onChange={handleInputChange}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Método de Pagamento Preferido
                  </label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 bg-slate-50 cursor-pointer"
                  >
                    <option value="mpesa">M-Pesa</option>
                    <option value="emola">E-Mola</option>
                    <option value="transfer">Transferência Bancária (BIM / BCI / Standard)</option>
                    <option value="cash_delivery">Pagamento na Entrega / POS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Observações / NUIT <span className="text-slate-400 font-normal">(Opcional)</span>
                  </label>
                  <input
                    type="text"
                    name="notes"
                    placeholder="Ex: Faturar no NUIT 400123456"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 bg-slate-50"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Order Summary */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2 flex items-center justify-between">
                <span>Resumo dos Equipamentos ({items.length} itens):</span>
                <span className="text-slate-950 font-black text-sm">
                  Total: {formatCurrency(totalAmount)}
                </span>
              </h4>

              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 text-xs">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center py-1 border-b border-slate-200/60 last:border-0"
                  >
                    <span className="text-slate-700 truncate pr-2 font-medium">
                      {item.quantity}x {item.product.name}
                      {item.selectedSize ? ` (${item.selectedSize})` : ''}
                    </span>
                    <span className="font-bold text-slate-900 flex-shrink-0">
                      {formatCurrency(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 3: Realtime WhatsApp Message Preview */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Pré-visualização da Mensagem WhatsApp:
                </span>
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copiada!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Texto</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-3.5 bg-emerald-950/90 text-emerald-100 font-mono text-xs rounded-2xl border border-emerald-800 whitespace-pre-wrap leading-relaxed shadow-inner max-h-40 overflow-y-auto">
                {previewMessage}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={handleSubmitWhatsApp}
                className="w-full sm:flex-1 py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/25 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                id="btn-final-whatsapp-submit"
                title={`Enviar pedido para o WhatsApp ${WHATSAPP_PHONE_DISPLAY}`}
              >
                <MessageSquare className="w-4 h-4 fill-white/20" />
                <span>Enviar via WhatsApp ({WHATSAPP_PHONE_DISPLAY})</span>
              </button>

              <button
                type="button"
                onClick={handleSubmitEmail}
                className="w-full sm:flex-1 py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer border border-slate-700"
                id="btn-final-email-submit"
                title={`Enviar pedido para o email ${EMAIL_DISPLAY}`}
              >
                <Mail className="w-4 h-4 text-amber-400" />
                <span>Enviar por E-mail ({EMAIL_DISPLAY})</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto py-3.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Voltar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
