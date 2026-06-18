# widget-template

Plantilla de lo que vive en **cada repo de widget** (los 200+). No es un paquete
a instalar: son los dos archivos que cada repo debe tener para integrarse al
catálogo.

## Archivos

| Archivo | Rol |
|---|---|
| `widget.meta.json` | Metadata del widget. Se **commitea una vez** (bootstrapping) y luego el pipeline lo mantiene actualizado en cada deploy. Lo valida el registry contra `widget.meta.schema.json`. |
| `.github/workflows/deploy-widget.yml` | Compila la demo estática (Angular o Flutter web), la publica en `widgets.tuorg.dev/{id}/{target}/`, actualiza `widget.meta.json` y notifica al registry vía `repository_dispatch`. |

## Contrato que cada repo debe cumplir

1. Tener un `widget.meta.json` válido en la raíz (`id` == nombre del repo).
2. Producir un build **estático** servible bajo un sub-path
   (`--base-href "/{id}/{target}/"`), para que los assets resuelvan bien dentro
   del iframe del portal.
3. Estar listado en `registry/repos.json`.

## Mapeo rama/tag → ruta publicada

| Trigger | target | URL |
|---|---|---|
| push `develop` | `dev` | `widgets.tuorg.dev/{id}/dev/` |
| push `qa` | `qa` | `widgets.tuorg.dev/{id}/qa/` |
| push `main` | `prod` | `widgets.tuorg.dev/{id}/prod/` |
| tag `v2.1.0` | `v2.1.0` | `widgets.tuorg.dev/{id}/v2.1.0/` (inmutable) |

## Secrets requeridos en el repo

- `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` — deploy a Cloudflare Pages.
- `REGISTRY_DISPATCH_TOKEN` — PAT con permiso para disparar `repository_dispatch`
  en `tuorg/widget-catalog-registry`.
