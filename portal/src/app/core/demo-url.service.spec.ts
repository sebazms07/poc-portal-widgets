import { TestBed } from '@angular/core/testing';
import { DemoUrlService } from './demo-url.service';
import { APP_CONFIG, PortalConfig } from './app-config';
import { WidgetMeta } from './catalog.models';

const WIDGET: WidgetMeta = {
  id: 'btn-primary-action',
  name: 'Botón primario',
  description: 'Botón',
  stack: 'angular',
  stackVersion: '16.2.0',
  repo: 'https://github.com/tuorg/btn-primary-action',
  owner: 'team-design-system',
  tags: ['button'],
  catalogTool: 'storybook',
  environments: {
    dev: { url: 'https://widgets.tuorg.dev/btn-primary-action/dev/', lastDeployed: '2026-06-18T00:00:00Z', commit: 'a1b2c3d' },
    qa: { url: 'https://widgets.tuorg.dev/btn-primary-action/qa/', lastDeployed: '2026-06-15T00:00:00Z', commit: 'a1b2c3d' },
    prod: { url: 'https://widgets.tuorg.dev/btn-primary-action/prod/', lastDeployed: '2026-06-10T00:00:00Z', commit: 'a1b2c3d' },
  },
  versions: [
    { version: '2.1.0', url: 'https://widgets.tuorg.dev/btn-primary-action/v2.1.0/', releasedAt: '2026-06-10', environment: 'prod' },
  ],
};

function configure(cfg: PortalConfig): DemoUrlService {
  TestBed.configureTestingModule({ providers: [{ provide: APP_CONFIG, useValue: cfg }] });
  return TestBed.inject(DemoUrlService);
}

describe('DemoUrlService', () => {
  it('en prod devuelve la URL real del ambiente', () => {
    const svc = configure({ catalogUrl: '/x', pocMode: false, demoBaseUrl: '/demo' });
    expect(svc.resolve(WIDGET, { kind: 'env', env: 'qa' })).toBe(
      'https://widgets.tuorg.dev/btn-primary-action/qa/',
    );
  });

  it('en POC reescribe a la demo local por widget (id en la ruta)', () => {
    const svc = configure({ catalogUrl: '/x', pocMode: true, demoBaseUrl: '/demo' });
    const url = svc.resolve(WIDGET, { kind: 'version', version: WIDGET.versions[0] });
    expect(url).toContain('/demo/btn-primary-action/?');
    expect(url).toContain('version=2.1.0');
    expect(url).toContain('env=prod');
  });

  it('realUrl siempre devuelve la URL publicada, incluso en POC', () => {
    const svc = configure({ catalogUrl: '/x', pocMode: true, demoBaseUrl: '/demo' });
    expect(svc.realUrl(WIDGET, { kind: 'env', env: 'dev' })).toBe(
      'https://widgets.tuorg.dev/btn-primary-action/dev/',
    );
  });
});
