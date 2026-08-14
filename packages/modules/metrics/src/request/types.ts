import type { RequestOptions, IncomingMessage, ClientRequest } from 'http';
import type httpType from 'http';
import type httpsType from 'https';
import type {
  METRICS_MODULE_TOKEN,
  METRICS_SERVICES_REGISTRY_TOKEN,
  MetricsInstances,
} from '@tramvai/tokens-metrics';

export type MetricsModule = typeof METRICS_MODULE_TOKEN;
export type HttpModule = typeof httpType;
export type HttpsModule = typeof httpsType;
export type OriginalRequest = HttpModule['request'];
export type GetServiceName = (typeof METRICS_SERVICES_REGISTRY_TOKEN)['getServiceName'];
export type Args =
  | [RequestOptions | string | URL, (res: IncomingMessage) => void]
  | [string | URL, RequestOptions, (res: IncomingMessage) => void];
export type CreateRequestWithMetrics = (args: {
  metricsInstances: MetricsInstances;
  getServiceName: GetServiceName;
}) => (originalRequest: HttpModule['request'], ...requestArgs: Args) => ClientRequest;
