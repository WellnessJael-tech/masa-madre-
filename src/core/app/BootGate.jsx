import { ConfigError } from '@/core/config/errors.js'
import { getRuntime } from '@/core/config/runtime.js'
import { isDev } from '@/core/config/env.js'
import { DemoBadge } from './DemoBadge.jsx'

/**
 * Monta la tienda solo si la configuración es válida.
 *
 * El arranque en sí no ocurre aquí: lo ejecuta core/config/runtime.js una vez,
 * fuera de React. Este componente solo decide qué pintar según el resultado.
 *
 * Si la configuración es inválida, aquí se detiene: el core nunca recibe un
 * blueprint roto. En DEV se muestra el detalle accionable; en producción, un
 * mensaje genérico y el detalle al log (MODULES.md §6).
 */
export function BootGate({ children }) {
  const runtime = getRuntime()

  if (!runtime.ok) return <BootFailure error={runtime.error} />

  return (
    <>
      {runtime.value.mode.showDemoBadge && <DemoBadge />}
      {children}
    </>
  )
}

function BootFailure({ error }) {
  const detailed = isDev() && error instanceof ConfigError

  return (
    <main
      role="alert"
      className="flex min-h-svh flex-col items-center justify-center gap-3 p-6 text-center"
    >
      <h1 className="font-heading text-xl font-medium text-foreground">
        {detailed ? 'La tienda no pudo arrancar' : 'Algo no funcionó'}
      </h1>
      <p className="max-w-prose text-sm text-muted-foreground">
        {detailed
          ? 'La configuración de este cliente no es válida. Detalle abajo y en la consola.'
          : 'Estamos al tanto. Vuelve a intentarlo en un momento.'}
      </p>

      {detailed && (
        <pre className="mt-4 max-w-full overflow-auto rounded-md border border-destructive/40 bg-muted p-4 text-left font-mono text-xs text-foreground">
          {error.format()}
        </pre>
      )}
    </main>
  )
}

export default BootGate
