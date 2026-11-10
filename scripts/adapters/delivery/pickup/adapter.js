/**
 * Adaptador de delivery: retiro en sucursal. Sin proveedor externo — cómputo
 * local sobre blueprint.branches. isMock: false: no simula nada, es la
 * lógica real y definitiva de "retiro en tienda" (docs/architecture/
 * DELIVERY.md §4.1).
 *
 * Simplificación deliberada respecto a DELIVERY.md: usa directamente
 * branches[].pickup === true, sin la lista adicional
 * delivery.pickup.branches (sería redundante para este alcance "básico").
 */
import meta from './adapter.meta.js'

/**
 * @param {{blueprint: object}} ctx
 * @returns {Promise<Array>}
 */
async function quote({ blueprint }) {
  const branches = (blueprint.branches ?? []).filter((b) => b.pickup)
  const prepMinutes = blueprint.delivery?.pickup?.preparationMinutes ?? 20

  return branches.map((branch) => ({
    id: `pickup:${branch.id}`,
    kind: 'pickup',
    label: `Retiro en ${branch.name}`,
    fee: { amount: 0, currency: blueprint.commerce.currency },
    etaMinutes: prepMinutes,
  }))
}

export default { ...meta, quote }
