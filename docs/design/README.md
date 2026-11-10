# docs/design/ — empieza aquí

> **Si otra IA (o vos, en una sesión futura) debe crear un nuevo cliente visual o rediseñar la
> presentación de Masa Madre, empieza en este archivo.** El objetivo de esta carpeta es que no
> haga falta releer el código fuente ni que Claude vuelva a explicar la arquitectura desde cero.

## Orden de lectura recomendado

| # | Documento | Cuándo leerlo |
|---|---|---|
| 1 | [`SYSTEM-OVERVIEW.md`](./SYSTEM-OVERVIEW.md) | Siempre, primero. El mapa conceptual completo. |
| 2 | [`DESIGN-CONTRACT.md`](./DESIGN-CONTRACT.md) | Siempre, segundo. Qué controla cada capa. |
| 3 | [`COMPONENTS.md`](./COMPONENTS.md) | Antes de tocar cualquier pantalla/componente específico. |
| 4 | [`BLUEPRINT-MANUAL.md`](./BLUEPRINT-MANUAL.md) | Cuando necesites saber qué datos de cliente existen realmente. |
| 5 | [`THEME-MANUAL.md`](./THEME-MANUAL.md) | Antes de crear o editar un theme (colores/tipografía). |
| 6 | [`CREATING-A-CLIENT.md`](./CREATING-A-CLIENT.md) | Cuando el objetivo sea dar de alta un cliente nuevo. |
| 7 | [`DESIGN-TO-CODE.md`](./DESIGN-TO-CODE.md) | Antes de escribir o modificar cualquier archivo. |
| 8 | [`DESIGN-RULES.md`](./DESIGN-RULES.md) | Consulta rápida — la lista corta de "no romper esto". |

## Instrucción lista para copiar a una IA de diseño externa

> "Vas a trabajar en la presentación visual de una tienda construida sobre Masa Madre, un motor de
> e-commerce reutilizable. Lee, en este orden, los documentos de `docs/design/`:
> `SYSTEM-OVERVIEW.md`, `DESIGN-CONTRACT.md`, `COMPONENTS.md`, `BLUEPRINT-MANUAL.md`,
> `THEME-MANUAL.md`. Si tu tarea es crear un cliente nuevo, sigue además `CREATING-A-CLIENT.md`.
> Antes de escribir o modificar cualquier archivo, revisa `DESIGN-TO-CODE.md` y `DESIGN-RULES.md`.
>
> No necesitas leer el código fuente del proyecto (`src/`) para proponer un diseño — todo lo que
> necesitas saber (qué datos existen, qué estados debe soportar cada componente, qué no puedes
> eliminar) está en esos documentos. Si necesitas un dato que no aparece en `BLUEPRINT-MANUAL.md`,
> no asumas que existe: indícalo como una extensión propuesta.
>
> Al terminar, verificá que no rompiste nada siguiendo la sección de verificación de
> `DESIGN-TO-CODE.md`."

## Qué NO está en esta carpeta

- **Nada de identidad visual definida todavía.** No hay una guía de marca, ni una paleta
  "oficial" más allá de los dos themes de ejemplo (`_base`, `demo-medical`) — son puntos de
  partida técnicos, no una dirección de arte.
- **Nada sobre negocio, precios o alcance comercial.** Eso vive en `docs/business/`.
- **El detalle de por qué se tomó cada decisión de arquitectura.** Eso vive en
  `docs/architecture/DECISIONS.md` — no hace falta leerlo para diseñar, solo para entender el
  historial del proyecto.

## Estado del proyecto al momento de escribir esto

Core funcional, dos clientes de demostración (`demo`, `demo-medical`) probando la reutilización,
88 tests unitarios y una suite de Playwright de 27 casos (54 con el proyecto móvil) — todos en
verde. Ver `docs/audits/FUNCTIONAL-READINESS.md` para el detalle capacidad por capacidad, y el
resumen de bloque más reciente en `docs/architecture/DECISIONS.md` (ADR-0023) para lo último que
cambió antes de esta documentación.
