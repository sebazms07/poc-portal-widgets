import React, {useMemo, useState} from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {useCatalog, type Stack} from '@site/src/lib/catalog';
import styles from './styles.module.css';

type StackFilter = 'all' | Stack;

/** Listado runtime del catálogo: buscador + filtros + grilla de tarjetas. */
export default function WidgetCatalog(): JSX.Element {
  const state = useCatalog();
  const docsBase = useBaseUrl('/docs/widgets');

  const [q, setQ] = useState('');
  const [stack, setStack] = useState<StackFilter>('all');
  const [owner, setOwner] = useState('all');
  const [tags, setTags] = useState<string[]>([]);

  const widgets = state.status === 'ready' ? state.index.widgets : [];

  const owners = useMemo(() => [...new Set(widgets.map((w) => w.owner))].sort(), [widgets]);
  const allTags = useMemo(() => [...new Set(widgets.flatMap((w) => w.tags))].sort(), [widgets]);

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    return widgets.filter((w) => {
      if (stack !== 'all' && w.stack !== stack) return false;
      if (owner !== 'all' && w.owner !== owner) return false;
      if (tags.length && !tags.every((tag) => w.tags.includes(tag))) return false;
      if (t) {
        const hay = `${w.id} ${w.name} ${w.description} ${w.tags.join(' ')} ${w.owner}`.toLowerCase();
        if (!hay.includes(t)) return false;
      }
      return true;
    });
  }, [widgets, q, stack, owner, tags]);

  const toggleTag = (tag: string) =>
    setTags((cur) => (cur.includes(tag) ? cur.filter((x) => x !== tag) : [...cur, tag]));

  if (state.status === 'loading') return <p>Cargando catálogo…</p>;
  if (state.status === 'error') return <p>Error al cargar el catálogo: {state.error}</p>;

  return (
    <div>
      <div className={styles.toolbar}>
        <input
          className={styles.search}
          type="search"
          placeholder="Buscar por nombre, id, descripción, tag u owner…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className={styles.seg}>
          {(['all', 'angular', 'flutter'] as StackFilter[]).map((s) => (
            <button key={s} className={stack === s ? styles.active : undefined} onClick={() => setStack(s)}>
              {s === 'all' ? 'Todos' : s}
            </button>
          ))}
        </div>
        <select className={styles.select} value={owner} onChange={(e) => setOwner(e.target.value)}>
          <option value="all">Todos los equipos</option>
          {owners.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.tags}>
        {allTags.map((tag) => (
          <button
            key={tag}
            className={tags.includes(tag) ? `${styles.chip} ${styles.chipOn}` : styles.chip}
            onClick={() => toggleTag(tag)}>
            {tag}
          </button>
        ))}
      </div>

      <p className={styles.count}>
        {results.length} de {widgets.length} widgets
      </p>

      <div className={styles.grid}>
        {results.map((w) => (
          <Link key={w.id} className={styles.card} to={`${docsBase}/${w.id}`}>
            <div className={styles.cardHead}>
              <span className={`${styles.badge} ${styles[w.stack]}`}>{w.stack}</span>
              <span className={styles.ver}>v{w.versions[0]?.version ?? '—'}</span>
            </div>
            <h3 className={styles.name}>{w.name}</h3>
            <code className={styles.id}>{w.id}</code>
            <p className={styles.desc}>{w.description}</p>
            <div className={styles.cardTags}>
              {w.tags.map((t) => (
                <span key={t} className={styles.tag}>
                  {t}
                </span>
              ))}
            </div>
            <div className={styles.owner}>{w.owner}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
