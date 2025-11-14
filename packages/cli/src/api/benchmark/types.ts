export type Samples = {
  serverCompilationTimings: CompilationStats[];
  serverBuildTimeSamples: number[];
  clientCompilationTimings: CompilationStats[];
  clientBuildTimeSamples: number[];
  maxMemoryRssSamples: number[];
  clientMaxMemoryRssSamples: number[];
  serverMaxMemoryRssSamples: number[];
};

export type CompilationStats = {
  totalBuildCosts: Record<string, number>;
  loaderBuildCosts: Record<string, number>;
  pluginBuildCosts: Record<string, number>;
};

export type RunStats = {
  serverCompilationStats: CompilationStats | undefined;
  clientCompilationStats: CompilationStats | undefined;
  clientBuildTime: number | undefined;
  serverBuildTime: number | undefined;
  clientMaxMemoryRss: number | undefined;
  serverMaxMemoryRss: number | undefined;
  maxMemoryRss: number | undefined;
};

type PlainObject<T = any> = {
  [key: string]: T;
};

interface ProcessData {
  /**
   * process id
   */
  pid: number;
  /**
   * parent process id
   */
  ppid: number | null;
}

export interface LoaderTransformData extends ProcessData {
  /** loader name */
  loader: string;
  /**
   * loader index
   */
  loaderIndex: number;
  /** loader path */
  path: string;
  input: string | null | undefined;
  /**
   * - isPitch: true: the result of loader.pitch()
   * - isPitch: false: the code result of loader()
   */
  result: string | null | undefined;
  /** Timestamp when called */
  startAt: number;
  endAt: number;
  /** loader configuration */
  options: PlainObject;
  /** pitching loader */
  isPitch: boolean;
  /**
   * is sync
   */
  sync: boolean;
  /** Error during conversion */
  // errors: DevToolErrorInstance[];
  /** module layer */
  layer?: string;
}

export type MinimalLoaderData = Pick<LoaderTransformData, 'startAt' | 'endAt' | 'pid' | 'loader'>;

export interface PluginData {
  /** hook tap name */
  tapName: string;
  /** hook call time-consuming */
  costs: number;
  startAt: number;
  endAt: number;
  /** hook function type */
  type: 'sync' | 'async' | 'promise';
  /** hook function result */
  result: any;
}
