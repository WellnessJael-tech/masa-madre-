import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-start gap-4">
      <h1 className="font-heading text-2xl font-medium text-foreground">
        Página no encontrada
      </h1>
      <p className="max-w-prose text-sm text-muted-foreground">
        La dirección que buscas no existe o cambió.
      </p>
      <Button asChild>
        <Link to="/">Volver al inicio</Link>
      </Button>
    </div>
  )
}

export default NotFoundPage
