import { CartItem, CheckoutFormData, Product, QuoteFormData } from '../types';

export const WHATSAPP_PHONE_RAW = '258856450275';
export const WHATSAPP_PHONE_DISPLAY = '+258 85 645 0275';
export const EMAIL_DISPLAY = 'comercial@proseguranca.co.mz';
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

