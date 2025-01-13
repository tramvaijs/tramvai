import { start } from '@tramvai/cli';
import { startCli } from '@tramvai/test-integration';
import { resolve } from 'path';
import detectPort from 'detect-port';

const EXAMPLE_DIR = __dirname;

export const startRootApp = ({
  define,
  env,
}: {
  define: Record<string, string>;
  env: Record<string, string>;
}) => {
  return startCli(
    {
      name: 'root-app',
      type: 'application',
      root: resolve(EXAMPLE_DIR, 'root-app'),
      define: {
        development: define,
      },
    },
    {
      rootDir: EXAMPLE_DIR,
      env: {
        LOG_ENABLE: 'warn:*',
        LOG_LEVEL: 'warn',
        ...env,
      },
      resolveSymlinks: false,
      fileCache: true,
    }
  );
};

export const startChildApp = async (
  name: string,
  {
    shared = {},
  }: {
    shared?: { deps?: string[] };
  } = {}
) => {
  const port = await detectPort(0);
  const staticPort = await detectPort(0);

  return start({
    config: {
      type: 'child-app',
      root: resolve(EXAMPLE_DIR, 'child-apps', name),
      name,
      hotRefresh: {
        enabled: true,
      },
      shared,
    },
    port,
    staticPort,
    rootDir: EXAMPLE_DIR,
    resolveSymlinks: false,
    fileCache: true,
  });
};
