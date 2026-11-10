/**
 * Manifiesto del módulo admin-content. MÓDULO PURO — sin JSX.
 *
 * Segundo módulo real del catálogo, con una dependencia real: admin-catalog
 * lo requiere (docs/modules/MODULES.md §3 ya documentaba exactamente esta
 * relación desde el Bloque 0). Cierra el pendiente registrado en
 * DECISIONS.md ADR-0021 ("sigue pendiente un par de módulos con dependencia
 * genuina probada con Playwright/validate").
 *
 * Alcance mínimo a propósito: un anuncio de sitio configurable (banner de
 * texto), no un editor de contenido completo — eso sería
 * sobre-construcción para lo que esta fase pide.
 */
export default {
  id: 'admin-content',
  version: '1.0.0',

  requires: [],
  conflictsWith: [],
  optional: [],
  provides: ['content.announcement'],
  ports: [],
  slots: ['layout.header.top'],

  configSchema: {
    announcement: { type: 'string', default: '' },
  },

  manageableBy: 'owner',

  load: () => import('./index.jsx'),
}
