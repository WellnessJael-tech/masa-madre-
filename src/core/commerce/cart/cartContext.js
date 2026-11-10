import { createContext } from 'react'

/**
 * Contexto interno del carrito. No se consume directamente — usar useCart().
 * Separado de CartProvider.jsx porque fast-refresh exige que un archivo de
 * componente no mezcle otros exports (mismo motivo que separa module.js del
 * registro de módulos, o adapter.meta.js del adaptador).
 */
export const CartContext = createContext(null)
