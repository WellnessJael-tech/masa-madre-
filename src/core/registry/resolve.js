/**
 * Resolución del conjunto de módulos activos.
 *
 * MÓDULO PURO: recibe el catálogo de manifiestos y la configuración del
 * cliente, y devuelve la lista ordenada de módulos activos o los errores que
 * lo impiden. No importa ningún módulo, no toca Vite, no toca React.
 *
 * Implementa el orden de validación de docs/modules/MODULES.md §6:
 *   1. existencia  2. dependencias  3. conflictos  4. ciclos
 *   5. puertos     6. config        7. (slots: en tiempo de registro)
 *
 * El CORE NUNCA importa un módulo. El catálogo se le inyecta (ver catalog.js),
 * así que añadir un módulo nuevo no toca este archivo ni ningún otro del core.
 */

import { validate } from '../config/schema/validator.js'

/**
 * @typedef {Object} ModuleManifest
 * @property {string}   id
 * @property {string}   version
 * @property {string[]} [requires]      Dependencias duras.
 * @property {string[]} [conflictsWith] Incompatibilidades declaradas.
 * @property {string[]} [optional]      Blandas: si están, se integra; si no, degrada.
 * @property {string[]} [provides]      Capacidades publicadas.
 * @property {string[]} [ports]         Puertos que necesita resueltos.
 * @property {string[]} [slots]         Slots que rellena.
 * @property {object}   [configSchema]  Descriptor validable.
 * @property {string}   [manageableBy]
 * @property {Function} [load]          Carga diferida del código del módulo.
 */

/**
 * @typedef {Object} ResolveResult
 * @property {boolean} ok
 * @property {Array<{id: string, manifest: ModuleManifest, config: object}>} modules Orden topológico.
 * @property {string[]} capabilities
 * @property {Array<{path: string, message: string}>} errors
 * @property {Array<{path: string, message: string}>} warnings
 */

/**
 * @param {Record<string, ModuleManifest>} catalog  id → manifiesto
 * @param {Record<string, {enabled?: boolean, config?: object}>} requested  blueprint.modules
 * @param {{availablePorts?: string[]}} [options]
 * @returns {ResolveResult}
 */
export function resolveModules(catalog, requested = {}, options = {}) {
  const errors = []
  const warnings = []
  const availablePorts = new Set(options.availablePorts ?? [])

  const catalogIds = Object.keys(catalog)

  // ── 1. Existencia ────────────────────────────────────────────────────
  const enabled = []
  for (const [id, entry] of Object.entries(requested)) {
    if (!catalog[id]) {
      errors.push({
        path: `modules.${id}`,
        message:
          `Módulo desconocido "${id}".` +
          suggestion(id, catalogIds) +
          ` Módulos disponibles: ${catalogIds.length ? catalogIds.join(', ') : '(ninguno)'}.`,
      })
      continue
    }
    if (entry?.enabled !== false) enabled.push(id)
  }
  if (errors.length > 0) return failure(errors, warnings)

  const active = new Set(enabled)

  // ── 2. Dependencias duras ────────────────────────────────────────────
  for (const id of enabled) {
    for (const dependency of catalog[id].requires ?? []) {
      if (!catalog[dependency]) {
        errors.push({
          path: `modules.${id}`,
          message:
            `"${id}" requiere el módulo "${dependency}", que no existe en el catálogo. ` +
            `Es un defecto del manifiesto de "${id}", no del blueprint.`,
        })
      } else if (!active.has(dependency)) {
        errors.push({
          path: `modules.${id}`,
          message:
            `"${id}" requiere "${dependency}", que está desactivado. ` +
            `Activa "${dependency}" o desactiva "${id}".`,
        })
      }
    }
  }

  // ── 3. Conflictos ────────────────────────────────────────────────────
  for (const id of enabled) {
    for (const other of catalog[id].conflictsWith ?? []) {
      if (active.has(other)) {
        errors.push({
          path: `modules.${id}`,
          message: `"${id}" y "${other}" son incompatibles y ambos están activos. Desactiva uno.`,
        })
      }
    }
  }

  // ── 5. Puertos ───────────────────────────────────────────────────────
  for (const id of enabled) {
    for (const port of catalog[id].ports ?? []) {
      if (!availablePorts.has(port)) {
        errors.push({
          path: `modules.${id}`,
          message:
            `"${id}" necesita el puerto "${port}", que no tiene ningún adaptador resuelto. ` +
            `Configura un adaptador para "${port}" o desactiva "${id}".`,
        })
      }
    }
  }

  // ── 4. Ciclos + orden topológico ─────────────────────────────────────
  const ordering = topologicalOrder(enabled, catalog)
  if (ordering.cycle) {
    errors.push({
      path: 'modules',
      message:
        `Dependencia circular entre módulos: ${ordering.cycle.join(' → ')}. ` +
        `Rompe el ciclo: un módulo no puede depender (ni indirectamente) de sí mismo.`,
    })
  }

  if (errors.length > 0) return failure(errors, warnings)

  // ── 6. Configuración de cada módulo ──────────────────────────────────
  const modules = []
  for (const id of ordering.order) {
    const manifest = catalog[id]
    const provided = requested[id]?.config ?? {}

    if (!manifest.configSchema) {
      if (Object.keys(provided).length > 0) {
        warnings.push({
          path: `modules.${id}.config`,
          message: `El módulo "${id}" no declara configSchema; se ignora la config suministrada.`,
        })
      }
      modules.push({ id, manifest, config: {} })
      continue
    }

    const result = validate(provided, { type: 'object', fields: manifest.configSchema })
    for (const issue of result.errors) {
      errors.push({ path: `modules.${id}.config.${issue.path}`, message: issue.message })
    }
    for (const issue of result.warnings) {
      warnings.push({ path: `modules.${id}.config.${issue.path}`, message: issue.message })
    }
    modules.push({ id, manifest, config: result.value ?? {} })
  }

  // ── Dependencias blandas: informar, nunca fallar ─────────────────────
  for (const id of enabled) {
    for (const soft of catalog[id].optional ?? []) {
      if (!active.has(soft)) {
        warnings.push({
          path: `modules.${id}`,
          message: `"${id}" se integra con "${soft}", que no está activo. Funcionará en modo degradado.`,
        })
      }
    }
  }

  if (errors.length > 0) return failure(errors, warnings)

  const capabilities = modules.flatMap(({ manifest }) => manifest.provides ?? [])
  const duplicated = capabilities.filter((c, i, all) => all.indexOf(c) !== i)
  for (const capability of new Set(duplicated)) {
    warnings.push({
      path: 'modules',
      message: `La capacidad "${capability}" la publican varios módulos activos.`,
    })
  }

  return { ok: true, modules, capabilities: [...new Set(capabilities)], errors, warnings }
}

/**
 * Orden topológico determinista: los módulos se inicializan después de sus
 * dependencias. El desempate alfabético evita que el orden dependa del orden
 * de las claves en el YAML, que no es de fiar.
 */
function topologicalOrder(ids, catalog) {
  const order = []
  const state = new Map() // id → 'visiting' | 'done'
  const stack = []
  let cycle = null

  const visit = (id) => {
    if (cycle) return
    if (state.get(id) === 'done') return
    if (state.get(id) === 'visiting') {
      cycle = [...stack.slice(stack.indexOf(id)), id]
      return
    }
    state.set(id, 'visiting')
    stack.push(id)
    const dependencies = (catalog[id]?.requires ?? []).filter((d) => ids.includes(d))
    for (const dependency of [...dependencies].sort()) visit(dependency)
    stack.pop()
    state.set(id, 'done')
    order.push(id)
  }

  for (const id of [...ids].sort()) visit(id)
  return { order, cycle }
}

function suggestion(id, candidates) {
  const near = candidates.find(
    (candidate) =>
      candidate.startsWith(id.slice(0, 3)) || id.startsWith(candidate.slice(0, 3))
  )
  return near ? ` ¿Quisiste decir "${near}"?` : ''
}

function failure(errors, warnings) {
  return { ok: false, modules: [], capabilities: [], errors, warnings }
}
