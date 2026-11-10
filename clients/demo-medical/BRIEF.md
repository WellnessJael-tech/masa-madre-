# Brief — Centro Médico Demo

Fecha: 2026-09-02 · Levantado por: — · Estado: **no aplica**

> ⚠️ **Esto no es un cliente real.** Existe para probar que un theme nuevo
> (azul + marrón, "cliente médico" — referencia desde
> `.claude/skills/masa-madre/SKILL.md` y `docs/architecture/ARCHITECTURE.md`)
> deriva una tienda visualmente distinta **sin tocar el core, el catálogo, el
> carrito ni el checkout**.
>
> Reutiliza exactamente el mismo adaptador de contenido (`content/filesystem`)
> que `clients/demo`, con su propio contenido de catálogo — productos médicos
> de ejemplo, ver `content/` — validado contra el mismo esquema
> (`core/catalog/schema.js`). Es la prueba de la promesa central del proyecto:
> `CLIENT BLUEPRINT + THEME + MODULE CONFIGURATION + CONTENT` deriva una
> tienda nueva sin reescribir el núcleo.
>
> Verificado con Playwright en
> `e2e/theme-derivation.spec.js`: compara `demo` y `demo-medical` en la misma
> corrida, sirviendo cada uno con su propio `VITE_CLIENT` en un puerto
> distinto.
>
> El primer cliente real de esta industria reemplaza este directorio con su
> propio `BRIEF.md` completo, siguiendo la plantilla de
> `docs/client-blueprints/BLUEPRINT-FORMAT.md §2`.
