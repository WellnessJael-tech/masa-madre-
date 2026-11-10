/**
 * API pública del registro de rutas.
 * Los módulos y el shell importan de aquí, nunca de registry.js directamente.
 */
export { registerRoute, getRegisteredRoutes, resetRoutes } from './registry.js'
