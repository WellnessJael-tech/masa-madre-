/**
 * Metadata del adaptador. CERO imports, cero `import.meta.glob`.
 *
 * Existe porque adapter.js sí usa `import.meta.glob` (solo funciona bajo
 * Vite), y scripts/validate-clients.mjs necesita conocer id/port/isMock desde
 * Node puro para validar que las referencias del blueprint resuelven. Mismo
 * principio que module.js/index.js en el registro de módulos: metadata
 * estática y segura, implementación aparte.
 */
export default {
  id: 'filesystem',
  port: 'content',
  isMock: false,
}
