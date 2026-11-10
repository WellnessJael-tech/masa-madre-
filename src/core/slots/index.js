/**
 * API pública del sistema de slots.
 * Los módulos importan de aquí, nunca de los archivos internos.
 */
export { Slot } from './Slot.jsx'
export {
  declareSlot,
  declareSlots,
  registerSlot,
  getSlotContributions,
  isSlotDeclared,
  listDeclaredSlots,
  resetSlots,
} from './registry.js'
