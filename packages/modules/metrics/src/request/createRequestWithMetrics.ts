import { format } from '@tinkoff/url';
import { subscribe } from 'diagnostics_channel';
import type { DiagnosticsChannel } from 'undici';

// eslint-disable-next-line no-restricted-imports
import { UndiciError } from 'undici/lib/core/errors';

import type { ClientRequest } from 'http';
import type { Socket } from 'net';
import { TLSSocket } from 'tls';
import type { Args, CreateRequestWithMetrics } from './types';

// https://nodejs.org/api/errors.html#nodejs-error-codes - Common system errors possible for net/http/dns
const POSSIBLE_ERRORS = [
  'EADDRINUSE',
  'ECONNREFUSED',
  'ECONNRESET',
  'ENOTFOUND',
  'EPIPE',
  'ETIMEDOUT',
];

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
  metricsInstances: { dnsResolveDuration, tcpConnectDuration, tlsHandshakeDuration },
}) {
  subscribe('net.client.socket', ({ socket }: { socket: TLSSocket | Socket }) => {
    const socketInfo = {
      start: Date.now(),
      lookupEnd: 0,
      connectEnd: 0,
      secureConnectEnd: 0,
      host: 'unknown',
    };
    const protocol = socket instanceof TLSSocket ? 'https' : 'http';

    socket.once('lookup', (_err, _address, _family, host) => {
      socketInfo.lookupEnd = Date.now();
      dnsResolveDuration.observe(
        { service: host },
        getDuration(socketInfo.lookupEnd, socketInfo.start)
      );
    });

    socket.on('connect', () => {
      socketInfo.connectEnd = Date.now();
      let service;

      if (protocol === 'http') {
        // _host is internal field - https://github.com/nodejs/node/blob/main/lib/net.js#L1383
        const { remotePort: port, _host: host } = <Socket & { _host: string }>socket;
        service = `${protocol}://${host}:${port}`;
        socketInfo.host = host;
      } else {
        // connect-options also internal - https://github.com/nodejs/node/blob/main/lib/internal/tls/wrap.js#L1749
        const connectOptionsSymbol = Object.getOwnPropertySymbols(socket).find(
          (smb) => smb.toString() === 'Symbol(connect-options)'
        );
        const connectOptions = socket[connectOptionsSymbol];
        const { port, host } = connectOptions;
        service = `${protocol}://${host}:${port}`;
        socketInfo.host = host;
      }

      tcpConnectDuration.observe(
        { service },
        getDuration(socketInfo.connectEnd, socketInfo.lookupEnd)
      );
    });

    socket.on('secureConnect', () => {
      socketInfo.secureConnectEnd = Date.now();
      tlsHandshakeDuration.observe(
        { service: socketInfo.host },
        getDuration(socketInfo.secureConnectEnd, socketInfo.connectEnd)
      );
    });
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
}) => {
  subscribe('undici:request:create', ({ request }: { request: RequestWithMetrics }) => {
    const { method, origin, path } = request;
    const url = origin + path;
    const serviceName = getServiceName(url, request);

    const timerDone = requestsDuration.startTimer();
    const labelsValues = {
      method: method ?? 'unknown',
      service: serviceName || origin || 'unknown',
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
      const { labelsValues } = request[requestMetricsSymbol];
      const { statusCode } = response;

      labelsValues.status = statusCode;

      if (statusCode >= 400) {
        requestsErrors.inc(labelsValues);
      }

      requestsTotal.inc(labelsValues);
    }
  );

  subscribe('undici:request:trailers', ({ request }: { request: RequestWithMetrics }) => {
    const { timerDone, labelsValues } = request[requestMetricsSymbol];
    timerDone(labelsValues);
  });

  subscribe(
    'undici:request:error',
    ({ request, error }: { request: RequestWithMetrics; error: UndiciError }) => {
      const { timerDone, labelsValues } = request[requestMetricsSymbol];

      if (error instanceof UndiciError) {
        labelsValues.status = request.aborted ? 'aborted' : error.code;
      }

      requestsTotal.inc(labelsValues);
      requestsErrors.inc(labelsValues);
      timerDone(labelsValues);
    }
  );
};
