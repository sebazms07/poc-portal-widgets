---
sidebar_position: 1
title: Introducción
slug: /intro
---

# Catálogo de Widgets — Docusaurus

Este sitio es una **POC** de cómo Docusaurus puede ser la puerta de entrada única
para los 200+ widgets de la organización (Angular y Flutter): documentación escrita
**+** catálogo en vivo **+** búsqueda, sin reintroducir el acoplamiento "rebuild en
cada deploy".

## Las dos capas

| Capa | Naturaleza | Cómo se sirve |
|---|---|---|
| **Documentación escrita** (esta sección) | Estática, cambia poco | Build de Docusaurus |
| **Catálogo + demos** ([/catalog](/catalog) y páginas por widget) | Dinámica, cambia en cada deploy | Datos en runtime (`catalog-index.json`) + iframe a la demo real |

## Cómo encaja

- El **registry** produce `catalog-index.json` (validado con JSON Schema).
- La página [**/catalog**](/catalog) lo descarga **en runtime** → no requiere rebuild
  cuando cambian los datos.
- Cada widget tiene además una **página MDX generada** (en _Widgets_) que embebe su
  demo con `<WidgetDemo />` y queda **indexada por la búsqueda**.
- Las demos son `<iframe>` al build estático real del widget, así que **siempre
  están frescas** sin tocar Docusaurus.

> POC exploratorio: los widgets y sus demos están simulados. El detalle de
> arquitectura está en [Arquitectura](./architecture).
