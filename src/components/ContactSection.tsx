import React, { useState } from 'react';
import { 
  Phone, 
  MessageSquare, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  Building2,
  ExternalLink
} from 'lucide-react';
import { 
  WHATSAPP_PHONE_DISPLAY, 
  WHATSAPP_PHONE_RAW, 
  EMAIL_DISPLAY, 
  ADDRESS_DISPLAY, 
  getGeneralWhatsAppChatUrl 
} from '../utils/whatsapp';

export const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.message) {
      return;
    }

    // Build contact message for WhatsApp
    const messageText =
      `Olá, ProSegurança! Mensagem enviada pelo website:\n\n` +
      `Nome: ${formData.name}\n` +
      `Telefone: ${formData.phone}\n` +
      `Email: ${formData.email || 'Não informado'}\n\n` +
      `Mensagem:\n${formData.message}`;

    const url = `https://wa.me/${WHATSAPP_PHONE_RAW}?text=${encodeURIComponent(messageText)}`;
    window.open(url, '_blank');
    setSubmitted(true);
  };

  return (
    <section id="contactos" className="py-20 bg-slate-100 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-100 px-3 py-1 rounded-full mb-3">
            <Phone className="w-3.5 h-3.5" />
            <span>Fale Connosco</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Contactos & Localização
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            Estamos prontos para atender pedidos individuais ou cotações de grande volume para a sua empresa.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Direct Contact Info Cards */}
          <div className="lg:col-span-5 space-y-4">
            {/* WhatsApp Card */}
            <a
              href={getGeneralWhatsAppChatUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                    WhatsApp & Chamadas (Atendimento Imediato)
                  </div>
                  <div className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                    {WHATSAPP_PHONE_DISPLAY}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-semibold text-emerald-600">
                    <span>Clique para conversar no WhatsApp</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </a>

            {/* Email Card */}
            <a
              href={`mailto:${EMAIL_DISPLAY}`}
              className="block p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                    Email para Cotações Formais
                  </div>
                  <div className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
                    {EMAIL_DISPLAY}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Envie a sua lista de requisição em PDF / Excel
                  </div>
                </div>
              </div>
            </a>

            {/* Location Card */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
                    Localização & Armazém
                  </div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {ADDRESS_DISPLAY}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Entregas e despachos para todo o território nacional
                  </div>
                </div>
              </div>
            </div>

            {/* Hours Card */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Horário de Atendimento
                  </div>
                  <div className="text-xs font-semibold text-slate-800 mt-0.5 space-y-0.5">
                    <div>Segunda a Sexta: 08:00 às 17:30</div>
                    <div>Sábado: 08:00 às 13:00</div>
                  </div>
                  <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                    WhatsApp disponível para orçamentos e emergências
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg">
              <div className="mb-6">
                <h3 className="text-xl font-extrabold text-slate-900">
                  Envie-nos uma Mensagem
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Preencha os campos abaixo para tirar dúvidas, consultar disponibilidade ou solicitar propostas.
                </p>
              </div>

              {submitted ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-emerald-950">
                    Mensagem Preparada e Enviada!
                  </h4>
                  <p className="text-xs text-emerald-800 max-w-sm mx-auto">
                    O seu contacto foi direcionado para a nossa linha de atendimento via WhatsApp ({WHATSAPP_PHONE_DISPLAY}). Responderemos com a maior brevidade possível.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-500 cursor-pointer"
                  >
                    Enviar Outra Mensagem
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nome Completo <span className="text-amber-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        placeholder="Seu nome"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 bg-slate-50"
                        id="contact-name"
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
                        placeholder="+258 84/85..."
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 bg-slate-50"
                        id="contact-phone"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email <span className="text-slate-400 font-normal">(Opcional)</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="seuemail@empresa.co.mz"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 bg-slate-50"
                      id="contact-email"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mensagem / Detalhes do que precisa <span className="text-amber-500">*</span>
                    </label>
                    <textarea
                      name="message"
                      required
                      rows={4}
                      placeholder="Ex: Gostaria de saber preços e prazos de entrega para 30 capacetes de segurança e 50 pares de luvas anticorte em Maputo..."
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 bg-slate-50"
                      id="contact-message"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                    id="contact-submit-btn"
                  >
                    <Send className="w-4 h-4" />
                    <span>Enviar Mensagem</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
