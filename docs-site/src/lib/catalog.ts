import {useEffect, useState} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';

/**
 * Tipos del catálogo: reflejan el mismo `catalog-index.json` que produce el
 * registry y que consume el portal Angular. Docusaurus reusa el contrato tal cual.
 */
export type Stack = 'angular' | 'flutter';
export type EnvName = 'dev' | 'qa' | 'prod';

export interface DeployedEnvironment {
  url: string;
  lastDeployed: string;
  commit: string;
}
export interface WidgetVersion {
  version: string;
  url: string;
  releasedAt: string;
  environment: EnvName;
}
export interface WidgetMeta {
  id: string;
  name: string;
  description: string;
  stack: Stack;
  stackVersion: string;
  repo: string;
  owner: string;
  tags: string[];
  catalogTool: string;
  environments: Record<EnvName, DeployedEnvironment>;
  versions: WidgetVersion[];
}
export interface CatalogIndex {
  generatedAt: string;
  totalWidgets: number;
  byStack: Partial<Record<Stack, number>>;
  widgets: WidgetMeta[];
}

export type DemoTarget = {kind: 'env'; env: EnvName} | {kind: 'version'; version: WidgetVersion};

/** Cache a nivel de módulo: el índice se descarga una sola vez y se comparte. */
let cache: Promise<CatalogIndex> | null = null;
function load(url: string): Promise<CatalogIndex> {
  if (!cache) {
    cache = fetch(url).then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status} al cargar el catálogo`);
      return r.json();
    });
  }
  return cache;
}

type State =
  | {status: 'loading'}
  | {status: 'ready'; index: CatalogIndex}
  | {status: 'error'; error: string};

/** Hook que descarga `catalog-index.json` en runtime (client-side). */
export function useCatalog(): State {
  const url = useBaseUrl('/catalog-index.json');
  const [state, setState] = useState<State>({status: 'loading'});
  useEffect(() => {
    let alive = true;
    load(url)
      .then((index) => alive && setState({status: 'ready', index}))
      .catch((e) => alive && setState({status: 'error', error: String(e.message ?? e)}));
    return () => {
      alive = false;
    };
  }, [url]);
  return state;
}

/** En POC la demo es local y parametrizada; en prod sería la URL real del meta. */
export function buildDemoUrl(demoBase: string, w: WidgetMeta, target: DemoTarget): string {
  const params = new URLSearchParams({
    id: w.id,
    name: w.name,
    stack: w.stack,
    env: target.kind === 'version' ? target.version.environment : target.env,
  });
  if (target.kind === 'version') params.set('version', target.version.version);
  return `${demoBase}/${w.id}/?${params.toString()}`;
}

/** URL real publicada (para "abrir en pestaña nueva"). */
export function realUrl(w: WidgetMeta, target: DemoTarget): string {
  return target.kind === 'version' ? target.version.url : w.environments[target.env].url;
}
