import { useParams } from 'react-router'

/**
 * Páginas legales genéricas (términos, privacidad, devoluciones).
 * Texto placeholder explícito — ningún cliente de este repo es real, y
 * cuando lo sea, este contenido debe reemplazarse por asesoría legal real
 * (docs/business/TIERS.md ya aclara que esto no es responsabilidad
 * nuestra). Mismo principio de honestidad que DemoBadge: no simular algo
 * que no existe.
 */
const PAGES = {
  terminos: {
    title: 'Términos y condiciones',
    body:
      'Este texto es un placeholder. Antes de publicar la tienda, reemplázalo con ' +
      'los términos y condiciones reales de tu negocio (asesoría legal, no generada aquí).',
  },
  privacidad: {
    title: 'Política de privacidad',
    body:
      'Este texto es un placeholder. Antes de publicar la tienda, reemplázalo con tu ' +
      'política de privacidad real: qué datos se recopilan, con qué fin, y cómo se protegen.',
  },
  devoluciones: {
    title: 'Política de devoluciones',
    body:
      'Este texto es un placeholder. Antes de publicar la tienda, reemplázalo con las ' +
      'condiciones reales de cambio y devolución de tu negocio.',
  },
}

export function LegalPage() {
  const { slug } = useParams()
  const page = PAGES[slug]

  if (!page) {
    return <p className="text-sm text-muted-foreground">Página no encontrada.</p>
  }

  return (
    <div className="flex flex-col gap-3" data-testid="legal-page">
      <h1 className="font-heading text-xl font-medium text-foreground">{page.title}</h1>
      <p className="max-w-prose text-sm text-muted-foreground">{page.body}</p>
    </div>
  )
}

export default LegalPage
