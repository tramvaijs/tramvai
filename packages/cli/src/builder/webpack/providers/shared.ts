import type { Provider } from '@tinkoff/dippy';
import { provide } from '@tinkoff/dippy';
import { EventEmitter } from 'events';
import { CONFIG_MANAGER_TOKEN, WITH_BUILD_STATS_TOKEN } from '../../../di/tokens';
import { closeWorkerPool, warmupWorkerPool } from '../../../library/webpack/utils/threadLoader';
import { calculateBuildTime } from '../utils/calculateBuildTime';
import { maxMemoryRss } from '../utils/maxMemoryRss';
import {
  CLOSE_HANDLER_TOKEN,
  EVENT_EMITTER_TOKEN,
  GET_BUILD_STATS_TOKEN,
  INIT_HANDLER_TOKEN,
  WEBPACK_CLIENT_COMPILER_TOKEN,
  WEBPACK_SERVER_COMPILER_TOKEN,
  WEBPACK_ANALYZE_PLUGIN_NAME_TOKEN,
  WEBPACK_ANALYZE_PLUGIN_TOKEN,
} from '../tokens';
import { emitWebpackEvents } from '../utils/webpackEvents';
import { BundleAnalyzePlugin } from '../analyzePlugins/bundle';
import { StatoscopeAnalyzePlugin } from '../analyzePlugins/statoscope';
import { WhyBundledAnalyzePlugin } from '../analyzePlugins/whyBundled';
import { RsdoctorAnalyzePlugin } from '../analyzePlugins/rsdoctor';
import { StatsAnalyzePlugin } from '../analyzePlugins/stats';
import type { AnalyzePlugin } from '../types';

interface Type<T> extends Function {
  new (...args: any[]): T;
}

const pluginMap: Record<string, Type<AnalyzePlugin>> = {
  bundle: BundleAnalyzePlugin,
  whybundled: WhyBundledAnalyzePlugin,
  statoscope: StatoscopeAnalyzePlugin,
  stats: StatsAnalyzePlugin,
  rsdoctor: RsdoctorAnalyzePlugin,
};

export const sharedProviders: Provider[] = [
  provide({
    provide: GET_BUILD_STATS_TOKEN,
    useFactory: ({ withBuildStats, clientCompiler, serverCompiler }) => {
      if (!withBuildStats) {
        return () => {
          return {};
        };
      }

      const getClientTime = clientCompiler && calculateBuildTime(clientCompiler);
      const getServerTime = serverCompiler && calculateBuildTime(serverCompiler);

      const getMaxMemoryRss = maxMemoryRss();
      return () => {
        return {
          client: {
            buildTime: getClientTime?.(),
          },
          server: {
            buildTime: getServerTime?.(),
          },
          maxMemoryRss: getMaxMemoryRss?.(),
        };
      };
    },
    deps: {
      withBuildStats: { token: WITH_BUILD_STATS_TOKEN, optional: true },
      clientCompiler: { token: WEBPACK_CLIENT_COMPILER_TOKEN, optional: true },
      serverCompiler: { token: WEBPACK_SERVER_COMPILER_TOKEN, optional: true },
    },
  }),
  provide({
    provide: WEBPACK_ANALYZE_PLUGIN_TOKEN,
    useFactory: ({ pluginName }) => {
      if (!pluginName) {
        return;
      }

      const PluginClass = pluginMap[pluginName];

      if (!PluginClass) {
        throw new Error(
          'Set correct value for --analytics cli option, <bundle|whybundled|statoscope|rsdoctor>\n'
        );
      }

      return new PluginClass();
    },
    deps: {
      pluginName: WEBPACK_ANALYZE_PLUGIN_NAME_TOKEN,
    },
  }),
  provide({
    provide: EVENT_EMITTER_TOKEN,
    useClass: EventEmitter,
  }),
  provide({
    provide: INIT_HANDLER_TOKEN,
    multi: true,
    useFactory: ({ eventEmitter, clientCompiler, serverCompiler }) => {
      return () => {
        clientCompiler && emitWebpackEvents(clientCompiler, eventEmitter, 'client');
        serverCompiler && emitWebpackEvents(serverCompiler, eventEmitter, 'server');
      };
    },
    deps: {
      eventEmitter: EVENT_EMITTER_TOKEN,
      clientCompiler: { token: WEBPACK_CLIENT_COMPILER_TOKEN, optional: true },
      serverCompiler: { token: WEBPACK_SERVER_COMPILER_TOKEN, optional: true },
    },
  }),
  provide({
    provide: INIT_HANDLER_TOKEN,
    multi: true,
    useFactory: ({ configManager }) => {
      return async () => {
        await warmupWorkerPool(configManager);
      };
    },
    deps: {
      configManager: CONFIG_MANAGER_TOKEN,
    },
  }),
  provide({
    provide: CLOSE_HANDLER_TOKEN,
    multi: true,
    useFactory: ({ configManager, analyzePlugin }) => {
      return async () => {
        await closeWorkerPool(configManager);

        if (analyzePlugin) {
          return analyzePlugin.afterBuild();
        }
      };
    },
    deps: {
      configManager: CONFIG_MANAGER_TOKEN,
      analyzePlugin: { token: WEBPACK_ANALYZE_PLUGIN_TOKEN, optional: true },
    },
  }),
];
