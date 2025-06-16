import { provide, isValidModule } from '@tinkoff/dippy';
import {
  CONFIG_SERVICE_TOKEN,
  ConfigService,
  Configuration,
  INPUT_PARAMETERS_TOKEN,
  InputParameters,
} from '../config/config-service';
import { Tramvai } from '../core/tramvai';
import type { DevServer } from '../builder/dev-server';
import { DEV_SERVER_CLOSE_HANDLER_TOKEN, DEV_SERVER_TOKEN } from '../builder/dev-server';
import { Logger } from '../services/logger';
import { PORT_MANAGER_TOKEN, PortManager } from '../services/port-manager';
import { TRACER_TOKEN, tracer } from '../services/tracer';
import { TramvaiPlugin } from '../core/plugin';

export interface StartParameters extends InputParameters {}

export async function start(
  inputParameters: StartParameters,
  extraConfiguration?: Partial<Configuration>
): Promise<DevServer> {
  const logger = new Logger();

  const config = new ConfigService(inputParameters, extraConfiguration);
  await config.initialize();

  const portManager = new PortManager({
    logger,
    config,
    inputParameters,
  });

  tracer.init();

  tracer.mark({
    event: 'start-command.started',
    category: ['api'],
  });

  const plugins: TramvaiPlugin[] = config.plugins.map((plugin) => {
    if (typeof plugin === 'string') {
      const possibleModule = require(plugin).default;

      if (isValidModule(possibleModule)) {
        return possibleModule;
      }

      throw Error(
        `Plugin "${plugin}" is not a valid @tramvai/api module. Module should be created with "declareModule" method, and be exported as default`
      );
    }

    return plugin;
  });

  const tramvai = new Tramvai({
    modules: plugins,
    providers: [
      provide({
        provide: INPUT_PARAMETERS_TOKEN,
        useValue: inputParameters,
      }),
      provide({
        provide: CONFIG_SERVICE_TOKEN,
        useValue: config,
      }),
      provide({
        provide: PORT_MANAGER_TOKEN,
        useValue: portManager,
      }),
      provide({
        provide: TRACER_TOKEN,
        useValue: tracer,
      }),
      provide({
        provide: DEV_SERVER_CLOSE_HANDLER_TOKEN,
        useValue: () => {
          tracer.finish();
        },
      }),
    ],
  });

  const devServer = tramvai.resolve(DEV_SERVER_TOKEN);

  if (!devServer) {
    throw Error(
      `Development server not found, make sure you add "@tramvai/plugin-webpack-builder" plugin to tramvai config file`
    );
  }

  const server = await tracer.wrap(
    {
      event: 'start-command.dev-server.start',
      category: ['api'],
    },
    () => devServer.start()
  );

  return server;
}
