import { useReducer } from 'react'
import { CartContext } from './cartContext.js'
import { cartReducer, initialCartState } from './cartReducer.js'

/**
 * Carrito en memoria — sin backend, sin persistencia entre recargas
 * (ADR-0017). Se monta una vez en AppShell, fuera del router, para que
 * sobreviva a la navegación entre páginas de la SPA.
 */
export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialCartState)
  return <CartContext.Provider value={{ state, dispatch }}>{children}</CartContext.Provider>
}

export default CartProvider
