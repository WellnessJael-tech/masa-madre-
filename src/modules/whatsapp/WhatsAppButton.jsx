import { buildWhatsAppLink } from '@/core/lib/whatsappLink.js'

/**
 * Botón flotante de WhatsApp. Contribución del módulo al slot
 * global.floating (core/app/slots.js). Sin lógica de negocio: el teléfono y
 * el mensaje vienen de la config del blueprint del cliente.
 *
 * Usa el token de marca de terceros --mm-whatsapp-brand (themes/_base), no
 * un color literal ni un token de marca del cliente: el verde de WhatsApp es
 * identidad del proveedor, no del comercio, y no debe variar por theme.
 *
 * buildWhatsAppLink es compartido con core/commerce/checkout/CheckoutView.jsx
 * (que necesita un enlace de WhatsApp sin poder importar este módulo).
 */
export function WhatsAppButton({ phone, message }) {
  const href = buildWhatsAppLink(phone, message)

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-testid="whatsapp-button"
      aria-label="Escribir por WhatsApp"
      className="fixed bottom-4 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-whatsapp-foreground shadow-lg transition-transform hover:scale-105"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  )
}

function WhatsAppIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.44 9.9-9.9 0-2.64-1.03-5.12-2.9-6.99A9.82 9.82 0 0 0 12.04 2Zm5.8 14.14c-.24.68-1.4 1.3-1.93 1.38-.5.08-1.11.11-1.79-.11-.41-.13-.95-.31-1.63-.6-2.87-1.24-4.74-4.13-4.88-4.32-.14-.19-1.17-1.56-1.17-2.97 0-1.41.74-2.1 1-2.39.26-.29.56-.36.75-.36h.53c.17 0 .4-.06.62.48.24.58.81 2 .88 2.14.07.14.11.31.02.5-.09.19-.14.31-.28.48-.14.17-.29.37-.42.5-.14.14-.28.29-.12.57.16.28.71 1.17 1.53 1.9 1.05.94 1.94 1.23 2.22 1.37.28.14.44.12.6-.07.16-.19.68-.79.87-1.06.18-.27.36-.22.61-.13.24.09 1.53.72 1.79.85.26.13.44.19.5.3.07.11.07.63-.17 1.3Z" />
    </svg>
  )
}

export default WhatsAppButton
