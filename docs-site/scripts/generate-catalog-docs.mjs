/**
 * Genera la "base de información" del sitio Docusaurus a partir del catálogo.
 *
 * Entradas (producidas por el registry / mock-widgets):
 *   ../registry/catalog-index.json
 *   ../mock-widgets/_demo/**
 *
 * Salidas (regenerables; gitignored):
 *   static/catalog-index.json          → lo consume la página /catalog y <WidgetDemo> en runtime
 *   static/demo/**                     → demos que cargan los iframes (en prod serían widgets.tuorg.dev)
 *   docs/widgets/<id>.mdx              → una página por widget, con la demo embebida (indexable por Algolia)
 *   docs/widgets/_category_.json       → categoría "Widgets" en el sidebar
 *
 * Se ejecuta en `prestart`/`prebuild` y desde la GitHub Action `update-catalog-docs.yml`
 * (disparada por repository_dispatch en cada deploy de widget).
 */
import {cp, mkdir, rm, readFile, writeFile, readdir} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const site = resolve(here, '..');
const root = resolve(site, '..');

const catalogSrc = resolve(root, 'registry/catalog-index.json');
const demoSrc = resolve(root, 'mock-widgets/_demo');
const staticDir = resolve(site, 'static');
const widgetsDocs = resolve(site, 'docs/widgets');

const q = (s) => JSON.stringify(s ?? ''); // valor escapado seguro para YAML/MDX

async function main() {
  const index = JSON.parse(await readFile(catalogSrc, 'utf8'));

  // 1) Datos en runtime → static/
  await mkdir(staticDir, {recursive: true});
  await cp(catalogSrc, resolve(staticDir, 'catalog-index.json'));
  await rm(resolve(staticDir, 'demo'), {recursive: true, force: true});
  await cp(demoSrc, resolve(staticDir, 'demo'), {recursive: true});

  // 2) Páginas MDX por widget (limpio y regenero para reflejar altas/bajas)
  await rm(widgetsDocs, {recursive: true, force: true});
  await mkdir(widgetsDocs, {recursive: true});

  await writeFile(
    resolve(widgetsDocs, '_category_.json'),
    JSON.stringify(
      {
        label: 'Widgets',
        position: 4,
        link: {
          type: 'generated-index',
          title: 'Catálogo de widgets',
          description:
            'Una página por widget con su demo embebida. Para el listado interactivo con filtros, ver /catalog.',
        },
      },
      null,
      2,
    ) + '\n',
  );

  for (const w of index.widgets) {
    await writeFile(resolve(widgetsDocs, `${w.id}.mdx`), widgetPage(w));
  }

  console.log(
    `[generate] ${index.widgets.length} páginas MDX + catalog-index.json + demo/ → static/ y docs/widgets/`,
  );
}

function widgetPage(w) {
  const envRows = ['dev', 'qa', 'prod']
    .map((e) => `| \`${e}\` | ${w.environments[e].lastDeployed} | \`${w.environments[e].commit}\` |`)
    .join('\n');

  const verRows = w.versions.length
    ? w.versions
        .map((v) => `| \`v${v.version}\` | ${v.releasedAt} | [${v.url}](${v.url}) |`)
        .join('\n')
    : '| — | — | — |';

  return `---
title: ${q(w.name)}
description: ${q(w.description)}
tags: [${[w.stack, ...w.tags].map((t) => q(t)).join(', ')}]
---

import WidgetDemo from '@site/src/components/WidgetDemo';

**Stack:** \`${w.stack} ${w.stackVersion}\` · **Equipo:** \`${w.owner}\` · **Herramienta:** \`${w.catalogTool}\`

${w.description}

## Demo en vivo

<WidgetDemo id="${w.id}" />

## Ambientes

| Ambiente | Último deploy | Commit |
|---|---|---|
${envRows}

## Versiones publicadas

| Versión | Publicada | URL |
|---|---|---|
${verRows}

## Repositorio

[${w.repo}](${w.repo})
`;
}

main().catch((err) => {
  console.error('[generate] error:', err);
  process.exit(1);
});
