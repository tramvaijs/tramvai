import type { Provider } from '@tinkoff/dippy';
import { provide } from '@tinkoff/dippy';
import {
  SELF_SIGNED_CERTIFICATE_TOKEN,
  createSelfSignedCertificate,
} from '@tramvai/plugin-base-builder/lib/utils/selfSignedCertificate';

import { COMMAND_PARAMETERS_TOKEN, CONFIG_MANAGER_TOKEN } from '../../../di/tokens';

export const selfSignedCertificateProvider: Provider[] = [
  provide({
    provide: SELF_SIGNED_CERTIFICATE_TOKEN,
    useFactory: ({ configManager, parameters }) => {
      const { host } = configManager;
      if (configManager.httpProtocol === 'https') {
        return createSelfSignedCertificate({
          host,
          certificatePath: parameters?.httpsCert,
          keyPath: parameters?.httpsKey,
        });
      }
      return null;
    },
    deps: {
      configManager: CONFIG_MANAGER_TOKEN,
      parameters: COMMAND_PARAMETERS_TOKEN,
    },
  }),
];
