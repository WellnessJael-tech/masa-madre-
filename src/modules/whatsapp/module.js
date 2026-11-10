/**
 * Manifiesto del módulo whatsapp. MÓDULO PURO — sin JSX, sin imports de
 * React. Es lo único que core/registry/catalog.js carga de forma eager para
 * construir el catálogo; la implementación (index.jsx) se carga solo si el
 * módulo queda activo (load()).
 *
 * Ver docs/modules/MODULES.md §3 (catálogo) y §5 (formato del manifiesto).
 * El más simple del catálogo: sin requires, sin conflictsWith, sin puertos.
 */
export default {
  id: 'whatsapp',
  version: '1.0.0',

  requires: [],
  conflictsWith: [],
  optional: [],
  provides: ['whatsapp.contact'],
  ports: [],

  // Slot ya declarado por el core (core/app/slots.js), exclusivo — un
  // módulo de campaña estacional con CTA flotante competiría por el mismo
  // slot (docs/architecture/SEASONAL-CAMPAIGNS.md §6).
  slots: ['global.floating'],

  configSchema: {
    phone: { type: 'string', required: true, pattern: /^\+\d{6,15}$/ },
    defaultMessage: {
      type: 'string',
      default: 'Hola, quiero hacer una consulta.',
    },
  },

  manageableBy: 'owner',

  load: () => import('./index.jsx'),
}
