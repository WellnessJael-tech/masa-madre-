/**
 * Validación del blueprint.
 *
 * MÓDULO PURO: recibe el objeto ya parseado y devuelve un resultado. No lee
 * disco, no conoce Vite y no lanza — quien decide qué hacer con los errores es
 * el cargador (load.js) o el script de validación.
 *
 * Cubre las reglas de docs/client-blueprints/BLUEPRINT-FORMAT.md §4 que
 * dependen solo del propio blueprint. Las que necesitan disco o cálculo de
 * color (existencia de assets, contraste AA, colores prohibidos en el theme)
 * NO están aquí y siguen pendientes: ver §Pendiente en el informe del bloque.
 */

import { validate } from '../schema/validator.js'
import { satisfies } from '../schema/semver.js'
import { blueprintSchema, BLUEPRINT_SCHEMA_VERSION } from './schema.js'

/**
 * @typedef {Object} BlueprintValidationResult
 * @property {boolean} ok
 * @property {object|null} blueprint  Valor normalizado, con defaults aplicados.
 * @property {Array<{path: string, message: string}>} errors
 * @property {Array<{path: string, message: string}>} warnings
 */

/**
 * @param {unknown} raw          Blueprint ya parseado desde YAML.
 * @param {object} context
 * @param {string} context.slug         Slug esperado (nombre de la carpeta).
 * @param {string} context.coreVersion  Versión del core en ejecución.
 * @returns {BlueprintValidationResult}
 */
export function validateBlueprint(raw, context) {
  const { slug, coreVersion } = context

  if (raw === null || raw === undefined) {
    return fail('(raíz)', 'El blueprint está vacío o no se pudo interpretar.')
  }
  if (typeof raw !== 'object' || Array.isArray(raw)) {
    return fail('(raíz)', 'El blueprint debe ser un mapa YAML de nivel superior.')
  }

  const result = validate(raw, blueprintSchema)
  const errors = [...result.errors]
  const warnings = [...result.warnings]
  const blueprint = result.value

  // Estas comprobaciones cruzadas solo tienen sentido si la estructura es válida.
  if (errors.length === 0) {
    checkSchemaVersion(blueprint, errors)
    checkSlug(blueprint, slug, errors)
    checkCoreRange(blueprint, coreVersion, errors)
    checkStatusConsistency(blueprint, errors, warnings)
    checkBranchReferences(blueprint, errors)
    checkDeclaredIntent(blueprint, warnings)
  }

  return { ok: errors.length === 0, blueprint: errors.length === 0 ? blueprint : null, errors, warnings }
}

function checkSchemaVersion(blueprint, errors) {
  if (blueprint.schemaVersion !== BLUEPRINT_SCHEMA_VERSION) {
    errors.push({
      path: 'schemaVersion',
      message:
        `El core entiende la versión de esquema ${BLUEPRINT_SCHEMA_VERSION}, ` +
        `el blueprint declara ${blueprint.schemaVersion}. ` +
        `Migra el blueprint o usa un core compatible.`,
    })
  }
}

function checkSlug(blueprint, expectedSlug, errors) {
  if (expectedSlug && blueprint.slug !== expectedSlug) {
    errors.push({
      path: 'slug',
      message:
        `El slug "${blueprint.slug}" no coincide con la carpeta "${expectedSlug}". ` +
        `Deben ser idénticos.`,
    })
  }
}

function checkCoreRange(blueprint, coreVersion, errors) {
  const check = satisfies(coreVersion, blueprint.core)
  if (!check.ok) {
    errors.push({
      path: 'core',
      message:
        `El core en ejecución (${coreVersion}) no satisface el rango "${blueprint.core}". ` +
        `${check.reason} Actualiza el rango en el blueprint o despliega un core compatible.`,
    })
  }
}

function checkStatusConsistency(blueprint, errors, warnings) {
  const live = blueprint.status === 'live'

  if (live && blueprint.assets?.approved === false) {
    errors.push({
      path: 'assets.approved',
      message:
        `No se puede publicar (status: live) con los recursos gráficos sin aprobar. ` +
        `Confirma la aprobación con el cliente y pon assets.approved: true.`,
    })
  }

  const missing = blueprint.assets?.missing ?? []
  if (live && missing.length > 0) {
    warnings.push({
      path: 'assets.missing',
      message: `Se publica con recursos pendientes: ${missing.join(', ')}.`,
    })
  }

  if (!live && blueprint.seo?.robots === 'allow') {
    warnings.push({
      path: 'seo.robots',
      message:
        `status es "${blueprint.status}" pero robots está en "allow". ` +
        `Se forzará "disallow" para no indexar una tienda que no está publicada.`,
    })
  }
}

/** Las sucursales referenciadas por pickup deben existir y admitir retiro. */
function checkBranchReferences(blueprint, errors) {
  const branches = blueprint.branches ?? []
  const byId = new Map(branches.map((b) => [b.id, b]))
  const referenced = blueprint.delivery?.pickup?.branches ?? []

  for (const id of referenced) {
    const branch = byId.get(id)
    if (!branch) {
      errors.push({
        path: 'delivery.pickup.branches',
        message:
          `Sucursal "${id}" no existe. Sucursales declaradas: ` +
          `${branches.length ? [...byId.keys()].join(', ') : '(ninguna)'}.`,
      })
    } else if (branch.pickup === false) {
      errors.push({
        path: 'delivery.pickup.branches',
        message: `La sucursal "${id}" se ofrece para retiro pero tiene pickup: false.`,
      })
    }
  }

  const duplicates = branches
    .map((b) => b.id)
    .filter((id, i, all) => all.indexOf(id) !== i)
  for (const id of new Set(duplicates)) {
    errors.push({ path: 'branches', message: `Id de sucursal duplicado: "${id}".` })
  }
}

/**
 * `roadmap` y `excluded` no afectan al build, pero un módulo listado en ambos
 * (o activo y a la vez excluido) delata una contradicción en lo acordado.
 */
function checkDeclaredIntent(blueprint, warnings) {
  const enabled = Object.entries(blueprint.modules ?? {})
    .filter(([, m]) => m.enabled)
    .map(([id]) => id)

  for (const entry of blueprint.excluded ?? []) {
    if (enabled.includes(entry.module)) {
      warnings.push({
        path: 'excluded',
        message:
          `El módulo "${entry.module}" está activo y a la vez marcado como excluido ` +
          `("${entry.reason ?? 'sin motivo'}"). Revisa qué se acordó con el cliente.`,
      })
    }
  }

  for (const entry of blueprint.roadmap ?? []) {
    if (enabled.includes(entry.module)) {
      warnings.push({
        path: 'roadmap',
        message: `El módulo "${entry.module}" ya está activo; sobra en el roadmap.`,
      })
    }
  }
}

function fail(path, message) {
  return { ok: false, blueprint: null, errors: [{ path, message }], warnings: [] }
}
