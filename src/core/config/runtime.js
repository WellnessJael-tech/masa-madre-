/**
 * Runtime resuelto de la tienda.
 *
 * El arranque ocurre UNA vez, al cargar el módulo, no durante un render:
 * es una secuencia de inicialización (ARCHITECTURE.md §5), no un cálculo
 * derivado del estado de la UI. Mantenerlo fuera de React evita depender del
 * ciclo de vida de un componente y hace que el fallo se detecte de inmediato.
 *
 * CAPA FINA DE VITE: aquí se juntan el entorno y los catálogos descubiertos
 * por glob. Toda la lógica que ejecuta está en módulos puros.
 */

import { boot, reportWarnings } from './boot.js'
import { ConfigError } from './errors.js'
import { readClientSlug, readRawMode, readCoreVersion, isDev } from './env.js'
import { discoverModules, discoverAdapters } from '../registry/index.js'

/** @type {{ok: true, value: object} | {ok: false, error: Error} | null} */
let cached = null

/**
 * @returns {{ok: true, value: import('./boot.js').BootResult} | {ok: false, error: Error}}
 */
export function getRuntime() {
  if (cached) return cached

  try {
    const value = boot({
      slug: readClientSlug(),
      rawMode: readRawMode(),
      coreVersion: readCoreVersion(),
      moduleCatalog: discoverModules(),
      adapterCatalog: discoverAdapters(),
    })
    reportWarnings(value.warnings)
    if (isDev()) console.info('[core] Manifiesto de build:', value.manifest)
    cached = { ok: true, value }
  } catch (error) {
    console.error(error instanceof ConfigError ? error.format() : error)
    cached = { ok: false, error }
  }

  return cached
}

/** Solo para tests: fuerza un nuevo arranque. */
export function resetRuntime() {
  cached = null
}
