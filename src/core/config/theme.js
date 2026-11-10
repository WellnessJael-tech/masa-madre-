/**
 * Aplica el theme del cliente resuelto en el blueprint.
 *
 * El contrato base (themes/_base/theme.css) ya se importó estáticamente en
 * index.css — define TODOS los tokens con valores neutros
 * (docs/architecture/ARCHITECTURE.md §6). Esta función importa DESPUÉS el
 * theme del cliente, que solo sobrescribe valores en :root; el orden de
 * carga es lo que hace que la cascada de CSS gane sin necesitar más
 * especificidad.
 *
 * Se llama desde main.jsx ANTES de montar React (no desde un componente) para
 * no producir un parpadeo del theme base antes de los colores del cliente.
 * Costo: un chunk de CSS más que descargar antes del primer render — el
 * archivo es minúsculo, y evitar el parpadeo vale ese costo. Ver ADR-0019.
 *
 * Es la ÚNICA pieza de infraestructura de theming que faltaba. Ningún
 * cliente futuro necesita tocar este archivo: solo crear su
 * themes/<id>/theme.css y declarar design.theme en su blueprint.
 *
 * @param {string} themeId  blueprint.design.theme
 */
export async function applyTheme(themeId) {
  if (themeId === '_base') return // el contrato base ya está cargado; nada que sobrescribir
  await import(`@/themes/${themeId}/theme.css`)
}
