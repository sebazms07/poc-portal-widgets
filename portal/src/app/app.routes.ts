import { Routes } from '@angular/router';

/**
 * Rutas del portal. Lazy-loaded por feature: el detalle del widget no entra en
 * el bundle inicial. `:id` se enlaza al input `id` del componente gracias a
 * `withComponentInputBinding()`.
 */
export const routes: Routes = [
  {
    path: '',
    title: 'Catálogo de Widgets',
    loadComponent: () =>
      import('./features/catalog-list/catalog-list').then((m) => m.CatalogList),
  },
  {
    path: 'widget/:id',
    title: 'Widget · Catálogo',
    loadComponent: () =>
      import('./features/widget-detail/widget-detail').then((m) => m.WidgetDetail),
  },
  { path: '**', redirectTo: '' },
];
