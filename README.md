# Catálogo de Widgets — POC

Portal in-house para catalogar y exponer las demos de **200+ widgets** propios,
repartidos en repos independientes sobre dos stacks: **Angular** (~100) y
**Flutter** (~100).

> **POC exploratorio.** Los widgets y sus demos están **simulados**. El foco es la
> **arquitectura** y cómo encajan las piezas; cada parte es reemplazable por su
> equivalente real sin cambiar el diseño.

---

## La idea en una frase

Cada widget **publica su demo como archivos estáticos** en una URL predecible bajo
un dominio común, y un **portal Angular** los cataloga y los muestra en un
`<iframe>`. Funciona igual para Angular y para Flutter porque, para el portal,
**ambos son solo una URL**.

Se descartó **Storybook Composition** como núcleo porque no soporta Flutter de
forma nativa. Ver [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) para el detalle.

---

## Flujo de datos

```
┌────────────────────┐   CI/CD por widget        ┌──────────────────────────┐
│  Repo del widget    │ ── build estático ──────▶ │  Hosting (Cloudflare      │
│  (1 de 200+)        │                           │  Pages)                   │
│                     │                           │  widgets.tuorg.dev/       │
│  widget.meta.json   │                           │    {id}/{dev|qa|prod}/    │
│  deploy-widget.yml  │                           │    {id}/v{semver}/        │
└─────────┬───────────┘                           └────────────┬─────────────┘
          │ repository_dispatch / cron                          │ iframe src
          ▼                                                      │
┌──────────────────────────────┐                                │
│  Registry (repo central)      │                                │
│  aggregate-catalog.js         │   lee cada widget.meta.json,   │
│  widget.meta.schema.json      │   valida con ajv,              │
│  → catalog-index.json         │   agrega y ordena              │
└─────────────┬────────────────┘                                │
              │ fetch catalog-index.json                         │
              ▼                                                  ▼
        ┌─────────────────────────────────────────────────────────┐
        │  Portal Angular 20                                        │
        │  listado · buscador · filtros · selector env/versión      │
        │  visor en <iframe> ───────────────────────────────────────┘
        └──────────────────────────────────────────────────────────┘
```

Dos niveles de metadata:

1. **`widget.meta.json`** — uno por repo, generado por el CI en cada deploy.
2. **`catalog-index.json`** — el índice agregado que produce el registry y es lo
   **único** que consume el portal.

---

## Estructura del repo

```
pocPortalWidgets/
├── portal/              # ★ App Angular 20 (el catálogo)
│   ├── src/app/core/        modelos, CatalogService, DemoUrlService, config
│   ├── src/app/features/    catalog-list, widget-card, widget-detail
│   └── sync-assets.mjs      glue del POC: copia índice + demo a public/
├── registry/            # Repo "registry": agrega y valida
│   ├── aggregate-catalog.js
│   ├── widget.meta.schema.json
│   ├── repos.json
│   ├── catalog-index.json          (generado)
│   ├── catalog-index.errors.json   (generado)
│   └── .github/workflows/aggregate-catalog.yml
├── widget-template/     # Lo que vive en CADA repo de widget
│   ├── widget.meta.json
│   └── .github/workflows/deploy-widget.yml
├── mock-widgets/        # Datos simulados del POC
│   ├── _generate-mock-widgets.js    genera N widget.meta.json
│   ├── _demo/index.html             demo parametrizada que cargan los iframes
│   └── <id>/widget.meta.json        (generados)
└── docs/ARCHITECTURE.md
```

---

## Cómo correr el POC

Requisitos: Node 20+ (probado con Node 24) y npm.

```bash
# 1) Generar los widget.meta.json simulados
node mock-widgets/_generate-mock-widgets.js

# 2) Construir el índice central (valida con JSON Schema)
cd registry
npm install
npm run aggregate          # source=local (sin red); produce catalog-index.json

# 3) Levantar el portal
cd ../portal
npm install
npm start                  # prestart copia índice + demo a public/ y sirve en :4200
```

Abrí `http://localhost:4200`. El listado, los filtros, el detalle y el visor en
iframe funcionan contra los datos simulados.

> `npm run aggregate` usa `--source local` (lee `mock-widgets/`). En producción se
> usa `--source remote`, que baja cada `widget.meta.json` de
> `raw.githubusercontent.com`.

---

## Qué está simulado vs. qué sería en producción

| Pieza | En este POC | En producción |
|---|---|---|
| `widget.meta.json` | Generados por `mock-widgets/_generate-mock-widgets.js` | Generados por el CI de cada repo en cada deploy |
| Origen del índice | `aggregate --source local` lee `mock-widgets/` | `aggregate --source remote` baja de GitHub raw |
| Demo del iframe | Demo local parametrizada (`/demo/index.html?...`) | Build estático real en `widgets.tuorg.dev/{id}/{target}/` |
| Cómo el portal obtiene el índice | Asset local copiado a `public/` | `fetch` a la URL publicada por el registry |

El switch POC ↔ prod está aislado en un único provider:
[`portal/src/app/core/app-config.ts`](portal/src/app/core/app-config.ts)
(`pocMode`, `catalogUrl`, `demoBaseUrl`). Cambiar de entorno = cambiar ese objeto.

---

## El portal (Angular 20)

Construido con idioms de Angular 20:

- **Standalone components** + **rutas lazy** (`loadComponent`); el detalle no entra
  en el bundle inicial.
- **Signals** en todo el estado: `signal`, `computed`, `input.required()`,
  `linkedSignal` (la selección de ambiente se reinicia sola al cambiar de widget).
- **Control flow** nuevo: `@if` / `@for` / `@switch` / `@empty`.
- `withComponentInputBinding()` enlaza `:id` de la ruta al input del componente.
- `ChangeDetectionStrategy.OnPush` en los componentes.
- El `<iframe>` se sanea con `DomSanitizer` y corre con `sandbox`.

Una única fuente de verdad ([`CatalogService`](portal/src/app/core/catalog.service.ts))
descarga el índice y expone widgets, conteos y facetas (owners, tags) como
`computed`. Los filtros del listado derivan de ahí.

Tests: `cd portal && npm test` (6 specs: servicio de catálogo, resolución de URLs
POC/prod, y bootstrap de la app).

---

## Decisiones tomadas

| Tema | Decisión |
|---|---|
| Stack de widgets | Angular 16+ (~100) y Flutter (~100) |
| Repos | Independientes, uno por widget |
| Ambientes | dev, qa, prod por widget |
| Versionado | URLs inmutables por versión semver |
| Catálogo | Portal Angular 20 in-house (no Storybook) |
| Renderizado de demos | `<iframe>` a la URL del build estático |
| Metadata por widget | `widget.meta.json` en cada repo |
| Índice central | `catalog-index.json` en el repo registry |
| Validación | JSON Schema + ajv en el agregador |
| Hosting | **Cloudflare Pages** (preferida) |

---

## Próximos pasos

1. **Confirmar hosting** (Cloudflare Pages vs S3+CloudFront vs GitHub Pages).
2. **Script de bootstrapping** para inyectar `widget.meta.json` en los repos que
   aún no lo tienen (la base ya existe en `mock-widgets/_generate-mock-widgets.js`).
3. **Endurecer el `repository_dispatch`** ya cableado en el template y el workflow,
   para reemplazar el cron de 30 min por actualización en tiempo real.
4. **Auth del portal** (SSO interno) y, si aplica, paginación/virtual scroll para
   200+ tarjetas.

Detalle completo de arquitectura, escalado a 200+ widgets, seguridad del iframe y
decisión de hosting: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).
