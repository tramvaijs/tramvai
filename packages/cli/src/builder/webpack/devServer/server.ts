import noop from '@tinkoff/utils/function/noop';
import eachObj from '@tinkoff/utils/object/each';
import path from 'path';
import type webpack from 'webpack';
import type Config from 'webpack-chain';
import death from 'death';
import { createProxyServer } from 'http-proxy';
// eslint-disable-next-line no-restricted-imports
import webOutgoing from 'http-proxy/lib/http-proxy/passes/web-outgoing';
import { PoolState } from 'lightning-pool';
import type { Container } from '@tinkoff/dippy';
import type { ConfigManager } from '../../../config/configManager';
import type { ApplicationConfigEntry } from '../../../typings/configEntry/application';
import type { Worker } from './pool/base/types';
import { ProcessWorkerBridge } from './pool/process/pool';
import { ThreadWorkerBridge } from './pool/thread/pool';
import { createWorkerPool } from './pool/pool';
import type { SERVER_TOKEN } from '../../../di/tokens';
import { CLOSE_HANDLER_TOKEN } from '../tokens';
import { getApplicationUrl } from '../../../utils/getApplicationUrl';

const EXITED_UNEXPECTEDLY = `

!!!  Child process exited unexpectedly  !!!,


See server logs with details and try to fix the issue,
After code change rebuild will be done automatically


`;

declare module 'webpack' {
  export class MultiStats {
    // MultiStats не экспортируется явно из webpack
    stats: webpack.Stats[];
  }
}

const HOOK_NAME = 'DevServer';

export const serverRunner = ({
  di,
  config,
  compiler,
  configManager,
  server,
}: {
  di: Container;
  config: Config;
  compiler: webpack.MultiCompiler;
  configManager: ConfigManager<ApplicationConfigEntry, 'development'>;
  server: typeof SERVER_TOKEN | null;
}) => {
  if (!server) {
    return noop;
  }
  // eslint-disable-next-line max-statements
  return async function runDevServer() {
    const file = `${Object.keys(config.entryPoints.entries())[0]}.js`;
    const filename = path.resolve(config.output.get('path'), file);
    // настоящая ссылка на файл используется для отладки в debug режиме
    const realFilename = `${getApplicationUrl({
      host: configManager.staticHost,
      port: configManager.staticPort,
      protocol: configManager.httpProtocol,
    })}/${configManager.output.server}/${file}`;
    const serverCompiler = compiler.compilers.find((comp) => comp.name === 'server');

    if (!serverCompiler) {
      throw new Error('Server compiler has not found');
    }

    const fs = serverCompiler.outputFileSystem as any;
    // ThreadWorkerPool is experimental
    // it doesn't work well when running integration tests in tramvai repo
    // mostly because of the some problems with `babel-plugin-lodash`
    // but thread workers are more lightweight and performant
    //
    // also currently they do not support nodejs debugging - [issue](https://github.com/nodejs/node/issues/26609)
    // in case of debugging fallback to the child processes
    const { pool, send } = await createWorkerPool(
      di,
      configManager.experiments.serverRunner === 'thread' && !configManager.debug
        ? ThreadWorkerBridge
        : ProcessWorkerBridge
    );
    let worker: Worker | null;
    let serverInvalidated = true;
    let workerPort: number | null;
    let resolveWorkerPort: () => void | null;
    let workerPortPromise: Promise<void> | null;
    let hasExitedUnexpectedly = false;
    let proxyErrorCount = 0;

    const proxy = createProxyServer({
      // указываем, что сами обработаем ответ
      selfHandleResponse: true,
    });

    const deathUnsubscribe = death({ exit: true, uncaughtException: true })(async (signal, err) => {
      await pool.close(true);

      if (err instanceof Error) {
        console.error(err);
      }

      process.exit(1);
    });

    di.register({
      provide: CLOSE_HANDLER_TOKEN,
      multi: true,
      useValue: deathUnsubscribe,
    });

    // отключаем инвалидацию и перезапуск сервера если выставлен флаг noServerRebuild
    if (!configManager.noServerRebuild) {
      serverCompiler.hooks.invalid.tap(HOOK_NAME, () => {
        serverInvalidated = true;
        hasExitedUnexpectedly = false;
      });
    }

    const waitWorkerPort = async () => {
      if (workerPort) {
        return workerPort;
      }

      if (workerPortPromise) {
        return workerPortPromise;
      }

      workerPortPromise = new Promise<void>((resolve) => {
        resolveWorkerPort = resolve;
      });

      return workerPortPromise;
    };

    // http-proxy всегда склеивает слеши в урле, что немного неожиданно при работе с сервером напрямую
    // https://github.com/http-party/node-http-proxy/issues/775
    // поэтому пытаемся вернуть все слеши на место
    proxy.on('proxyReq', (proxyReq, req, res) => {
      // Early Hints support
      proxyReq.socket.on('data', (data) => {
        try {
          const chunk = data.toString();

          if (chunk.startsWith('HTTP/1.1 103 Early Hints')) {
            res.socket.write(data);
          }
        } catch (e) {
          // do nothing
        }
      });

      // https://github.com/http-party/node-http-proxy/issues/1022#issuecomment-439245479
      // eslint-disable-next-line no-param-reassign
      (proxyReq as any).path = req.url;
    });

    // делаем запросы к дочернему процессу и пытаемся полностью получить его ответ
    // если всё ок, то просто отправляем полученные данные клиенту
    proxy.on('proxyRes', (proxyRes, req, res) => {
      proxyErrorCount--;

      if (!res.headersSent) {
        // дублируем всю логику прокси и отправляем ответ
        // немного костыль по мотивам https://github.com/http-party/node-http-proxy/issues/1263#issuecomment-394758768
        eachObj((handler) => {
          handler(req, res, proxyRes, {});
        }, webOutgoing);
      }

      //
      // Обработка события aborted нужна только для кейса, когда запросы на localhost:4000
      // проксируются через tramvai сервер, который каждый ребилд переоткрывается на другом порту
      //
      // Кейс нужен для __webpack_hmr, который отдает данные в стриме через server-sent events,
      // и нам нужно всегда держать постоянное соединение к __webpack_hmr,
      // а повторное открытие tramvai сервера на другом порту сбрасывает это соединение
      //
      // В proxy.on('error') уже содержится логика по повторному запросу на другой порт,
      // поэтому нам просто нужно обработать обрыв соединения как ошибку
      //
      proxyRes.on('aborted', () => {
        const contentType = res.getHeader('content-type');

        if (typeof contentType === 'string' && contentType.includes('text/event-stream')) {
          proxy.emit('error', Error('aborted'), req, res);
        }
      });

      proxyRes.pipe(res);
    });

    // в случае ошибки ждём пока получим новый порт и делаем повторный запрос
    // рекурсивные ошибки будут опять попадать сюда и это будет продолжаться до тех пор пока не получим ответ
    proxy.on('error', async (err, req, res) => {
      if (hasExitedUnexpectedly) {
        // @ts-ignore
        res.statusCode = 500;
        res.end(EXITED_UNEXPECTEDLY);
        return;
      }

      if (proxyErrorCount > 10) {
        console.error('[dev-server-error] looping of request proxying to worker', err);
        // @ts-ignore
        res.statusCode = 500;
        res.end(EXITED_UNEXPECTEDLY);
        return;
      }

      if (pool.state !== PoolState.CLOSED) {
        proxyErrorCount++;

        await waitWorkerPort();

        proxy.web(req, res as any, { target: `http://localhost:${workerPort}` });
      }
    });

    // задаём свой http-сервер который будет проксировать запросы к дочернему процессу
    server.on('request', async (req, res) => {
      if (hasExitedUnexpectedly) {
        res.statusCode = 500;
        res.end(EXITED_UNEXPECTEDLY);
        return;
      }

      await waitWorkerPort();

      proxy.web(req, res, { target: `http://localhost:${workerPort}` });
    });

    // Проксируем также и веб-сокеты
    server.on('upgrade', (req, socket, head) => {
      proxy.ws(req, socket, { target: `http://localhost:${workerPort}` });
    });

    di.register({
      provide: CLOSE_HANDLER_TOKEN,
      multi: true,
      useValue: async () => {
        proxy.close();

        if (worker) {
          // если сервер закрывается, мы должны завершить все дочерние воркеры
          await pool.release(worker);
          await pool.close(true);
        }
      },
    });

    serverCompiler.hooks.beforeCompile.tapPromise(HOOK_NAME, async () => {
      if (pool.state === PoolState.IDLE) {
        await pool.start();
      }
    });

    compiler.hooks.done.tap(HOOK_NAME, async (stats) => {
      if (serverInvalidated) {
        workerPort = null;
        workerPortPromise = null;

        serverInvalidated = false;

        if (stats.hasErrors()) {
          // всплыли ошибки при сборке - просто игнорим калбек чтобы не падать ниже и дать возможность выполнить пересборку
          return;
        }

        if (worker) {
          await pool.release(worker);
        }

        worker = await pool.acquire();

        worker.on('error', (error) => {
          if (pool.state !== PoolState.CLOSED) {
            console.error('[worker] error:', error);
            hasExitedUnexpectedly = true;
          }
        });

        worker.on('exit', async () => {
          hasExitedUnexpectedly = true;
          workerPort = null;
          workerPortPromise = null;

          if (worker) {
            pool.release(worker);
          }

          worker = null;

          if (pool.state !== PoolState.CLOSED) {
            console.error(EXITED_UNEXPECTEDLY);
          }
        });

        worker.once('message', ({ cmd, port }) => {
          if (cmd === 'listen') {
            workerPort = port;

            resolveWorkerPort?.();
          }
        });

        const script = fs.readFileSync(filename);

        await send(worker, 'script', { filename: realFilename, script });
      }
    });
  };
};
