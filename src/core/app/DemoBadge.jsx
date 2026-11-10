/**
 * Aviso de MODO DEMO.
 *
 * Requisitos de docs/business/DEMO-PRODUCTION.md §4, todos deliberados:
 *  - Persistente y NO DESCARTABLE. Si se pudiera cerrar, alguien haría una
 *    captura sin él y esa captura circularía como si fuera real.
 *  - Sobrevive a una captura de pantalla: es contenido, no un tooltip.
 *  - Se imprime. Nada de ocultarlo en @media print.
 *  - Usa tokens del sistema (--color-demo-banner), definidos fuera del theme,
 *    para que ningún theme de cliente pueda ocultarlo.
 *
 * Este es el ÚNICO punto de la UI que consulta el modo. El resto del sistema
 * cambia de demo a producción sustituyendo adaptadores, no componentes.
 */
export function DemoBadge() {
  return (
    <div
      role="status"
      className="sticky top-0 z-50 w-full bg-demo-banner px-4 py-1.5 text-center text-xs font-medium text-demo-banner-foreground"
    >
      MODO DEMO — datos simulados. No corresponden a ventas, pagos ni entregas reales.
    </div>
  )
}

export default DemoBadge
