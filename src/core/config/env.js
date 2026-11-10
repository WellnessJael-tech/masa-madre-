/**
 * Único punto donde el core lee `import.meta.env`.
 *
 * CAPA FINA DE VITE. Aislarlo tiene dos efectos: el resto del core queda puro
 * y comprobable con `node --test`, y hay un solo sitio donde auditar qué
 * variables de entorno llegan al navegador.
 *
 * AVISO DE SEGURIDAD: todo lo que se lea aquí acaba en el bundle y es PÚBLICO.
 * Nunca añadas una clave secreta, aunque el repositorio sea privado.
 * Ver docs/architecture/PAYMENTS.md §1.
 */

/** Slug del cliente a construir. Ver ADR-0003. */
export function readClientSlug() {
  return import.meta.env.VITE_CLIENT ?? ''
}

/** Modo crudo, sin normalizar. Lo interpreta core/config/mode.js. */
export function readRawMode() {
  return import.meta.env.VITE_MODE
}

/** Versión del core, inyectada desde package.json en vite.config.js. */
export function readCoreVersion() {
  return __CORE_VERSION__
}

/** true en `vite dev`. */
export function isDev() {
  return import.meta.env.DEV
}
