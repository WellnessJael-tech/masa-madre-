/**
 * API pública del registro de módulos.
 * Los módulos y el shell importan de aquí, nunca de los archivos internos.
 */
export { resolveModules } from './resolve.js'
export { discoverModules, discoverAdapters } from './catalog.js'
export { loadActiveModules } from './load.js'
