import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WidgetMeta } from '../../core/catalog.models';
import { timeAgo } from '../../core/format';

/** Tarjeta presentacional de un widget en el listado del catalogo. */
@Component({
  selector: 'app-widget-card',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './widget-card.html',
  styleUrl: './widget-card.scss',
})
export class WidgetCard {
  readonly widget = input.required<WidgetMeta>();

  protected readonly lastProd = computed(() => timeAgo(this.widget().environments.prod.lastDeployed));
  protected readonly latestVersion = computed(() => this.widget().versions[0]?.version ?? '—');
}
