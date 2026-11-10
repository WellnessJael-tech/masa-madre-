import { declareSlots } from '@/core/slots'

/**
 * Slots que declara el shell del core.
 *
 * El nombre de un slot es API PÚBLICA: renombrarlo o quitarlo es un cambio
 * breaking (docs/architecture/VERSIONING.md §2).
 *
 * Aquí solo están los del layout. Los de catálogo, producto, carrito y
 * checkout se declararán en sus propios dominios cuando existan
 * (docs/modules/MODULES.md §7 lista el conjunto previsto).
 */
export function declareLayoutSlots() {
  declareSlots({
    'layout.header.top': {},
    'layout.header.actions': {},
    'layout.footer.extra': {},
    'home.sections': {},
    // Exclusivo: dos elementos flotantes en móvil se tapan entre sí.
    // Ver docs/architecture/SEASONAL-CAMPAIGNS.md §6.
    'global.floating': { exclusive: true },
  })
}
