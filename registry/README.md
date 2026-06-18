# widget-catalog-registry

Repo central que recolecta los `widget.meta.json` de cada widget, los **valida** con
JSON Schema y produce el índice único que consume el portal.

## Archivos

| Archivo | Rol |
|---|---|
| `aggregate-catalog.js` | Recolecta + valida + agrega → `catalog-index.json` |
| `widget.meta.schema.json` | Contrato (JSON Schema draft-07) que valida cada metadata |
| `repos.json` | Lista de repos a inspeccionar (en prod, 200+ entradas) |
| `catalog-index.json` | **Salida**: índice agregado, ordenado por `id` |
| `catalog-index.errors.json` | **Salida**: repos con metadata inválida y por qué |
| `.github/workflows/aggregate-catalog.yml` | cron + manual + `repository_dispatch` |

## Uso

```bash
npm install
npm run aggregate          # source=local (lee ../mock-widgets, sin red) — para el POC
npm run aggregate:remote   # source=remote (baja de raw.githubusercontent) — producción
```

La corrida **nunca falla** por un widget inválido: lo deriva a
`catalog-index.errors.json` y sigue. Procesa en lotes de 10 concurrentes.

## Cómo agregar un widget al catálogo

1. El repo del widget debe tener un `widget.meta.json` válido (ver `widget-template/`).
2. Agregá una entrada `{ "org": "...", "repo": "..." }` en `repos.json`.
3. La próxima corrida (cron, manual o `repository_dispatch`) lo incorpora.
