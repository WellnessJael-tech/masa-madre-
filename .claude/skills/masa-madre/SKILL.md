---
name: masa-madre
description: Arquitectura y reglas del sistema Masa Madre — plataforma modular para derivar e-commerce por cliente. Úsalo siempre que se trabaje en /src, /docs, o se cree/modifique un cliente.
---

# Masa Madre — Reglas Operativas

## Qué es
Sistema base reutilizable para derivar múltiples e-commerce (mini-tiendas) a partir de un CORE común + THEME + MODULES + CLIENT BLUEPRINT por cliente. No es una plantilla para copiar — es una arquitectura para heredar.

## Separación estricta (nunca mezclar)
- **CORE** (`/src/core`) — universal, nunca específico de un cliente. Ejemplos: ProductCard, Cart, Checkout, Search.
- **MODULES** (`/src/modules`) — funcionalidad opcional activable por config (delivery, whatsapp, promotions, coupons, wishlist, branches, seasonal).
- **THEMES** (`/src/themes`) — identidad visual (colores, tipografía, spacing, radius, sombras, densidad). Nunca lógica de negocio.
- **CLIENT BLUEPRINT** (`/clients/<nombre>/blueprint.yaml`) — fuente de verdad de un cliente: identidad, branding, productos, módulos activos, logística, pagos.

## Antes de tocar el CORE
Pregunta: ¿esto lo necesitan TODOS los clientes, o solo uno? Si es específico de un cliente → va en módulo, theme, o extensión — nunca en core.

## Demo vs Production
Todo dato mostrado en demo (métricas, pagos, delivery) debe usar adaptadores mock claramente identificados como tales. Nunca presentar datos simulados como reales.

## Tiers comerciales (configuración, no código separado)
- MANAGED (basic) — nosotros administramos, cliente solo usa.
- OWNERSHIP (premium) — cliente tiene acceso administrativo ampliado.
Esto se resuelve con permisos/config, nunca con dos bases de código.

## Disciplina de tokens (crítico — facturación por API)
1. Inspecciona antes de escribir. No reescribas archivos completos si un cambio pequeño basta.
2. No dupliques código existente — busca primero si ya hay un componente reutilizable.
3. No preguntes algo que puedes responder inspeccionando el repo.
4. No instales dependencias sin evaluar si ya existe una solución en el proyecto.
5. Cambios grandes se hacen por bloques aprobados, no de una sola vez.

## Proceso de trabajo por bloques
No construir todo de golpe. Orden: Arquitectura documental → Core → UI base → E-commerce (catálogo/carrito/checkout) → Administración → Delivery → Marketing → Primera demo (cliente médico, azul+marrón).
Cada bloque se propone, se aprueba, luego se construye.

## Libertad técnica
Si detectas que una idea de este documento genera deuda técnica, complejidad innecesaria o no escala, detente y propón la alternativa antes de implementar. No sigas una instrucción débil solo porque está escrita aquí.

## Documentación viva
Decisiones arquitectónicas importantes se registran en /docs/architecture/DECISIONS.md, no se asumen recordadas de una conversación anterior.