---
sidebar_position: 2
title: Arquitectura
---

# Arquitectura del sitio

Docusaurus **no reemplaza** el pipeline existente: se enchufa como capa de
presentación sobre el mismo contrato de datos (`catalog-index.json`).

```
deploy widget ─repository_dispatch─▶ registry ──▶ catalog-index.json
                                                      │
                          ┌───────────────────────────┼───────────────────────────┐
                          ▼ (A) runtime               ▼ (B) generación MDX
                  /catalog + <WidgetDemo>      generate-catalog-docs.mjs ▶ build
                          │                         (docs/widgets/*.mdx)
                          └──────────► iframe ◀───────────────┘
                                static/demo/{id}/  (en prod: widgets.tuorg.dev/{id}/{target}/)
```

## Decisiones

- **(A) Catálogo en runtime.** [/catalog](/catalog) y `<WidgetDemo>` hacen `fetch` de
  `catalog-index.json`. Cambian los datos → se reflejan sin rebuild.
- **(B) Una página MDX por widget**, generada por `scripts/generate-catalog-docs.mjs`.
  Da URLs estables por widget y **búsqueda full-text** (Algolia). El rebuild se
  **batchea** y conviene limitarlo a cambios de **prod**.
- **Demos por iframe.** No se puede renderizar Angular/Flutter dentro del runtime
  React de Docusaurus, así que el mecanismo de demo es idéntico al del portal Angular.
- **Versionado como dato.** El versionado nativo de Docusaurus no escala a 200
  widgets × N versiones; el semver se maneja como dato (selector + URL inmutable).

## Evitar el "rebuild storm"

Atar un rebuild completo a *cada* deploy de *cada* widget no escala. Mitigaciones:

1. La capa (A) no necesita rebuild en absoluto.
2. La frescura de dev/qa vive en el iframe, no en el doc.
3. La regeneración de MDX (B) se dispara por `repository_dispatch`, se **coalesce**
   y se limita a releases de prod.

El detalle completo de la arquitectura del sistema está en el `docs/ARCHITECTURE.md`
de la raíz del repositorio.
