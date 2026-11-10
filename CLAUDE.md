# Masa Madre — Proyecto Core

## Arquitectura
- Modular y reutilizable
- Mobile-first
- Sistema de variables de diseño (colores, tipografías) separado del núcleo
- No modificar el núcleo (CORE) sin necesidad real
- Componentes independientes y desacoplados
- No romper funcionalidades existentes al añadir features

## Estructura

```
src/
  core/            → UNIVERSAL. Nunca específico de un cliente.
                     app (shell, routing, layout) · config · registry · slots
                     ports (contratos) · commerce · catalog · ui · lib
  modules/<id>/    → OPCIONAL, activable desde el blueprint del cliente.
  adapters/<port>/<proveedor>/
                   → Implementaciones de un puerto (pagos, delivery, analítica…).
  themes/<nombre>/ → Identidad visual: tokens CSS. CERO lógica de negocio.
  components/ui/   → Primitivas shadcn (vendor, gestionadas por `npx shadcn add`).
  lib/utils.js     → `cn()`. Ruta exigida por shadcn.

clients/<slug>/    → UN CLIENTE = DATOS, no código.
                     BRIEF.md (entrevista) · blueprint.yaml (config)
                     content/ · assets/ · extensions/

docs/              → ver docs/README.md (índice enrutador)
```

Detalle y justificación: `docs/architecture/ARCHITECTURE.md`.

## Regla de dependencia (unidireccional)

| Capa | Puede importar | No puede importar |
|---|---|---|
| `core/` | core, ports, components/ui | modules, adapters, themes, clients |
| `modules/` | core, ports, components/ui | **otros modules**, adapters, clients |
| `adapters/` | ports, SDK externo | core UI, modules, otros adapters |
| `themes/` | nada (es CSS) | todo |
| `clients/` | nada (son datos) | todo |

El core nunca sabe qué módulos existen: los módulos se enchufan en *slots* que el core declara.

## Reglas de trabajo
- Antes de tocar el core, confirmar que no rompe temas existentes
- Cada cliente nuevo = un theme nuevo, nunca duplicar el core
- ¿Lo necesitan todos los clientes? Sí → core. Algunos → módulo. Uno solo → extensión.
- Prohibido color literal (`#hex`, `rgb()`) en `core/`, `modules/` y `components/ui/`.
  Solo utilidades semánticas (`bg-primary`, `text-muted-foreground`).
- Las decisiones arquitectónicas se registran en `docs/architecture/DECISIONS.md`.
- Blueprint de cliente en YAML (ADR-0004).