/**
 * Parseo + validación de un blueprint.
 *
 * MÓDULO PURO: recibe el YAML como texto. No sabe de dónde salió — puede
 * venir de `import.meta.glob` (navegador, ver load.js) o de `fs` (Node, ver
 * scripts/validate-clients.mjs). Esa separación es lo que permite validar
 * todos los clientes desde la línea de comandos sin arrancar Vite.
 */

import { ConfigError } from '../errors.js'
import { parseYamlOrThrow } from '../../lib/yaml.js'
import { validateBlueprint } from './validate.js'

/**
 * @param {string} rawYaml
 * @param {string} slug
 * @param {string} source  Ruta, solo para los mensajes de error.
 * @param {{coreVersion: string}} context
 * @returns {{blueprint: object, warnings: Array<{path: string, message: string}>}}
 * @throws {ConfigError} Un blueprint inválido nunca se devuelve: se lanza.
 */
export function parseAndValidate(rawYaml, slug, source, context) {
  const parsed = parseYamlOrThrow(rawYaml, { source, label: `El blueprint de "${slug}"` })
  const result = validateBlueprint(parsed, { slug, coreVersion: context.coreVersion })

  if (!result.ok) {
    throw new ConfigError(
      `El blueprint de "${slug}" no cumple el contrato (${result.errors.length} error(es)).`,
      {
        source,
        issues: result.errors,
        hint: 'Contrato completo en docs/client-blueprints/BLUEPRINT-FORMAT.md §3.',
      }
    )
  }

  return { blueprint: result.blueprint, warnings: result.warnings }
}
