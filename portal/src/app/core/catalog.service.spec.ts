import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CatalogService } from './catalog.service';
import { APP_CONFIG, POC_CONFIG } from './app-config';
import { CatalogIndex } from './catalog.models';

const FIXTURE: CatalogIndex = {
  generatedAt: '2026-06-18T15:00:00Z',
  totalWidgets: 2,
  byStack: { angular: 1, flutter: 1 },
  widgets: [
    {
      id: 'btn-primary-action',
      name: 'Botón primario',
      description: 'Botón',
      stack: 'angular',
      stackVersion: '16.2.0',
      repo: 'https://github.com/tuorg/btn-primary-action',
      owner: 'team-design-system',
      tags: ['button', 'core'],
      catalogTool: 'storybook',
      environments: {
        dev: { url: 'https://x/dev/', lastDeployed: '2026-06-18T00:00:00Z', commit: 'a1b2c3d' },
        qa: { url: 'https://x/qa/', lastDeployed: '2026-06-15T00:00:00Z', commit: 'a1b2c3d' },
        prod: { url: 'https://x/prod/', lastDeployed: '2026-06-10T00:00:00Z', commit: 'a1b2c3d' },
      },
      versions: [{ version: '2.1.0', url: 'https://x/v2.1.0/', releasedAt: '2026-06-10', environment: 'prod' }],
    },
    {
      id: 'flutter-rating-stars',
      name: 'Estrellas',
      description: 'Rating',
      stack: 'flutter',
      stackVersion: '3.22.0',
      repo: 'https://github.com/tuorg/flutter-rating-stars',
      owner: 'team-mobile-core',
      tags: ['rating'],
      catalogTool: 'widgetbook',
      environments: {
        dev: { url: 'https://y/dev/', lastDeployed: '2026-06-18T00:00:00Z', commit: 'd4e5f6a' },
        qa: { url: 'https://y/qa/', lastDeployed: '2026-06-15T00:00:00Z', commit: 'd4e5f6a' },
        prod: { url: 'https://y/prod/', lastDeployed: '2026-06-10T00:00:00Z', commit: 'd4e5f6a' },
      },
      versions: [],
    },
  ],
};

describe('CatalogService', () => {
  let service: CatalogService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_CONFIG, useValue: POC_CONFIG },
      ],
    });
    service = TestBed.inject(CatalogService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('carga el índice y deriva facetas y conteos', () => {
    http.expectOne(POC_CONFIG.catalogUrl).flush(FIXTURE);

    expect(service.status()).toBe('ready');
    expect(service.widgets().length).toBe(2);
    expect(service.counts()).toEqual({ total: 2, angular: 1, flutter: 1 });
    expect(service.owners()).toEqual(['team-design-system', 'team-mobile-core']);
    expect(service.tags()).toEqual(['button', 'core', 'rating']);
    expect(service.byId('flutter-rating-stars')?.name).toBe('Estrellas');
  });

  it('expone un mensaje de error si la carga falla', () => {
    http.expectOne(POC_CONFIG.catalogUrl).flush('not found', { status: 404, statusText: 'Not Found' });

    expect(service.status()).toBe('error');
    expect(service.errorMessage()).toContain('catalog-index.json');
    expect(service.widgets()).toEqual([]);
  });
});
