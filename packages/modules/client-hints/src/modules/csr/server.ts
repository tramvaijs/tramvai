import { declareModule, provide } from '@tinkoff/dippy';
import { RENDER_SLOTS, ResourceSlot, ResourceType } from '@tramvai/tokens-render';

import { serverProviders } from '../../shared/providers.server';
import { loadHighEntropyClientHints } from '../../browser/loadHighEntropyClientHints.inline';

export const ClientHintsCSRModule = /* @__PURE__ */ declareModule({
  name: 'ClientHintsCSRModule',
  providers: [
    ...serverProviders,
    provide({
      provide: RENDER_SLOTS,
      useValue: {
        type: ResourceType.inlineScript,
        slot: ResourceSlot.HEAD_PERFORMANCE,
        payload: `(${loadHighEntropyClientHints.toString()})()`,
      },
    }),
  ],
});
