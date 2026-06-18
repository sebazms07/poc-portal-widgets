/**
 * Tipos del catalogo. Reflejan 1:1 el JSON Schema `widget.meta.schema.json`
 * del registry y la forma de `catalog-index.json`.
 */
export type Stack = 'angular' | 'flutter';
export type CatalogTool = 'storybook' | 'widgetbook' | 'other';
export type EnvName = 'dev' | 'qa' | 'prod';

export interface DeployedEnvironment {
  url: string;
  lastDeployed: string; // ISO date-time
  commit: string;
}

export interface WidgetVersion {
  version: string; // semver
  url: string;
  releasedAt: string; // YYYY-MM-DD
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
  catalogTool: CatalogTool;
  environments: Record<EnvName, DeployedEnvironment>;
  versions: WidgetVersion[];
}

export interface CatalogIndex {
  generatedAt: string;
  totalWidgets: number;
  byStack: Partial<Record<Stack, number>>;
  widgets: WidgetMeta[];
}

/** Orden de ambientes para selectores y badges. */
export const ENV_ORDER: readonly EnvName[] = ['dev', 'qa', 'prod'];
