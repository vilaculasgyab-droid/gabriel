import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  MessageSquare, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  ArrowLeft,
  Building2,
  ExternalLink,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { 
  WHATSAPP_PHONE_DISPLAY, 
  WHATSAPP_PHONE_RAW, 
  EMAIL_DISPLAY, 
  ADDRESS_DISPLAY, 
  getGeneralWhatsAppChatUrl 
} from '../utils/whatsapp';
import { useSEO } from '../hooks/useSEO';

interface ContactPageProps {
  onNavigate: (path: string) => void;
  onOpenQuoteModal: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate, onOpenQuoteModal }) => {
  useSEO({
    title: 'Contacte a ProSegurança | Atendimento e Cotações Moçambique',
    description: `Fale connosco pelo WhatsApp (${WHATSAPP_PHONE_DISPLAY}) ou email (${EMAIL_DISPLAY}). Localização em Mozal, Boane. Cotações formais para empresas e obras em Moçambique.`,
    canonicalPath: '/contactos',
    breadcrumbs: [
      { name: 'Início', path: '/' },
      { name: 'Contactos', path: '/contactos' },
    ],
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: 'Dúvida Geral / Cotação',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.message) {
      return;
    }

    const messageText =
      `Olá, ProSegurança! Mensagem enviada pela Página de Contactos:\n\n` +
      `👤 Nome: ${formData.name}\n` +
      `📱 Telefone: ${formData.phone}\n` +
      `🏢 Empresa: ${formData.company || 'Não informada'}\n` +
      `📧 Email: ${formData.email || 'Não informado'}\n` +
      `📌 Assunto: ${formData.subject}\n\n` +
      `📝 Mensagem:\n${formData.message}`;

    const url = `https://wa.me/${WHATSAPP_PHONE_RAW}?text=${encodeURIComponent(messageText)}`;
    window.open(url, '_blank');
    setSubmitted(true);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10 sm:py-14 animate-in fade-in duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb & Back Button */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
            <button
              onClick={() => onNavigate('/')}
              className="text-slate-700 hover:text-amber-600 font-semibold cursor-pointer transition-colors"
            >
              Início
            </button>
            <span>/</span>
            <span className="text-amber-600 font-bold">Contactos</span>
          </div>

          <button
            onClick={() => onNavigate('/')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 hover:border-slate-400 text-slate-800 text-xs sm:text-sm font-bold shadow-sm hover:shadow transition-all cursor-pointer"
            id="back-to-home-btn"
          >
            <ArrowLeft className="w-4 h-4 text-amber-500" />
            <span>Voltar à Loja</span>
          </button>
        </div>

        {/* Header Banner */}
        <div className="relative rounded-3xl bg-slate-900 text-white p-8 sm:p-12 overflow-hidden shadow-xl border border-slate-800 mb-12">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3.5 py-1.5 rounded-full mb-4">
              <Phone className="w-4 h-4 text-amber-400" />
              <span>Canais de Atendimento</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
              Contactos & Localização
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Estamos prontos para atender pedidos imediatos, tirar dúvidas técnicas sobre normas de segurança e elaborar propostas personalizadas para a sua empresa.
            </p>
          </div>
        </div>

        {/* 2-Column Grid: Cards on left, Form on right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          
          {/* Left Column: Direct Info Cards */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* WhatsApp Card */}
            <a
              href={getGeneralWhatsAppChatUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-6 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                    WhatsApp Oficial (Atendimento Imediato)
                  </div>
                  <div className="text-lg font-black text-slate-900 mt-0.5">
                    {WHATSAPP_PHONE_DISPLAY}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-semibold text-emerald-600">
                    <span>Abrir conversa no WhatsApp</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </a>

            {/* Direct Phone Call Card */}
            <a
              href="tel:+258846159254"
              className="block p-6 rounded-2xl bg-white border border-slate-200 hover:border-amber-500 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                  <Phone className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
                    Chamada Telefónica Direta
                  </div>
                  <div className="text-lg font-black text-slate-900 mt-0.5">
                    {WHATSAPP_PHONE_DISPLAY}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-semibold text-amber-600">
                    <span>Ligar agora (+258 84 615 9254)</span>
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </a>

            {/* Email Card */}
            <a
              href={`mailto:${EMAIL_DISPLAY}`}
              className="block p-6 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                    Email para Cotações Formais
                  </div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">
                    {EMAIL_DISPLAY}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Envie listas de requisições, especificações e editais
                  </div>
                </div>
              </div>
            </a>

            {/* Location Card */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
                    Localização Principal
                  </div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">
                    {ADDRESS_DISPLAY}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Entregas e despachos para todo o território nacional
                  </div>
                </div>
              </div>
            </div>

            {/* Working Hours Card */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Horário de Atendimento
                  </div>
                  <div className="text-xs font-semibold text-slate-800 mt-1 space-y-1">
                    <div><strong>Segunda a Sexta:</strong> 08:00 às 17:30</div>
                    <div><strong>Sábado:</strong> 08:00 às 13:00</div>
                    <div className="text-slate-500 font-normal">Domingos e Feriados: Fechado (Atendimento WhatsApp em escala de emergência)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Methods Info */}
            <div className="p-6 rounded-2xl bg-slate-900 text-white shadow-md border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">
                <CreditCard className="w-4 h-4" />
                <span>Formas de Pagamento Aceites</span>
              </div>
              <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                Facilidade e segurança no pagamento do seu pedido em Moçambique:
              </p>
              <div className="flex flex-wrap gap-2 text-xs font-bold">
                <span className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-red-400">
                  M-Pesa
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-orange-400">
                  E-Mola
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-blue-400">
                  Transferência Bancária (BIM, BCI, Standard Bank)
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-emerald-400">
                  POS na Entrega
                </span>
              </div>
            </div>

          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-7 sm:p-10 border border-slate-200 shadow-xl">
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full mb-2">
                  <Send className="w-3.5 h-3.5" />
                  <span>Formulário de Contacto</span>
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900">
                  Envie a sua Mensagem
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Preencha o formulário abaixo. A mensagem será encaminhada diretamente para a nossa equipa via WhatsApp.
                </p>
              </div>

              {submitted ? (
                <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-emerald-950">
                    Mensagem Preparada com Sucesso!
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-800 max-w-md mx-auto leading-relaxed">
                    Sua mensagem foi direcionada para a nossa equipa no WhatsApp ({WHATSAPP_PHONE_DISPLAY}). Responderemos o mais breve possível.
                  </p>
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href={getGeneralWhatsAppChatUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-500 flex items-center gap-2 shadow-sm"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Abrir WhatsApp Novamente</span>
                    </a>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
                    >
                      Enviar Outra Mensagem
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Nome Completo <span className="text-amber-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        placeholder="Ex: João Manhiça"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full text-xs sm:text-sm px-3.5 py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 bg-slate-50"
                        id="contact-page-name"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Telefone / WhatsApp <span className="text-amber-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        placeholder="+258 84 / 85..."
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full text-xs sm:text-sm px-3.5 py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 bg-slate-50"
                        id="contact-page-phone"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Email <span className="text-slate-400 font-normal">(Opcional)</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        placeholder="seuemail@exemplo.co.mz"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full text-xs sm:text-sm px-3.5 py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 bg-slate-50"
                        id="contact-page-email"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Empresa / Obra <span className="text-slate-400 font-normal">(Opcional)</span>
                      </label>
                      <input
                        type="text"
                        name="company"
                        placeholder="Ex: Construtora X, Lda"
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full text-xs sm:text-sm px-3.5 py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 bg-slate-50"
                        id="contact-page-company"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Assunto
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full text-xs sm:text-sm px-3.5 py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 bg-slate-50"
                      id="contact-page-subject"
                    >
                      <option value="Dúvida Geral / Cotação">Dúvida Geral / Cotação</option>
                      <option value="Cotação B2B para Empresa com NUIT">Cotação B2B para Empresa com NUIT</option>
                      <option value="Consulta sobre Tamanhos ou Stock">Consulta sobre Tamanhos ou Stock</option>
                      <option value="Prazos de Entrega e Envio Provincial">Prazos de Entrega e Envio Provincial</option>
                      <option value="Parceria ou Fornecimento Contínuo">Parceria ou Fornecimento Contínuo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Mensagem / Lista de Equipamentos <span className="text-amber-500">*</span>
                    </label>
                    <textarea
                      name="message"
                      required
                      rows={5}
                      placeholder="Descreva aqui o que você precisa (ex: quantidade de capacetes, botas com tamanhos, luvas ou qualquer dúvida)..."
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full text-xs sm:text-sm px-3.5 py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 bg-slate-50"
                      id="contact-page-message"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-4 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 transition-all cursor-pointer"
                      id="contact-page-submit-btn"
                    >
                      <Send className="w-4 h-4" />
                      <span>Enviar Mensagem para o WhatsApp</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
