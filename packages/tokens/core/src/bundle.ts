import type { Reducer } from '@tramvai/types-actions-state-context';
import type { ModuleType } from '@tinkoff/dippy';
import type { PageAction } from './action';

export interface BundleOptions {
  presets?: BundlePreset[];
  name: string;
  components: Record<string, any>;
  reducers?: Reducer<any, any>[];
  actions?: PageAction[];
  modules?: ModuleType[];
}
export type BundlePreset = Partial<BundleOptions>;

export interface Bundle {
  name: string;
  components: BundleOptions['components'];
  actions?: BundleOptions['actions'];
  reducers?: BundleOptions['reducers'];
  modules?: BundleOptions['modules'];
}

export type BundleImport = () => Promise<{ default: Bundle }>;
