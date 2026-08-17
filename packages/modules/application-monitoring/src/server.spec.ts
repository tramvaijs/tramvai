import { provide, APP_INFO_TOKEN } from '@tramvai/core';
import { ENV_MANAGER_TOKEN } from '@tramvai/module-common';
import { getDiWrapper } from '@tramvai/test-helpers';
import type { PageResource } from '@tramvai/tokens-render';
import { RENDER_SLOTS } from '@tramvai/tokens-render';

import { ApplicationMonitoringModule } from './server';
import {
  INLINE_REPORTER_EXTENSIONS_TOKEN,
  INLINE_REPORTER_FACTORY_SCRIPT_TOKEN,
  INLINE_REPORTER_PARAMETERS_TOKEN,
  INLINE_REPORTER_TRANSPORTS_TOKEN,
} from './tokens';

const baseProviders = [
  { provide: APP_INFO_TOKEN, useValue: { appName: 'test-app' } },
  { provide: ENV_MANAGER_TOKEN, useValue: { get: () => undefined } },
];

const getRenderSlots = (providers: any[] = []) => {
  const { di } = getDiWrapper({
    modules: [ApplicationMonitoringModule],
    providers: [...baseProviders, ...providers],
  });

  return di.get(RENDER_SLOTS) as (PageResource | PageResource[])[];
};

describe('ApplicationMonitoringModule RENDER_SLOTS', () => {
  it('installs the default dispatcher even when nothing else is provided', () => {
    const slots = getRenderSlots();
    const bootstrap = slots[0] as PageResource;

    expect(bootstrap.payload).toContain(
      'window.__TRAMVAI_INLINE_REPORTER = (function inlineReporter'
    );
  });

  it('uses an overridden INLINE_REPORTER_FACTORY_SCRIPT_TOKEN instead of the default', () => {
    function myCustomFactory() {
      return { send() {} };
    }

    const slots = getRenderSlots([
      provide({ provide: INLINE_REPORTER_FACTORY_SCRIPT_TOKEN, useValue: myCustomFactory }),
    ]);
    const bootstrap = slots[0] as PageResource;

    expect(bootstrap.payload).toContain('function myCustomFactory');
    expect(bootstrap.payload).not.toContain('function inlineReporter');
  });

  it('shallow-merges every INLINE_REPORTER_PARAMETERS_TOKEN entry into the bootstrap script', () => {
    const slots = getRenderSlots([
      provide({
        provide: INLINE_REPORTER_PARAMETERS_TOKEN,
        multi: true,
        useValue: { path: '/some/path', envs: { ANALYTICS_URL: 'https://analytics.example' } },
      }),
    ]);
    const bootstrap = slots[0] as PageResource;

    expect(bootstrap.payload).toContain('"appName":"test-app"');
    expect(bootstrap.payload).toContain('"path":"/some/path"');
    expect(bootstrap.payload).toContain('"ANALYTICS_URL":"https://analytics.example"');
  });

  it('emits one registerExtension script per INLINE_REPORTER_EXTENSIONS_TOKEN entry', () => {
    function firstExtensionFactory() {
      return (eventName: string, payload: Record<string, any>) => payload;
    }
    function secondExtensionFactory() {
      return (eventName: string, payload: Record<string, any>) => payload;
    }

    const slots = getRenderSlots([
      provide({
        provide: INLINE_REPORTER_EXTENSIONS_TOKEN,
        multi: true,
        useValue: firstExtensionFactory,
      }),
      provide({
        provide: INLINE_REPORTER_EXTENSIONS_TOKEN,
        multi: true,
        useValue: secondExtensionFactory,
      }),
    ]);
    const extensionResources = slots[1] as PageResource[];

    expect(extensionResources).toHaveLength(2);
    expect(extensionResources[0].payload).toContain(
      'window.__TRAMVAI_INLINE_REPORTER.registerExtension'
    );
    expect(extensionResources[0].payload).toContain('function firstExtensionFactory');
    expect(extensionResources[1].payload).toContain('function secondExtensionFactory');
  });

  it('passes the bare factory to registerExtension/registerTransport instead of invoking it with parameters', () => {
    // parameters are applied once, inside the dispatcher (see inlineReporter.inline.ts), not
    // re-serialized into every single extension/transport script
    function myExtensionFactory() {
      return (eventName: string, payload: Record<string, any>) => payload;
    }
    function myTransportFactory() {
      return (eventName: string, payload: Record<string, any>) => {};
    }

    const slots = getRenderSlots([
      provide({
        provide: INLINE_REPORTER_EXTENSIONS_TOKEN,
        multi: true,
        useValue: myExtensionFactory,
      }),
      provide({
        provide: INLINE_REPORTER_TRANSPORTS_TOKEN,
        multi: true,
        useValue: myTransportFactory,
      }),
    ]);
    const extensionResources = slots[1] as PageResource[];
    const transportResources = slots[2] as PageResource[];

    expect(extensionResources[0].payload).toMatch(
      /^window\.__TRAMVAI_INLINE_REPORTER\.registerExtension\?\.\(function myExtensionFactory\(\) \{[\s\S]*\}\)$/
    );
    expect(transportResources[0].payload).toMatch(
      /^window\.__TRAMVAI_INLINE_REPORTER\.registerTransport\?\.\(function myTransportFactory\(\) \{[\s\S]*\}\)$/
    );
    expect(extensionResources[0].payload).not.toContain('"appName"');
    expect(transportResources[0].payload).not.toContain('"appName"');
  });

  it('emits one registerTransport script per INLINE_REPORTER_TRANSPORTS_TOKEN entry', () => {
    function myTransportFactory() {
      return (eventName: string, payload: Record<string, any>) => {};
    }

    const slots = getRenderSlots([
      provide({
        provide: INLINE_REPORTER_TRANSPORTS_TOKEN,
        multi: true,
        useValue: myTransportFactory,
      }),
    ]);
    const transportResources = slots[2] as PageResource[];

    expect(transportResources).toHaveLength(1);
    expect(transportResources[0].payload).toContain(
      'window.__TRAMVAI_INLINE_REPORTER.registerTransport'
    );
    expect(transportResources[0].payload).toContain('function myTransportFactory');
  });

  it('orders scripts as bootstrap -> extensions -> transports -> htmlOpened -> errorMonitoring', () => {
    function myExtensionFactory() {
      return (eventName: string, payload: Record<string, any>) => payload;
    }
    function myTransportFactory() {
      return (eventName: string, payload: Record<string, any>) => {};
    }

    const slots = getRenderSlots([
      provide({
        provide: INLINE_REPORTER_EXTENSIONS_TOKEN,
        multi: true,
        useValue: myExtensionFactory,
      }),
      provide({
        provide: INLINE_REPORTER_TRANSPORTS_TOKEN,
        multi: true,
        useValue: myTransportFactory,
      }),
    ]);

    const bootstrap = slots[0] as PageResource;
    const extensionResources = slots[1] as PageResource[];
    const transportResources = slots[2] as PageResource[];
    const htmlOpened = slots[3] as PageResource;
    const errorMonitoring = slots[4] as PageResource;

    expect(bootstrap.payload).toContain('window.__TRAMVAI_INLINE_REPORTER = (');
    expect(extensionResources[0].payload).toContain('registerExtension');
    expect(transportResources[0].payload).toContain('registerTransport');
    expect(htmlOpened.payload).toContain("send?.('html-opened')");
    expect(errorMonitoring.payload).toContain("addEventListener('error'");
  });

  it('puts the bootstrap, extension and transport scripts in HEAD_META, ahead of HEAD_PERFORMANCE where events actually fire', () => {
    // HEAD_META renders entirely before HEAD_PERFORMANCE (see htmlPageSchema.ts) - this is
    // what guarantees registration always completes before any send() call, without buffering
    function myExtensionFactory() {
      return (eventName: string, payload: Record<string, any>) => payload;
    }
    function myTransportFactory() {
      return (eventName: string, payload: Record<string, any>) => {};
    }

    const slots = getRenderSlots([
      provide({
        provide: INLINE_REPORTER_EXTENSIONS_TOKEN,
        multi: true,
        useValue: myExtensionFactory,
      }),
      provide({
        provide: INLINE_REPORTER_TRANSPORTS_TOKEN,
        multi: true,
        useValue: myTransportFactory,
      }),
    ]);

    const bootstrap = slots[0] as PageResource;
    const extensionResources = slots[1] as PageResource[];
    const transportResources = slots[2] as PageResource[];
    const htmlOpened = slots[3] as PageResource;
    const errorMonitoring = slots[4] as PageResource;

    expect(bootstrap.slot).toBe('head:meta');
    expect(extensionResources[0].slot).toBe('head:meta');
    expect(transportResources[0].slot).toBe('head:meta');
    expect(htmlOpened.slot).toBe('head:performance');
    expect(errorMonitoring.slot).toBe('head:performance');
  });
});
