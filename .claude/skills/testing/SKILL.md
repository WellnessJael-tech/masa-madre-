---
name: testing
description: Pruebas automatizadas con Playwright para masa madre. Úsalo para verificar que una funcionalidad realmente funciona antes de darla por terminada.
---

# Testing — Masa Madre

## Principio central
Nunca decir "debería funcionar" — siempre probarlo con Playwright y confirmar el resultado real.

## Flujo estándar de prueba para e-commerce
1. Abrir la tienda
2. Agregar un producto al carrito
3. Verificar que el carrito se actualiza
4. Completar checkout
5. Verificar responsive en móvil y escritorio
6. Reportar cualquier error encontrado, con capturas si es posible