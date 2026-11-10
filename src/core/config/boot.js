/**
 * Secuencia de arranque.
 *
 * Orquesta ARCHITECTURE.md §5. Si un paso falla, la app NO arranca: se lanza
 * un ConfigError con el detalle. Nunca se arranca a medias
 * (docs/modules/MODULES.md §6).
 *
 * CORRECCIÓN DE ORDEN respecto a ARCHITECTURE.md §5 original (ver ADR-0014):
 * los adaptadores se resuelven ANTES que los módulos. El paso 5 de
 * MODULES.md §6 comprueba que todo puerto que un módulo necesita tenga
 * adaptador; esa comprobación es imposible si los módulos se resuelven
 * primero. El documento tenía los pasos 4 y 5 invertidos.
 *
 * Devuelve el MANIFIESTO DE BUILD (VERSIONING.md §4): la respuesta a
 * "¿qué está corriendo esta tienda?".
 */

import { ConfigError, formatWarnings } from './errors.js'
import { loadBlueprint } from './blueprint/load.js'
import { resolveMode, checkNoMocksInProduction } from './mode.js'
import { resolveAdapters, flattenAdapters } from './adapters.js'
import { resolveModules } from '../registry/resolve.js'

/**
 * @typedef {Object} BootResult
 * @property {object} blueprint
 * @property {import('./mode.js').ModeResolution} mode
 * @property {Record<string, object|object[]>} adapters
 * @property {Array<{id: string, manifest: object, config: object}>} modules
 * @property {string[]} capabilities
 * @property {object} manifest   Manifiesto de build.
 * @property {Array<{path: string, message: string}>} warnings
 */

/**
 * @param {object} input
 * @param {string} input.slug
 * @param {string|undefined} input.rawMode
 * @param {string} input.coreVersion
 * @param {Record<string, object>} input.moduleCatalog
 * @param {Record<string, object>} input.adapterCatalog
 * @param {string} [input.commit]
 * @returns {BootResult}
 */
export function boot(input) {
  const { slug, rawMode, coreVersion, moduleCatalog, adapterCatalog, commit = 'unknown' } = input
  const warnings = []

  // ── 1-2. Cliente + blueprint ─────────────────────────────────────────
  // Lanza si el blueprint es inválido: no llega nada roto al resto del core.
  const { blueprint, warnings: blueprintWarnings } = loadBlueprint(slug, { coreVersion })
  warnings.push(...blueprintWarnings)

  // ── 3. Modo ──────────────────────────────────────────────────────────
  const mode = resolveMode({ rawMode, blueprint })
  warnings.push(...mode.warnings)
  if (mode.errors.length > 0) {
    throw new ConfigError('No se pudo resolver el modo de ejecución.', {
      issues: mode.errors,
      hint: 'Ver docs/business/DEMO-PRODUCTION.md §3.',
    })
  }

  // ── 4. Adaptadores (antes que módulos: ver ADR-0014) ─────────────────
  const adapterResolution = resolveAdapters(adapterCatalog, blueprint)
  warnings.push(...adapterResolution.warnings)
  if (!adapterResolution.ok) {
    throw new ConfigError('No se pudieron resolver los adaptadores.', {
      issues: adapterResolution.errors,
      hint: 'Ver docs/architecture/DELIVERY.md y docs/architecture/PAYMENTS.md.',
    })
  }

  // ── 4b. Guardarraíl: ningún mock en producción ───────────────────────
  const mockIssues = checkNoMocksInProduction(
    mode.mode,
    flattenAdapters(adapterResolution.adapters)
  )
  if (mockIssues.length > 0) {
    throw new ConfigError('Hay adaptadores simulados en un build de producción.', {
      issues: mockIssues,
      hint: 'Ver docs/business/DEMO-PRODUCTION.md §3.',
    })
  }

  // ── 5. Módulos ───────────────────────────────────────────────────────
  const moduleResolution = resolveModules(moduleCatalog, blueprint.modules, {
    availablePorts: adapterResolution.availablePorts,
  })
  warnings.push(...moduleResolution.warnings)
  if (!moduleResolution.ok) {
    throw new ConfigError('No se pudo resolver el conjunto de módulos.', {
      issues: moduleResolution.errors,
      hint: 'Ver docs/modules/MODULES.md §6.',
    })
  }

  // ── 6. Theme ─────────────────────────────────────────────────────────
  // PENDIENTE: hoy el theme base se importa estáticamente desde index.css.
  // La selección del theme del cliente y los themeOverrides se implementan
  // cuando exista el primer theme de cliente.

  // ── 7. Slots ─────────────────────────────────────────────────────────
  // Los declara el shell; las contribuciones de módulos se registran al
  // cargar cada módulo (module.load()), fuera de esta función.

  const manifest = buildManifest({
    slug,
    blueprint,
    mode,
    coreVersion,
    commit,
    modules: moduleResolution.modules,
    adapters: adapterResolution.adapters,
  })

  return {
    blueprint,
    mode,
    adapters: adapterResolution.adapters,
    modules: moduleResolution.modules,
    capabilities: moduleResolution.capabilities,
    manifest,
    warnings,
  }
}

/** Manifiesto de build. Ver docs/architecture/VERSIONING.md §4. */
function buildManifest({ slug, blueprint, mode, coreVersion, commit, modules, adapters }) {
  const adapterSummary = {}
  for (const [port, value] of Object.entries(adapters)) {
    const list = Array.isArray(value) ? value : [value]
    adapterSummary[port] = list.map((a) => a.id).join(',')
  }

  return {
    client: slug,
    coreVersion,
    blueprintVersion: blueprint.blueprintVersion,
    schemaVersion: blueprint.schemaVersion,
    mode: mode.mode,
    status: blueprint.status,
    robots: mode.robots,
    commit,
    builtAt: new Date().toISOString(),
    theme: blueprint.design.theme,
    tier: blueprint.commercial.tier,
    modules: modules.map(({ id, manifest }) => `${id}@${manifest.version ?? '0.0.0'}`),
    adapters: adapterSummary,
  }
}

/** Vuelca los avisos de arranque en consola con formato legible. */
export function reportWarnings(warnings) {
  if (warnings.length === 0) return
  console.warn(formatWarnings(`Avisos de configuración (${warnings.length})`, warnings))
}
