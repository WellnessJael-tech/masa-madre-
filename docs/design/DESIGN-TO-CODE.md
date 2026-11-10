# Design-to-Code — de una propuesta visual a Masa Madre funcionando

> Cómo una IA externa (o un diseñador) convierte una identidad de cliente + estos documentos en
> cambios reales al repositorio, sin romper la arquitectura.

## Insumos que necesita esa IA

1. Identidad del cliente (nombre, rubro, colores de marca, tono).
2. `docs/design/SYSTEM-OVERVIEW.md` (el mapa).
3. `docs/design/DESIGN-CONTRACT.md` (qué puede tocar).
4. `docs/design/COMPONENTS.md` (qué existe, componente por componente).
5. `docs/design/BLUEPRINT-MANUAL.md` y `docs/design/THEME-MANUAL.md` (los datos reales
   disponibles).

**No necesita** leer `src/core/`, `src/modules/` ni entender React, routing, o el sistema de
módulos internamente. Todo lo que necesita saber está en los cinco documentos de arriba.

## Qué archivos puede crear o modificar

| Puede crear | Puede modificar | No debe tocar |
|---|---|---|
| `src/themes/<cliente>/theme.css` (theme nuevo) | Los tokens de un theme existente (valores, no nombres) | `src/core/**` |
| `clients/<slug>/blueprint.yaml` (cliente nuevo, ver `CREATING-A-CLIENT.md`) | Contenido (`clients/<slug>/content/**`) | `src/modules/**` |
| Contenido de un cliente (productos, categorías) | — | `src/adapters/**` |
| — | — | `src/components/ui/**` (vendor de shadcn) |
| — | — | Cualquier archivo `*.test.js` o `e2e/*.spec.js` existente |

**Si una propuesta visual requiere cambiar composición de un componente** (no solo colores/tipos),
eso SÍ implica tocar un archivo de `src/core/` (ej. `ProductCard.jsx`) — está permitido, pero debe
seguir las restricciones de `COMPONENTS.md` para ese componente específico (qué información es
obligatoria, qué acciones no pueden eliminarse). No es un archivo "prohibido" en general — es un
archivo donde la libertad es de **composición y estilo**, no de eliminar lógica.

## Cómo conectar el diseño

1. **Solo colores/tipografía/espaciado nuevo → crear/editar un `theme.css`.** Cero riesgo de
   romper funcionalidad, porque un theme no puede contener lógica (es CSS).
2. **Reorganizar un componente existente (layout, composición) → editar el archivo `.jsx` de ese
   componente**, cambiando clases y estructura JSX, sin tocar sus `props`, sus llamadas a
   `useCart()`/`getRuntime()`, ni la lógica de sus `if` de estado (los estados documentados en
   `COMPONENTS.md` deben seguir existiendo, aunque se vean distinto).
3. **Un dato que no existe todavía (imagen de hero, producto destacado) → primero proponer la
   extensión del blueprint** (qué campo, qué tipo, qué componente lo consumiría) **antes** de
   escribir el componente que lo usa. No inventar que el dato ya está disponible.

## Cómo verificar que la funcionalidad sigue funcionando

Después de cualquier cambio de presentación:

```
npx eslint .                 # ningún color literal nuevo en core/modules, sin errores de sintaxis
npm test                     # los 88 tests unitarios de lógica no deben verse afectados por CSS/JSX visual
npm run build                # compila para ambos... (compila per-cliente, correr una vez por VITE_CLIENT)
npm run validate             # blueprints y catálogo siguen siendo válidos
npx playwright test          # el comportamiento (agregar al carrito, pagar, filtrar) sigue intacto
```

Si `npx playwright test` falla tras un cambio puramente visual, **casi siempre significa que se
eliminó o renombró algo que un test identifica por `data-testid`** — los `data-testid` existentes
(ver `COMPONENTS.md`, sección "Tests relevantes" de cada componente) deben conservarse aunque el
diseño visual cambie por completo alrededor de ellos.

## Ejemplo mínimo de principio a fin

Un cliente nuevo, mismo theme (`_base`), sin cambios de composición: solo requiere completar
`CREATING-A-CLIENT.md` pasos 1-7. Cero cambios de código.

Un cliente nuevo con identidad de marca fuerte (colores propios): además, un `theme.css` nuevo de
~10-20 líneas (ver `src/themes/demo-medical/theme.css` como plantilla).

Un cliente que además quiere una composición de catálogo distinta (ej. lista en vez de grilla):
además de lo anterior, editar `ProductGrid.jsx` — sigue siendo el mismo componente, mismas props,
distinta disposición interna.
