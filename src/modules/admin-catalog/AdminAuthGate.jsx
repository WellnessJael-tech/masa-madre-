import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function AdminAuthGate({ onSubmit }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
    setError(!onSubmit(value))
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-6">
      <form onSubmit={handleSubmit} className="flex w-full max-w-xs flex-col gap-3">
        <h1 className="font-heading text-lg font-medium text-foreground">Acceso administrador</h1>
        <p className="text-xs text-muted-foreground">
          Esto NO es autenticación real — solo evita el acceso casual. Ver
          docs/architecture/DECISIONS.md ADR-0021.
        </p>
        <input
          type="password"
          data-testid="admin-password-input"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Contraseña"
          autoFocus
          className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
        />
        {error && <p className="text-sm text-destructive">Contraseña incorrecta.</p>}
        <Button type="submit" data-testid="admin-password-submit">
          Entrar
        </Button>
      </form>
    </main>
  )
}

export default AdminAuthGate
