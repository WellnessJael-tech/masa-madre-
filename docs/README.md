# Documentación — Masa Madre

> **Índice enrutador.** No leas todos los documentos. Busca tu pregunta abajo y abre **solo** ese archivo.
> Cada documento responde principalmente a una pregunta. Si tu cambio no encaja en ninguno, probablemente
> pertenece a un documento existente, no a uno nuevo.

| Si tu pregunta es… | Abre |
|---|---|
| ¿Dónde va este archivo/carpeta? ¿Qué capa puede importar a cuál? | [architecture/ARCHITECTURE.md](architecture/ARCHITECTURE.md) |
| ¿Esto es core, módulo, theme, puerto o contenido? ¿Cómo se activa? | [modules/MODULES.md](modules/MODULES.md) |
| ¿Cómo se calcula el envío / zonas / pickup / Uber Direct? | [architecture/DELIVERY.md](architecture/DELIVERY.md) |
| ¿Cómo se cobra? ¿Dónde van las credenciales? | [architecture/PAYMENTS.md](architecture/PAYMENTS.md) |
| ¿Qué le pregunto al cliente? ¿Qué campos configuran su tienda? | [client-blueprints/BLUEPRINT-FORMAT.md](client-blueprints/BLUEPRINT-FORMAT.md) |
| ¿Qué es mock y qué es real? ¿Cómo se marca? | [business/DEMO-PRODUCTION.md](business/DEMO-PRODUCTION.md) |
| ¿Qué puede tocar el cliente según lo que pagó? | [business/TIERS.md](business/TIERS.md) |
| ¿Cómo monto Navidad / Black Friday sin romper el theme? | [architecture/SEASONAL-CAMPAIGNS.md](architecture/SEASONAL-CAMPAIGNS.md) |
| ¿Cómo actualizo el core sin romper tiendas vivas? ¿Cómo revierto? | [architecture/VERSIONING.md](architecture/VERSIONING.md) |
| ¿Cómo le pido a una IA que construya una pieza sin romper la arquitectura? | [playbooks/PROMPT-TEMPLATES.md](playbooks/PROMPT-TEMPLATES.md) |
| ¿Qué recibe el cliente al cerrar su proyecto? ¿Qué pasa si cancela? | [business/ENTREGA-CLIENTE.md](business/ENTREGA-CLIENTE.md) |
| ¿Cómo se forma y se evalúa a un colaborador nuevo? | [business/ACADEMIA.md](business/ACADEMIA.md) |
| ¿Por qué se decidió esto así? ¿Qué hay pendiente de aprobar? | [architecture/DECISIONS.md](architecture/DECISIONS.md) |
| ¿Cómo diseño la interfaz visual sin estudiar el código? | [design/README.md](design/README.md) |
| ¿Qué funciona de verdad hoy, capacidad por capacidad? | [audits/FUNCTIONAL-READINESS.md](audits/FUNCTIONAL-READINESS.md) |

## Estado

Core funcional con dos clientes de demostración (`demo`, `demo-medical`) probando la
reutilización: catálogo, búsqueda, carrito, checkout, delivery básico (pickup + zona fija),
sistema de módulos con dependencias reales, y un admin de catálogo con carga masiva. Ver
[DECISIONS.md](architecture/DECISIONS.md) (ADR-0023, el más reciente) y
[audits/FUNCTIONAL-READINESS.md](audits/FUNCTIONAL-READINESS.md) para el detalle verificado.

## Reglas para escribir en /docs

1. Un documento = una pregunta. Si un documento empieza a responder dos, se parte.
2. Antes de crear un archivo, verifica que la información no pertenezca a uno existente.
3. Las decisiones se registran en `DECISIONS.md`, no en la conversación.
4. Nada aquí describe integraciones que no existen como si existieran. Los contratos
   pendientes se marcan explícitamente como **PENDIENTE / NO IMPLEMENTADO**.
