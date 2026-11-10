/**
 * Contrato de producto y categoría.
 *
 * Ver docs/client-blueprints/BLUEPRINT-FORMAT.md (commerce.products,
 * commerce.categories). El catálogo es CORE-fijo, no un módulo — ver
 * docs/modules/MODULES.md §3 (PROP-0001).
 *
 * MÓDULO PURO.
 */
import { moneyDescriptor } from '../commerce/money.js'

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/

export const categorySchema = {
  type: 'object',
  fields: {
    id: { type: 'string', required: true, pattern: SLUG_PATTERN },
    name: { type: 'string', required: true, minLength: 1 },
    parentId: { type: 'string' },
  },
}

/** clients/<slug>/content/categories.yaml contiene una LISTA de categorías. */
export const categoryListSchema = { type: 'array', items: categorySchema, default: [] }

export const productSchema = {
  type: 'object',
  fields: {
    id: { type: 'string', required: true, pattern: SLUG_PATTERN },
    name: { type: 'string', required: true, minLength: 1 },
    description: { type: 'string', default: '' },
    categoryId: { type: 'string', required: true },
    price: moneyDescriptor(true),
    compareAtPrice: moneyDescriptor(false),
    images: {
      type: 'array',
      default: [],
      items: {
        type: 'object',
        fields: {
          src: { type: 'string', required: true },
          alt: { type: 'string', default: '' },
        },
      },
    },
    stock: {
      type: 'object',
      default: {},
      fields: {
        quantity: { type: 'number', integer: true, min: 0, default: 0 },
      },
    },
  },
}
