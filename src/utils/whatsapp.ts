import { CartItem, CheckoutFormData, Product, QuoteFormData } from '../types';

export const WHATSAPP_PHONE_RAW = '258846159254';
export const WHATSAPP_PHONE_DISPLAY = '+258 84 615 9254';
export const PHONE_CALL_TEL = 'tel:+258846159254';
export const PHONE_CALL_RAW = '+258846159254';
export const EMAIL_DISPLAY = 'zadamo@gmail.com';
export const EMAIL_RECIPIENT = 'zadamo@gmail.com';
export const ADDRESS_DISPLAY = 'Mozal, Boane, Moçambique';

/**
 * Format currency in Mozambican Meticais (MZN)
 * Example: 15000 -> 15.000 MZN
 */
export function formatCurrency(amount: number): string {
  const formatted = new Intl.NumberFormat('de-DE', {
    maximumFractionDigits: 0,
  }).format(amount);
  return `${formatted} MZN`;
}

/**
 * Format order into the exact WhatsApp message template requested:
 *
 * Olá, ProSegurança!
 * 
 * Gostaria de fazer um pedido:
 * 
 * [Produto 1]
 * Quantidade: [quantidade]
 * Preço: [preço]
 * 
 * [Produto 2]
 * Quantidade: [quantidade]
 * Preço: [preço]
 * 
 * TOTAL: [total] MZN
 * 
 * Nome: [Nome]
 * Telefone: [Telefone]
 * Local de entrega: [Local de entrega]
 */
export function buildWhatsAppOrderMessage(
  items: CartItem[],
  totalAmount: number,
  formData: CheckoutFormData
): string {
  const itemsText = items
    .map((item) => {
      const sizeStr = item.selectedSize ? ` (Tamanho: ${item.selectedSize})` : '';
      const colorStr = item.selectedColor ? ` (Cor: ${item.selectedColor})` : '';
      const unitTotal = item.product.price * item.quantity;
      return `${item.product.name}${sizeStr}${colorStr}\nQuantidade: ${item.quantity}\nPreço: ${formatCurrency(unitTotal)}`;
    })
    .join('\n\n');

  const deliveryStr = formData.cityProvince
    ? `${formData.deliveryLocation}, ${formData.cityProvince}`
    : formData.deliveryLocation;

  return (
    `Olá, ProSegurança!\n\n` +
    `Gostaria de fazer um pedido:\n\n` +
    `${itemsText}\n\n` +
    `TOTAL: ${formatCurrency(totalAmount)}\n\n` +
    `Nome: ${formData.customerName}\n` +
    `Telefone: ${formData.phone}\n` +
    `Local de entrega: ${deliveryStr}` +
    (formData.companyName ? `\nEmpresa: ${formData.companyName}` : '') +
    (formData.notes ? `\nObservações: ${formData.notes}` : '')
  );
}

/**
 * Build direct WhatsApp checkout URL
 */
export function getWhatsAppOrderUrl(
  items: CartItem[],
  totalAmount: number,
  formData: CheckoutFormData
): string {
  const message = buildWhatsAppOrderMessage(items, totalAmount, formData);
  return `https://wa.me/${WHATSAPP_PHONE_RAW}?text=${encodeURIComponent(message)}`;
}

/**
 * Build single product WhatsApp inquiry URL
 */
export function getProductWhatsAppInquiryUrl(product: Product, quantity = 1, selectedSize?: string): string {
  const sizeStr = selectedSize ? ` (Tamanho: ${selectedSize})` : '';
  const total = product.price * quantity;
  const message =
    `Olá, ProSegurança!\n\n` +
    `Gostaria de comprar o seguinte produto do catálogo:\n\n` +
    `Produto: ${product.name}${sizeStr}\n` +
    `Quantidade: ${quantity}\n` +
    `Preço Unitário: ${formatCurrency(product.price)}\n` +
    `Preço Total: ${formatCurrency(total)}\n` +
    `Disponibilidade: ${product.inStock ? 'Disponível em Stock' : 'Sob Encomenda'}\n\n` +
    `Podem confirmar a entrega e dados para pagamento? Obrigado!`;

  return `https://wa.me/${WHATSAPP_PHONE_RAW}?text=${encodeURIComponent(message)}`;
}

/**
 * Build Quote for Works and Companies WhatsApp message:
 *
 * Nome da empresa:
 * Nome do responsável:
 * Telefone:
 * Email:
 * Tipo de obra:
 * Local da obra:
 * Produtos necessários:
 * Quantidade:
 * Mensagem:
 */
export function getQuoteWhatsAppUrl(quoteData: QuoteFormData): string {
  const message =
    `Olá, ProSegurança!\n\n` +
    `Gostaria de solicitar uma Cotação para Obras / Empresa:\n\n` +
    `Nome da empresa: ${quoteData.companyName}\n` +
    `Nome do responsável: ${quoteData.contactName}\n` +
    `Telefone: ${quoteData.phone}\n` +
    `Email: ${quoteData.email || 'Não informado'}\n` +
    `Tipo de obra: ${quoteData.workType}\n` +
    `Local da obra: ${quoteData.workLocation}\n` +
    `Produtos necessários: ${quoteData.itemsNeeded}\n` +
    `Quantidade: ${quoteData.quantity || 'Conforme lista'}\n` +
    `Mensagem: ${quoteData.message || 'Solicito proposta formal com NUIT e prazos de entrega.'}\n\n` +
    `Aguardo o envio da cotação. Obrigado!`;

  return `https://wa.me/${WHATSAPP_PHONE_RAW}?text=${encodeURIComponent(message)}`;
}

/**
 * Pre-defined WhatsApp quick action URLs
 */
export const WHATSAPP_QUICK_ACTIONS = {
  buyProduct: () =>
    `https://wa.me/${WHATSAPP_PHONE_RAW}?text=${encodeURIComponent(
      'Olá, ProSegurança! Gostaria de consultar a disponibilidade e comprar equipamentos de segurança do catálogo.'
    )}`,
  requestQuote: () =>
    `https://wa.me/${WHATSAPP_PHONE_RAW}?text=${encodeURIComponent(
      'Olá, ProSegurança! Gostaria de solicitar uma Cotação para Obras e Empresas com NUIT.'
    )}`,
  askQuestions: () =>
    `https://wa.me/${WHATSAPP_PHONE_RAW}?text=${encodeURIComponent(
      'Olá, ProSegurança! Tenho dúvidas técnicas sobre os equipamentos de proteção individual (EPIs) e normas de segurança.'
    )}`,
};

/**
 * General direct chat WhatsApp URL
 */
export function getGeneralWhatsAppChatUrl(customText?: string): string {
  const message =
    customText ||
    `Olá, ProSegurança! Gostaria de obter informações sobre o catálogo de Equipamentos de Proteção Individual (EPIs) e fazer um pedido.`;
  return `https://wa.me/${WHATSAPP_PHONE_RAW}?text=${encodeURIComponent(message)}`;
}

/**
 * Build email order subject and body
 */
export function buildOrderEmailDetails(
  items: CartItem[],
  totalAmount: number,
  formData: CheckoutFormData
): { subject: string; body: string } {
  const itemsText = items
    .map((item, idx) => {
      const sizeStr = item.selectedSize ? ` (Tamanho: ${item.selectedSize})` : '';
      const colorStr = item.selectedColor ? ` (Cor: ${item.selectedColor})` : '';
      const unitTotal = item.product.price * item.quantity;
      return `${idx + 1}. ${item.product.name}${sizeStr}${colorStr}\n   Quantidade: ${item.quantity}\n   Preço Unitário: ${formatCurrency(item.product.price)}\n   Subtotal: ${formatCurrency(unitTotal)}`;
    })
    .join('\n\n');

  const deliveryStr = formData.cityProvince
    ? `${formData.deliveryLocation}, ${formData.cityProvince}`
    : formData.deliveryLocation;

  const subject = `Novo Pedido ProSegurança - ${formData.customerName} (${formatCurrency(totalAmount)})`;

  const body =
    `Olá, Equipa Comercial ProSegurança!\n\n` +
    `Gostaria de realizar o seguinte pedido através da loja online:\n\n` +
    `=== ITENS DO PEDIDO ===\n\n` +
    `${itemsText}\n\n` +
    `TOTAL DO PEDIDO: ${formatCurrency(totalAmount)}\n\n` +
    `=== DADOS DO CLIENTE E ENTREGA ===\n` +
    `• Nome: ${formData.customerName}\n` +
    `• Telefone/WhatsApp: ${formData.phone}\n` +
    `• Email: ${formData.email || 'Não informado'}\n` +
    `• Empresa: ${formData.companyName || 'Não informada'}\n` +
    `• Local de Entrega: ${deliveryStr}\n` +
    `• Método de Pagamento Selecionado: ${formData.paymentMethod}\n` +
    (formData.notes ? `• Observações: ${formData.notes}\n` : '') +
    `\nAguardo a confirmação do pedido, disponibilidade e dados para liquidação da fatura.\n\n` +
    `Atenciosamente,\n${formData.customerName}`;

  return { subject, body };
}

/**
 * Get mailto URL for order submission to zadamo@gmail.com
 */
export function getOrderEmailUrl(
  items: CartItem[],
  totalAmount: number,
  formData: CheckoutFormData
): string {
  const { subject, body } = buildOrderEmailDetails(items, totalAmount, formData);
  return `mailto:${EMAIL_RECIPIENT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * Get mailto URL for Quote request to zadamo@gmail.com
 */
export function getQuoteEmailUrl(quoteData: QuoteFormData): string {
  const subject = `Solicitação de Cotação B2B / Obras - ${quoteData.companyName}`;
  const body =
    `Olá, Equipa Comercial ProSegurança!\n\n` +
    `Gostaria de solicitar uma Cotação Formal para Obras e Empresas:\n\n` +
    `=== DADOS DA EMPRESA / PROJETO ===\n` +
    `• Nome da Empresa: ${quoteData.companyName}\n` +
    `• Nome do Responsável: ${quoteData.contactName}\n` +
    `• Telefone de Contacto: ${quoteData.phone}\n` +
    `• Email do Solicitante: ${quoteData.email || 'Não informado'}\n` +
    `• Tipo de Obra / Atividade: ${quoteData.workType}\n` +
    `• Localização da Obra: ${quoteData.workLocation}\n\n` +
    `=== EQUIPAMENTOS SOLICITADOS ===\n` +
    `• Produtos Necessários:\n${quoteData.itemsNeeded}\n\n` +
    `• Quantidades Estimadas: ${quoteData.quantity || 'Conforme lista'}\n` +
    `• Mensagem / Requisitos Técnicos:\n${quoteData.message || 'Solicitamos envio de cotação com NUIT, disponibilidade de stock e prazos de entrega.'}\n\n` +
    `Aguardo o envio da proposta comercial formal.\n\n` +
    `Atenciosamente,\n${quoteData.contactName}\n${quoteData.companyName}`;

  return `mailto:${EMAIL_RECIPIENT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * Get mailto URL for general contact form message to zadamo@gmail.com
 */
export function getContactEmailUrl(formData: {
  name: string;
  phone: string;
  email?: string;
  company?: string;
  subject?: string;
  message: string;
}): string {
  const subject = `Mensagem de Contacto Website - ${formData.subject || 'Dúvida Geral'} (${formData.name})`;
  const body =
    `Olá, Equipa ProSegurança!\n\n` +
    `Mensagem enviada através do formulário de contacto do website:\n\n` +
    `• Nome: ${formData.name}\n` +
    `• Telefone / WhatsApp: ${formData.phone}\n` +
    `• Email: ${formData.email || 'Não informado'}\n` +
    `• Empresa: ${formData.company || 'Não informada'}\n` +
    `• Assunto: ${formData.subject || 'Dúvida Geral / Cotação'}\n\n` +
    `Mensagem:\n${formData.message}\n\n` +
    `Atenciosamente,\n${formData.name}`;

  return `mailto:${EMAIL_RECIPIENT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * Get mailto URL for direct product inquiry to zadamo@gmail.com
 */
export function getProductEmailInquiryUrl(
  product: Product,
  quantity = 1,
  selectedSize?: string
): string {
  const sizeStr = selectedSize ? ` (Tamanho: ${selectedSize})` : '';
  const total = product.price * quantity;
  const subject = `Interesse no Produto: ${product.name}`;
  const body =
    `Olá, Equipa ProSegurança!\n\n` +
    `Tenho interesse em adquirir o seguinte equipamento do vosso catálogo:\n\n` +
    `• Produto: ${product.name}${sizeStr}\n` +
    `• Código / SKU: ${product.id}\n` +
    `• Quantidade Pretendida: ${quantity}\n` +
    `• Preço Unitário: ${formatCurrency(product.price)}\n` +
    `• Preço Total Previsto: ${formatCurrency(total)}\n` +
    `• Stock no Catálogo: ${product.inStock ? 'Disponível em Stock' : 'Sob Encomenda'}\n\n` +
    `Por favor, entrem em contacto com informações sobre disponibilidade imediata, opções de entrega e dados para pagamento.\n\n` +
    `Obrigado!`;

  return `mailto:${EMAIL_RECIPIENT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}


