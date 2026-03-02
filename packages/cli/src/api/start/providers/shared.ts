import type { Provider } from '@tinkoff/dippy';
import { provide } from '@tinkoff/dippy';
import { nanoid } from 'nanoid';
import { STRICT_ERROR_HANDLE } from '../tokens';
import { COMMAND_PARAMETERS_TOKEN } from '../../../di/tokens';
import type { Params } from '../index';
import { BUILD_ID_TOKEN } from '../../../builder/webpack/tokens';

export const sharedProviders: readonly Provider[] = [
  provide({
    provide: STRICT_ERROR_HANDLE,
    useFactory: ({ parameters }: { parameters: Params }) => {
      return parameters.strictErrorHandle ?? true;
    },
    deps: {
      parameters: COMMAND_PARAMETERS_TOKEN,
    },
  }),
  provide({
    provide: BUILD_ID_TOKEN,
    useFactory: () => {
      return nanoid();
    },
  }),
] as const;
