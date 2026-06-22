# docs-site — POC de Docusaurus

Alternativa/complemento al portal Angular: **Docusaurus** como puerta de entrada
única (documentación + catálogo + búsqueda) sobre el **mismo** `catalog-index.json`.

Demuestra el enfoque **híbrido** que evita el "rebuild en cada deploy":

- **(A) Catálogo en runtime** — [`/catalog`](src/pages/catalog.tsx) y el componente
  [`<WidgetDemo>`](src/components/WidgetDemo/index.tsx) hacen `fetch` del índice. No
  requieren rebuild cuando cambian los datos.
- **(B) Una página MDX por widget** — generada por
  [`scripts/generate-catalog-docs.mjs`](scripts/generate-catalog-docs.mjs), con la
  demo embebida e indexable por la búsqueda.

## Estructura

```
docs-site/
├── src/
│   ├── lib/catalog.ts              # tipos + useCatalog() (fetch runtime) + helpers de URL
│   ├── components/
│   │   ├── WidgetDemo/             # visor: selector env/versión + iframe (usado en MDX y catálogo)
│   │   └── WidgetCatalog/          # listado + filtros (usado por /catalog)
│   └── pages/
│       ├── index.tsx               # home
│       └── catalog.tsx             # /catalog
├── scripts/generate-catalog-docs.mjs   # genera static/ + docs/widgets/*.mdx desde el catálogo
├── docs/                           # intro, architecture, registry + widgets/ (generado)
└── .github/workflows/update-catalog-docs.yml   # repository_dispatch → regen + deploy
```

## Cómo correrlo

Requiere que el registry haya generado el índice (`../registry/catalog-index.json`):

```bash
# (una vez, desde la raíz del repo, si aún no existe el índice)
node ../mock-widgets/_generate-mock-widgets.js
cd ../registry && npm install && npm run aggregate && cd ../docs-site

npm install
npm start          # prestart corre el generador; sirve en http://localhost:3000
```

- `npm start` → `prestart` ejecuta `generate-catalog-docs.mjs` (copia índice + demos a
  `static/`, genera `docs/widgets/*.mdx`) y arranca el dev server.
- `npm run build` → ídem vía `prebuild`, y compila el sitio estático a `build/`.
- `npm run generate` → solo regenera la base de información.

## Qué es POC vs. producción

| Pieza | POC | Producción |
|---|---|---|
| Fuente del índice | `../registry/catalog-index.json` (local) | `catalog-index.json` publicado por el registry |
| Demos del iframe | `static/demo/{id}/` (simuladas) | `widgets.tuorg.dev/{id}/{target}/` (build real) |
| Disparo de regeneración | manual / schedule | `repository_dispatch` de cada deploy |

Los archivos generados (`static/catalog-index.json`, `static/demo/`, `docs/widgets/`)
están en `.gitignore`: se regeneran solos.
