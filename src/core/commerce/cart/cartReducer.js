/**
 * Reducer del carrito. MÓDULO PURO: no conoce el catálogo, solo clampa la
 * cantidad al `maxQuantity` que le pasa quien despacha la acción (useCart.js,
 * que sí conoce el stock). Así el reducer es testeable sin datos de producto.
 */

export const initialCartState = { lines: [] }

export function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { productId, quantity = 1, maxQuantity } = action
      const existing = state.lines.find((l) => l.productId === productId)
      const next = clamp((existing?.quantity ?? 0) + quantity, maxQuantity)
      return { lines: setLine(state.lines, productId, next) }
    }
    case 'SET_QUANTITY': {
      const { productId, quantity, maxQuantity } = action
      return { lines: setLine(state.lines, productId, clamp(quantity, maxQuantity)) }
    }
    case 'REMOVE_ITEM':
      return { lines: state.lines.filter((l) => l.productId !== action.productId) }
    case 'CLEAR':
      return initialCartState
    default:
      return state
  }
}

function clamp(value, max) {
  return Math.max(0, Math.min(value, max ?? Infinity))
}

/** Cantidad 0 elimina la línea — es lo mismo que "quitar del carrito". */
function setLine(lines, productId, quantity) {
  const rest = lines.filter((l) => l.productId !== productId)
  return quantity > 0 ? [...rest, { productId, quantity }] : rest
}
