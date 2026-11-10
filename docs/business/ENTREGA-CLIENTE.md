# Documento de Entrega al Cliente — Plantilla oficial

> **Responde a:** ¿qué recibe exactamente el cliente al cerrar su proyecto, y qué queda claro por
> escrito sobre su autonomía, sus costos y nuestra relación posterior?
>
> **No responde a:** qué puede administrar según su tier ([TIERS.md](TIERS.md)), ni cómo se
> configura su tienda ([BLUEPRINT-FORMAT.md](../client-blueprints/BLUEPRINT-FORMAT.md)).

---

## Cómo usar esta plantilla

1. Copia el bloque de §2 a un documento nuevo por cliente.
2. Sustituye **todos** los `<MARCADORES>`. Un marcador sin sustituir es un defecto de entrega.
3. Entrega en PDF firmado + la fuente en la carpeta del cliente.
4. **Prohibido** entregar este documento con una sección vacía o un "por definir". Si algo no está
   definido, el proyecto no está listo para entregarse.

**Regla de redacción.** Está escrito para el dueño del negocio, no para un desarrollador. Si una
frase exige saber qué es un repositorio, un DNS o un build, reescríbela. El cliente debe poder leer
esto solo y saber qué tiene, cuánto le cuesta mantenerlo y a quién llamar.

---

## 1. Los cuatro compromisos de entrega

Lo que EWB entrega siempre, en todos los niveles, sin excepción:

| # | Entregable | Qué significa en concreto |
|---|---|---|
| 1 | **Producto desplegado y funcional** | El sitio en línea, en su dominio, operando |
| 2 | **Capacitación** | Sesión grabada + guía escrita de las tareas que el cliente hará solo |
| 3 | **Especificación de hosting y costos de terceros** | Cuánto paga, a quién, cada mes y cada año |
| 4 | **Manual de operabilidad y assets gráficos** | Cómo operarlo + sus archivos de marca en formato editable |

---

## 2. Plantilla (copiar desde aquí)

---

# Acta de Entrega de Proyecto

**Cliente:** `<RAZÓN SOCIAL>`
**RNC / Cédula:** `<RNC>`
**Proyecto:** `<NOMBRE DEL PROYECTO>`
**Nivel contratado:** `<V1 | V2>`
**Modalidad de administración:** `<MANAGED | OWNERSHIP>`
**Fecha de entrega:** `<FECHA>`
**Versión entregada:** `<VERSIÓN>` · **Identificador de compilación:** `<COMMIT>`
**Responsable EWB:** `<NOMBRE>` · `<CORREO>`

---

## 1. Qué recibe usted

### 1.1 Su sitio, en línea

| | |
|---|---|
| Dirección pública | `<URL>` |
| Dominio | `<DOMINIO>` — registrado a nombre de `<TITULAR>` |
| Vence el | `<FECHA>` |
| Alojamiento (hosting) | `<PROVEEDOR>` |
| Certificado de seguridad (HTTPS) | `<PROVEEDOR>` · renovación `<AUTOMÁTICA | MANUAL>` |

### 1.2 Funciones activas

Lo que su sitio hace hoy. Nada de esta lista es una promesa futura:

| Función | Estado | Nota |
|---|---|---|
| `<EJ: Catálogo de productos>` | Activo | `<N>` productos cargados |
| `<EJ: Carrito y pedido>` | Activo | — |
| `<EJ: Contacto por WhatsApp>` | Activo | Número `<NÚMERO>` |
| `<EJ: Retiro en tienda>` | Activo | `<SUCURSALES>` |
| `<EJ: Envío a domicilio>` | Activo | Tarifa `<MONTO>`, gratis sobre `<MONTO>` |
| `<EJ: Pago con tarjeta en línea>` | **No incluido** | Requiere `<QUÉ>` — ver §6 |

> **Declaración de funciones simuladas.** `<Ninguna función de este sitio opera con datos
> simulados.>` / `<Las siguientes funciones operan en modo demostración y NO procesan
> transacciones reales: ...>`
>
> Esta línea es obligatoria y debe ser verdadera. Nunca se entrega una función simulada
> presentándola como real.

### 1.3 Sus accesos

| Acceso | Usuario | Entregado por |
|---|---|---|
| Panel de administración | `<USUARIO>` | `<CANAL SEGURO>` |
| Dominio | `<USUARIO>` | `<CANAL SEGURO>` |
| Correo corporativo | `<USUARIO>` | `<CANAL SEGURO>` |

> Las contraseñas se entregan por un canal seguro y **se cambian en la primera sesión**. EWB no
> conserva sus contraseñas.

### 1.4 Sus archivos de marca

Entregados en `<MEDIO>`:

- Logotipo: `.svg` (editable, escalable) y `.png` con fondo transparente
- Variantes: horizontal, vertical, monocromática, versión para fondo oscuro
- Paleta de colores con sus códigos exactos
- Tipografías utilizadas y su licencia de uso
- Imágenes del sitio en su resolución original

**Estos archivos son suyos.** Puede usarlos con cualquier proveedor, en cualquier momento, sin
pedirnos permiso.

---

## 2. Su autonomía — qué le pertenece

Con la entrega de este documento, usted es propietario de:

1. **El sitio desplegado y su contenido.** Textos, imágenes, productos, precios y datos de sus
   clientes son suyos, sin reservas.
2. **Su dominio y sus cuentas.** Registradas a su nombre o transferibles a su nombre a solicitud.
3. **Sus archivos de marca**, en formato editable.
4. **Sus datos**, exportables en formato estándar cuando lo pida.

**Si decide terminar la relación con EWB:** su sitio sigue funcionando y sigue siendo suyo. No se
apaga, no se bloquea, no caduca. Lo que ocurre está en §4.

---

## 3. Qué NO le pertenece, dicho claramente

Su sitio se construyó sobre **Masa Madre**, el motor de desarrollo propiedad de EWB. Es la razón de
que su proyecto costara lo que costó y se entregara cuando se entregó.

| | |
|---|---|
| Usted posee | Su sitio, su contenido, su marca, sus datos |
| EWB conserva | El motor Masa Madre, su código fuente y los componentes reutilizables |
| Usted puede | Usar su sitio indefinidamente, modificar su contenido, contratar a otro proveedor para mantenerlo |
| Usted no puede | Revender, sublicenciar o redistribuir el motor Masa Madre como producto propio |

Esto es equivalente a comprar un vehículo: el vehículo es suyo, la patente del motor es del
fabricante.

**Su compilación lleva una firma digital** que identifica la versión del motor con que fue
construida. Sirve para dos cosas: verificar que recibe actualizaciones legítimas, y validar su
licencia. **No recopila información sobre usted ni sobre sus visitantes.**

---

## 4. La suscripción y la red de Afiliados

### Si mantiene su suscripción

- Actualizaciones automáticas del motor: mejoras, correcciones y parches de seguridad
- Soporte técnico en `<CANAL>`, tiempo de respuesta `<PLAZO>`
- **Descuentos de Afiliado** en servicios adicionales: marketing, automatización, nuevos módulos,
  diseño de empaques
- Prioridad en solicitudes de cambio

### Si termina la suscripción

| Conserva | Pierde |
|---|---|
| Su sitio, funcionando | Actualizaciones automáticas del motor |
| Su contenido y sus datos | Soporte técnico de EWB |
| Su dominio y accesos | Descuentos de Afiliado |
| Sus archivos de marca | Prioridad en cambios |

**Importante y sin letra pequeña:** su sitio **no deja de funcionar**. Queda congelado en la
versión entregada. A partir de ahí, mantenerlo —incluidas las actualizaciones de seguridad— pasa a
ser su responsabilidad o la de quien usted contrate.

**Reactivación:** puede volver en cualquier momento. Condiciones vigentes al momento de reactivar.

---

## 5. Costos que usted paga directamente a terceros

EWB **no** cobra estos servicios ni los revende. Usted contrata y paga directamente al proveedor.
Montos estimados a `<FECHA>` — pueden variar.

| Concepto | Proveedor | Costo | Frecuencia | Vence |
|---|---|---|---|---|
| Dominio | `<PROVEEDOR>` | `<MONTO>` | Anual | `<FECHA>` |
| Alojamiento | `<PROVEEDOR>` | `<MONTO>` | `<FREC>` | `<FECHA>` |
| Correo corporativo | `<PROVEEDOR>` | `<MONTO>` | `<FREC>` | `<FECHA>` |
| `<OTRO>` | `<PROVEEDOR>` | `<MONTO>` | `<FREC>` | `<FECHA>` |
| **Total estimado anual** | | **`<MONTO>`** | | |

**Costos que aparecerán si crece:**

| Si usted… | Aparece este costo | Estimado |
|---|---|---|
| Recibe más de `<N>` visitas/mes | `<CONCEPTO>` | `<MONTO>` |
| Activa pagos con tarjeta | Comisión por transacción | `<%>` + `<MONTO>` |
| Supera `<N>` productos | `<CONCEPTO>` | `<MONTO>` |

> **Su nivel `<V1|V2>` tiene límites técnicos** de catálogo, usuarios y transacciones mensuales.
> Están en §7. Al acercarse a ellos le avisamos antes de que afecte su operación.

---

## 6. Qué NO está incluido

Lista explícita, para que no haya expectativa equivocada:

| No incluido | Por qué | Cómo obtenerlo |
|---|---|---|
| `<EJ: Pago con tarjeta en línea>` | `<RAZÓN>` | `<CÓMO>` |
| `<EJ: Facturación electrónica (e-CF)>` | `<RAZÓN>` | `<CÓMO>` |
| `<EJ: App móvil>` | Fuera del alcance del nivel `<V>` | Nivel `<V>` |
| `<EJ: Redacción de contenido continuo>` | Servicio aparte | `<CÓMO>` |

---

## 7. Límites técnicos de su nivel

| Recurso | Su límite | Uso actual |
|---|---|---|
| Productos en catálogo | `<N>` | `<N>` |
| Usuarios administradores | `<N>` | `<N>` |
| Transacciones mensuales | `<N>` | — |
| Almacenamiento de imágenes | `<N>` | `<N>` |

Al alcanzar el `<80>`% de cualquier límite le contactamos con las opciones.

---

## 8. Capacitación recibida

| | |
|---|---|
| Fecha | `<FECHA>` |
| Duración | `<DURACIÓN>` |
| Participantes | `<NOMBRES>` |
| Grabación | `<ENLACE>` · disponible hasta `<FECHA>` |
| Manual escrito | `<ARCHIVO>` |

**Tareas que usted sabe hacer solo tras la capacitación:**

- [ ] `<EJ: Cambiar el precio de un producto>`
- [ ] `<EJ: Agregar un producto nuevo con foto>`
- [ ] `<EJ: Marcar un producto como agotado>`
- [ ] `<EJ: Ver y gestionar los pedidos del día>`
- [ ] `<EJ: Cambiar el anuncio de la cabecera>`

Cada casilla la marca **el cliente** tras hacer la tarea él mismo durante la sesión. Una casilla sin
marcar es capacitación pendiente, no un trámite.

---

## 9. Soporte y garantía

| | |
|---|---|
| Garantía por defectos | `<N>` días desde esta fecha |
| Qué cubre | Que lo entregado funcione como se describe en §1.2 |
| Qué no cubre | Cambios de alcance, contenido nuevo, fallos de terceros (hosting, dominio, proveedor de pago), modificaciones hechas por el cliente o por terceros |
| Canal de soporte | `<CANAL>` |
| Horario | `<HORARIO>` |
| Tiempo de respuesta | `<PLAZO>` |
| Emergencia (sitio caído) | `<CANAL>` · `<PLAZO>` |

---

## 10. Protección de datos

- Los datos de sus clientes son **suyos**. EWB no los usa, no los vende, no los comparte.
- Tratamiento conforme a la **Ley 172-13** de protección de datos personales de la República
  Dominicana.
- Su sitio `<recopila | no recopila>` datos personales de los visitantes. `<Detallar cuáles y con
  qué finalidad.>`
- Analítica: `<activa, proveedor X, con consentimiento previo | no activa>`
- Exportación de sus datos: a solicitud, en `<PLAZO>`, en formato `<FORMATO>`, sin costo.

---

## 11. Aceptación

Al firmar, el cliente declara que:

- Recibió el producto desplegado y lo verificó funcionando
- Recibió la capacitación y completó las tareas de §8
- Recibió sus archivos de marca y sus accesos
- Comprende los costos de terceros de §5 y que son su responsabilidad
- Comprende qué no está incluido (§6) y los límites de su nivel (§7)
- Comprende la relación con el motor Masa Madre (§3) y las condiciones de la suscripción (§4)

| Por el cliente | Por EWB |
|---|---|
| Nombre: `<NOMBRE>` | Nombre: `<NOMBRE>` |
| Cédula: `<CÉDULA>` | Cargo: `<CARGO>` |
| Firma: ______________ | Firma: ______________ |
| Fecha: `<FECHA>` | Fecha: `<FECHA>` |

---

*(fin de la plantilla)*

---

## 3. Lista de verificación interna (NO se entrega al cliente)

Antes de generar el acta, verificar:

- [ ] `npm run validate -- <slug>` pasa con código 0
- [ ] El manifiesto de build muestra `mode: production` y `status: live`
- [ ] **Ningún adaptador con `isMock: true`** en el build entregado
- [ ] `assets.approved: true` en el blueprint
- [ ] Toda función listada en §1.2 fue probada en el sitio real, no en desarrollo
- [ ] Dominio y hosting a nombre del cliente, o con transferencia documentada
- [ ] HTTPS activo y renovación verificada
- [ ] Contraseñas entregadas por canal seguro y no almacenadas por EWB
- [ ] Cero marcadores `<...>` sin sustituir en el documento final
- [ ] §1.2 no promete nada que el sitio no haga **hoy**
