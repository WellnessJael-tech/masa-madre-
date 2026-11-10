/**
 * Carga del blueprint del cliente.
 *
 * CAPA FINA DE VITE. Localiza el YAML y delega parseo y validación en
 * parse.js, que es puro. Aquí solo vive lo que depende del bundler.
 *
 * El cliente se elige en build con VITE_CLIENT (ADR-0003): un despliegue por
 * cliente, sin resolución de tenant en runtime.
 */

import { ConfigError } from '../errors.js'
import { parseAndValidate } from './parse.js'

/** Los YAML de todos los clientes, en crudo. Vite resuelve el patrón en build. */
const BLUEPRINT_FILES = import.meta.glob('/clients/*/blueprint.yaml', {
  eager: true,
  query: '?raw',
  import: 'default',
})

/** @returns {string[]} Slugs de los clientes presentes en el repositorio. */
export function listClients() {
  return Object.keys(BLUEPRINT_FILES)
    .map((path) => path.split('/').at(-2))
    .sort()
}

/**
 * Carga y valida el blueprint de un cliente.
 *
 * @param {string} slug
 * @param {{coreVersion: string}} context
 * @returns {{blueprint: object, warnings: Array<{path: string, message: string}>}}
 * @throws {ConfigError} Si el cliente no existe, el YAML es inválido, o el
 *         blueprint no cumple el contrato. Un blueprint inválido NUNCA llega
 *         al core: se lanza aquí.
 */
export function loadBlueprint(slug, context) {
  const available = listClients()

  if (!slug) {
    throw new ConfigError('No se indicó ningún cliente.', {
      hint:
        `Define VITE_CLIENT al construir. Clientes disponibles: ` +
        `${available.length ? available.join(', ') : '(ninguno)'}.`,
    })
  }

  const path = `/clients/${slug}/blueprint.yaml`
  const raw = BLUEPRINT_FILES[path]

  if (raw === undefined) {
    throw new ConfigError(`No existe el cliente "${slug}".`, {
      source: path,
      hint: `Clientes disponibles: ${available.length ? available.join(', ') : '(ninguno)'}.`,
    })
  }

  return parseAndValidate(raw, slug, path, context)
}
