import { PrefixTree } from '@tramvai/core';
import type { SimplifiedPWAConfig } from '@tramvai/plugin-base-builder/lib/types';

import { createSelectActivePwaConfig } from './selectActivePwaConfig';

function createPrefixTree() {
  return new PrefixTree<SimplifiedPWAConfig>({ delimiter: '/' });
}

function makePwaConfig(scope: string) {
  return {
    sw: { scope },
  } as SimplifiedPWAConfig;
}

describe('selectPwaConfig', () => {
  describe('empty or missing configs', () => {
    const prefixTree = createPrefixTree();
    const selectActivePwaConfig = createSelectActivePwaConfig(prefixTree);

    it('returns undefined for empty array', () => {
      expect(selectActivePwaConfig([], '/app/')).toBeUndefined();
    });

    it('returns undefined for undefined input', () => {
      expect(selectActivePwaConfig(undefined as any, '/app/')).toBeUndefined();
    });
  });

  describe('single config', () => {
    const prefixTree = createPrefixTree();
    const selectActivePwaConfig = createSelectActivePwaConfig(prefixTree);
    const config = makePwaConfig('/app/');

    it('returns the config regardless of path', () => {
      expect(selectActivePwaConfig([config], '/any/path/')).toBe(config);
    });

    it('returns the config for root path', () => {
      expect(selectActivePwaConfig([config], '/')).toBe(config);
    });
  });

  describe('multiple configs — exact scope match', () => {
    const prefixTree = createPrefixTree();
    const selectActivePwaConfig = createSelectActivePwaConfig(prefixTree);
    const bankConfig = makePwaConfig('/bank/');
    const investConfig = makePwaConfig('/invest/');

    it('returns matching config for /bank/ path', () => {
      expect(selectActivePwaConfig([bankConfig, investConfig], '/bank/')).toBe(bankConfig);
    });

    it('returns matching config for /invest/ path', () => {
      expect(selectActivePwaConfig([bankConfig, investConfig], '/invest/')).toBe(investConfig);
    });
  });

  describe('multiple configs — longest prefix match', () => {
    const prefixTree = createPrefixTree();
    const selectActivePwaConfig = createSelectActivePwaConfig(prefixTree);
    const appConfig = makePwaConfig('/app/');
    const appBankConfig = makePwaConfig('/app/bank/');

    it('returns more specific config for nested path', () => {
      expect(selectActivePwaConfig([appConfig, appBankConfig], '/app/bank/cards/')).toBe(
        appBankConfig
      );
    });

    it('returns parent config for non-nested path', () => {
      expect(selectActivePwaConfig([appConfig, appBankConfig], '/app/invest/')).toBe(appConfig);
    });
  });

  describe('multiple configs — no match', () => {
    const prefixTree = createPrefixTree();
    const selectActivePwaConfig = createSelectActivePwaConfig(prefixTree);
    const bankConfig = makePwaConfig('/bank/');
    const investConfig = makePwaConfig('/invest/');

    it('returns undefined when path does not match any scope', () => {
      expect(selectActivePwaConfig([bankConfig, investConfig], '/other/')).toBeUndefined();
    });
  });

  describe('multiple configs — root scope', () => {
    const prefixTree = createPrefixTree();
    const selectActivePwaConfig = createSelectActivePwaConfig(prefixTree);
    const rootConfig = makePwaConfig('/');
    const bankConfig = makePwaConfig('/bank/');

    it('matches root scope as fallback', () => {
      expect(selectActivePwaConfig([rootConfig, bankConfig], '/other/')).toBe(rootConfig);
    });

    it('prefers specific scope over root', () => {
      expect(selectActivePwaConfig([rootConfig, bankConfig], '/bank/cards/')).toBe(bankConfig);
    });
  });
});
