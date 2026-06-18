import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../core/catalog.service';
import { DemoTarget, DemoUrlService } from '../../core/demo-url.service';
import { ENV_ORDER, EnvName, WidgetMeta, WidgetVersion } from '../../core/catalog.models';
import { formatDate, timeAgo } from '../../core/format';

/** Detalle de un widget: visor en iframe + selector de ambiente/version + metadata. */
@Component({
  selector: 'app-widget-detail',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './widget-detail.html',
  styleUrl: './widget-detail.scss',
})
export class WidgetDetail {
  /** Enlazado desde la ruta `widget/:id` por withComponentInputBinding(). */
  readonly id = input.required<string>();

  private readonly catalog = inject(CatalogService);
  private readonly demoUrls = inject(DemoUrlService);
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly envOrder = ENV_ORDER;
  protected readonly status = this.catalog.status;
  protected readonly widget = computed<WidgetMeta | undefined>(() => this.catalog.byId(this.id()));

  /** Seleccion actual del visor. Se reinicia a prod cada vez que cambia el widget. */
  protected readonly selection = linkedSignal<WidgetMeta | undefined, DemoTarget>({
    source: this.widget,
    computation: (): DemoTarget => ({ kind: 'env', env: 'prod' }),
  });

  protected readonly iframeUrl = computed<SafeResourceUrl | null>(() => {
    const w = this.widget();
    if (!w) return null;
    const url = this.demoUrls.resolve(w, this.selection());
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  protected readonly externalUrl = computed<string | null>(() => {
    const w = this.widget();
    return w ? this.demoUrls.realUrl(w, this.selection()) : null;
  });

  /** Datos de deploy del ambiente actualmente seleccionado (si aplica). */
  protected readonly currentEnvInfo = computed(() => {
    const w = this.widget();
    const sel = this.selection();
    if (!w || sel.kind !== 'env') return null;
    const info = w.environments[sel.env];
    return { ...info, deployedAgo: timeAgo(info.lastDeployed) };
  });

  protected selectEnv(env: EnvName): void {
    this.selection.set({ kind: 'env', env });
  }

  protected selectVersion(version: WidgetVersion): void {
    this.selection.set({ kind: 'version', version });
  }

  protected onVersionChange(version: string): void {
    const found = this.widget()?.versions.find((v) => v.version === version);
    if (found) this.selectVersion(found);
  }

  protected isEnv(env: EnvName): boolean {
    const sel = this.selection();
    return sel.kind === 'env' && sel.env === env;
  }

  protected isVersion(version: WidgetVersion): boolean {
    const sel = this.selection();
    return sel.kind === 'version' && sel.version.version === version.version;
  }

  protected readonly fmtDate = formatDate;
}
