/**
 * Contrato del Client Blueprint.
 *
 * Traduce docs/client-blueprints/BLUEPRINT-FORMAT.md §3 a descriptores
 * validables. MÓDULO PURO.
 *
 * CRITERIO DE ESTRICTEZ
 * Las secciones que el CORE consume para tomar decisiones (meta, modules,
 * features, delivery, payments, commercial…) se tipan estrictamente: un error
 * ahí produce una tienda mal configurada.
 * Las secciones puramente descriptivas o de presentación (branding, assets,
 * marketing…) se validan de forma abierta (`strict: false`): equivocarse ahí
 * es visible de inmediato, y cerrarlas obligaría a tocar el core cada vez que
 * un cliente necesita un matiz nuevo.
 */

import { moneyDescriptor as money } from '../../commerce/money.js'

export const BLUEPRINT_SCHEMA_VERSION = 1

const eta = {
  type: 'object',
  fields: {
    type: { type: 'string', enum: ['exact', 'range', 'manual', 'none'], default: 'range' },
    minMinutes: { type: 'number', min: 0 },
    maxMinutes: { type: 'number', min: 0 },
  },
}

export const blueprintSchema = {
  type: 'object',
  fields: {
    // ── META ────────────────────────────────────────────────────────────
    schemaVersion: { type: 'number', required: true, integer: true, min: 1 },
    blueprintVersion: { type: 'string', required: true, pattern: /^\d+\.\d+\.\d+$/ },
    core: { type: 'string', required: true },
    slug: { type: 'string', required: true, pattern: /^[a-z0-9]+(-[a-z0-9]+)*$/ },
    status: {
      type: 'string',
      required: true,
      enum: ['draft', 'staging', 'live', 'archived'],
    },

    // ── IDENTIDAD ───────────────────────────────────────────────────────
    identity: {
      type: 'object',
      required: true,
      strict: false,
      fields: {
        legalName: { type: 'string' },
        tradeName: { type: 'string', required: true, minLength: 1 },
        taxId: { type: 'string' },
        tagline: { type: 'string' },
        description: { type: 'string' },
        industry: { type: 'string' },
        valueProposition: { type: 'string' },
        tone: { type: 'string' },
        locales: { type: 'array', items: { type: 'string' }, default: ['es'] },
        defaultLocale: { type: 'string', default: 'es' },
        countries: { type: 'array', items: { type: 'string' }, default: [] },
        audience: { type: 'object', strict: false, fields: {} },
        contact: { type: 'object', strict: false, fields: {} },
      },
    },

    // ── PRESENTACIÓN (abierta a propósito) ──────────────────────────────
    branding: { type: 'object', strict: false, fields: {}, default: {} },
    assets: {
      type: 'object',
      strict: false,
      default: { approved: false },
      fields: {
        approved: { type: 'boolean', default: false },
        missing: { type: 'array', items: { type: 'string' }, default: [] },
      },
    },
    design: {
      type: 'object',
      strict: false,
      required: true,
      fields: {
        theme: { type: 'string', required: true, pattern: /^[a-z0-9_]+(-[a-z0-9]+)*$/ },
        themeOverrides: { type: 'record', values: { type: 'string' }, default: {} },
        animations: { type: 'string', enum: ['none', 'subtle', 'expressive'], default: 'subtle' },
        respectReducedMotion: { type: 'boolean', default: true },
      },
    },
    marketing: { type: 'object', strict: false, fields: {}, default: {} },
    seo: { type: 'object', strict: false, fields: {}, default: {} },

    // ── CONTENIDO ───────────────────────────────────────────────────────
    // Único adaptador hoy: filesystem (core/catalog + adapters/content/filesystem).
    // Ver ADR-0016.
    content: {
      type: 'object',
      default: { adapter: 'filesystem' },
      fields: {
        adapter: { type: 'string', default: 'filesystem' },
      },
    },

    // ── MÓDULOS ─────────────────────────────────────────────────────────
    modules: {
      type: 'record',
      default: {},
      values: {
        type: 'object',
        fields: {
          enabled: { type: 'boolean', default: true },
          config: { type: 'object', strict: false, fields: {}, default: {} },
        },
      },
    },
    roadmap: {
      type: 'array',
      default: [],
      items: {
        type: 'object',
        fields: {
          module: { type: 'string', required: true },
          when: { type: 'string' },
          note: { type: 'string' },
        },
      },
    },
    excluded: {
      type: 'array',
      default: [],
      items: {
        type: 'object',
        fields: {
          module: { type: 'string', required: true },
          reason: { type: 'string' },
        },
      },
    },

    // ── FLAGS DE CORE ───────────────────────────────────────────────────
    features: {
      type: 'object',
      default: {},
      fields: {
        search: {
          type: 'object',
          default: { enabled: true, minChars: 2 },
          fields: {
            enabled: { type: 'boolean', default: true },
            minChars: { type: 'number', integer: true, min: 1, default: 2 },
          },
        },
        filters: {
          type: 'object',
          default: {},
          strict: false,
          fields: {
            facets: { type: 'array', items: { type: 'string' }, default: [] },
            defaultSort: { type: 'string', default: 'relevance' },
          },
        },
        stock: {
          type: 'object',
          default: {},
          fields: {
            show: { type: 'boolean', default: true },
            allowBackorder: { type: 'boolean', default: false },
            lowStockThreshold: { type: 'number', integer: true, min: 0, default: 5 },
          },
        },
        checkout: {
          type: 'object',
          default: {},
          fields: {
            guestCheckout: { type: 'boolean', default: true },
            steps: {
              type: 'array',
              items: { type: 'string' },
              default: ['contact', 'delivery', 'payment', 'review'],
            },
          },
        },
      },
    },

    // ── COMERCIO ────────────────────────────────────────────────────────
    commerce: {
      type: 'object',
      required: true,
      strict: false,
      fields: {
        currency: { type: 'string', required: true, pattern: /^[A-Z]{3}$/ },
        minOrder: money(),
        priceDisplay: {
          type: 'object',
          default: {},
          strict: false,
          fields: {
            taxIncluded: { type: 'boolean', default: true },
            showStrikethrough: { type: 'boolean', default: true },
          },
        },
      },
    },

    // ── LOGÍSTICA ───────────────────────────────────────────────────────
    branches: {
      type: 'array',
      default: [],
      items: {
        type: 'object',
        strict: false,
        fields: {
          id: { type: 'string', required: true, pattern: /^[a-z0-9]+(-[a-z0-9]+)*$/ },
          name: { type: 'string', required: true },
          address: { type: 'string' },
          pickup: { type: 'boolean', default: false },
          hours: { type: 'record', values: { type: 'string' }, default: {} },
        },
      },
    },
    delivery: {
      type: 'object',
      default: {},
      strict: false,
      fields: {
        adapters: { type: 'array', items: { type: 'string' }, default: [] },
        optionOrder: { type: 'string', enum: ['price', 'eta', 'manual'], default: 'price' },
        quoteTimeoutMs: { type: 'number', integer: true, min: 500, max: 30000, default: 5000 },
        ownDelivery: {
          type: 'object',
          strict: false,
          fields: {
            coverage: {
              type: 'string',
              enum: ['zone-list', 'radius', 'polygon', 'postal-code'],
              default: 'zone-list',
            },
            zones: {
              type: 'array',
              default: [],
              items: {
                type: 'object',
                strict: false,
                fields: {
                  id: { type: 'string', required: true },
                  label: { type: 'string', required: true },
                  fee: money(true),
                  minOrder: money(),
                  freeOver: money(),
                  eta,
                },
              },
            },
          },
        },
        pickup: {
          type: 'object',
          strict: false,
          fields: {
            branches: { type: 'array', items: { type: 'string' }, default: [] },
            preparationMinutes: { type: 'number', integer: true, min: 0, default: 20 },
          },
        },
      },
    },

    // ── PAGOS ───────────────────────────────────────────────────────────
    payments: {
      type: 'object',
      default: {},
      strict: false,
      fields: {
        adapters: { type: 'array', items: { type: 'string' }, default: [] },
        releaseOn: { type: 'string', enum: ['paid', 'submitted'], default: 'paid' },
        orderStates: { type: 'record', values: { type: 'string' }, default: {} },
      },
    },

    // ── MÉTRICAS ────────────────────────────────────────────────────────
    analytics: {
      type: 'object',
      default: {},
      strict: false,
      fields: {
        // Default vacío = sin analítica. NUNCA 'mock': no existe ningún
        // adaptador de analítica todavía; un default que asuma uno
        // inexistente rompería el build de cualquier cliente que no lo
        // sobrescriba. Descubierto verificando el guardarraíl del Bloque 3.
        adapter: { type: 'string', default: '' },
        track: { type: 'array', items: { type: 'string' }, default: [] },
        consent: {
          type: 'object',
          default: {},
          fields: {
            required: { type: 'boolean', default: true },
            mode: { type: 'string', enum: ['opt-in', 'opt-out'], default: 'opt-in' },
          },
        },
      },
    },

    // ── COMERCIAL ───────────────────────────────────────────────────────
    commercial: {
      type: 'object',
      required: true,
      strict: false,
      fields: {
        tier: { type: 'string', required: true, enum: ['managed', 'ownership'] },
        addOns: { type: 'array', items: { type: 'string' }, default: [] },
        contentManagedBy: { type: 'string', enum: ['us', 'client'], default: 'us' },
        acceptanceCriteria: { type: 'array', items: { type: 'string' }, default: [] },
      },
    },
  },
}
