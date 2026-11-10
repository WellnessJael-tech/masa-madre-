/**
 * Metadata del theme base.
 *
 * DECLARATIVO ÚNICAMENTE. Un theme no contiene lógica de negocio ni importa
 * nada del core (docs/architecture/ARCHITECTURE.md §3). Si un theme necesita
 * ejecutar algo, el diseño está mal: eso pertenece al core o a un módulo.
 *
 * @typedef {Object} ThemeMeta
 * @property {string}  id
 * @property {string}  name
 * @property {boolean} isBase       El theme base no se asigna a un cliente.
 * @property {'light'|'dark'|'both'} colorScheme
 * @property {string[]} tokens      Tokens del contrato, para validar que un
 *                                  theme de cliente no invente ninguno.
 */

/** @type {ThemeMeta} */
export const themeMeta = {
  id: '_base',
  name: 'Base',
  isBase: true,
  colorScheme: 'both',
  tokens: [
    // shadcn
    'radius',
    'background', 'foreground',
    'card', 'card-foreground',
    'popover', 'popover-foreground',
    'primary', 'primary-foreground',
    'secondary', 'secondary-foreground',
    'accent', 'accent-foreground',
    'muted', 'muted-foreground',
    'destructive',
    'border', 'input', 'ring',
    'chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5',
    'sidebar', 'sidebar-foreground',
    'sidebar-primary', 'sidebar-primary-foreground',
    'sidebar-accent', 'sidebar-accent-foreground',
    'sidebar-border', 'sidebar-ring',
    // Masa Madre
    'mm-font-sans', 'mm-font-heading', 'mm-font-mono',
    'mm-layout-max',
  ],
}

export default themeMeta
