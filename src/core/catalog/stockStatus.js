/**
 * Determina si un producto está en "stock bajo" según
 * features.stock.lowStockThreshold del blueprint (ya validado con default 5
 * — core/config/blueprint/schema.js). MÓDULO PURO.
 *
 * No confundir con "sin stock" (quantity === 0): eso ya se maneja aparte en
 * ProductCard/ProductDetailPage. Stock bajo es 1..threshold.
 *
 * @param {number} quantity
 * @param {number} threshold
 */
export function isLowStock(quantity, threshold) {
  return quantity > 0 && quantity <= threshold
}
