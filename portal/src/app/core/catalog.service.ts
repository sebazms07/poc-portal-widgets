import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { APP_CONFIG } from './app-config';
import { CatalogIndex, WidgetMeta } from './catalog.models';

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; index: CatalogIndex }
  | { status: 'error'; message: string };

/**
 * Unica fuente de verdad del portal: descarga `catalog-index.json` y lo expone
 * como signals. Toda la UI (listado, filtros, detalle) deriva de aqui.
 */
@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);
  private readonly cfg = inject(APP_CONFIG);

  private readonly state = signal<LoadState>({ status: 'loading' });

  readonly status = computed(() => this.state().status);
  readonly isLoading = computed(() => this.state().status === 'loading');
  readonly errorMessage = computed(() => {
    const s = this.state();
    return s.status === 'error' ? s.message : null;
  });

  readonly widgets = computed<WidgetMeta[]>(() => {
    const s = this.state();
    return s.status === 'ready' ? s.index.widgets : [];
  });

  readonly generatedAt = computed(() => {
    const s = this.state();
    return s.status === 'ready' ? s.index.generatedAt : null;
  });

  /** Facetas derivadas para alimentar los filtros del portal. */
  readonly owners = computed(() => unique(this.widgets().map((w) => w.owner)).sort());
  readonly tags = computed(() => unique(this.widgets().flatMap((w) => w.tags)).sort());
  readonly counts = computed(() => {
    const all = this.widgets();
    return {
      total: all.length,
      angular: all.filter((w) => w.stack === 'angular').length,
      flutter: all.filter((w) => w.stack === 'flutter').length,
    };
  });

  constructor() {
    this.reload();
  }

  reload(): void {
    this.state.set({ status: 'loading' });
    this.http.get<CatalogIndex>(this.cfg.catalogUrl).subscribe({
      next: (index) => this.state.set({ status: 'ready', index }),
      error: (err: HttpErrorResponse) =>
        this.state.set({ status: 'error', message: describeError(err) }),
    });
  }

  /** Busca un widget por id en el indice ya cargado. */
  byId(id: string): WidgetMeta | undefined {
    return this.widgets().find((w) => w.id === id);
  }
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function describeError(err: HttpErrorResponse): string {
  if (err.status === 0) return 'No se pudo contactar el origen del catalogo (red o CORS).';
  if (err.status === 404) return 'No se encontro catalog-index.json en el origen configurado.';
  return `Error ${err.status} al cargar el catalogo.`;
}
