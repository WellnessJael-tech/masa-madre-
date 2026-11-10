import { Slot } from '@/core/slots'
import { CatalogView } from '@/core/catalog/components/CatalogView.jsx'
import { getRuntime } from '@/core/config/runtime.js'

/**
 * Home con el catálogo real del cliente.
 *
 * Corregido en la auditoría de reutilización (Fase 2): antes mostraba
 * "Masa Madre" y un texto de desarrollo fijos, sin importar qué cliente
 * estuviera resolviendo el build — un caso exacto de texto de cliente (o,
 * peor, texto NUESTRO) hardcodeado en un componente genérico. Ahora lee
 * identity.tradeName/tagline del blueprint, ya validados por el esquema.
 */
export function HomePage() {
  const runtime = getRuntime()
  const identity = runtime.ok ? runtime.value.blueprint.identity : null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-medium text-foreground">
          {identity?.tradeName ?? 'Tienda'}
        </h1>
        {(identity?.tagline || identity?.description) && (
          <p className="max-w-prose text-sm text-muted-foreground">
            {identity.tagline || identity.description}
          </p>
        )}
      </div>

      <CatalogView />

      <Slot name="home.sections" />
    </div>
  )
}

export default HomePage
