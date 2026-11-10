/**
 * Parseo de YAML con errores legibles.
 * MÓDULO PURO — usado por blueprint/parse.js y catalog/parse.js para no
 * duplicar el manejo de YAMLException.
 */
import { load as parseYamlLib, YAMLException } from 'js-yaml'
import { ConfigError } from '../config/errors.js'

/**
 * @param {string} rawYaml
 * @param {object} opts
 * @param {string} opts.source  Ruta, para el mensaje de error.
 * @param {string} [opts.label] Qué es el archivo, para el título del error.
 */
export function parseYamlOrThrow(rawYaml, { source, label = 'El archivo' }) {
  try {
    return parseYamlLib(rawYaml, { filename: source })
  } catch (error) {
    const where =
      error instanceof YAMLException && error.mark
        ? ` (línea ${error.mark.line + 1}, columna ${error.mark.column + 1})`
        : ''
    throw new ConfigError(`${label} no es YAML válido${where}.`, {
      source,
      issues: [{ path: 'YAML', message: error.reason ?? error.message }],
      hint: 'Revisa la indentación y los dos puntos. El YAML no admite tabuladores.',
    })
  }
}
