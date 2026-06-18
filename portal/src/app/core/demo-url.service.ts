import { Injectable, inject } from '@angular/core';
import { APP_CONFIG } from './app-config';
import { EnvName, WidgetMeta, WidgetVersion } from './catalog.models';

export type DemoTarget = { kind: 'env'; env: EnvName } | { kind: 'version'; version: WidgetVersion };

/**
 * Resuelve la URL que carga el iframe del visor.
 *
 * - Prod (`pocMode: false`): devuelve la URL real publicada en el meta del widget,
 *   sea la del ambiente (dev/qa/prod) o la inmutable de una version.
 * - POC (`pocMode: true`): reescribe a la demo local parametrizada para que el
 *   iframe muestre algo representativo sin tener los builds reales desplegados.
 */
@Injectable({ providedIn: 'root' })
export class DemoUrlService {
  private readonly cfg = inject(APP_CONFIG);

  resolve(widget: WidgetMeta, target: DemoTarget): string {
    const realUrl =
      target.kind === 'version' ? target.version.url : widget.environments[target.env].url;

    if (!this.cfg.pocMode) {
      return realUrl;
    }

    const params = new URLSearchParams({
      id: widget.id,
      name: widget.name,
      stack: widget.stack,
      env: target.kind === 'version' ? target.version.environment : target.env,
    });
    if (target.kind === 'version') {
      params.set('version', target.version.version);
    }
    // Cada widget tiene su propia demo en /demo/{id}/ (el id va en la ruta, no en query).
    return `${this.cfg.demoBaseUrl}/${widget.id}/?${params.toString()}`;
  }

  /** URL real (no reescrita) para el boton "abrir en nueva pestana". */
  realUrl(widget: WidgetMeta, target: DemoTarget): string {
    return target.kind === 'version'
      ? target.version.url
      : widget.environments[target.env].url;
  }
}
