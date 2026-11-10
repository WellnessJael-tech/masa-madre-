/**
 * Errores de configuración.
 *
 * MÓDULO PURO.
 *
 * Regla de docs/modules/MODULES.md §6: cualquier fallo de configuración
 * DETIENE el arranque con un mensaje accionable. Una tienda que arranca mal
 * configurada pierde ventas en silencio; una que no arranca se detecta en el
 * despliegue. El mensaje incluye siempre dónde está el problema y qué hacer.
 */

export class ConfigError extends Error {
  /**
   * @param {string} title
   * @param {{path?: string, issues?: Array<{path: string, message: string}>, hint?: string, source?: string}} [detail]
   */
  constructor(title, detail = {}) {
    super(title)
    this.name = 'ConfigError'
    this.title = title
    this.path = detail.path ?? null
    this.issues = detail.issues ?? []
    this.hint = detail.hint ?? null
    this.source = detail.source ?? null
  }

  /** Texto multilínea legible, para consola y para la pantalla de error en DEV. */
  format() {
    const lines = [`✖ ${this.title}`]
    if (this.source) lines.push(`  archivo: ${this.source}`)
    for (const issue of this.issues) lines.push(`  · ${issue.path}: ${issue.message}`)
    if (this.hint) lines.push(`  → ${this.hint}`)
    return lines.join('\n')
  }
}

/**
 * Formatea avisos con el mismo aspecto que los errores, para que no pasen
 * desapercibidos en el log de un despliegue.
 * @param {string} title
 * @param {Array<{path: string, message: string}>} issues
 */
export function formatWarnings(title, issues) {
  if (issues.length === 0) return ''
  return [`⚠ ${title}`, ...issues.map((i) => `  · ${i.path}: ${i.message}`)].join('\n')
}
