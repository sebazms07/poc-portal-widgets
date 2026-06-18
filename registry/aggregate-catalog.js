#!/usr/bin/env node
/**
 * Job agregador del catalogo de widgets.
 *
 * 1. Lee `repos.json` -> lista de { org, repo, branch? }.
 * 2. Para cada repo obtiene su `widget.meta.json`:
 *      --source remote (default real)  -> raw.githubusercontent.com/{org}/{repo}/{branch}/widget.meta.json
 *      --source local  (default POC)   -> ../mock-widgets/{repo}/widget.meta.json
 * 3. Valida cada metadata contra `widget.meta.schema.json` con ajv + ajv-formats.
 * 4. Validos -> catalog-index.json. Invalidos -> catalog-index.errors.json (sin romper la corrida).
 * 5. Ordena por `id` para que el diff en git sea estable.
 * 6. Procesa en lotes de CONCURRENCY para no saturar la API de GitHub.
 *
 * Uso:
 *   node aggregate-catalog.js                 # source = local (POC, sin red)
 *   node aggregate-catalog.js --source remote # produccion (raw.githubusercontent)
 *   node aggregate-catalog.js --source local  # explicito
 *
 * Codigo de salida: 0 siempre que la corrida termine, aunque haya widgets invalidos.
 * Devuelve 1 solo ante un error infraestructural (no se pudo escribir el indice, etc.).
 */
"use strict";

const fs = require("fs");
const path = require("path");
const Ajv = require("ajv");
const addFormats = require("ajv-formats");

const ROOT = __dirname;
const MOCK_DIR = path.resolve(ROOT, "..", "mock-widgets");
const SCHEMA_PATH = path.join(ROOT, "widget.meta.schema.json");
const REPOS_PATH = path.join(ROOT, "repos.json");
const INDEX_PATH = path.join(ROOT, "catalog-index.json");
const ERRORS_PATH = path.join(ROOT, "catalog-index.errors.json");

const CONCURRENCY = 10;
const DEFAULT_BRANCH = "main";

/** Parseo minimo de flags: --source <local|remote>. */
function parseArgs(argv) {
  const args = { source: "local" };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--source") args.source = argv[++i];
  }
  if (!["local", "remote"].includes(args.source)) {
    throw new Error(`--source invalido: ${args.source} (usar local|remote)`);
  }
  return args;
}

/** Compila el validador una sola vez. */
function buildValidator() {
  const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, "utf8"));
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  return ajv.compile(schema);
}

/** Obtiene el widget.meta.json crudo de un repo, segun la fuente elegida. */
async function fetchMeta(entry, source) {
  const branch = entry.branch || DEFAULT_BRANCH;
  if (source === "local") {
    const file = path.join(MOCK_DIR, entry.repo, "widget.meta.json");
    const raw = await fs.promises.readFile(file, "utf8");
    return { raw, origin: path.relative(ROOT, file) };
  }
  const url = `https://raw.githubusercontent.com/${entry.org}/${entry.repo}/${branch}/widget.meta.json`;
  const res = await fetch(url, { headers: githubHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status} al obtener ${url}`);
  return { raw: await res.text(), origin: url };
}

/** Cabeceras opcionales con GITHUB_TOKEN para subir el rate limit en CI. */
function githubHeaders() {
  const token = process.env.GITHUB_TOKEN;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Procesa un repo: descarga + parsea + valida. Nunca lanza: devuelve resultado tipado. */
async function processRepo(entry, source, validate) {
  const ref = `${entry.org}/${entry.repo}`;
  let origin = ref;
  try {
    const fetched = await fetchMeta(entry, source);
    origin = fetched.origin;
    const meta = JSON.parse(fetched.raw);
    if (validate(meta)) {
      return { ok: true, meta };
    }
    return {
      ok: false,
      error: { repo: ref, origin, reason: "schema-invalid", details: validate.errors },
    };
  } catch (err) {
    const reason = err instanceof SyntaxError ? "json-parse-error" : "fetch-error";
    return { ok: false, error: { repo: ref, origin, reason, details: String(err.message || err) } };
  }
}

/** Ejecuta tareas en lotes de tamano `size` para limitar la concurrencia. */
async function runBatched(items, size, worker) {
  const out = [];
  for (let i = 0; i < items.length; i += size) {
    const batch = items.slice(i, i + size);
    out.push(...(await Promise.all(batch.map(worker))));
  }
  return out;
}

async function main() {
  const { source } = parseArgs(process.argv.slice(2));
  const validate = buildValidator();
  const { repos } = JSON.parse(fs.readFileSync(REPOS_PATH, "utf8"));

  console.log(`Agregando ${repos.length} repos (source=${source}, concurrency=${CONCURRENCY})...`);
  const results = await runBatched(repos, CONCURRENCY, (entry) =>
    processRepo(entry, source, validate)
  );

  const widgets = results
    .filter((r) => r.ok)
    .map((r) => r.meta)
    .sort((a, b) => a.id.localeCompare(b.id));
  const errors = results.filter((r) => !r.ok).map((r) => r.error);

  const byStack = widgets.reduce((acc, w) => {
    acc[w.stack] = (acc[w.stack] || 0) + 1;
    return acc;
  }, {});

  const index = {
    generatedAt: new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
    totalWidgets: widgets.length,
    byStack,
    widgets,
  };

  fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2) + "\n");
  fs.writeFileSync(
    ERRORS_PATH,
    JSON.stringify(
      { generatedAt: index.generatedAt, totalErrors: errors.length, errors },
      null,
      2
    ) + "\n"
  );

  console.log(`OK  ${widgets.length} validos -> ${path.basename(INDEX_PATH)}`);
  console.log(`ERR ${errors.length} invalidos -> ${path.basename(ERRORS_PATH)}`);
  for (const e of errors) console.log(`    - ${e.repo}: ${e.reason}`);
}

main().catch((err) => {
  console.error("Fallo infraestructural del agregador:", err);
  process.exit(1);
});
