/**
 * Dinero: descriptor de validación + formateo.
 * MÓDULO PURO.
 */

/** Descriptor validable para un importe. Ver core/config/schema/validator.js */
export function moneyDescriptor(required = false) {
  return {
    type: 'object',
    required,
    fields: {
      amount: { type: 'number', required: true, min: 0 },
      currency: { type: 'string', required: true, pattern: /^[A-Z]{3}$/ },
    },
  }
}

/**
 * Formatea un importe. No decide impuestos ni redondeo — eso es
 * commerce.priceDisplay, que se aplica antes de llegar aquí.
 *
 * TODO: derivar el locale de identity.defaultLocale cuando el contexto del
 * cliente esté disponible en los componentes (hoy no lo está: ver
 * PENDIENTE del Bloque 2 sobre selección de theme/locale por cliente).
 *
 * @param {{amount: number, currency: string}} money
 * @param {string} [locale]
 */
export function formatMoney(money, locale = 'es-CL') {
  if (!money) return ''
  return new Intl.NumberFormat(locale, { style: 'currency', currency: money.currency }).format(
    money.amount
  )
}
