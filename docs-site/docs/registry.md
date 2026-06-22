---
sidebar_position: 3
title: Registry y actualización
---

# De dónde salen los datos

El sitio **no** define su propia fuente de verdad: consume `catalog-index.json`,
el mismo índice que produce el repo *registry* a partir de los `widget.meta.json`
de cada repo de widget.

## Generación de la base de información

`scripts/generate-catalog-docs.mjs` toma ese índice y produce:

| Salida | Para qué |
|---|---|
| `static/catalog-index.json` | Lo consume `/catalog` y `<WidgetDemo>` en runtime |
| `static/demo/**` | Las demos que cargan los iframes (en prod: `widgets.tuorg.dev`) |
| `docs/widgets/<id>.mdx` | Una página por widget, con demo embebida e indexable |

Corre solo en `prestart` y `prebuild`, así que `npm start` / `npm run build`
siempre parten de datos frescos.

## Actualización en cada deploy

La GitHub Action `.github/workflows/update-catalog-docs.yml` se dispara por
`repository_dispatch` (evento `widget-deployed`, el mismo que ya emite cada
`deploy-widget.yml`), regenera la base de información y vuelve a publicar el sitio.
Incluye `schedule` como red de seguridad y `workflow_dispatch` para corridas manuales.

Para evitar rebuilds excesivos conviene **coalescer** los eventos y regenerar el
contenido MDX solo ante cambios de **prod**; el catálogo en runtime (`/catalog`) no
necesita rebuild porque lee el índice publicado directamente.
