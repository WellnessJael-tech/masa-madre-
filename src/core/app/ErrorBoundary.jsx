import { Component } from 'react'

/**
 * Frontera de error del shell.
 *
 * En DEV muestra el detalle; en producción, un mensaje genérico. Es el mismo
 * criterio que el arranque: fallar de forma visible y accionable para nosotros,
 * discreta para el comprador (docs/modules/MODULES.md §6).
 *
 * Tiene que ser un componente de clase: React no ofrece equivalente en hooks.
 */
export class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // TODO(Bloque Administración): enviar al puerto de observabilidad cuando exista.
    console.error('[core] Error no controlado:', error, info)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <main
        role="alert"
        className="flex min-h-svh flex-col items-center justify-center gap-3 p-6 text-center"
      >
        <h1 className="font-heading text-xl font-medium text-foreground">
          Algo no funcionó
        </h1>
        <p className="max-w-prose text-sm text-muted-foreground">
          Estamos al tanto. Vuelve a intentarlo en un momento.
        </p>

        {import.meta.env.DEV && (
          <pre className="mt-4 max-w-full overflow-auto rounded-md border border-border bg-muted p-4 text-left font-mono text-xs text-muted-foreground">
            {error.stack ?? String(error)}
          </pre>
        )}
      </main>
    )
  }
}

export default ErrorBoundary
