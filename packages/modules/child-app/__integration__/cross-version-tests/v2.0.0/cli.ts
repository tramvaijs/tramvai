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
      commands: {
        build: {
          options: {
            server: resolve(__dirname, 'root-app'),
          },
          configurations: {
            definePlugin: {
              dev: define,
            },
          },
        },
      },
    },
    {
      rootDir: EXAMPLE_DIR,
      env,
      resolveSymlinks: false,
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
      commands: {
        serve: {
          configurations: {
            hotRefresh: true,
          },
        },
      },
    },
    port,
    staticPort,
    rootDir: EXAMPLE_DIR,
    resolveSymlinks: false,
  });
};
