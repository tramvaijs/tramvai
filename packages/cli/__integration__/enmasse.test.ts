import { join, resolve } from 'path';
import { readdirSync, existsSync } from 'fs';
import http from 'http';
import { command } from 'execa';
import type { DirectoryTree } from 'directory-tree';
import dirTree from 'directory-tree';
import rimraf from 'rimraf';
import { getPort } from '@tramvai/internal-test-utils/utils/getPort';

const bin = join(__dirname, '../bin/platform.js');
const examplesRoot = join(__dirname, '../../../tinkoff-examples');
const examplesList = ['module', 'package', 'react-app'];

const normalizePath = (pth: string) => pth.replace(/\\/g, '/');

const sortByPath = (items: DirectoryTree[]) => {
  return items.sort((a, b) => a.path.localeCompare(b.path));
};

const getTrees = (dir: string) => {
  const trees: { original: DirectoryTree[]; less: DirectoryTree[] } = {
    original: [],
    less: [],
  };

  // определяем, как именно собирали файлы, что бы иметь возможность вырезать хэши
  const isWebpackBuild = existsSync(join(dir, 'client', 'stats.json'));

  dirTree(dir, {}, (item) => {
    const { path, name } = item;

    const newPath = path.split('.');
    const newName = name.split('.');

    if (isWebpackBuild) {
      newPath.splice(1, 1);
      newName.splice(1, 1);
    }

    trees.original.push(item);

    const newOne = {
      ...item,
      path: normalizePath(newPath.join('.')),
      name: normalizePath(newName.join('.')),
    };

    // Might differ on different systems or runs for some reason
    // @ts-ignore
    delete newOne.size;

    trees.less.push(newOne);
  });

  return {
    original: sortByPath(trees.original),
    less: sortByPath(trees.less),
  };
};

describe('enmasse', () => {
  const currentCwd = process.cwd();
  const currentProcessEnv = process.env;
  let monitoringEndpointPort: number;

  readdirSync(examplesRoot)
    .filter((path) => examplesList.includes(path))
    .forEach((file) => {
      const app = file;
      let events: Record<string, any>[] = [];
      let server: http.Server;

      describe(`test ${app}`, () => {
        beforeAll(async () => {
          monitoringEndpointPort = await getPort();

          server = http.createServer((req, res) => {
            let body = '';

            req.on('data', (chunk) => {
              body += chunk.toString();
            });

            req.on('end', () => {
              const event = JSON.parse(body);

              events.push(event);

              res.writeHead(200, { 'Content-Type': 'text/html' });
              res.end();
            });
          });

          server.listen(monitoringEndpointPort, () => {});

          const appCwd = join(examplesRoot, app);

          process.chdir(appCwd);

          rimraf.sync(resolve(appCwd, 'dist'));

          // На MacOS chalk генерирует дополнительные символы в снапшот тестах,
          // принудительно отключаем colorized output https://github.com/chalk/supports-color#info
          process.env = {
            ...process.env,
            FORCE_COLOR: '0',
            TRAMVAI_ANALYTICS_DISABLED: 'false',
            TRAMVAI_ANALYTICS_ENDPOINT: `http://localhost:${monitoringEndpointPort}/`,
            CI: 'true',
            CI_PROJECT_NAMESPACE: 'tenant',
            CI_PROJECT_NAME: 'repository',
            CI_PIPELINE_URL: 'https://example.com/pipeline',
            CI_JOB_URL: 'https://example.com/job',
          };
        });

        afterAll(() => {
          events = [];
          server?.close();

          process.chdir(currentCwd);
          process.env = currentProcessEnv;
        });

        it(`platform --help ${app}`, async () => {
          const result = await command(`node ${bin} --no-color --help`, { shell: true });

          expect(result.exitCode).toEqual(0);
          expect(result.stdout).toMatchSnapshot('result.stdout');

          events = [];
        });

        it(`platform build ${app}`, async () => {
          const result = await command(`node ${bin} build ${app}`, { shell: true }).catch(
            (error) => {
              console.error(error.stderr);
              console.info(error.stdout);
              throw error;
            }
          );

          const output = getTrees('dist');

          expect(result.exitCode).toEqual(0);

          events.sort((a, b) => {
            // @ts-expect-error
            return new Date(a.timestamp) - new Date(b.timestamp);
          });

          expect({ events }).toMatchSnapshot(
            {
              events: [
                [
                  {
                    timestamp: expect.any(String),
                    arguments: ['build', app],
                    dependencies: {
                      babel: expect.any(String),
                      react: expect.any(String),
                      swc: expect.any(String),
                      webpack: expect.any(String),
                    },
                    event: 'cli:init',
                    level: 'INFO',
                    message: '@tramvai/cli initialized',
                    os: {
                      arch: expect.any(String),
                      nodeVersion: expect.any(String),
                      packageManager: {
                        name: 'unknown',
                      },
                      platform: expect.any(String),
                      cpus: {
                        count: expect.any(Number),
                        model: expect.any(String),
                      },
                    },
                    system: 'tramvai-cli',
                    tramvai: {
                      name: '@tramvai/cli',
                      version: '0.0.0-stub',
                    },
                    vcs: {
                      tenant: expect.any(String),
                      repository: expect.any(String),
                      pipelineUrl: expect.any(String),
                      jobUrl: expect.any(String),
                    },
                    uptime: expect.any(Number),
                    'x-command-id': expect.any(String),
                  },
                ],
                [
                  {
                    timestamp: expect.any(String),
                    command: 'build',
                    event: 'cli:command:start',
                    features: {},
                    level: 'INFO',
                    message: '@tramvai/cli production build started',
                    os: {
                      arch: expect.any(String),
                      nodeVersion: expect.any(String),
                      packageManager: {
                        name: 'unknown',
                      },
                      platform: expect.any(String),
                      cpus: {
                        count: expect.any(Number),
                        model: expect.any(String),
                      },
                    },
                    parameters: {
                      target: app,
                    },
                    project: {
                      name: app,
                      type: app === 'react-app' ? 'application' : app,
                    },
                    system: 'tramvai-cli',
                    tramvai: {
                      name: '@tramvai/cli',
                      version: '0.0.0-stub',
                    },
                    vcs: {
                      tenant: expect.any(String),
                      repository: expect.any(String),
                      pipelineUrl: expect.any(String),
                      jobUrl: expect.any(String),
                    },
                    'x-command-id': expect.any(String),
                  },
                ],
                [
                  {
                    timestamp: expect.any(String),
                    command: 'build',
                    event: 'cli:command:end',
                    level: 'INFO',
                    message: '@tramvai/cli production build finished',
                    os: {
                      arch: expect.any(String),
                      nodeVersion: expect.any(String),
                      packageManager: {
                        name: 'unknown',
                      },
                      platform: expect.any(String),
                      cpus: {
                        count: expect.any(Number),
                        model: expect.any(String),
                      },
                    },
                    duration: expect.any(Number),
                    parameters: {
                      target: app,
                    },
                    project: {
                      name: app,
                      type: app === 'react-app' ? 'application' : app,
                    },
                    system: 'tramvai-cli',
                    tramvai: {
                      name: '@tramvai/cli',
                      version: '0.0.0-stub',
                    },
                    vcs: {
                      tenant: expect.any(String),
                      repository: expect.any(String),
                      pipelineUrl: expect.any(String),
                      jobUrl: expect.any(String),
                    },
                    memoryUsage: {
                      maxRss: expect.any(Number),
                      maxHeapTotal: expect.any(Number),
                      maxHeapUsed: expect.any(Number),
                    },
                    'x-command-id': expect.any(String),
                  },
                ],
              ],
            },
            'monitoring'
          );

          expect(output.less).toMatchSnapshot('output.less');

          output.original.forEach((f) => {
            expect(f.size).toBeGreaterThan(0);
          });
        }, 160000);
      });
    });
});
