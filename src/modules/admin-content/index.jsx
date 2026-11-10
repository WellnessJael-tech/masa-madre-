import { registerSlot } from '@/core/slots'

/**
 * Se ejecuta una sola vez, en el arranque, con la config ya validada.
 * Sin anuncio configurado, no contribuye nada al slot (slot vacío = normal).
 */
export function register(config) {
  if (!config.announcement) return

  registerSlot('layout.header.top', {
    moduleId: 'admin-content',
    priority: 100,
    render: () => (
      <div
        data-testid="site-announcement"
        className="w-full bg-secondary px-4 py-2 text-center text-sm text-secondary-foreground"
      >
        {config.announcement}
      </div>
    ),
  })
}
