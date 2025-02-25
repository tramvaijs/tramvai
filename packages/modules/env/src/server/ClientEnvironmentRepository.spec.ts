import type { EnvParameter, EnvironmentManager } from '@tramvai/tokens-common';
import { ClientEnvironmentRepository } from './ClientEnvironmentRepository';

const valuesFromTokens = (tokens: EnvParameter[]): Record<string, string | undefined> => {
  return tokens.reduce(
    (acc, { key, value }) => {
      acc[key] = value;
      return acc;
    },
    {} as Record<string, string | undefined>
  );
};

describe('ClientEnvironmentRepository', () => {
  describe('should work only with client env', () => {
    const envTokens = [
      {
        key: 'CLIENT',
        value: 'client',
        dehydrate: true,
      },
      {
        key: 'SERVER',
        value: 'server',
        dehydrate: false,
      },
    ];
    const envValues = valuesFromTokens(envTokens);

    let envManager: EnvironmentManager;
    let repository: ClientEnvironmentRepository;

    beforeEach(() => {
      // @ts-expect-error
      envManager = {
        getAll: () => envValues,
      };
      repository = new ClientEnvironmentRepository(envManager, envTokens);
    });

    it('get()', () => {
      expect(repository.get('CLIENT')).toEqual('client');
      expect(repository.get('SERVER')).toEqual(undefined);
    });

    it('getAll()', () => {
      expect(repository.getAll()).toEqual({
        CLIENT: 'client',
      });
    });

    it('update()', () => {
      repository.update({ CLIENT: 'new', FOO: 'bar' });

      expect(repository.get('CLIENT')).toEqual('new');
      expect(repository.getAll()).toEqual({
        CLIENT: 'new',
        FOO: 'bar',
      });
    });
  });
});
