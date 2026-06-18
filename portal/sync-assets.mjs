/**
 * Glue del dev-loop del POC.
 *
 * Copia hacia `portal/public/` los dos artefactos que el portal consume en runtime:
 *   - registry/catalog-index.json -> public/catalog-index.json
 *       En produccion esto NO se copia: el portal hace fetch a la URL publicada
 *       del registry (CDN / pagina estatica). Aqui lo servimos como asset local.
 *   - mock-widgets/_demo/*        -> public/demo/
 *       La demo simulada parametrizada que cargan los iframes. En produccion los
 *       iframes apuntan directo a widgets.tuorg.dev/{id}/{env}/ (pocMode: false).
 *
 * Se ejecuta via los hooks `prestart`/`prebuild` de npm, asi que `npm start` y
 * `npm run build` siempre parten de datos frescos del registry.
 */
import { cp, mkdir, access } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

const catalogSrc = resolve(root, 'registry/catalog-index.json');
const demoSrc = resolve(root, 'mock-widgets/_demo');
const publicDir = resolve(here, 'public');

try {
  await access(catalogSrc);
} catch {
  console.error(
    `[sync-assets] No existe ${catalogSrc}.\n` +
      `             Generá el índice primero:  cd ../registry && npm install && npm run aggregate`,
  );
  process.exit(1);
}

await mkdir(resolve(publicDir, 'demo'), { recursive: true });
await cp(catalogSrc, resolve(publicDir, 'catalog-index.json'));
await cp(demoSrc, resolve(publicDir, 'demo'), { recursive: true });

console.log('[sync-assets] catalog-index.json + demo/ copiados a portal/public/');
