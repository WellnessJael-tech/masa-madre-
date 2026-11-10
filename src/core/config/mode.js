/**
 * Resolutor de modo DEMO / PRODUCTION.
 *
 * MÓDULO PURO: recibe el valor crudo del entorno y devuelve el modo resuelto
 * con sus consecuencias. Quien lee `import.meta.env` es env.js.
 *
 * Implementa docs/business/DEMO-PRODUCTION.md §3.
 *
 * IDEA CENTRAL: el modo NO cambia la UI. Solo cambia qué adaptador se resuelve
 * detrás de cada puerto. Por eso este archivo no exporta ningún componente ni
 * ninguna bandera que un componente deba consultar — salvo `showDemoBadge`,
 * que es marcado visual y se aplica una sola vez en el shell, no en cada
 * componente.
 */

export const MODES = Object.freeze({ DEMO: 'demo', PRODUCTION: 'production' })

/** El default es el modo que NO puede engañar a nadie. */
export const DEFAULT_MODE = MODES.DEMO

/**
 * @typedef {Object} ModeResolution
 * @property {'demo'|'production'} mode
 * @property {boolean} isDemo
 * @property {boolean} isProduction
 * @property {boolean} showDemoBadge   Marcado visual obligatorio y no descartable.
 * @property {boolean} allowMockAdapters
 * @property {'allow'|'disallow'} robots
 * @property {Array<{path: string, message: string}>} errors
 * @property {Array<{path: string, message: string}>} warnings
 */

/**
 * @param {object} input
 * @param {string|undefined} input.rawMode  Valor crudo de VITE_MODE.
 * @param {object|null} [input.blueprint]   Blueprint ya validado.
 * @returns {ModeResolution}
 */
export function resolveMode({ rawMode, blueprint = null }) {
  const errors = []
  const warnings = []

  let mode = DEFAULT_MODE

  if (rawMode === undefined || rawMode === null || rawMode === '') {
    warnings.push({
      path: 'VITE_MODE',
      message: `Sin definir. Se asume "${DEFAULT_MODE}", que es el default seguro.`,
    })
  } else if (rawMode === MODES.DEMO || rawMode === MODES.PRODUCTION) {
    mode = rawMode
  } else {
    errors.push({
      path: 'VITE_MODE',
      message:
        `Valor no reconocido: "${rawMode}". Valores válidos: ` +
        `"${MODES.DEMO}" o "${MODES.PRODUCTION}".`,
    })
  }

  const isProduction = mode === MODES.PRODUCTION

  if (isProduction && blueprint) {
    if (blueprint.assets?.approved === false) {
      errors.push({
        path: 'assets.approved',
        message:
          `No se puede construir en producción con los recursos gráficos sin aprobar. ` +
          `Confirma la aprobación y pon assets.approved: true.`,
      })
    }
    if (blueprint.status !== 'live') {
      warnings.push({
        path: 'status',
        message:
          `Build de producción con status "${blueprint.status}". ` +
          `Se fuerza robots: disallow para no indexar una tienda sin publicar.`,
      })
    }
  }

  const robots = isProduction && blueprint?.status === 'live' ? 'allow' : 'disallow'

  return {
    mode,
    isDemo: mode === MODES.DEMO,
    isProduction,
    showDemoBadge: mode === MODES.DEMO,
    allowMockAdapters: mode === MODES.DEMO,
    robots,
    errors,
    warnings,
  }
}

/**
 * EL GUARDARRAÍL. Convierte "no publicar mocks" de intención a garantía.
 *
 * Se ejecuta después de resolver los adaptadores: si el modo es producción y
 * algún adaptador resuelto está marcado como simulado, el arranque falla.
 *
 * @param {'demo'|'production'} mode
 * @param {Record<string, {id: string, isMock: boolean}>} resolvedAdapters puerto → adaptador
 * @returns {Array<{path: string, message: string}>}
 */
export function checkNoMocksInProduction(mode, resolvedAdapters) {
  if (mode !== MODES.PRODUCTION) return []

  return Object.entries(resolvedAdapters)
    .filter(([, adapter]) => adapter?.isMock === true)
    .map(([port, adapter]) => ({
      path: `adapters.${port}`,
      message:
        `El adaptador "${adapter.id}" es simulado (isMock) y el modo es producción. ` +
        `Sustitúyelo por un adaptador real o desactiva la funcionalidad. ` +
        `Nunca se publica un mock como si fuera real.`,
    }))
}
