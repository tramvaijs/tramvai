import type { Provider } from '@tinkoff/dippy';
import { provide } from '@tinkoff/dippy';
import {
  COMMAND_PARAMETERS_TOKEN,
  CONFIG_MANAGER_TOKEN,
  SELF_SIGNED_CERTIFICATE_TOKEN,
} from '../../../di/tokens';
import { createSelfSignedCertificate } from '../utils/selfSignedCertificate/createSelfSignedCertificate';

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
