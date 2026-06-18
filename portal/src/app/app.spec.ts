import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { App } from './app';
import { APP_CONFIG, POC_CONFIG } from './core/app-config';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_CONFIG, useValue: POC_CONFIG },
      ],
    }).compileComponents();
  });

  it('crea la app y renderiza la marca', () => {
    const fixture = TestBed.createComponent(App);
    // El CatalogService dispara la carga del índice en su constructor.
    TestBed.inject(HttpTestingController).expectOne(POC_CONFIG.catalogUrl);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.brand__text strong')?.textContent).toContain(
      'Catálogo de Widgets',
    );
  });
});
