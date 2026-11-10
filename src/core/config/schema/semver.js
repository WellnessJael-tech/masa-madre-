/**
 * Comprobación de rango semver, reducida a lo que usa el proyecto.
 *
 * MÓDULO PURO. Sin dependencias: se soportan exactamente las tres formas que
 * documenta docs/architecture/VERSIONING.md §3, no el estándar completo.
 * Cualquier otra sintaxis se RECHAZA con un error claro en vez de aceptarse a
 * medias — un rango mal interpretado desplegaría un core incompatible.
 *
 *   "^1.4"  →  >=1.4.0 <2.0.0     (con major 0, "^0.1" → >=0.1.0 <0.2.0)
 *   "~1.4"  →  >=1.4.0 <1.5.0
 *   "1.4.2" →  exactamente 1.4.2
 */

const VERSION = /^(\d+)\.(\d+)(?:\.(\d+))?$/
const RANGE = /^([\^~]?)(\d+)\.(\d+)(?:\.(\d+))?$/

/** @param {string} input */
export function parseVersion(input) {
  const match = VERSION.exec(String(input).trim())
  if (!match) return null
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: match[3] === undefined ? 0 : Number(match[3]),
  }
}

/**
 * @param {string} version Versión concreta, p. ej. "0.1.0"
 * @param {string} range   Rango, p. ej. "^0.1"
 * @returns {{ok: true} | {ok: false, reason: string}}
 */
export function satisfies(version, range) {
  const v = parseVersion(version)
  if (!v) return { ok: false, reason: `Versión inválida: "${version}".` }

  const match = RANGE.exec(String(range).trim())
  if (!match) {
    return {
      ok: false,
      reason:
        `Rango no soportado: "${range}". Formas admitidas: "^1.4", "~1.4" o "1.4.2" ` +
        `(ver docs/architecture/VERSIONING.md §3).`,
    }
  }

  const [, operator, rawMajor, rawMinor, rawPatch] = match
  const min = {
    major: Number(rawMajor),
    minor: Number(rawMinor),
    patch: rawPatch === undefined ? 0 : Number(rawPatch),
  }

  if (compare(v, min) < 0) {
    return { ok: false, reason: `${version} es anterior al mínimo ${formatVersion(min)}.` }
  }

  let max
  if (operator === '^') {
    // Con major 0 el caret pinta el minor: 0.x se considera inestable.
    max = min.major === 0
      ? { major: 0, minor: min.minor + 1, patch: 0 }
      : { major: min.major + 1, minor: 0, patch: 0 }
  } else if (operator === '~') {
    max = { major: min.major, minor: min.minor + 1, patch: 0 }
  } else {
    if (rawPatch === undefined) {
      return {
        ok: false,
        reason: `Rango exacto "${range}" incompleto: indica major.minor.patch (p. ej. "${rawMajor}.${rawMinor}.0").`,
      }
    }
    return compare(v, min) === 0
      ? { ok: true }
      : { ok: false, reason: `Se exige exactamente ${range}, pero el core es ${version}.` }
  }

  if (compare(v, max) >= 0) {
    return { ok: false, reason: `${version} alcanza o supera el límite ${formatVersion(max)}.` }
  }
  return { ok: true }
}

function compare(a, b) {
  return a.major - b.major || a.minor - b.minor || a.patch - b.patch
}

function formatVersion(v) {
  return `${v.major}.${v.minor}.${v.patch}`
}
