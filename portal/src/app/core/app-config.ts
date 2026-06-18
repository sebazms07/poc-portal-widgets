import { InjectionToken } from '@angular/core';

/**
 * Configuracion del portal inyectable. Aisla los dos puntos donde el POC difiere
 * de produccion para que cambiar de entorno sea solo cambiar este provider.
 */
export interface PortalConfig {
  /**
   * URL del `catalog-index.json`.
   * - POC: asset local servido por el dev server (`/catalog-index.json`).
   * - Prod: URL publicada por el repo registry (CDN / raw / pagina estatica).
   */
  catalogUrl: string;

  /**
   * Si es `true`, los iframes apuntan a la demo local parametrizada en vez de a
   * las URLs reales de `widgets.tuorg.dev`. Permite ver el portal funcionando sin
   * tener los 200 builds reales desplegados.
   */
  pocMode: boolean;

  /** Base de la demo simulada local (solo se usa cuando `pocMode` es true). */
  demoBaseUrl: string;
}

export const APP_CONFIG = new InjectionToken<PortalConfig>('PORTAL_CONFIG');

/** Config del POC: catalogo e iframes resueltos contra assets locales. */
export const POC_CONFIG: PortalConfig = {
  catalogUrl: '/catalog-index.json',
  pocMode: true,
  demoBaseUrl: '/demo/index.html',
};
