/**
 * Validador declarativo mínimo.
 *
 * Se usa en DOS sitios, y por eso vive aparte de ambos:
 *  - el contrato del blueprint (core/config/blueprint/schema.js)
 *  - el `configSchema` de cada módulo (docs/modules/MODULES.md §5)
 *
 * MÓDULO PURO: sin APIs de Vite, sin acceso a disco, sin React. Es lo que
 * permite ejercitarlo con `node --test` sin instalar nada.
 *
 * No es un sustituto de una librería de esquemas: cubre exactamente lo que el
 * proyecto necesita hoy. Si el contrato crece hasta requerir uniones,
 * refinamientos o transformaciones, conviene reevaluar (ver PROP-0014).
 *
 * DESCRIPTORES
 *   { type: 'string',  required?, default?, enum?, pattern?, minLength? }
 *   { type: 'number',  required?, default?, min?, max?, integer? }
 *   { type: 'boolean', required?, default? }
 *   { type: 'object',  fields: {...}, required?, default?, strict? }
 *   { type: 'record',  values: <descriptor>, required?, default? }
 *   { type: 'array',   items: <descriptor>, required?, default?, minItems? }
 *   { type: 'any',     required?, default? }
 *
 * `strict: false` en un objeto silencia el aviso de clave desconocida. Se usa
 * en secciones abiertas por diseño (p. ej. contenido libre del cliente).
 */

/** @typedef {{path: string, message: string}} Issue */
/** @typedef {{ok: boolean, value: unknown, errors: Issue[], warnings: Issue[]}} Result */

const isPlainObject = (v) => typeof v === 'object' && v !== null && !Array.isArray(v)

const typeName = (v) => {
  if (v === null) return 'null'
  if (Array.isArray(v)) return 'array'
  return typeof v
}

/**
 * @param {unknown} value
 * @param {object} descriptor
 * @param {string} [path] Ruta para los mensajes. '' en la raíz.
 * @returns {Result}
 */
export function validate(value, descriptor, path = '') {
  const errors = []
  const warnings = []
  const out = walk(value, descriptor, path, errors, warnings)
  return { ok: errors.length === 0, value: out, errors, warnings }
}

function walk(value, descriptor, path, errors, warnings) {
  const at = path || '(raíz)'

  if (value === undefined || value === null) {
    if (descriptor.required) {
      errors.push({ path: at, message: `Campo obligatorio ausente.` })
      return undefined
    }
    if (descriptor.default === undefined) return undefined
    // No se devuelve el default tal cual: se sigue procesando con él como
    // valor. Así una sección ausente con `default: {}` recibe también los
    // defaults de sus campos anidados, en vez de quedarse en {}.
    value = structuredClone(descriptor.default)
  }

  switch (descriptor.type) {
    case 'string':
      return checkString(value, descriptor, at, errors)
    case 'number':
      return checkNumber(value, descriptor, at, errors)
    case 'boolean':
      if (typeof value !== 'boolean') {
        errors.push({ path: at, message: `Se esperaba booleano, se recibió ${typeName(value)}.` })
        return undefined
      }
      return value
    case 'object':
      return checkObject(value, descriptor, path, at, errors, warnings)
    case 'record':
      return checkRecord(value, descriptor, path, at, errors, warnings)
    case 'array':
      return checkArray(value, descriptor, path, at, errors, warnings)
    case 'any':
      return value
    default:
      errors.push({ path: at, message: `Descriptor con tipo desconocido "${descriptor.type}".` })
      return undefined
  }
}

function checkString(value, d, at, errors) {
  if (typeof value !== 'string') {
    errors.push({ path: at, message: `Se esperaba texto, se recibió ${typeName(value)}.` })
    return undefined
  }
  if (d.enum && !d.enum.includes(value)) {
    errors.push({
      path: at,
      message: `Valor "${value}" no permitido. Valores válidos: ${d.enum.join(', ')}.`,
    })
    return undefined
  }
  if (d.pattern && !d.pattern.test(value)) {
    errors.push({ path: at, message: `"${value}" no cumple el formato esperado (${d.pattern}).` })
    return undefined
  }
  if (d.minLength !== undefined && value.length < d.minLength) {
    errors.push({ path: at, message: `Debe tener al menos ${d.minLength} caracteres.` })
    return undefined
  }
  return value
}

function checkNumber(value, d, at, errors) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    errors.push({ path: at, message: `Se esperaba número, se recibió ${typeName(value)}.` })
    return undefined
  }
  if (d.integer && !Number.isInteger(value)) {
    errors.push({ path: at, message: `Se esperaba un entero, se recibió ${value}.` })
    return undefined
  }
  if (d.min !== undefined && value < d.min) {
    errors.push({ path: at, message: `Debe ser mayor o igual que ${d.min} (recibido ${value}).` })
    return undefined
  }
  if (d.max !== undefined && value > d.max) {
    errors.push({ path: at, message: `Debe ser menor o igual que ${d.max} (recibido ${value}).` })
    return undefined
  }
  return value
}

function checkObject(value, d, path, at, errors, warnings) {
  if (!isPlainObject(value)) {
    errors.push({ path: at, message: `Se esperaba un objeto, se recibió ${typeName(value)}.` })
    return undefined
  }

  const out = {}
  const fields = d.fields ?? {}

  for (const [key, fieldDescriptor] of Object.entries(fields)) {
    const childPath = path ? `${path}.${key}` : key
    const result = walk(value[key], fieldDescriptor, childPath, errors, warnings)
    if (result !== undefined) out[key] = result
  }

  if (d.strict !== false) {
    for (const key of Object.keys(value)) {
      if (key in fields) continue
      const childPath = path ? `${path}.${key}` : key
      warnings.push({
        path: childPath,
        message: `Clave desconocida. Se ignora — revisa si es una errata.${suggest(key, Object.keys(fields))}`,
      })
    }
  } else {
    for (const key of Object.keys(value)) {
      if (!(key in fields)) out[key] = value[key]
    }
  }

  return out
}

function checkRecord(value, d, path, at, errors, warnings) {
  if (!isPlainObject(value)) {
    errors.push({ path: at, message: `Se esperaba un objeto, se recibió ${typeName(value)}.` })
    return undefined
  }
  const out = {}
  for (const [key, entry] of Object.entries(value)) {
    const childPath = path ? `${path}.${key}` : key
    const result = walk(entry, d.values, childPath, errors, warnings)
    if (result !== undefined) out[key] = result
  }
  return out
}

function checkArray(value, d, path, at, errors, warnings) {
  if (!Array.isArray(value)) {
    errors.push({ path: at, message: `Se esperaba una lista, se recibió ${typeName(value)}.` })
    return undefined
  }
  if (d.minItems !== undefined && value.length < d.minItems) {
    errors.push({ path: at, message: `Debe tener al menos ${d.minItems} elemento(s).` })
    return undefined
  }
  return value.map((entry, i) => walk(entry, d.items, `${path}[${i}]`, errors, warnings))
}

/**
 * Sugerencia por distancia de edición. Convierte "el campo no existe" en
 * "quisiste decir X", que es la diferencia entre un aviso útil y uno inútil.
 */
function suggest(key, candidates) {
  let best = null
  let bestDistance = Infinity
  for (const candidate of candidates) {
    const distance = editDistance(key.toLowerCase(), candidate.toLowerCase())
    if (distance < bestDistance) {
      bestDistance = distance
      best = candidate
    }
  }
  const threshold = Math.max(2, Math.floor(key.length / 3))
  return best && bestDistance <= threshold ? ` ¿Quisiste decir "${best}"?` : ''
}

function editDistance(a, b) {
  const rows = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 0; j <= b.length; j++) rows[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      rows[i][j] = Math.min(
        rows[i - 1][j] + 1,
        rows[i][j - 1] + 1,
        rows[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      )
    }
  }
  return rows[a.length][b.length]
}
