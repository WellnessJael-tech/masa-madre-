# Versionado y actualizaciones

> **Responde a:** ¿cómo se mejora el core sin romper tiendas vivas, quién recibe qué y cuándo, cómo
> se revierte, y cómo se sabe qué está corriendo cada cliente?
>
> **Estado: DISEÑO. No implementado.**

---

## 1. Alcance: qué hace falta de verdad en el MVP

Con cero clientes en producción, el riesgo de sobreingeniería aquí es alto. Un sistema de
publicación de paquetes, canales de release y migraciones automáticas antes del primer cliente es
tiempo tirado.

**Lo mínimo que hay que resolver, y nada más:**

1. Saber **qué versión** corre cada cliente. *(sin esto, diagnosticar es adivinar)*
2. Poder **actualizar un cliente sin tocar los demás**.
3. Poder **revertir en minutos**.
4. Saber **qué se rompe** al cambiar el core, antes de desplegar.

Se resuelve con: **git + semver + un campo en el blueprint + un manifiesto de build.** Sin
infraestructura nueva.

---

## 2. Tres cosas versionadas, no una

| Qué | Formato | Quién lo cambia | Dónde vive |
|---|---|---|---|
| **Core** | semver `MAJOR.MINOR.PATCH` | nosotros | `package.json` + tag de git |
| **Esquema de blueprint** | entero incremental | nosotros | `schemaVersion` |
| **Blueprint de un cliente** | semver | nosotros, por cliente | `blueprintVersion` |

Separarlos importa: cambiar el contenido de un cliente no es una versión de core, y cambiar el core
no invalida su blueprint salvo que cambie el esquema.

### Qué es un cambio breaking del core

`MAJOR` cuando se rompe algo de lo que un cliente depende:

- Renombrar o eliminar un **slot** (los nombres de slot son API pública).
- Cambiar la firma de un **puerto**.
- Eliminar o renombrar un **módulo** o su `id`.
- Eliminar un **token de theme** del contrato base.
- Cambiar el significado de un campo del blueprint.
- Cambiar un estado canónico de pedido o de pago.

`MINOR`: slot nuevo, módulo nuevo, token nuevo, campo opcional nuevo, adaptador nuevo.
`PATCH`: correcciones sin cambio de contrato.

> El contrato de tokens de theme cuenta como API. Es fácil olvidarlo: borrar `--shadow-card`
> porque "ya no se usa en el core" rompe todo theme de cliente que lo defina.

---

## 3. Cada cliente fija su versión

```yaml
# clients/<slug>/blueprint.yaml
core: "^1.4"           # acepta 1.4.x y 1.5.x — nunca 2.x
schemaVersion: 1
blueprintVersion: "1.2.0"
```

| Rango | Significado | Cuándo usarlo |
|---|---|---|
| `^1.4` | minor y patch automáticos | por defecto |
| `~1.4` | solo patches | cliente sensible, temporada alta |
| `1.4.2` | congelado exacto | tras un incidente, o auditoría en curso |

**El fijado no impide desplegar un core más nuevo: impide hacerlo por accidente.** Si el core
instalado no satisface el rango, el build falla con un mensaje explícito. Subir de versión es un
cambio deliberado en el blueprint, revisable en un diff.

---

## 4. Manifiesto de build

Generado en cada build e incrustado en la app. Es la respuesta a "¿qué está corriendo esto?".

```json
{
  "client": "acme-salud",
  "coreVersion": "1.4.2",
  "blueprintVersion": "1.2.0",
  "schemaVersion": 1,
  "mode": "production",
  "commit": "b481ffc",
  "builtAt": "2026-09-01T14:22:00Z",
  "theme": "acme-salud",
  "modules": ["whatsapp@1.0.0", "branches@1.1.0", "promotions@2.0.1"],
  "adapters": { "payment": "bank-transfer", "delivery": "own-delivery,pickup" },
  "campaigns": ["navidad"]
}
```

Accesible en tres sitios:

- `/_build.json` — comprobable sin abrir el panel.
- Panel de administración, pie de página.
- Consola del navegador al arrancar, en una línea.

Con esto, un reporte de "no me funciona el envío" se diagnostica sabiendo la versión exacta, en vez
de reproduciendo a ciegas.

---

## 5. Registro central de clientes

Un solo archivo, `clients/REGISTRY.md`, con una fila por cliente. Es la vista de flota:

| Cliente | Tier | Core | Estado | Último despliegue | Notas |
|---|---|---|---|---|---|
| `acme-salud` | managed | 1.4.2 | live | 2026-09-01 | temporada alta en diciembre |
| `demo-medico` | — | 1.5.0 | demo | 2026-08-28 | cliente de demostración |

Un archivo de texto en git. Sin dashboard, sin base de datos. Cuando la tabla sea inmanejable a
mano, será señal de que hay suficientes clientes para justificar automatizarla — no antes.

---

## 6. Cómo se actualiza un cliente

```
1. Cambiar el core        → merge a main, bump de versión, tag, CHANGELOG
2. Elegir a quién         → según la política de §7
3. Desplegar a staging    → VITE_CLIENT=<slug> VITE_MODE=production, dominio de staging
4. Pasar el smoke test    → §8
5. Desplegar a producción → build inmutable, etiquetado
6. Actualizar REGISTRY.md
```

**Nunca se actualizan todos los clientes a la vez.** Orden fijo:

```
demo interna  →  1 cliente piloto (perfil tolerante)  →  esperar  →  el resto por lotes
```

El tiempo de espera es lo que separa "un cliente notó un fallo" de "todos los clientes lo notaron".

---

## 7. Quién recibe qué

| Tipo de cambio | MANAGED | OWNERSHIP |
|---|---|---|
| Parche de seguridad | inmediato, sin avisar | inmediato, avisando |
| Corrección de fallo | en la siguiente ventana | en la siguiente ventana |
| Funcionalidad nueva (opt-in) | al activarla | cuando el cliente quiera |
| Cambio visual del core | en la ventana, avisando | coordinado |
| Cambio breaking (MAJOR) | migración agendada | migración agendada, con aviso previo |

**Ventana de actualización:** martes o miércoles por la mañana. Nunca viernes, ni en temporada alta
del cliente (la fecha de temporada alta vive en su `BRIEF.md` — por eso se pregunta).

**Un cliente puede quedarse atrás, pero no indefinidamente.** Regla: máximo dos versiones `MINOR`
de retraso. Mantener cinco variantes del core en producción anula el sentido de tener un core.

---

## 8. Smoke test antes de desplegar

Ejecutado contra staging, con el blueprint real del cliente. Es lo que hace segura la actualización.

- [ ] El build compila (blueprint, módulos, adaptadores y theme resuelven).
- [ ] La home carga; ningún slot esperado quedó vacío.
- [ ] El catálogo lista; búsqueda y filtros responden.
- [ ] Detalle de producto: precio, variantes y stock correctos.
- [ ] Añadir al carrito, modificar cantidad, quitar.
- [ ] Checkout completo hasta crear el pedido.
- [ ] Cada método de envío activo cotiza.
- [ ] Cada método de pago activo llega a su estado inicial correcto.
- [ ] Los módulos activos aparecen en sus slots.
- [ ] Ningún mock en un build de producción.
- [ ] Contraste AA en las pantallas principales.
- [ ] Móvil real, no solo el emulador del navegador.
- [ ] El manifiesto de build muestra los valores esperados.

> Este checklist es el borrador de la suite de Playwright del Bloque final. Escrito así, cada línea
> se convierte luego en un test. **Playwright ya está conectado** (`playwright.config.js` +
> `e2e/`, ver [DECISIONS.md ADR-0018](DECISIONS.md#adr-0018--playwright-real-cierra-d-08)): hoy
> cubre "añadir al carrito, modificar cantidad, checkout completo hasta crear el pedido" con clicks
> reales. El resto de líneas de esta lista siguen manuales hasta que exista lo que prueban
> (delivery, más de un método de pago, contraste automatizado).

---

## 9. Revertir

**Requisito:** volver atrás en menos de 15 minutos, sin build.

- Cada despliegue produce un **artefacto inmutable**, etiquetado
  `<cliente>-<coreVersion>-<commit>`.
- Se conservan los **últimos 5** artefactos por cliente.
- Revertir = repuntar el hosting al artefacto anterior. **No** se revierte con git ni recompilando:
  eso tarda y puede fallar justo cuando hay una incidencia.
- Tras revertir: anotar en `REGISTRY.md`, abrir el incidente, y **fijar** el cliente
  (`core: "1.4.2"` exacto) para que no vuelva a subir solo.

**Qué no se revierte con esto:** los datos. Si una migración de esquema de blueprint ya se aplicó,
volver al artefacto anterior puede dejar un blueprint que la versión antigua no entiende. Por eso:

> Las migraciones de `schemaVersion` deben ser **compatibles hacia atrás durante al menos una
> versión MAJOR**. La versión nueva lee el esquema viejo; la vieja ignora campos que no conoce.

---

## 10. Cuándo cambiar de enfoque

Esta estrategia es deliberadamente ligera. Deja de servir cuando ocurra alguna de estas señales:

| Señal | Qué adoptar |
|---|---|
| Más de ~5 clientes en producción | Monorepo con workspaces y `@masamadre/core` versionado |
| `REGISTRY.md` desactualizado dos veces seguidas | Registro generado desde los manifiestos de build |
| Un despliegue manual tarda más de 15 min | Pipeline de CI con matriz por cliente |
| Dos clientes bloqueados en versiones distintas por más de un mes | Canales de release (stable / edge) |
| Un fallo llegó a producción por saltarse el smoke test | Automatizar el smoke test como puerta de despliegue |

Adoptar cualquiera de estas **antes** de que aparezca su señal es coste sin beneficio. Adoptarlas
después es tarde pero recuperable. La señal es el disparador — se revisa esta tabla en cada
incorporación de cliente.
