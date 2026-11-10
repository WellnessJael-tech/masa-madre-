import { getSlotContributions, isSlotDeclared } from './registry.js'

/**
 * Punto de extensión. El core lo renderiza sin saber quién lo rellena.
 *
 *   <Slot name="layout.header.actions" context={{ user }} />
 *
 * Un slot vacío no renderiza nada y NO es un error: significa que ningún
 * módulo activo contribuye ahí. Ver docs/modules/MODULES.md §7.
 *
 * El `context` es de solo lectura: un módulo no muta el estado del core desde
 * un slot; para eso usa la API pública del core.
 *
 * @param {{name: string, context?: Record<string, unknown>}} props
 */
export function Slot({ name, context = {} }) {
  if (import.meta.env.DEV && !isSlotDeclared(name)) {
    console.warn(
      `[slots] <Slot name="${name}"> no está declarado. ` +
        `Decláralo con declareSlot() para que los módulos puedan rellenarlo.`
    )
  }

  const contributions = getSlotContributions(name)
  if (contributions.length === 0) return null

  return contributions.map(({ moduleId, render }) => (
    <SlotContribution key={`${name}:${moduleId}`} render={render} context={context} />
  ))
}

/**
 * Aísla la llamada a `render` en su propio componente para que los hooks que
 * use un módulo tengan un ámbito estable entre renders.
 */
function SlotContribution({ render, context }) {
  return render(context)
}

export default Slot
