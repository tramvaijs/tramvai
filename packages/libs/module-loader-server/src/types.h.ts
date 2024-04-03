type LogFunction = (...args: any[]) => void;

export interface Logger {
  trace: LogFunction;
  debug: LogFunction;
  info: LogFunction;
  warn: LogFunction;
  error: LogFunction;
}

export type RequestFunc = (options: {
  url: string;
  responseType?: string;
  timeout?: number;
}) => Promise<any>;

export interface Cache {
  get: (key: string) => any;
  set: (key: string, module: any) => void;
}

export interface RequestOptions {
  circuitBreakerEnabled?: boolean;
}

export interface LoaderDeps {
  log?: Logger;
  request?: RequestFunc;
  cache?: Cache;
  externals?: Record<string, any>;
  debug?: string[];
  timeout?: number;
  requestOptions?: RequestOptions;
}

export interface LoadOptions {
  [key: string]: any;
  // тип ресурса, по умолчанию 'module', используется при логировании
  kind?: string;
  // если задан, будет использоваться после kind при логировании
  displayName?: string;
  // если задан, ресурс будет проверен на соответствие заданному хешу
  integrity?: string;

  codePrefix?: string;

  type?: 'js' | 'json';
}
