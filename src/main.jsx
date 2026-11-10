import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AppShell } from '@/core/app/AppShell.jsx'
import { declareLayoutSlots } from '@/core/app/slots.js'
import { getRuntime } from '@/core/config/runtime.js'
import { applyTheme } from '@/core/config/theme.js'
import { loadActiveModules } from '@/core/registry'

// Arranque. Ver docs/architecture/ARCHITECTURE.md §5.
declareLayoutSlots()

const runtime = getRuntime()
if (runtime.ok) {
  // Antes de montar: evita el parpadeo del theme base antes del del cliente.
  await applyTheme(runtime.value.blueprint.design.theme)
  // Antes de montar también: las contribuciones a slots (p. ej. el botón de
  // WhatsApp) deben existir antes del primer render.
  await loadActiveModules(runtime.value.modules)
  // El <title> estático de index.html ("Masa Madre") es el mismo problema
  // que la Fase 2 pide buscar: presentación de un cliente colándose en algo
  // genérico. Se corrige aquí, no en index.html — cada cliente ya valida
  // identity.tradeName (required en el esquema).
  document.title = runtime.value.blueprint.identity.tradeName
}
// Si runtime falla, se omiten ambos: BootGate mostrará la pantalla de error
// con los colores neutros del contrato base y sin módulos, que es correcto.

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppShell />
  </StrictMode>,
)



