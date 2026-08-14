import { subscribe } from 'diagnostics_channel';
import type { ClientRequest } from 'http';
import net from 'node:net';
import tls from 'node:tls';
import type { DiagnosticsChannel } from 'undici';
import type LRUCache from '@tinkoff/lru-cache-nano';

// eslint-disable-next-line no-restricted-imports
import { UndiciError } from 'undici/lib/core/errors';

import { format } from '@tinkoff/url';
import { MetricsInstances } from '@tramvai/tokens-metrics';
import type { Args, CreateRequestWithMetrics, GetServiceName } from './types';

// https://nodejs.org/api/errors.html#nodejs-error-codes - Common system errors possible for net/http/dns
const POSSIBLE_ERRORS = [
  'EADDRINUSE',
  'ECONNREFUSED',
  'ECONNRESET',
  'ENOTFOUND',
  'EPIPE',
  'ETIMEDOUT',
];

const kMetricsAttached = Symbol('metricsAttached');
const UNKNOWN_HOST = 'unknown';
const isCorrectEmitNet = Number(process.versions.node.split('.')[0]) > 20;

// ip v6 contains [] in address: [::1]
// remove it for correct isIP check
const normalizeIpUrl = (url: string) => url.replace(/^\[|\]$/g, '');

const getHost = (request: RequestWithMetrics, cache: LRUCache<string, string>) => {
  // @ts-expect-error wrong typings
  const { protocol, servername, origin } = request;

  const url = new URL(origin.toString());
  const { port } = url;
  const portSuffix = port ? `:${port}` : '';

  if (servername) {
    return `${protocol}//${servername}${portSuffix}`;
  }
  let hostname = normalizeIpUrl(url.hostname);

  if (net.isIP(hostname)) {
    hostname = cache.get(hostname);
  }

  return `${protocol}//${hostname}${portSuffix}`;
};

const originalNetConnect = net.Socket.prototype.connect;
const originalTlsConnect = tls.connect;

// eslint-disable-next-line max-statements
export const getUrlAndOptions = (args: Args) => {
  let url;
  let options;

  // У request первый аргумент либо урл либо объект опций, кейс когда первого аргумента нет не валиден
  const isUrlStringFirst = args[0].constructor === String;
  const isUrlObjectFirst = args[0].constructor === URL;
  const isOptionsFirst = !isUrlStringFirst && !isUrlObjectFirst;
  const isOptionsSecond = !isOptionsFirst && !(args[0] instanceof Function);

  if (isUrlStringFirst) {
    [url] = args;
  }
  if (isUrlObjectFirst) {
    url = format(args[0] as URL);
  }
  if (isOptionsFirst) {
    [options] = args;
    // Тут учитываем случай если передаётся не href в options, а отдельно protocol, host, port, path
    if (options.href) {
      url = options.href;
    } else {
      const urlString = format({
        protocol: options.protocol,
        host: options.hostname || options.host,
        port: options.port,
        pathname: options.path,
      });

      // format где-то внутри делает encodeURIComponent и из-за этого потом не может обрезать query
      try {
        url = decodeURIComponent(urlString);
      } catch {
        url = urlString;
      }
    }
  }
  if (isOptionsSecond) {
    [, options] = args;
  }

  const parsedUrl = new URL(url);
  const urlWOQuery = parsedUrl.origin + parsedUrl.pathname;

  return [urlWOQuery, options || {}, parsedUrl];
};

// in seconds
const getDuration = (current: number, prev: number) =>
  // max to avoid negative values and turn that into zero
  prev === 0 ? 0 : Math.max((current - prev) / 1000, 0);

export const createRequestWithMetrics: CreateRequestWithMetrics = ({
  metricsInstances: { requestsTotal, requestsErrors, requestsDuration },
  getServiceName,
}) => {
  return function requestWithMetrics(originalRequest, ...args) {
    const [url, options] = getUrlAndOptions(args);
    const serviceName = getServiceName(url, options);
    const req = originalRequest.apply(this, args) as ClientRequest;
    const timerDone = requestsDuration.startTimer();
    const labelsValues = {
      method: options.method || 'unknown',
      service: serviceName || new URL(url).origin || 'unknown',
      status: 'unknown',
    };

    req.on('response', (res) => {
      labelsValues.status = res.statusCode.toString();
      if (res.statusCode >= 400) {
        requestsErrors.inc(labelsValues);
      }
      requestsTotal.inc(labelsValues);
      timerDone(labelsValues);
    });
    req.on('error', (e: Error & { code?: string }) => {
      if (POSSIBLE_ERRORS.includes(e?.code)) {
        labelsValues.status = req.aborted ? 'aborted' : e.code;
      }

      requestsTotal.inc(labelsValues);
      requestsErrors.inc(labelsValues);
      timerDone(labelsValues);
    });

    return req;
  };
};

export function initConnectionResolveMetrics({
  metricsInstances,
  cache,
}: {
  metricsInstances: MetricsInstances;
  cache: LRUCache<string, string>;
}) {
  if (isCorrectEmitNet) {
    subscribe('net.client.socket', ({ socket }: { socket: tls.TLSSocket | net.Socket }) => {
      instrumentSocket(socket, {
        metricsInstances,
        cache,
      });
    });
  } else {
    net.Socket.prototype.connect = function patchedNetConnect(...args) {
      const socket = originalNetConnect.apply(this, args);

      instrumentSocket(socket, {
        metricsInstances,
        cache,
      });

      return socket;
    };

    tls.connect = function patchedTlsConnect(...args) {
      const socket = originalTlsConnect.apply(this, args);

      instrumentSocket(socket, {
        metricsInstances,
        cache,
      });

      return socket;
    };
  }
}

function instrumentSocket(
  socket: net.Socket | tls.TLSSocket,
  {
    metricsInstances: { dnsResolveDuration, tcpConnectDuration, tlsHandshakeDuration },
    cache,
  }: { metricsInstances: MetricsInstances; cache: LRUCache<string, string> }
) {
  // ignore reused sockets
  if (socket[kMetricsAttached]) {
    return;
  }

  socket[kMetricsAttached] = true;

  const socketInfo = {
    start: Date.now(),
    lookupEnd: 0,
    connectEnd: 0,
    secureConnectEnd: 0,
    host: undefined,
  };
  const protocol = socket instanceof tls.TLSSocket ? 'https' : 'http';

  socket.once('lookup', (_err, address, _family, host) => {
    socketInfo.lookupEnd = Date.now();
    socketInfo.host = host;

    if (socketInfo.host) {
      cache.set(address, host);
    }

    dnsResolveDuration.observe(
      { service: host ?? UNKNOWN_HOST },
      getDuration(socketInfo.lookupEnd, socketInfo.start)
    );
  });

  socket.once('connect', () => {
    socketInfo.connectEnd = Date.now();

    if (protocol === 'http') {
      // _host is internal field - https://github.com/nodejs/node/blob/main/lib/net.js#L1383
      const { _host: host, remoteAddress } = <net.Socket & { _host: string }>socket;
      let finalHost = host;

      // When a DNS cache is used, the lookup phase is skipped
      // and the host field contains null or ip address
      // To recover the actual hostname, we maintain an IP-to-hostname mapping and
      // reuse the result of the previous DNS resolution for that IP
      if (!finalHost) {
        finalHost = cache.get(remoteAddress);
      } else if (net.isIP(finalHost)) {
        finalHost = cache.get(host);
      }

      socketInfo.host = `http://${finalHost ?? UNKNOWN_HOST}`;
    } else {
      // connect-options also internal - https://github.com/nodejs/node/blob/main/lib/internal/tls/wrap.js#L1749
      const connectOptionsSymbol = Object.getOwnPropertySymbols(socket).find(
        (smb) => smb.toString() === 'Symbol(connect-options)'
      );
      const connectOptions = socket[connectOptionsSymbol];
      const { servername } = connectOptions;

      socketInfo.host = `https://${servername ?? UNKNOWN_HOST}`;
    }

    tcpConnectDuration.observe(
      { service: socketInfo.host },
      getDuration(socketInfo.connectEnd, socketInfo.lookupEnd)
    );
  });

  socket.once('secureConnect', () => {
    socketInfo.secureConnectEnd = Date.now();
    tlsHandshakeDuration.observe(
      { service: socketInfo.host },
      getDuration(socketInfo.secureConnectEnd, socketInfo.connectEnd)
    );
  });
}

const requestMetricsSymbol = Symbol('request-metrics');

type RequestWithMetrics = DiagnosticsChannel.RequestCreateMessage['request'] & {
  [requestMetricsSymbol]: { labelsValues: any; timerDone: any };
  aborted: boolean;
};

export const addMetricsForFetch = ({
  metricsInstances: { requestsTotal, requestsErrors, requestsDuration },
  getServiceName,
  cache,
}: {
  metricsInstances: MetricsInstances;
  getServiceName: GetServiceName;
  cache: LRUCache<string, string>;
}) => {
  subscribe('undici:request:create', ({ request }: { request: RequestWithMetrics }) => {
    const { path, method } = request;
    const host = getHost(request, cache);

    const url = `${host}${path}`;
    const serviceName = getServiceName(url, request);

    const timerDone = requestsDuration.startTimer();
    const labelsValues = {
      method: method ?? 'unknown',
      service: serviceName || host || 'unknown',
      status: 'unknown',
    };

    request[requestMetricsSymbol] = {
      labelsValues,
      timerDone,
    };
  });

  subscribe(
    'undici:request:headers',
    ({
      request,
      response,
    }: {
      request: RequestWithMetrics;
      response: DiagnosticsChannel.RequestHeadersMessage['response'];
    }) => {
      const labelsValues = request[requestMetricsSymbol]?.labelsValues ?? {};
      const { statusCode } = response;

      labelsValues.status = statusCode;

      if (statusCode >= 400) {
        requestsErrors.inc(labelsValues);
      }

      requestsTotal.inc(labelsValues);
    }
  );

  subscribe('undici:request:trailers', ({ request }: { request: RequestWithMetrics }) => {
    const labelsValues = request[requestMetricsSymbol]?.labelsValues ?? {};
    const timerDone = request[requestMetricsSymbol]?.timerDone;
    timerDone?.(labelsValues);
  });

  subscribe(
    'undici:request:error',
    ({ request, error }: { request: RequestWithMetrics; error: UndiciError }) => {
      const labelsValues = request[requestMetricsSymbol]?.labelsValues ?? {};
      const timerDone = request[requestMetricsSymbol]?.timerDone;

      if (error instanceof UndiciError) {
        labelsValues.status = request.aborted ? 'aborted' : error.code;
      }

      requestsTotal.inc(labelsValues);
      requestsErrors.inc(labelsValues);
      timerDone?.(labelsValues);
    }
  );
};
