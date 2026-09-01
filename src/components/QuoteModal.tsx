import React, { useState } from 'react';
import { QuoteFormData } from '../types';
import { 
  X, 
  Building2, 
  MessageSquare, 
  CheckCircle2
} from 'lucide-react';
import { getQuoteWhatsAppUrl, WHATSAPP_PHONE_DISPLAY } from '../utils/whatsapp';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuoteModal: React.FC<QuoteModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState<QuoteFormData>({
    companyName: '',
    contactName: '',
    phone: '',
    email: '',
    workType: 'Construção Civil / Edificação',
    workLocation: '',
    itemsNeeded: '',
    quantity: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.contactName || !formData.phone || !formData.itemsNeeded) {
      return;
    }

    const url = getQuoteWhatsAppUrl(formData);
    window.open(url, '_blank');
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-400/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Cotação para Obras e Empresas
              </h3>
              <p className="text-xs text-slate-400">
                Proposta comercial com NUIT, prazos e faturamento para projetos
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-7 max-h-[78vh] overflow-y-auto">
          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">
                Solicitação de Cotação Encaminhada!
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                A sua solicitação foi organizada e aberta no WhatsApp do departamento comercial ({WHATSAPP_PHONE_DISPLAY}).
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-slate-900 text-amber-400 font-bold text-xs hover:bg-slate-800 cursor-pointer"
              >
                Fechar
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nome da empresa <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    required
                    placeholder="Ex: Construtora Horizonte, Lda"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nome do responsável <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="contactName"
                    required
                    placeholder="Ex: Eng. Manuel Macamo"
                    value={formData.contactName}
                    onChange={handleChange}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Telefone <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="+258 84/85..."
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="compras@empresa.co.mz"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tipo de obra
                  </label>
                  <select
                    name="workType"
                    value={formData.workType}
                    onChange={handleChange}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 bg-slate-50 cursor-pointer"
                  >
                    <option value="Construção Civil / Edificação">Construção Civil / Edificação</option>
                    <option value="Infraestrutura & Estradas">Infraestrutura & Estradas</option>
                    <option value="Mineração & Pedreiras">Mineração & Pedreiras</option>
                    <option value="Manutenção Industrial">Manutenção Industrial</option>
                    <option value="Instalações Elétricas / Hidráulicas">Instalações Elétricas / Hidráulicas</option>
                    <option value="Petróleo, Gás & Energia">Petróleo, Gás & Energia</option>
                    <option value="Outro tipo de projeto">Outro tipo de projeto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Local da obra <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="workLocation"
                    required
                    placeholder="Ex: Maputo, Matola, Nacala, Beira, Pemba..."
                    value={formData.workLocation}
                    onChange={handleChange}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Produtos necessários <span className="text-amber-500">*</span>
                  </label>
                  <textarea
                    name="itemsNeeded"
                    required
                    rows={3}
                    placeholder="Ex: Capacetes com catraca, Botas biqueira de aço, Luvas anticorte, Coletes refletores..."
                    value={formData.itemsNeeded}
                    onChange={handleChange}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Quantidade estimada
                  </label>
                  <textarea
                    name="quantity"
                    rows={3}
                    placeholder="Ex: 50 unidades de cada / Para 100 operários"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mensagem adicional
                </label>
                <textarea
                  name="message"
                  rows={2}
                  placeholder="Informações adicionais, prazos de entrega desejados ou requisitos técnicos..."
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 bg-slate-50"
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  className="w-full sm:flex-1 py-3.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 cursor-pointer transition-colors"
                >
                  <MessageSquare className="w-4 h-4 fill-white/20" />
                  <span>Solicitar Cotação</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto py-3.5 px-5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

