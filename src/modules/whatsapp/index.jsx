import { registerSlot } from '@/core/slots'
import { WhatsAppButton } from './WhatsAppButton.jsx'

/**
 * Se ejecuta una sola vez, en el arranque (core/registry/load.js), con la
 * config ya validada contra module.js#configSchema.
 */
export function register(config) {
  registerSlot('global.floating', {
    moduleId: 'whatsapp',
    priority: 100,
    render: () => <WhatsAppButton phone={config.phone} message={config.defaultMessage} />,
  })
}
