/**
 * Registro de slots.
 *
 * El core declara puntos de extensión con nombre y NO sabe quién los rellena.
 * Los módulos se registran al cargarse. Ver docs/modules/MODULES.md §7.
 *
 * LIMITACIÓN ACTUAL (consciente): el registro se lee en tiempo de render y no
 * notifica cambios. Los módulos se registran durante el arranque, antes del
 * primer render (ARCHITECTURE.md §5, paso 7), así que basta. Si algún día un
 * módulo necesita registrarse después, esto tendrá que emitir eventos — no
 * antes, para no pagar esa complejidad sin usarla.
 */

/** @type {Map<string, {exclusive: boolean}>} */
const declared = new Map()

/** @type {Map<string, Array<{moduleId: string, priority: number, render: Function}>>} */
const contributions = new Map()

/**
 * Declara un slot. Solo el core declara slots.
 * @param {string} name
 * @param {{exclusive?: boolean}} [options] exclusive: admite una sola contribución.
 */
export function declareSlot(name, options = {}) {
  declared.set(name, { exclusive: options.exclusive ?? false })
}

/**
 * Declara varios slots de una vez.
 * @param {Record<string, {exclusive?: boolean}>} map
 */
export function declareSlots(map) {
  for (const [name, options] of Object.entries(map)) declareSlot(name, options)
}

/**
 * Registra una contribución de un módulo a un slot.
 * @param {string} name
 * @param {{moduleId: string, priority?: number, render: Function}} contribution
 */
export function registerSlot(name, contribution) {
  const { moduleId, priority = 100, render } = contribution

  if (!declared.has(name)) {
    throw new Error(
      `Slot desconocido "${name}" (lo intenta rellenar el módulo "${moduleId}"). ` +
        `Los slots los declara el core; revisa el nombre o declara el slot.`
    )
  }

  const existing = contributions.get(name) ?? []

  if (declared.get(name).exclusive && existing.length > 0) {
    throw new Error(
      `El slot "${name}" es exclusivo y ya lo rellena "${existing[0].moduleId}". ` +
        `El módulo "${moduleId}" no puede añadirse. Desactiva uno de los dos.`
    )
  }

  if (existing.some((c) => c.moduleId === moduleId)) {
    throw new Error(`El módulo "${moduleId}" ya contribuye al slot "${name}".`)
  }

  existing.push({ moduleId, priority, render })
  // Menor prioridad = antes. Empate → orden de registro, que es el orden
  // topológico de módulos y por tanto determinista.
  existing.sort((a, b) => a.priority - b.priority)
  contributions.set(name, existing)
}

/**
 * Contribuciones ordenadas de un slot. Un slot vacío devuelve [], no es error.
 * @param {string} name
 */
export function getSlotContributions(name) {
  return contributions.get(name) ?? []
}

/** @param {string} name */
export function isSlotDeclared(name) {
  return declared.has(name)
}

/** Nombres de todos los slots declarados. Para diagnóstico. */
export function listDeclaredSlots() {
  return [...declared.keys()]
}

/** Vacía el registro. Solo para tests. */
export function resetSlots() {
  declared.clear()
  contributions.clear()
}
