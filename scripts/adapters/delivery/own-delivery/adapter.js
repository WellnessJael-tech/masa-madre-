/**
 * Adaptador de delivery: reparto propio por zona fija. Sin proveedor
 * externo — cómputo local sobre blueprint.delivery.ownDelivery.zones
 * (docs/architecture/DELIVERY.md §4.2, modo "zone-list": "no requiere mapas,
 * ni geocodificación, ni claves de API"). isMock: false por el mismo motivo
 * que pickup.
 *
 * Aplica freeOver ya cableado en el Bloque 6 (ADR-0022): si el total del
 * carrito alcanza el umbral de la zona, la tarifa se muestra en 0.
 */
import meta from './adapter.meta.js'

/**
 * @param {{blueprint: object, cartTotal: {amount: number, currency: string}}} ctx
 * @returns {Promise<Array>}
 */
async function quote({ blueprint, cartTotal }) {
  const zones = blueprint.delivery?.ownDelivery?.zones ?? []

  return zones.map((zone) => {
    const qualifiesFree = zone.freeOver && cartTotal.amount >= zone.freeOver.amount
    return {
      id: `own-delivery:${zone.id}`,
      kind: 'delivery',
      label: zone.label,
      fee: qualifiesFree ? { amount: 0, currency: zone.fee.currency } : zone.fee,
      etaMinutes: zone.eta?.maxMinutes ?? null,
    }
  })
}

export default { ...meta, quote }
