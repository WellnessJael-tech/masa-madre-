/**
 * Construye un enlace de WhatsApp (wa.me) a partir de un teléfono y un
 * mensaje. MÓDULO PURO.
 *
 * Compartido entre modules/whatsapp/WhatsAppButton.jsx y
 * core/commerce/checkout/CheckoutView.jsx: el checkout (core) necesita
 * ofrecer un enlace de contacto sin importar el módulo whatsapp (core/ no
 * puede importar modules/, ver CLAUDE.md). Ambos leen un teléfono de una
 * fuente de datos del blueprint (identity.contact.phone en el caso del
 * checkout) y usan esta misma función — no hay dos implementaciones del
 * mismo enlace.
 *
 * @param {string} phone
 * @param {string} message
 */
export function buildWhatsAppLink(phone, message) {
  const digits = String(phone).replace(/\D/g, '')
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}
