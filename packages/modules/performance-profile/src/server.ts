import path from 'node:path';
import fs from 'node:fs';
import { finished } from 'node:stream/promises';
import { Session } from 'node:inspector';
import { createPapiMethod } from '@tramvai/papi';
import { Module, provide } from '@tramvai/core';
import { SERVER_MODULE_PAPI_PRIVATE_ROUTE } from '@tramvai/tokens-server';
import { LOGGER_TOKEN } from '@tramvai/module-common';
import { FASTIFY_RESPONSE } from '@tramvai/tokens-server-private';
import { PERFORMANCE_PROFILE_OPTIONS_TOKEN, PERFORMANCE_PROFILE_STATE_TOKEN } from './tokens';

export { PERFORMANCE_PROFILE_OPTIONS_TOKEN } from './tokens';

const REQUEST_TIMEOUT = 120_000;
const DEFAULT_DURATION = 60_000;

const papiTakeMemorySnapshotUrl = '/takeMemorySnapshot';
const papiGetMemorySnapshotUrl = '/getMemorySnapshot';
const papiCpuProfileUrl = '/getCpuProfile';

const post = (session: Session, method: string) =>
  new Promise<any>((resolve, reject) => {
    session.post(method, undefined, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });

@Module({
  imports: [],
  providers: [
    provide({
      provide: SERVER_MODULE_PAPI_PRIVATE_ROUTE,
      multi: true,
      useFactory: ({ logger, options, state }) => {
        const log = logger('performance-profile:inspect-memory');

        const tmpDir = options?.tmpDir ?? '/tmp';

        return createPapiMethod({
          method: 'get',
          options: {
            timeout: REQUEST_TIMEOUT,
          },
          path: papiTakeMemorySnapshotUrl,
          async handler() {
            if (state.inProgress) {
              this.deps.res.code(409).send(`Snapshot already generating`);
              return;
            }

            state.inProgress = true;

            const fileName = `heapdump-app.heapsnapshot`;
            const filePath = path.join(tmpDir, fileName);

            this.deps.res.send(`Creating snapshot for app`);

            const session = new Session();
            session.connect();

            try {
              if (fs.existsSync(filePath)) {
                await fs.promises.unlink(filePath);
              }

              const writeStream = fs.createWriteStream(filePath);

              session.on('HeapProfiler.addHeapSnapshotChunk', ({ params: { chunk } }) => {
                writeStream.write(chunk);
              });

              await post(session, 'HeapProfiler.takeHeapSnapshot');

              log.info('Snapshot created successfully');

              writeStream.end();

              await finished(writeStream);
            } catch (error: any) {
              log.error({
                event: 'snapshot-creation-failed',
                message: 'Failed to create snapshot',
                error,
              });
            } finally {
              session.disconnect();

              state.inProgress = false;
            }
          },
          deps: {
            res: FASTIFY_RESPONSE,
          },
        });
      },
      deps: {
        logger: LOGGER_TOKEN,
        options: { token: PERFORMANCE_PROFILE_OPTIONS_TOKEN, optional: true },
        state: PERFORMANCE_PROFILE_STATE_TOKEN,
      },
    }),
    provide({
      provide: SERVER_MODULE_PAPI_PRIVATE_ROUTE,
      multi: true,
      useFactory: ({ logger, options, state }) => {
        const log = logger('performance-profile:inspect-memory');

        const tmpDir = options?.tmpDir ?? '/tmp';

        return createPapiMethod({
          method: 'get',
          options: {
            timeout: REQUEST_TIMEOUT,
          },
          path: papiGetMemorySnapshotUrl,
          async handler({ responseManager }) {
            if (state.inProgress) {
              responseManager.setStatus(425);
              responseManager.setBody({
                resultCode: 'Error',
                errorMessage: 'Snapshot not ready yet',
              });

              return;
            }

            const fileName = `heapdump-app.heapsnapshot`;
            const filePath = path.join(tmpDir, fileName);

            if (!fs.existsSync(filePath)) {
              const error = {
                resultCode: 'Error',
                errorMessage: 'Snapshot not found',
              };

              responseManager.setStatus(404);
              responseManager.setBody(error);

              return;
            }

            const stream = fs.createReadStream(filePath);
            stream.on('close', () => {
              fs.unlink(filePath, (error: any) => {
                if (error) {
                  log.error({
                    event: 'snapshot-deletion-failed',
                    message: 'Failed to delete snapshot',
                    error,
                  });
                }
              });
            });

            this.deps.res.header('Content-Type', 'application/octet-stream');
            this.deps.res.header('Content-Disposition', `attachment; filename="${fileName}"`);

            await this.deps.res.send(stream);
          },
          deps: {
            res: FASTIFY_RESPONSE,
          },
        });
      },
      deps: {
        logger: LOGGER_TOKEN,
        options: { token: PERFORMANCE_PROFILE_OPTIONS_TOKEN, optional: true },
        state: PERFORMANCE_PROFILE_STATE_TOKEN,
      },
    }),
    provide({
      provide: SERVER_MODULE_PAPI_PRIVATE_ROUTE,
      multi: true,
      useFactory: ({ logger }) => {
        const log = logger('performance-profile:inspect-cpu');

        return createPapiMethod({
          method: 'get',
          options: {
            timeout: REQUEST_TIMEOUT,
          },
          path: papiCpuProfileUrl,
          async handler({ parsedUrl, responseManager }) {
            const { duration } = parsedUrl.query;

            let parsedDuration = DEFAULT_DURATION;
            if (duration && !Number.isNaN(Number(duration))) {
              parsedDuration = Math.max(100, Math.min(Number(duration), REQUEST_TIMEOUT));
            }

            const session = new Session();
            session.connect();

            try {
              await post(session, 'Profiler.enable');
              await post(session, 'Profiler.start');

              await new Promise((resolve) => setTimeout(resolve, parsedDuration));

              const { profile } = await post(session, 'Profiler.stop');

              responseManager.setHeader('Content-Type', 'application/octet-stream');
              responseManager.setHeader(
                'Content-Disposition',
                `attachment; filename="cpuprofile-${Date.now()}.cpuprofile"`
              );
              responseManager.setBody(Buffer.from(JSON.stringify(profile, null, 2)));
            } catch (error: any) {
              log.error({
                event: 'profile-creation-failed',
                message: 'Failed to create profile',
                error,
              });

              responseManager.setStatus(500);
              responseManager.setBody({
                resultCode: 'Error',
                errorMessage: `Failed to create profile. ${error.toString()}`,
              });
            } finally {
              session.disconnect();
            }
          },
        });
      },
      deps: {
        logger: LOGGER_TOKEN,
      },
    }),
    provide({
      provide: PERFORMANCE_PROFILE_STATE_TOKEN,
      useValue: {},
    }),
  ],
})
export class PerformanceProfileModule {}
