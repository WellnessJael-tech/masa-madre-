/**
 * Carga el código de cada módulo activo y ejecuta su registro (normalmente,
 * llamadas a registerSlot()). `resolveModules()` solo decide QUÉ módulos
 * están activos y validados — cargar su código y ejecutarlo es un paso
 * aparte, deliberadamente async, para no obligar a boot() (síncrono, con
 * datos ya en memoria vía import.meta.glob eager) a volverse asíncrono.
 *
 * Se llama UNA VEZ desde main.jsx, antes de montar React — igual que
 * applyTheme(): las contribuciones a slots deben existir antes del primer
 * render para que un <Slot/> no aparezca vacío en el primer paint.
 *
 * SECUENCIAL, no en paralelo: resolveModules() ya devuelve los módulos en
 * orden topológico determinista (docs/modules/MODULES.md §7 — un empate de
 * prioridad en un slot se resuelve por ese orden). Cargar con Promise.all
 * haría que el orden de registro dependiera de qué import() resuelve
 * primero, rompiendo esa garantía.
 *
 * @param {Array<{id: string, manifest: object, config: object}>} modules
 */
export async function loadActiveModules(modules) {
  for (const { manifest, config } of modules) {
    if (typeof manifest.load !== 'function') continue
    const loaded = await manifest.load()
    await loaded.register?.(config)
  }
}
