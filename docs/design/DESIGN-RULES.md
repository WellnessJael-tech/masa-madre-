# Design Rules — reglas prácticas para no romper Masa Madre

> Lista corta, para consulta rápida. El razonamiento completo de cada regla está en
> `DESIGN-CONTRACT.md` y `COMPONENTS.md` — esto es el resumen accionable.

1. **No introducir lógica de negocio en presentación.** Un componente visual recibe datos ya
   calculados (totales, stock, opciones de entrega). Si sientes la tentación de calcular algo
   dentro de un componente `.jsx` de presentación, ese cálculo probablemente ya existe en
   `core/commerce/` o `core/catalog/` — reutilízalo, no lo dupliques.

2. **No hardcodear identidad del cliente en el core.** Cualquier texto de marca (nombre, tagline,
   contacto) debe leerse de `identity.*` vía `getRuntime()`. Dos veces ya se encontró y corrigió
   esto en este proyecto (ver `docs/architecture/DECISIONS.md`, ADR-0023) — es el error más fácil
   de cometer y más caro de encontrar después.

3. **Usar tokens del theme, nunca valores hardcodeados.** Ni colores hex, ni tamaños de fuente en
   píxeles sueltos si ya existe un token equivalente. Ver `THEME-MANUAL.md` para la lista completa.

4. **Mantener los contratos funcionales.** Las props de un componente, y los estados que
   `COMPONENTS.md` documenta para él, deben seguir existiendo. Puedes cambiar cómo se ven, no que
   existan.

5. **Mobile-first, siempre.** Diseña primero para una pantalla angosta; el proyecto entero está
   construido con esa prioridad.

6. **Mantener accesibilidad.** El skip-link, los `aria-*` ya presentes, el foco visible, y
   `prefers-reduced-motion` no son negociables. Si agregas una animación, debe respetar esa
   preferencia (ya hay una regla global en `index.css`, pero una animación *nueva* debe también
   respetarla explícitamente si usa una técnica que la regla global no cubre).

7. **No eliminar acciones obligatorias.** Agregar al carrito, cambiar cantidad, elegir entrega
   (cuando hay más de una opción), confirmar pedido — deben poder ejecutarse en cualquier
   rediseño, aunque el botón se vea distinto.

8. **No eliminar los avisos obligatorios.** El aviso de modo demostración, la marca de "pedido
   simulado", el disclaimer de salud (si aplica) — pueden cambiar de forma, nunca desaparecer ni
   volverse descartables por el usuario.

9. **No alterar estructuras de datos sin justificación.** Si una propuesta visual necesita un
   campo que no existe en el `blueprint.yaml` actual, no lo inventes en el componente — proponlo
   como una extensión (`DESIGN-TO-CODE.md`) para que se agregue al esquema real primero.

10. **No tocar `src/components/ui/**`.** Son componentes vendor de shadcn, gestionados por una
    herramienta externa — cualquier ajuste ahí se pierde en la siguiente actualización. Si algo de
    ese comportamiento necesita cambiar, se hace desde el componente que lo usa, no editando el
    primitivo directamente.

11. **No romper un test existente sin saber por qué.** Si `npx playwright test` falla tras un
    cambio visual, revisa primero si eliminaste o renombraste un `data-testid` — es la causa más
    común, no un bug real de la prueba.

12. **Ante la duda, es más seguro proponer que asumir.** Si no es evidente si algo pertenece a
    PRESENTATION o a CORE, trátalo como CORE (no lo toques) y documenta la duda — es más barato
    revisar una propuesta que deshacer una ruptura de arquitectura.
