#!/usr/bin/env node
/**
 * Generador de widgets simulados para el POC.
 *
 * Escribe un `widget.meta.json` por cada widget definido abajo en
 * `mock-widgets/<id>/widget.meta.json`. En un entorno real este archivo
 * lo produce el pipeline de CI/CD de cada repo en cada deploy (ver
 * `widget-template/.github/workflows/deploy-widget.yml`), pero aqui lo
 * simulamos para tener datos contra los cuales correr el registry y el portal.
 *
 * Tambien sirve como prueba de concepto del "script de bootstrapping"
 * (pendiente #4): inyectar un widget.meta.json valido en repos que aun no lo tienen.
 *
 *   node mock-widgets/_generate-mock-widgets.js
 */
const fs = require("fs");
const path = require("path");

const DOMAIN = "https://widgets.tuorg.dev";
const ORG = "tuorg";

/** Helpers para fabricar fechas/commits verosimiles y deterministas. */
const isoAt = (daysAgo, h = 12, m = 0) => {
  const d = new Date(Date.UTC(2026, 5, 18, h, m, 0)); // 2026-06-18 base
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.toISOString().replace(".000Z", "Z");
};
const dateAt = (daysAgo) => isoAt(daysAgo).slice(0, 10);
const commit = (seed) =>
  Math.abs(seed * 2654435761 % 0xfffffff).toString(16).padStart(7, "0").slice(0, 7);

/** Construye el bloque environments {dev,qa,prod} con URLs predecibles. */
const envs = (id, base) => ({
  dev: { url: `${DOMAIN}/${id}/dev/`, lastDeployed: isoAt(base + 0, 14, 32), commit: commit(base + 1) },
  qa: { url: `${DOMAIN}/${id}/qa/`, lastDeployed: isoAt(base + 3, 9, 10), commit: commit(base + 2) },
  prod: { url: `${DOMAIN}/${id}/prod/`, lastDeployed: isoAt(base + 8, 11, 0), commit: commit(base + 3) },
});

/** Construye el array de versiones inmutables (semver) mas recientes primero. */
const vers = (id, list) =>
  list.map(([version, daysAgo]) => ({
    version,
    url: `${DOMAIN}/${id}/v${version}/`,
    releasedAt: dateAt(daysAgo),
    environment: "prod",
  }));

const widgets = [
  {
    id: "btn-primary-action",
    name: "Boton de accion primaria",
    description: "Boton reutilizable para acciones primarias del sistema.",
    stack: "angular", stackVersion: "16.2.0", owner: "team-design-system",
    tags: ["button", "core", "forms"], catalogTool: "storybook", base: 8,
    versions: [["2.1.0", 8], ["2.0.0", 48], ["1.4.0", 95]],
  },
  {
    id: "data-table-pro",
    name: "Tabla de datos avanzada",
    description: "Grid con orden, filtros, paginacion y seleccion multiple.",
    stack: "angular", stackVersion: "17.0.4", owner: "team-data-platform",
    tags: ["table", "data", "grid", "core"], catalogTool: "storybook", base: 2,
    versions: [["3.2.1", 2], ["3.2.0", 20], ["3.0.0", 70]],
  },
  {
    id: "date-picker",
    name: "Selector de fecha",
    description: "Calendario accesible con rangos y localizacion.",
    stack: "angular", stackVersion: "16.2.0", owner: "team-design-system",
    tags: ["forms", "date", "core"], catalogTool: "storybook", base: 12,
    versions: [["1.9.0", 12], ["1.8.2", 40]],
  },
  {
    id: "toast-notification",
    name: "Notificacion toast",
    description: "Avisos transitorios apilables con variantes de severidad.",
    stack: "angular", stackVersion: "17.1.0", owner: "team-platform-ui",
    tags: ["feedback", "overlay", "core"], catalogTool: "storybook", base: 5,
    versions: [["2.3.0", 5], ["2.2.0", 33]],
  },
  {
    id: "file-uploader",
    name: "Cargador de archivos",
    description: "Drag and drop con progreso, validacion de tipo y tamano.",
    stack: "angular", stackVersion: "16.2.0", owner: "team-platform-ui",
    tags: ["forms", "files"], catalogTool: "widgetbook", base: 18,
    versions: [["1.2.0", 18]],
  },
  {
    id: "flutter-rating-stars",
    name: "Estrellas de valoracion",
    description: "Componente de rating con medias estrellas y modo solo lectura.",
    stack: "flutter", stackVersion: "3.22.0", owner: "team-mobile-core",
    tags: ["rating", "feedback"], catalogTool: "widgetbook", base: 6,
    versions: [["1.5.0", 6], ["1.4.0", 36]],
  },
  {
    id: "flutter-bottom-sheet",
    name: "Bottom sheet modal",
    description: "Hoja inferior arrastrable con snap points configurables.",
    stack: "flutter", stackVersion: "3.22.0", owner: "team-mobile-core",
    tags: ["navigation", "overlay"], catalogTool: "widgetbook", base: 9,
    versions: [["2.0.0", 9], ["1.7.0", 60]],
  },
  {
    id: "flutter-chart-line",
    name: "Grafico de lineas",
    description: "Series temporales con tooltips, zoom y leyenda.",
    stack: "flutter", stackVersion: "3.19.6", owner: "team-data-platform",
    tags: ["chart", "data", "viz"], catalogTool: "widgetbook", base: 14,
    versions: [["0.9.0", 14], ["0.8.0", 44]],
  },
  {
    id: "flutter-otp-input",
    name: "Campo OTP",
    description: "Entrada de codigo de un solo uso con autollenado y validacion.",
    stack: "flutter", stackVersion: "3.22.0", owner: "team-security",
    tags: ["forms", "auth", "security"], catalogTool: "other", base: 4,
    versions: [["1.1.0", 4], ["1.0.0", 50]],
  },
];

const root = __dirname;
let written = 0;
for (const w of widgets) {
  const meta = {
    id: w.id,
    name: w.name,
    description: w.description,
    stack: w.stack,
    stackVersion: w.stackVersion,
    repo: `https://github.com/${ORG}/${w.id}`,
    owner: w.owner,
    tags: w.tags,
    catalogTool: w.catalogTool,
    environments: envs(w.id, w.base),
    versions: vers(w.id, w.versions),
  };
  const dir = path.join(root, w.id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "widget.meta.json"), JSON.stringify(meta, null, 2) + "\n");
  written++;
}

// Widget INVALIDO a proposito: 'stack' fuera del enum y 'id' demasiado corto.
// Sirve para demostrar que el agregador lo manda a catalog-index.errors.json
// sin romper la corrida.
const badDir = path.join(root, "bad-widget");
fs.mkdirSync(badDir, { recursive: true });
fs.writeFileSync(
  path.join(badDir, "widget.meta.json"),
  JSON.stringify(
    {
      id: "x",
      name: "Widget con metadata invalida",
      description: "Demuestra la rama de validacion fallida del agregador.",
      stack: "react",
      stackVersion: "1.0",
      repo: "http://github.com/tuorg/bad-widget",
      owner: "team-unknown",
      tags: ["broken"],
      catalogTool: "storybook",
      environments: { dev: { url: "https://x/dev/", lastDeployed: "ayer", commit: "zz" } },
      versions: [],
      extraneousField: true,
    },
    null,
    2
  ) + "\n"
);
written++;

console.log(`Generados ${written} widget.meta.json en mock-widgets/ (incluye 1 invalido).`);
