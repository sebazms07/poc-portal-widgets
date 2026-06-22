import React, {useState} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {useCatalog, buildDemoUrl, realUrl, type DemoTarget, type EnvName} from '@site/src/lib/catalog';
import styles from './styles.module.css';

const ENVS: EnvName[] = ['dev', 'qa', 'prod'];

/**
 * Visor de demo embebible. Se usa tanto en la página de catálogo como dentro de
 * cada página MDX por widget (`<WidgetDemo id="..." />`). Obtiene el widget del
 * `catalog-index.json` en runtime y muestra el selector de ambiente/versión + iframe.
 */
export default function WidgetDemo({id, height = 520}: {id: string; height?: number}): JSX.Element {
  const state = useCatalog();
  const demoBase = useBaseUrl('/demo');
  const [target, setTarget] = useState<DemoTarget>({kind: 'env', env: 'prod'});

  if (state.status === 'loading') return <div className={styles.state}>Cargando demo…</div>;
  if (state.status === 'error') return <div className={styles.state}>Error: {state.error}</div>;

  const w = state.index.widgets.find((x) => x.id === id);
  if (!w) return <div className={styles.state}>El widget «{id}» no está en el catálogo.</div>;

  const isEnv = (e: EnvName) => target.kind === 'env' && target.env === e;
  const isVer = (v: string) => target.kind === 'version' && target.version.version === v;

  return (
    <div className={styles.demo}>
      <div className={styles.bar}>
        <div className={styles.seg} role="group" aria-label="Ambiente">
          {ENVS.map((e) => (
            <button
              key={e}
              type="button"
              className={isEnv(e) ? styles.active : undefined}
              onClick={() => setTarget({kind: 'env', env: e})}>
              {e}
            </button>
          ))}
        </div>

        {w.versions.length > 0 && (
          <select
            className={styles.select}
            value={target.kind === 'version' ? target.version.version : ''}
            onChange={(ev) => {
              const v = w.versions.find((x) => x.version === ev.target.value);
              if (v) setTarget({kind: 'version', version: v});
            }}>
            <option value="">Versión…</option>
            {w.versions.map((v) => (
              <option key={v.version} value={v.version}>
                v{v.version} · {v.releasedAt}
              </option>
            ))}
          </select>
        )}

        <span className={styles.spacer} />
        <a className={styles.open} href={realUrl(w, target)} target="_blank" rel="noopener noreferrer">
          Abrir ↗
        </a>
      </div>

      <iframe
        className={styles.frame}
        style={{height}}
        src={buildDemoUrl(demoBase, w, target)}
        title={`Demo de ${w.name}`}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
