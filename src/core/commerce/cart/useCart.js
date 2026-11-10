import { useContext } from 'react'
import { CartContext } from './cartContext.js'
import { getCatalog } from '../../catalog/getCatalog.js'
import { getRuntime } from '../../config/runtime.js'

/**
 * API pública del carrito. Combina el estado (cartContext) con los datos de
 * catálogo para producir líneas enriquecidas y totales. Una línea cuyo
 * producto ya no existe en el catálogo se ignora — no rompe la UI.
 *
 * El stock máximo se recalcula del catálogo en cada llamada: si el stock de
 * un producto baja, el carrito lo respeta en la siguiente acción, no solo al
 * momento de agregarlo.
 */
export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart() debe usarse dentro de <CartProvider>.')
  const { state, dispatch } = ctx

  const { products } = getCatalog()
  const runtime = getRuntime()
  const currency = runtime.ok ? runtime.value.blueprint.commerce.currency : 'CLP'
  const productsById = new Map(products.map((p) => [p.id, p]))

  const lines = state.lines
    .map((line) => {
      const product = productsById.get(line.productId)
      if (!product) return null
      return {
        ...line,
        product,
        subtotal: { amount: product.price.amount * line.quantity, currency },
      }
    })
    .filter(Boolean)

  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0)
  const total = { amount: lines.reduce((sum, l) => sum + l.subtotal.amount, 0), currency }

  return {
    lines,
    itemCount,
    total,
    quantityOf: (productId) => state.lines.find((l) => l.productId === productId)?.quantity ?? 0,
    addItem: (productId, quantity = 1) => {
      const product = productsById.get(productId)
      if (product) {
        dispatch({ type: 'ADD_ITEM', productId, quantity, maxQuantity: product.stock.quantity })
      }
    },
    setQuantity: (productId, quantity) => {
      const product = productsById.get(productId)
      if (product) {
        dispatch({ type: 'SET_QUANTITY', productId, quantity, maxQuantity: product.stock.quantity })
      }
    },
    removeItem: (productId) => dispatch({ type: 'REMOVE_ITEM', productId }),
    clear: () => dispatch({ type: 'CLEAR' }),
  }
}
