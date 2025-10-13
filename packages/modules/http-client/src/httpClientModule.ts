import { commandLineListTokens, declareModule, optional, provide } from '@tramvai/core';
import {
  HTTP_CLIENT_AGENT,
  HTTP_CLIENT_AGENT_INTERCEPTORS,
  HTTP_CLIENT_AGENT_OPTIONS,
} from '@tramvai/tokens-http-client';
import { PapiClientModule } from './papiClientModule';
import { providers } from './shared';

export const HttpClientModule = /* @__PURE__ */ declareModule({
  name: 'HttpClientModule',
  imports: [PapiClientModule],
  providers: [
    ...providers,
    // we can't separate this module to browser and server files through "browser"
    // package.json field, because jest not supports this field resolving out of the box
    // and many unit tests rely on jsdom environment and fails because of resolving to server version
    // TODO: separate jest preset for jsdom unit tests with custom resolver to support "browser" field
    // @see https://github.com/marko-js/jest/blob/main/src/preset/browser/jest-preset.ts
    ...(typeof window === 'undefined'
      ? [
          provide({
            provide: commandLineListTokens.init,
            useFactory: ({ agent }) => {
              return () => {
                const { setGlobalDispatcher } = require('undici');

                setGlobalDispatcher(agent.http);
              };
            },
            deps: {
              agent: HTTP_CLIENT_AGENT,
            },
          }),
          provide({
            provide: HTTP_CLIENT_AGENT,
            useFactory: ({ options, interceptors }) => {
              const { Agent } = require('undici');

              const agent = new Agent(options).compose(...(interceptors ?? []));

              return {
                http: agent,
                https: agent,
              };
            },
            deps: {
              options: HTTP_CLIENT_AGENT_OPTIONS,
              interceptors: optional(HTTP_CLIENT_AGENT_INTERCEPTORS),
            },
          }),
          provide({
            provide: HTTP_CLIENT_AGENT_OPTIONS,
            useValue: {},
          }),
        ]
      : []),
  ],
});
