# Masa Madre — Proyecto Core

## Arquitectura
- Modular y reutilizable
- Mobile-first
- Sistema de variables de diseño (colores, tipografías) separado del núcleo
- No modificar el núcleo (CORE) sin necesidad real
- Componentes independientes y desacoplados
- No romper funcionalidades existentes al añadir features

## Estructura planeada
- /core → componentes, lógica, carrito, checkout, catálogo, búsqueda, filtros, administración
- /themes → un tema por cliente (colores, tipografías, logo, identidad visual)

## Reglas de trabajo
- Antes de tocar el core, confirmar que no rompe temas existentes
- Cada cliente nuevo = un theme nuevo, nunca duplicar el core