import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CatalogService } from '../../core/catalog.service';
import { Stack, WidgetMeta } from '../../core/catalog.models';
import { WidgetCard } from '../widget-card/widget-card';

type StackFilter = 'all' | Stack;

/** Pagina principal: buscador, filtros por stack/owner/tags y grilla de widgets. */
@Component({
  selector: 'app-catalog-list',
  imports: [WidgetCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './catalog-list.html',
  styleUrl: './catalog-list.scss',
})
export class CatalogList {
  protected readonly catalog = inject(CatalogService);

  protected readonly query = signal('');
  protected readonly stack = signal<StackFilter>('all');
  protected readonly owner = signal<'all' | string>('all');
  protected readonly activeTags = signal<readonly string[]>([]);

  /** Resultado final: aplica texto + stack + owner + tags sobre el catalogo. */
  protected readonly results = computed<WidgetMeta[]>(() => {
    const q = this.query().trim().toLowerCase();
    const stack = this.stack();
    const owner = this.owner();
    const tags = this.activeTags();

    return this.catalog.widgets().filter((w) => {
      if (stack !== 'all' && w.stack !== stack) return false;
      if (owner !== 'all' && w.owner !== owner) return false;
      if (tags.length && !tags.every((t) => w.tags.includes(t))) return false;
      if (q) {
        const haystack = `${w.id} ${w.name} ${w.description} ${w.tags.join(' ')} ${w.owner}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  });

  protected readonly hasActiveFilters = computed(
    () =>
      this.query().trim() !== '' ||
      this.stack() !== 'all' ||
      this.owner() !== 'all' ||
      this.activeTags().length > 0,
  );

  protected setStack(value: StackFilter): void {
    this.stack.set(value);
  }

  protected onSearch(value: string): void {
    this.query.set(value);
  }

  protected onOwner(value: string): void {
    this.owner.set(value);
  }

  protected toggleTag(tag: string): void {
    this.activeTags.update((tags) =>
      tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag],
    );
  }

  protected isTagActive(tag: string): boolean {
    return this.activeTags().includes(tag);
  }

  protected clearFilters(): void {
    this.query.set('');
    this.stack.set('all');
    this.owner.set('all');
    this.activeTags.set([]);
  }
}
