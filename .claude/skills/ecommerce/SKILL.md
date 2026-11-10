---
name: ecommerce
description: Lógica de comercio electrónico para el proyecto masa madre — carrito, checkout, catálogo, productos, inventario, precios. Úsalo al crear o modificar cualquier funcionalidad de tienda online.
---

# E-commerce — Masa Madre

## Principios
- Todo componente de tienda debe vivir en /core, nunca en /themes
- Carrito y checkout deben funcionar igual sin importar el tema visual activo
- Precios, stock e inventario se manejan con datos desacoplados del diseño

## Funcionalidades esperadas
- Catálogo de productos con filtros y búsqueda
- Carrito persistente (localStorage o backend, según se defina)
- Checkout simple, mobile-first
- Panel de administración básico para productos

## Reglas
- No hardcodear textos ni colores específicos de cliente dentro del core
- Cualquier feature nueva debe evaluarse: ¿es del core o es de un theme?