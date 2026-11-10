# Brief — Tienda Demo

Fecha: 2026-09-01 · Levantado por: — · Estado: **no aplica**

> ⚠️ **Esto no es un cliente real.** No hubo entrevista, no hay comercio detrás
> y no hay nada acordado con nadie.
>
> `clients/demo/` existe para ejercitar la infraestructura de configuración
> (cargador de blueprint, resolutor de modo, registro de módulos) contra el
> árbol real. Su `blueprint.yaml` es una prueba de contrato, no una tienda.
>
> El brief real se rellena con el cliente siguiendo la plantilla de
> [BLUEPRINT-FORMAT.md §2](../../docs/client-blueprints/BLUEPRINT-FORMAT.md).
> El primer cliente de demostración de verdad (médico, azul + marrón) llega en
> un bloque posterior y sí tendrá este documento completo.

## Por qué está en `draft` y sin recursos aprobados

Deliberado. `status: draft` y `assets.approved: false` hacen que un intento de
construir este cliente en modo producción **falle**, que es exactamente el
comportamiento que se quiere verificar
(ver [DEMO-PRODUCTION.md §3](../../docs/business/DEMO-PRODUCTION.md)).
