/**
 * Registro de rutas aportadas por módulos.
 *
 * Mismo principio que core/slots/registry.js: el core declara el mecanismo,
 * los módulos aportan contenido, sin que el core los conozca por nombre. A
 * diferencia de un slot (contenido dentro de un layout fijo), una ruta es una
 * PÁGINA COMPLETA en una URL — por eso es un registro aparte, no una reutilización
 * de Slot.
 *
 * Se llena durante loadActiveModules() (main.jsx), antes de montar React, y se
 * lee una sola vez en AppShell al construir el árbol de <Routes>. Cierra el
 * pendiente citado en AppShell.jsx desde el Bloque 3 ("inyectar las rutas que
 * aporten los módulos activos").
 */

/** @type {Array<{path: string, moduleId: string, Component: Function}>} */
const routes = []

/**
 * @param {{path: string, moduleId: string, Component: Function}} route
 */
export function registerRoute(route) {
  if (!route?.path || typeof route.Component !== 'function') {
    throw new Error(
      `registerRoute() necesita {path, moduleId, Component}. Módulo: "${route?.moduleId}".`
    )
  }
  const existing = routes.find((r) => r.path === route.path)
  if (existing) {
    throw new Error(
      `La ruta "${route.path}" ya está registrada por el módulo "${existing.moduleId}". ` +
        `El módulo "${route.moduleId}" no puede reutilizarla — usa una ruta distinta.`
    )
  }
  routes.push(route)
}

export function getRegisteredRoutes() {
  return routes
}

/** Solo para tests. */
export function resetRoutes() {
  routes.length = 0
}
