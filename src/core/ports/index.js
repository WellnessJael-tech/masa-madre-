/**
 * PUERTOS — contratos, cero implementación.
 *
 * MÓDULO PURO. Esta carpeta no importa nada (ARCHITECTURE.md §3): es el punto
 * más bajo del grafo de dependencias. El core habla con estos contratos; los
 * adaptadores los implementan; ni el core ni un módulo conocen jamás a un
 * proveedor concreto.
 *
 * Los contratos completos de pago y delivery están documentados en
 * docs/architecture/PAYMENTS.md y docs/architecture/DELIVERY.md. Aquí solo se
 * declaran los identificadores y la forma común, porque todavía NO existe
 * ningún adaptador: inventar aquí las firmas de un proveedor real sería
 * exactamente lo que la regla de realidad prohíbe.
 */

/** Puertos que el sistema contempla. Un adaptador declara cuál implementa. */
export const PORTS = Object.freeze({
  PAYMENT: 'payment',
  DELIVERY: 'delivery',
  ANALYTICS: 'analytics',
  CONTENT: 'content',
  STORAGE: 'storage',
  NOTIFICATIONS: 'notifications',
})

export const PORT_IDS = Object.freeze(Object.values(PORTS))

/**
 * Forma mínima común a todo adaptador. Lo que el core necesita saber de
 * cualquiera de ellos, sea del puerto que sea.
 *
 * @typedef {Object} Adapter
 * @property {string}  id       Identificador único dentro de su puerto.
 * @property {string}  port     Uno de PORT_IDS.
 * @property {boolean} isMock   OBLIGATORIO. true solo en adaptadores de demo.
 *                              Sin esta marca, el guardarraíl de producción no
 *                              puede funcionar (DEMO-PRODUCTION.md §6).
 * @property {object}  [capabilities] Qué sabe hacer, para que la UI se adapte
 *                              sin preguntar "¿quién eres?".
 */

/**
 * Comprueba la forma mínima de un adaptador. No valida el contrato específico
 * de su puerto: eso corresponde a cada puerto cuando exista un adaptador real.
 *
 * @param {unknown} adapter
 * @returns {string[]} Lista de problemas. Vacía si es válido.
 */
export function checkAdapterShape(adapter) {
  const problems = []
  if (typeof adapter !== 'object' || adapter === null) {
    return ['El adaptador debe ser un objeto.']
  }
  if (typeof adapter.id !== 'string' || adapter.id === '') {
    problems.push('Falta "id" (texto no vacío).')
  }
  if (!PORT_IDS.includes(adapter.port)) {
    problems.push(`"port" debe ser uno de: ${PORT_IDS.join(', ')} (recibido: ${adapter.port}).`)
  }
  if (typeof adapter.isMock !== 'boolean') {
    problems.push(
      'Falta "isMock" (booleano). Es obligatorio: sin esa marca no se puede impedir ' +
        'que un mock llegue a producción.'
    )
  }
  return problems
}
