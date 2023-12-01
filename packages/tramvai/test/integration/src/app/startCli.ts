import mergeDeep from '@tinkoff/utils/object/mergeDeep';
import { Writable } from 'stream';
import { setDefaultResultOrder } from 'dns';
import envCi from 'env-ci';
import { start } from '@tramvai/cli';
import type { PromiseType } from 'utility-types';
import waitOn from 'wait-on';
import { requestFactory, renderFactory } from '@tramvai/test-helpers';
import type { StartOptions } from './types';
import { getServerUrl, getUtilityServerUrl, getStaticUrl } from './utils';
import { wrapPapi } from './papi';
import { wrapMocker } from './mocker';

export * from './utils';

if (typeof setDefaultResultOrder === 'function') {
  setDefaultResultOrder('ipv4first');
}

const ciInfo = envCi();

export interface StartCliOptions extends Omit<StartOptions, 'config' | 'target'> {
  enableRebuild?: boolean;
  logger?: Pick<typeof console, 'log' | 'error'>;
}

export const startCli = async (
  targetOrConfig: StartOptions['target'] | StartOptions['config'],
  { enableRebuild = false, env, logger = console, ...cliOptions }: StartCliOptions = {}
) => {
  const stdout = new Writable({
    write(chunk, encoding, callback) {
      logger.log(`[@tramvai/cli] log:`, chunk.toString());

      callback();
    },
  });
  const stderr = new Writable({
    write(chunk, encoding, callback) {
      logger.error(`[@tramvai/cli] error:`, chunk.toString());

      callback();
    },
  });

  const cliResult = await start({
    stdout,
    stderr,
    noClientRebuild: !enableRebuild,
    noServerRebuild: !enableRebuild,
    // build cache made tests unstable in CI, because of cache writing process are async,
    // and there is no way to wait this process (`idleTimeoutForInitialStore: 0` helps sometimes, but no guarantees)
    fileCache: !ciInfo.isCi,
    // faster builds with debug flag, sm still will be disabled by default
    sourceMap: cliOptions.sourceMap ?? false,
    ...(typeof targetOrConfig === 'string'
      ? { target: targetOrConfig }
      : {
          config: mergeDeep(
            {
              // disable hot-refresh that may break checks for full page load because of never-ending request
              hotRefresh: { enabled: false },
              // faster builds
              sourceMap: false,
              // faster builds
              experiments: {
                transpilation: {
                  loader: 'swc',
                },
              },
            },
            targetOrConfig
          ),
        }),
    env: {
      ...env,
      MOCKER_ENABLED: 'true',
    },
    ...cliOptions,
  });

  const serverUrl = getServerUrl(cliResult);
  const staticUrl = getStaticUrl(cliResult);
  // @FIXME: the utility port might be defined on the provider level and we don't have access to it
  // in this case. So the value might be inconsistent with actual utility server (actually, already inconsistent for tincoin)
  const utilityServerUrl = getUtilityServerUrl(env, cliResult);
  const appName = typeof targetOrConfig === 'string' ? targetOrConfig : targetOrConfig.name;

  try {
    await waitOn({
      resources: [`${utilityServerUrl}/readyz`],
      timeout: 2 * 60 * 1000,
    });
  } catch (e) {
    logger.error('[@tramvai/cli] /readyz wait failed:', e);
    throw e;
  }

  const request = requestFactory(serverUrl);
  const render = renderFactory(request, {
    replaceDynamicStrings: {
      // eslint-disable-next-line no-template-curly-in-string
      [serverUrl]: '${SERVER_URL}',
      // eslint-disable-next-line no-template-curly-in-string
      [staticUrl]: '${STATIC_URL}',
      // for server error stacktraces
      '/([a-zA-Z0-9_.-]+?)(?:\\.es)?.((?:js|ts)x?)\\??:\\d+:\\d+': '/$1.$2?:[LINE]:[SYMBOL]',
    },
  });

  const papi = wrapPapi({
    serverUrl,
    appName,
  });

  const mocker = wrapMocker({ papi });

  return {
    ...cliResult,
    serverUrl,
    staticUrl,
    stdout,
    stderr,
    request,
    render,
    papi,
    mocker,
  };
};
export type StartCliResult = PromiseType<ReturnType<typeof startCli>>;
