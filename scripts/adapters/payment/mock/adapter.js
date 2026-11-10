/**
 * Adaptador de pago: mock. Simula "siempre aprobado tras un retardo"
 * (docs/business/DEMO-PRODUCTION.md §5). `isMock: true` — el guardarraíl de
 * core/config/mode.js impide que este adaptador quede resuelto en un build de
 * producción (docs/business/DEMO-PRODUCTION.md §3).
 *
 * No implementa ningún procesador real. Ver docs/architecture/PAYMENTS.md §5
 * para el contrato completo que tendrá un adaptador online real (requiere
 * backend, no existe todavía).
 */
import meta from './adapter.meta.js'

const DELAY_MS = 600

function isEligible() {
  return { eligible: true }
}

/**
 * @param {{orderId: string, amount: {amount:number, currency:string}}} req
 * @returns {Promise<{id:string, orderId:string, amount:object, state:'paid'}>}
 */
function init({ orderId, amount }) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id: `mock-${orderId}`, orderId, amount, state: 'paid' })
    }, DELAY_MS)
  })
}

export default {
  ...meta,
  family: 'offline',
  capabilities: {
    requiresRedirect: false,
    requiresProof: false,
    instantConfirmation: false,
    refundable: false,
    partialRefund: false,
    requiresBackend: false,
  },
  isEligible,
  init,
}
