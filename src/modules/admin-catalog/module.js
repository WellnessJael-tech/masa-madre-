/**
 * Manifiesto del módulo admin-catalog. MÓDULO PURO — sin JSX.
 *
 * ABM (alta/baja/modificación) de productos desde una ruta protegida, sin
 * tocar código. Requiere admin-content — exactamente la relación que
 * docs/modules/MODULES.md §3 documentaba desde el Bloque 0. Primera
 * dependencia real entre dos módulos de producción (antes solo probada con
 * un catálogo sintético en resolve.test.js). Ver DECISIONS.md ADR-0023.
 */
export default {
  id: 'admin-catalog',
  version: '1.0.0',

  requires: ['admin-content'],
  conflictsWith: [],
  optional: [],
  provides: ['admin.catalog-editor'],
  ports: [],
  slots: [],

  configSchema: {
    // ⚠️ NO es seguridad real: la contraseña viaja en el blueprint, que se
    // empaqueta en el bundle del navegador. Cualquiera puede leerla desde
    // las herramientas de desarrollador. Ver ADR-0021.
    password: { type: 'string', required: true, minLength: 4 },
    basePath: { type: 'string', default: '/admin' },
  },

  // Solo nosotros activamos/configuramos esto — no es autogestionable por
  // un cliente MANAGED ni OWNERSHIP todavía (TIERS.md, sin implementar en
  // código: ver auditoría de pendientes).
  manageableBy: 'operator',

  load: () => import('./index.jsx'),
}
