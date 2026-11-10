# Prompt Templates — Multi-Desarrollo EWB

> **Responde a:** ¿cómo le pido a una IA que construya una pieza nueva sin que rompa la
> arquitectura, y sin gastar tokens leyendo todo el repositorio?
>
> **No responde a:** qué es cada capa ([ARCHITECTURE.md](../architecture/ARCHITECTURE.md)), ni
> cómo se activa un módulo ([MODULES.md](../modules/MODULES.md)).

---

## 0. Por qué estas plantillas existen

Un prompt mal formado cuesta dinero dos veces: en tokens, y en el tiempo de arreglar el código que
produjo. Los tres fallos que estas plantillas eliminan:

| Fallo | Síntoma | Qué lo previene aquí |
|---|---|---|
| La IA explora el repo a ciegas | 40 llamadas de lectura antes de escribir una línea | **§1 Contexto mínimo**: la lista exacta de archivos a leer |
| La IA inventa arquitectura | Un `import` de `modules/` dentro de `core/` | **§2 Restricciones duras**, pegadas en cada prompt |
| Nadie sabe si funciona | "Listo ✅" sin ejecutar nada | **§4 Criterio de aceptación**: un comando que debe pasar |

**Regla de oro del coste:** un cliente nuevo cuesta **0 tokens de IA**. Es YAML y CSS. La IA solo
se usa para construir una *capacidad nueva* (core, módulo, adaptador), que se paga una vez y se
reutiliza en todos los clientes. Si te encuentras generando código por cliente, el error está en la
arquitectura, no en el prompt.

---

## 1. Protocolo obligatorio (pegar al inicio de CUALQUIER prompt)

```text
PROTOCOLO DE TRABAJO — no lo omitas, no lo resumas.

FASE 1 · RECONOCIMIENTO
Lee SOLO estos archivos, en este orden, y no explores más:
<LISTA_DE_ARCHIVOS>
Si algo que necesitas no está en esa lista, PREGUNTA antes de leer más.

FASE 2 · PLAN
Antes de escribir código, entrégame:
  a) la lista exacta de archivos que vas a CREAR (ruta completa)
  b) la lista exacta de archivos que vas a MODIFICAR y qué línea/bloque
  c) qué decisión arquitectónica nueva implica, si alguna
No escribas código hasta que yo apruebe el plan.

FASE 3 · IMPLEMENTACIÓN
Un bloque por vez. Nunca reescribas un archivo completo si basta un cambio puntual.
Nada de código de ejemplo, placeholders, ni "// TODO: implementar aquí".
Si no puedes implementar algo, dilo y detente — no lo simules.

FASE 4 · VERIFICACIÓN
Ejecuta el criterio de aceptación. Pégame la salida REAL del comando.
Si falla, arréglalo. No reportes éxito sin salida verde.

FASE 5 · REGISTRO
Redacta la entrada de decisión (ADR) en el formato del proyecto, si aplica.

PROHIBIDO: inventar APIs, inventar nombres de archivo que no verificaste,
afirmar que algo funciona sin haberlo ejecutado, "mejorar" código fuera del alcance.
```

---

## 2. Restricciones duras (pegar junto al protocolo, en prompts de Masa Madre)

```text
RESTRICCIONES ARQUITECTÓNICAS — violarlas invalida la entrega.

1. REGLA DE DEPENDENCIA (unidireccional):
   core/      → puede: core, core/ports, components/ui
                 NO puede: modules, adapters, themes, clients
   modules/   → puede: core, core/ports, components/ui
                 NO puede: OTROS MODULES, adapters, clients
   adapters/  → puede: core/ports, SDK externo
                 NO puede: core UI, modules, otros adapters
   themes/    → es CSS. No importa nada.
   clients/   → son datos (YAML/MD). No contienen código.

2. CERO COLOR LITERAL en core/, modules/ y components/ui/.
   Prohibido #hex, rgb(), hsl(), nombres CSS. Solo utilidades semánticas:
   bg-primary, text-muted-foreground, border-border.
   Si falta un color, el fallo está en el contrato de tokens (themes/_base), no en el componente.

3. CERO SECRETOS EN VITE_*. Todo import.meta.env.VITE_* acaba en el bundle y es PÚBLICO.
   Las claves privadas viven en el backend, nunca en el cliente.

4. EL CORE NO SABE QUÉ MÓDULOS EXISTEN. Los módulos se descubren con import.meta.glob
   y se enchufan en slots. Prohibido un `import` del core hacia un módulo por su nombre.
   Prohibido mantener una lista de módulos en el core.

5. MOBILE-FIRST. Sin anchos fijos en píxeles. Respetar prefers-reduced-motion.

6. NADA SIMULADO PRESENTADO COMO REAL. Un adaptador falso lleva isMock: true
   y rompe el build en producción. No se documenta como si existiera algo que no existe.
```

---

## 3. Plantilla A — Masa Madre CLI

**Repositorio destino:** `masa-madre` (este). **Crea:** `scripts/masa.mjs` + `scripts/cli/*`.

```text
[PEGAR §1 PROTOCOLO] + [PEGAR §2 RESTRICCIONES]

FASE 1 · Lee solo:
  package.json
  scripts/validate-clients.mjs
  src/core/config/boot.js
  src/core/config/env.js
  src/core/registry/catalog.js
  clients/demo/blueprint.yaml
  docs/client-blueprints/BLUEPRINT-FORMAT.md

OBJETIVO
Construir `scripts/masa.mjs`: una CLI en Node puro (sin dependencias nuevas, sin Vite)
que unifique las operaciones del motor. Debe correr con `node scripts/masa.mjs <comando>`
y exponerse como `npm run masa -- <comando>`.

COMANDOS REQUERIDOS
  masa new <slug>            Andamia clients/<slug>/ : BRIEF.md, blueprint.yaml mínimo válido,
                             content/categories.yaml, content/products/.gitkeep.
                             Falla si la carpeta ya existe. NUNCA sobrescribe.
  masa validate [slug]       Delega en la lógica existente de validate-clients.mjs.
                             NO la dupliques: extrae la lógica a scripts/cli/validate.mjs
                             y haz que ambos entrypoints la llamen.
  masa doctor                Verificaciones estáticas del repo, sin arrancar Vite:
                             (a) ningún import de modules/ dentro de core/
                             (b) ningún #hex/rgb()/hsl() en core/, modules/, excluyendo components/ui
                             (c) ningún VITE_* nuevo fuera de src/core/config/env.js
                             (d) todo module.js con id === nombre de carpeta
                             Salida: tabla de hallazgos. Exit 1 si hay alguno.
  masa manifest <slug>       Imprime el manifiesto de build en JSON, sin construir.
  masa module new <id>       Andamia src/modules/<id>/module.js + index.jsx con el manifiesto
                             completo (id, version, requires, conflictsWith, provides, ports,
                             slots, configSchema, manageableBy, load).
  masa theme new <nombre>    Andamia src/themes/<nombre>/theme.css + theme.js copiando la LISTA
                             DE TOKENS de themes/_base, con valores heredados comentados.
  masa build <slug>          Ejecuta vite build con VITE_CLIENT=<slug>. Corre `validate` ANTES;
                             si falla, no construye.
  masa dev <slug>            Ejecuta vite con VITE_CLIENT=<slug>.

REGLAS DE IMPLEMENTACIÓN
- Cero dependencias nuevas. Usa node:fs, node:path, node:process, node:child_process,
  y js-yaml (ya está en el proyecto).
- Todo comando devuelve exit 0 en éxito, 1 en fallo. Es lo que usará CI.
- Mensajes de error accionables: qué falló, en qué archivo, y qué hacer.
- `masa new` no inventa datos del cliente: genera un blueprint con los campos requeridos
  y marcadores <PENDIENTE> explícitos que `masa validate` rechace hasta completarse.
- Cada subcomando en su propio archivo scripts/cli/<comando>.mjs. masa.mjs solo enruta.

CRITERIO DE ACEPTACIÓN (ejecútalo y pega la salida)
  node scripts/masa.mjs doctor          → exit 0
  node scripts/masa.mjs validate        → exit 0, valida demo y demo-medical
  node scripts/masa.mjs new prueba-cli  → crea la carpeta
  node scripts/masa.mjs validate prueba-cli → exit 1, señalando los <PENDIENTE>
  npm test                              → sigue pasando
  npx eslint .                          → 0 errores, 0 warnings
Luego borra clients/prueba-cli.

NO HAGAS
- No toques src/core/. La CLI es herramienta, no motor.
- No reimplementes la validación de blueprints: ya existe y está probada.
- No añadas un gestor de prompts interactivo (inquirer). Argumentos y flags, nada más.
```

---

## 4. Plantilla B — Titanium ERP (PostgreSQL + RLS)

**Repositorio destino:** `titanium-erp` — **NO este repositorio.** El ERP no es un cliente de Masa
Madre ni un módulo: es un producto con backend propio. Mezclarlo aquí rompe la regla de capas.

```text
[PEGAR §1 PROTOCOLO]

CONTEXTO
Construyes el esquema de datos de Titanium ERP sobre PostgreSQL 16.
Topología: Instancia 1 (Core) con erp_schema y nms_schema. Instancia 2 (Tenants) aislada.
Stack backend: TypeScript + Fastify. Sin ORM pesado: SQL versionado a mano.
Jurisdicción: República Dominicana (DGII/e-CF, Ley 172-13 de datos personales).

OBJETIVO — ENTREGA 1 DE N (no intentes el ERP completo en un prompt)
Solo el núcleo de identidad y tenencia:
  - tabla de organizaciones (clientes de EWB)
  - tabla de usuarios y roles
  - tabla de membresías (usuario × organización × rol × departamento)
  - políticas RLS que aíslen por organización Y por departamento
  - el patrón de migración de doble vía

CONTRATO DE SALIDA — archivos exactos
  migrations/V001__core_identity.sql
  migrations/U001__core_identity_undo.sql
  migrations/V002__rls_policies.sql
  migrations/U002__rls_policies_undo.sql
  docs/DATA-MODEL.md        (diagrama en texto + justificación de cada tabla)
  test/rls.spec.sql         (pruebas que DEMUESTREN el aislamiento)

REQUISITOS TÉCNICOS NO NEGOCIABLES
1. RLS activado con FORCE ROW LEVEL SECURITY en toda tabla con datos de tenant.
   El dueño de la tabla también debe quedar sujeto a la política.
2. El contexto de sesión se establece con SET LOCAL app.current_org / app.current_role,
   nunca con un parámetro de consulta interpolado.
3. Rol de aplicación SIN BYPASSRLS. Documenta explícitamente qué rol puede saltarse RLS
   (solo migraciones) y por qué.
4. Claves primarias: UUID v7 si está disponible, si no UUID v4 con comentario del porqué.
   Nunca enteros secuenciales expuestos al cliente.
5. Toda tabla lleva created_at, updated_at (timestamptz), y created_by.
6. Columnas con datos personales (Ley 172-13) marcadas con COMMENT ON COLUMN
   indicando categoría del dato y política de retención.
7. Cada Vxxx tiene su Uxxx que revierte EXACTAMENTE lo que hizo, nada más.
8. Nada de cifrado inventado. Si una columna necesita cifrado en reposo, documenta
   la decisión (pgcrypto vs. cifrado en capa de aplicación) y sus implicaciones
   sobre índices y búsquedas. No elijas por mí.

PRUEBA DE AISLAMIENTO (es el entregable que de verdad importa)
test/rls.spec.sql debe demostrar, con SQL ejecutable:
  - usuario de org A no ve NINGUNA fila de org B (SELECT devuelve 0)
  - usuario de org A no puede INSERT con org_id de B (la política lo rechaza)
  - usuario de org A no puede UPDATE una fila a org_id de B
  - un rol de departamento no ve filas de otro departamento de SU MISMA org
  - sin SET LOCAL app.current_org, toda consulta devuelve 0 filas (falla cerrado)

CRITERIO DE ACEPTACIÓN
  psql -f migrations/V001__core_identity.sql   → sin error
  psql -f migrations/V002__rls_policies.sql    → sin error
  psql -f test/rls.spec.sql                    → todas las aserciones pasan
  psql -f migrations/U002... && psql -f migrations/U001...  → base limpia, sin residuos

NO HAGAS
- No generes las 40 tablas del ERP de golpe. Esta entrega es identidad y tenencia.
- No uses un ORM para definir el esquema. El SQL es la fuente de verdad.
- No implementes facturación electrónica e-CF sin la especificación oficial de la DGII:
  si no la tienes delante, dilo y detente.
```

> **Entregas siguientes, un prompt cada una:** V003 catabilidad contable · V004 inventario/warehouse
> · V005 CRM · V006 matriz de empleados · V007 biblioteca legal · V008 calificación forzada de
> planes · V009 módulo logístico. Nunca combines dos.

---

## 5. Plantilla C — Web Insignia EWB

**Repositorio destino:** `masa-madre` (este), como **cliente** `clients/ewb/`.

La web de EWB se construye con el motor de EWB. Si nuestro propio sitio necesita un repo aparte, el
motor no sirve. Esto es la prueba más honesta de Masa Madre que existe.

```text
[PEGAR §1 PROTOCOLO] + [PEGAR §2 RESTRICCIONES]

FASE 1 · Lee solo:
  docs/architecture/ARCHITECTURE.md  (§2, §3, §4)
  docs/modules/MODULES.md
  docs/client-blueprints/BLUEPRINT-FORMAT.md
  clients/demo-medical/blueprint.yaml
  src/modules/whatsapp/module.js
  src/themes/demo-medical/theme.css
  src/core/slots/Slot.jsx

OBJETIVO
La web insignia de EWB como cliente del motor, más UN módulo nuevo reutilizable.

ENTREGABLE 1 — clients/ewb/
  BRIEF.md            posicionamiento, audiencia, alcance
  blueprint.yaml      identidad EWB, theme: ewb, módulos activos
  content/            páginas: servicios, niveles V1-V4, sobre nosotros, contacto
  assets/

ENTREGABLE 2 — src/themes/ewb/
  theme.css           SOLO tokens. Cero lógica. Cubre el contrato completo de themes/_base.
  theme.js            metadata declarativa

ENTREGABLE 3 — src/modules/quote-calculator/
  Módulo NUEVO y GENÉRICO: un cotizador dirigido por configuración.
  CLAVE: el módulo no sabe nada de EWB ni de niveles V1-V4. Lee su configuración del
  blueprint del cliente. Debe poder cotizar mudanzas, catering o software sin cambiar una
  línea de su código. Si escribes "V1" dentro de src/modules/, el diseño es incorrecto.

  module.js debe declarar:
    id: 'quote-calculator', version, requires: [], provides: ['quote.estimate'],
    slots: [...], configSchema con:
      - variables de entrada (tipo: select | number | boolean | range, etiqueta, unidad)
      - reglas de precio (base, por-unidad, por-tramo, multiplicador, mínimo)
      - salida (desglose visible, moneda, aviso de "estimación no vinculante")
    manageableBy, load: () => import('./index.jsx')

  La BIBLIOTECA DE NIVELES V1-V4 es CONTENIDO (clients/ewb/content/levels.yaml),
  no código. Los límites por nivel se declaran como datos.

CRITERIO DE ACEPTACIÓN
  node scripts/validate-clients.mjs ewb   → exit 0
  npm test                                → pasa, incluidos tests nuevos del cotizador
  npx eslint .                            → 0/0
  Un test unitario del motor de precios con al menos 6 casos, incluyendo bordes:
  cantidad 0, por debajo del mínimo, en el límite exacto de un tramo, moneda sin decimales.
  grep -rE '#[0-9a-fA-F]{3,8}|rgb\(|hsl\(' src/modules/quote-calculator/  → sin resultados

NO HAGAS
- No pongas lógica de EWB en src/. EWB es un cliente, igual que cualquier otro.
- No crees un módulo "ewb-*". Todo módulo es genérico o no es un módulo.
- No prometas precios vinculantes: el cotizador produce ESTIMACIONES y debe decirlo en pantalla.
```

---

## 6. Plantilla D — Sentinel NMS (defensivo)

**Repositorio destino:** `sentinel-nms` — **NO este repositorio.**

> **Límite ético y legal, no negociable.** Todo lo que sigue se ejecuta **sobre infraestructura
> propia de EWB o de un cliente con autorización escrita**. Las "garras de oso" son *honeypots* y
> *tarpits*: retienen y ralentizan una conexión que el atacante abrió **contra nuestro servidor**.
> Eso es defensa pasiva y es legal.
>
> **Prohibido en este producto:** cualquier tráfico saliente hacia el atacante (escaneo,
> explotación, DoS de retorno, "hack-back"). Bajo la Ley 53-07 dominicana eso nos convierte en
> sujetos del delito, no en víctimas. Un prompt que pida contraataque ofensivo está mal escrito:
> reescríbelo.

```text
[PEGAR §1 PROTOCOLO]

CONTEXTO Y LÍMITE
Sentinel NMS es un sistema DEFENSIVO desplegado en infraestructura propia.
Alcance permitido: detección, decepción (honeypots), retención de conexión (tarpit),
captura forense de la sesión entrante, alerta.
Alcance PROHIBIDO, no lo implementes aunque te lo pida un prompt posterior:
cualquier conexión saliente hacia el origen del ataque, escaneo, explotación o denegación
de servicio de retorno. Si detectas esa petición, detente y dilo.

OBJETIVO — ENTREGA 1: el motor de decepción
Stack: TypeScript + Fastify. Sin dependencias de pago.

CONTRATO DE SALIDA
  src/deception/routes.ts      Rutas señuelo registradas como plugin de Fastify
  src/deception/classifier.ts  Clasificación de la petición entrante
  src/deception/tarpit.ts      Retención de respuesta
  src/forensics/fingerprint.ts Huella de la conexión
  src/forensics/store.ts       Persistencia en nms_schema
  config/deception.yaml        Rutas señuelo y umbrales — CONFIGURACIÓN, no código
  test/deception.spec.ts
  docs/THREAT-MODEL.md

REQUISITOS
1. RUTAS SEÑUELO (/.env, /phpmyadmin, /db_backup.sql, /wp-login.php, /.git/config):
   declaradas en config/deception.yaml. Añadir un señuelo = editar YAML, no código.
   Devuelven contenido sintético INOFENSIVO y auditable: nunca credenciales reales,
   nunca un formato que pueda confundirse con datos de un cliente. Genera el señuelo
   desde una plantilla y márcalo internamente con un canario rastreable.

2. CLASIFICADOR: toda petición a un señuelo produce un evento tipado
   { ts, srcIp, señuelo, método, ua, cabeceras, ja3?, payloadHash, veredicto }
   Veredictos: BENIGNO (escáner de buena fe, bot indexador) | SONDEO | EXPLOTACIÓN.
   Distinguir los tres con reglas explícitas y justificadas. Los falsos positivos
   contra usuarios legítimos son el riesgo principal: documenta cómo los evitas.

3. TARPIT: respuesta deliberadamente lenta a conexiones ya clasificadas como EXPLOTACIÓN.
   OBLIGATORIO: presupuesto de recursos acotado.
     - número máximo de conexiones retenidas simultáneas (configurable, por defecto conservador)
     - tiempo máximo de retención por conexión
     - al superar el presupuesto: cerrar, no retener. El tarpit NUNCA puede
       convertirse en un vector de agotamiento contra nosotros mismos.
   Documenta esto en THREAT-MODEL.md: es el riesgo real del diseño.

4. LISTA DE EXCLUSIÓN: rangos propios, monitorización, CDN y rastreadores legítimos
   jamás entran al tarpit. Configurable y verificada en tests.

5. FORENSE: hash de payloads, nunca almacenamiento crudo de secretos capturados.
   Retención con fecha de caducidad. La IP es dato personal bajo Ley 172-13:
   documenta base legal (interés legítimo en seguridad) y plazo de retención.

CRITERIO DE ACEPTACIÓN
  npm test con casos que demuestren:
    - petición a señuelo → evento registrado con veredicto correcto
    - IP en lista de exclusión → nunca entra al tarpit
    - superado el presupuesto de conexiones → cierra en vez de retener
    - usuario legítimo navegando rutas reales → cero eventos (sin falso positivo)
    - CERO conexiones salientes: afirma y prueba que el módulo no abre sockets de salida

ENTREGA 2 (prompt aparte, no ahora): consola Xterm.js en Titanium ERP.
Cuando llegue: la terminal cambia parámetros de inspección declarados en un catálogo cerrado.
Nunca ejecuta comandos arbitrarios del sistema. Autenticada, con rol dedicado y registro
de auditoría de cada comando.
```

---

## 7. Plantilla E — Web Piloto: Logística y Mudanzas

**Repositorio destino:** `masa-madre` (este), como cliente + módulo genérico. El gateway de
WhatsApp va en un **servicio backend aparte**.

```text
[PEGAR §1 PROTOCOLO] + [PEGAR §2 RESTRICCIONES]

FASE 1 · Lee solo:
  docs/architecture/DELIVERY.md
  docs/modules/MODULES.md
  src/core/ports/index.js
  src/adapters/delivery/own-delivery/adapter.js
  src/adapters/delivery/own-delivery/adapter.meta.js
  src/modules/whatsapp/module.js
  clients/demo-medical/blueprint.yaml

OBJETIVO
Cliente piloto de mudanzas + capacidades genéricas reutilizables.

ENTREGABLE 1 — src/modules/volume-estimator/
  Calculadora de cubaje en m³, GENÉRICA.
  El módulo no sabe de mudanzas: recibe un catálogo de ítems con dimensiones desde
  el CONTENIDO del cliente (clients/<slug>/content/inventory-items.yaml) y suma volumen.
  Entradas: ítem, cantidad, factor de embalaje, desmontable sí/no.
  Salida: m³ totales, desglose por ambiente, holgura recomendada.
  Prohibido escribir "mudanza", "camión" o "sofá" dentro de src/modules/.

ENTREGABLE 2 — src/adapters/delivery/distance-based/
  Adaptador del puerto delivery que cotiza por distancia.
  SIGUE EL PATRÓN adapter.meta.js + adapter.js (ver ADR-0016, adenda).
  Tarifa por tramos de km, mínimo, recargo por piso sin ascensor — todo desde el blueprint.
  MAPAS SIN COSTE: Leaflet + teselas de OpenStreetMap. Restricciones REALES que debes respetar:
    - atribución visible de OpenStreetMap (es obligatoria, no opcional)
    - Nominatim (geocodificación) tiene política de uso estricta: máximo 1 petición/segundo,
      User-Agent identificable, prohibido el uso masivo automatizado desde el navegador.
      Si el volumen esperado la supera, dilo y detente: hace falta un proxy backend con caché.
    - OSRM público no garantiza disponibilidad. Documenta esto como riesgo, no lo ocultes.

ENTREGABLE 3 — clients/mudanzas-piloto/
  BRIEF.md, blueprint.yaml, content/inventory-items.yaml, content/ (páginas)
  src/themes/mudanzas-piloto/theme.css

ENTREGABLE 4 — NO LO IMPLEMENTES AÚN: Gateway de WhatsApp
  Requiere backend, que es una decisión abierta (PROP-0006, sin resolver).
  En su lugar, entrégame un documento docs/WHATSAPP-GATEWAY.md que compare, con hechos:
    (a) WhatsApp Business Cloud API (oficial): coste real por tipo de conversación,
        requisitos de verificación de empresa, plantillas aprobadas, límites de inicio
        de conversación, qué se puede y qué no se puede automatizar.
    (b) Librerías no oficiales (whatsapp-web.js, Baileys): violan los Términos de
        Servicio de WhatsApp. Riesgo REAL de bloqueo permanente del número del cliente.
        Los "retardos dinámicos anti-baneo" mitigan la detección, NO el incumplimiento
        contractual ni la pérdida del número.
  Sé explícito sobre el riesgo de (b) para un cliente que depende de ese número para vender.
  No recomiendes una opción como si fuera gratuita si su coste es el número del cliente.

CRITERIO DE ACEPTACIÓN
  node scripts/validate-clients.mjs mudanzas-piloto  → exit 0
  npm test → tests del estimador de volumen con bordes: 0 ítems, ítem sin dimensiones,
             cantidad negativa (debe rechazarse), redondeo de m³
  tests del adaptador de distancia: distancia 0, en el límite exacto de un tramo,
             fuera de cobertura (debe degradar, no explotar)
  npx eslint . → 0/0
  grep -riE 'mudanza|camión|sofá' src/modules/volume-estimator/ → sin resultados

NO HAGAS
- No instales un SDK de mapas de pago.
- No implementes automatización de WhatsApp sin que yo haya decidido (a) o (b).
- No metas el cotizador de mudanzas en core/.
```

---

## 8. Orden de ejecución recomendado

| # | Plantilla | Desbloquea | Depende de |
|---|---|---|---|
| 1 | **A** — CLI | Todo lo demás: es la puerta de calidad | nada |
| 2 | **C** — Web Insignia | Credibilidad comercial, prueba el motor | A |
| 3 | **E** — Mudanzas | Primer ingreso real | A, C (reutiliza patrones) |
| 4 | **B** — ERP identidad | Facturación, gestión | decisión de backend (PROP-0006) |
| 5 | **D** — Sentinel | Protege lo anterior | B (comparte instancia) |

**No empieces por B ni por D.** Ninguno de los dos genera ingreso, ambos exigen la decisión de
backend que sigue abierta, y los dos son los más caros en tokens. El orden de arriba pone un
cliente pagando antes de construir infraestructura.

---

## 9. Lo que estas plantillas NO pueden darte

Honestidad obligatoria, porque el encargo pedía "código libre de errores":

- **Ninguna IA genera código libre de errores.** Lo que estas plantillas garantizan es que *los
  errores se detectan*: por eso cada una termina en un comando que debe pasar. La garantía está en
  la puerta de verificación, no en el generador.
- **$0 en licencias no es $0 en coste.** Las APIs de IA se facturan por token. El ahorro real viene
  de la arquitectura — un cliente nuevo cuesta YAML, no generación — no de usar modelos gratuitos.
- **Un prompt no sustituye una decisión.** PROP-0006 (backend) bloquea pagos reales, persistencia
  de pedidos, el ERP y el gateway de WhatsApp. Ninguna plantilla la resuelve.
