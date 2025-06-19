/* eslint-disable no-useless-escape, no-template-curly-in-string, max-nested-callbacks */

import path from 'node:path';
import fs from 'node:fs';
import { start } from '../../src/api/start';
import { Project } from '../../src/config/config-service';

// TODO: mock in default tramvai presets
// jest.mock(
//   'virtual:tramvai/file-system-pages',
//   () => ({
//     routes: {},
//     pages: {},
//     layouts: {},
//     errorBoundaries: {},
//     wildcards: {},
//   }),
//   { virtual: true }
// );

process.env.TRAMVAI_COMPILE_CACHE_DISABLED = 'true';

const sleep = (ms: number) => {
  return new Promise((resolve) => (setTimeout(resolve, ms) as unknown as NodeJS.Timeout).unref());
};

export function createTestSuite({ key, plugins }: { key: string; plugins: string[] }) {
  const testSuiteFolder = path.resolve(__dirname, '..', key);
  const fixturesFolder = path.resolve(__dirname, '..', 'fixtures');
  // todo check `testSuiteFolder` folder exists

  const projects: Record<string, Project> = {
    'app-bundle': {
      name: 'app-bundle',
      type: 'application',
      entryFile: path.join(fixturesFolder, 'application', 'bundle', 'index.ts'),
    },
    'app-output-relative': {
      name: 'app-bundle',
      type: 'application',
      entryFile: path.join(fixturesFolder, 'application', 'bundle', 'index.ts'),
      output: {
        server: 'custom/server',
        client: 'custom/client',
        static: 'custom/static',
      },
    },
    'app-virtual-module-config': {
      name: 'app-virtual-module-config',
      type: 'application',
      entryFile: path.join(fixturesFolder, 'application', 'virtual-module-config', 'index.ts'),
    },
    'app-broken': {
      name: 'app-broken',
      type: 'application',
      entryFile: path.join(fixturesFolder, 'application', 'broken', 'index.ts'),
    },
    'app-broken-ssr': {
      name: 'app-broken-ssr',
      type: 'application',
      entryFile: path.join(fixturesFolder, 'application', 'broken-ssr', 'index.ts'),
    },
    'app-jsx': {
      name: 'app-jsx',
      type: 'application',
      entryFile: path.join(fixturesFolder, 'application', 'jsx', 'index.ts'),
    },
    'app-css-modules': {
      name: 'app-css-modules',
      type: 'application',
      entryFile: path.join(fixturesFolder, 'application', 'css-modules', 'index.ts'),
    },
    'app-postcss': {
      name: 'app-postcss',
      type: 'application',
      entryFile: path.join(fixturesFolder, 'application', 'postcss', 'index.ts'),
    },
    'app-postcss-fn': {
      name: 'app-postcss-fn',
      type: 'application',
      entryFile: path.join(fixturesFolder, 'application', 'postcss-fn', 'index.ts'),
    },
    'app-fs-routing': {
      name: 'app-fs-routing',
      type: 'application',
      sourceDir: path.join(fixturesFolder, 'application', 'fs-routing'),
      entryFile: 'index.ts',
    },
    'app-config-to-env': {
      name: 'app-config-to-env',
      type: 'application',
      sourceDir: path.join(fixturesFolder, 'application', 'config-to-env'),
      entryFile: 'index.ts',
      fileSystemPages: {
        enabled: true,
        routesDir: 'customRoutesDir',
        pagesDir: 'customPagesDir',
      },
      experiments: {
        viewTransitions: true,
        reactTransitions: true,
      },
    },
    'app-root-error-boundary': {
      name: 'app-root-error-boundary',
      type: 'application',
      sourceDir: path.join(fixturesFolder, 'application', 'root-error-boundary'),
      entryFile: 'index.ts',
      fileSystemPages: {
        rootErrorBoundaryPath: 'error.tsx',
      },
    },
  };

  jest.setTimeout(10000);

  describe(`@tramvai/api test suite: ${key}`, () => {
    describe('api: application start', () => {
      describe('server', () => {
        it('bundle: should bundle single server.js', async () => {
          const devServer = await start(
            {
              name: 'app-bundle',
              rootDir: testSuiteFolder,
              buildType: 'server',
              noRebuild: true,
            },
            {
              plugins,
              projects,
            }
          );

          await devServer.buildPromise;

          const serverJs = await (
            await fetch(`http://localhost:${devServer.staticPort}/dist/server/server.js`)
          ).text();

          expect(serverJs).toContain('ENTRY');
          expect(serverJs).toContain('DYNAMIC');

          // todo close in afterEach
          await devServer.close();
        });

        it('output: should respect output.server', async () => {
          const devServer = await start(
            {
              name: 'app-output-relative',
              rootDir: testSuiteFolder,
              buildType: 'server',
              noRebuild: true,
            },
            { plugins, projects }
          );

          await devServer.buildPromise;

          const serverJs = await (
            await fetch(`http://localhost:${devServer.staticPort}/custom/server/server.js`)
          ).text();

          expect(serverJs).toContain('ENTRY');

          // todo close in afterEach
          await devServer.close();
        });

        it('virtual-modules: "virtual:tramvai/config" import should work', async () => {
          const devServer = await start(
            {
              name: 'app-virtual-module-config',
              rootDir: testSuiteFolder,
              buildType: 'server',
              noRebuild: true,
            },
            { plugins, projects }
          );

          await devServer.buildPromise;

          const serverJs = await (
            await fetch(`http://localhost:${devServer.staticPort}/dist/server/server.js`)
          ).text();

          expect(serverJs).toContain('appConfig');
          expect(serverJs).toContain('dist/server');
          expect(serverJs).toContain('dist/client');
          expect(serverJs).toContain('dist/static');

          // todo close in afterEach
          await devServer.close();
        });

        it('compiler: should rebuild broken server.js after update', async () => {
          const brokenFile = path.resolve(fixturesFolder, `application`, 'broken', 'dynamic.ts');

          // TODO: support concurrent tests
          await fs.promises.writeFile(
            brokenFile,
            `constbar = 'DYNAMIC';
export defaultbar;`,
            'utf-8'
          );

          const devServer = await start(
            {
              name: 'app-broken',
              rootDir: testSuiteFolder,
              buildType: 'server',
            },
            { plugins, projects }
          );

          try {
            await devServer.buildPromise;
          } catch (error) {
            // expected error
          }

          const response = await fetch(
            `http://localhost:${devServer.staticPort}/dist/server/server.js`
          );
          expect(response.status).toBe(404);

          await fs.promises.writeFile(
            brokenFile,
            `const bar = 'DYNAMIC';
export default bar;`,
            'utf-8'
          );

          // TODO: without sleep server.js request is stuck
          await sleep(200);

          const serverJs = await (
            await fetch(`http://localhost:${devServer.staticPort}/dist/server/server.js`)
          ).text();

          expect(serverJs).toContain('ENTRY');
          expect(serverJs).toContain('DYNAMIC');

          await fs.promises.unlink(brokenFile);
          // todo close in afterEach
          await devServer.close();
        });

        it('compiler: should compile broken server.js after update', async () => {
          const brokenFile = path.resolve(
            fixturesFolder,
            `application`,
            'broken-ssr',
            'dynamic.ts'
          );

          // TODO: support concurrent tests
          await fs.promises.writeFile(
            brokenFile,
            `constbar = 'DYNAMIC';
export defaultbar;`,
            'utf-8'
          );

          const devServer = await start(
            {
              name: 'app-broken-ssr',
              rootDir: testSuiteFolder,
              buildType: 'server',
            },
            { plugins, projects }
          );

          try {
            await devServer.buildPromise;
          } catch (error) {
            // expected error
          }

          const response = await fetch(`http://localhost:${devServer.port}`);
          expect(response.status).toBe(500);

          await fs.promises.writeFile(
            brokenFile,
            `const bar = 'DYNAMIC';
export default bar;`,
            'utf-8'
          );

          // TODO: need to wait when rebuild and compiled server started or request fails
          await sleep(200);

          const serverHtml = await (await fetch(`http://localhost:${devServer.port}`)).text();

          expect(serverHtml).toContain('Hello, world!');

          await fs.promises.unlink(brokenFile);
          // todo close in afterEach
          await devServer.close();
        });

        it('define: should replace constants', async () => {
          const devServer = await start(
            {
              name: 'app-config-to-env',
              rootDir: testSuiteFolder,
              buildType: 'server',
              noRebuild: true,
            },
            { plugins, projects }
          );

          await devServer.buildPromise;

          const serverJs = await (
            await fetch(`http://localhost:${devServer.staticPort}/dist/server/server.js`)
          ).text();

          expect(serverJs).toContain('isBrowser ${false}');
          expect(serverJs).toContain('isServer ${true}');

          // todo close in afterEach
          await devServer.close();
        });

        it('root-error-boundary: should generate root error boundary', async () => {
          const devServer = await start(
            {
              name: 'app-root-error-boundary',
              rootDir: testSuiteFolder,
              buildType: 'server',
              noRebuild: true,
            },
            { plugins, projects }
          );

          await devServer.buildPromise;

          const serverJs = await (
            await fetch(`http://localhost:${devServer.staticPort}/dist/server/server.js`)
          ).text();

          expect(serverJs).toContain('Root Error Boundary');

          // todo close in afterEach
          await devServer.close();
        });
      });

      describe('browser', () => {
        it('bundle: should bundle platform.js and separate chunks', async () => {
          const devServer = await start(
            {
              name: 'app-bundle',
              rootDir: testSuiteFolder,
              buildType: 'client',
              noRebuild: true,
            },
            {
              plugins,
              projects,
            }
          );

          await devServer.buildPromise;

          const platformJs = await (
            await fetch(`http://localhost:${devServer.staticPort}/dist/client/platform.js`)
          ).text();
          const dynamicJs = await (
            await fetch(`http://localhost:${devServer.staticPort}/dist/client/dynamic.chunk.js`)
          ).text();
          const statsJson = await (
            await fetch(`http://localhost:${devServer.staticPort}/dist/client/stats.json`)
          ).json();

          expect(platformJs).toContain('ENTRY');
          expect(dynamicJs).toContain('DYNAMIC');
          expect(Object.keys(statsJson.namedChunkGroups).length).toBe(2);

          // todo close in afterEach
          await devServer.close();
        });

        it('output: should respect output.client', async () => {
          const devServer = await start(
            {
              name: 'app-output-relative',
              rootDir: testSuiteFolder,
              buildType: 'client',
              noRebuild: true,
            },
            { plugins, projects }
          );

          await devServer.buildPromise;

          const platformJs = await (
            await fetch(`http://localhost:${devServer.staticPort}/custom/client/platform.js`)
          ).text();
          const statsJson = await (
            await fetch(`http://localhost:${devServer.staticPort}/custom/client/stats.json`)
          ).json();

          expect(platformJs).toContain('ENTRY');
          expect(Object.keys(statsJson.namedChunkGroups).length).toBe(2);

          // todo close in afterEach
          await devServer.close();
        });

        it('compiler: should rebuild broken client code after update', async () => {
          const brokenFile = path.resolve(fixturesFolder, `application`, 'broken', 'dynamic.ts');

          // TODO: support concurrent tests
          await fs.promises.writeFile(
            brokenFile,
            `constbar = 'DYNAMIC';
export defaultbar;`,
            'utf-8'
          );

          const devServer = await start(
            {
              name: 'app-broken',
              rootDir: testSuiteFolder,
              buildType: 'client',
            },
            { plugins, projects }
          );

          try {
            await devServer.buildPromise;
          } catch (error) {
            // expected error
          }

          const response = await fetch(
            `http://localhost:${devServer.staticPort}/dist/client/platform.js`
          );
          expect(response.status).toBe(404);

          await fs.promises.writeFile(
            brokenFile,
            `const bar = 'DYNAMIC';
export default bar;`,
            'utf-8'
          );

          // TODO: without sleep server.js request is stuck
          await sleep(200);

          const platformJs = await (
            await fetch(`http://localhost:${devServer.staticPort}/dist/client/platform.js`)
          ).text();

          expect(platformJs).toContain('ENTRY');

          await fs.promises.unlink(brokenFile);
          // todo close in afterEach
          await devServer.close();
        });

        it('define: should replace constants', async () => {
          const devServer = await start(
            {
              name: 'app-config-to-env',
              rootDir: testSuiteFolder,
              buildType: 'client',
              noRebuild: true,
            },
            { plugins, projects }
          );

          await devServer.buildPromise;

          const platformJs = await (
            await fetch(`http://localhost:${devServer.staticPort}/dist/client/platform.js`)
          ).text();

          expect(platformJs).toContain('isBrowser ${true}');
          expect(platformJs).toContain('isServer ${false}');

          // todo close in afterEach
          await devServer.close();
        });

        it('root-error-boundary: should create new entry point with hydration logic', async () => {
          const devServer = await start(
            {
              name: 'app-root-error-boundary',
              rootDir: testSuiteFolder,
              buildType: 'client',
              noRebuild: true,
            },
            { plugins, projects }
          );

          await devServer.buildPromise;

          const rootErrorBoundaryJs = await (
            await fetch(`http://localhost:${devServer.staticPort}/dist/client/rootErrorBoundary.js`)
          ).text();

          expect(rootErrorBoundaryJs).toContain('virtual/root-error-boundary.js');
          expect(rootErrorBoundaryJs).toContain('hydrateRoot');

          // todo close in afterEach
          await devServer.close();
        });
      });

      describe('universal', () => {
        it('transpiler: should transpile jsx from JS and TS files', async () => {
          const devServer = await start(
            {
              name: 'app-jsx',
              rootDir: testSuiteFolder,
              noRebuild: true,
            },
            { plugins, projects }
          );

          await devServer.buildPromise;

          const platformJs = await (
            await fetch(`http://localhost:${devServer.staticPort}/dist/client/platform.js`)
          ).text();
          const serverJs = await (
            await fetch(`http://localhost:${devServer.staticPort}/dist/server/server.js`)
          ).text();

          expect(platformJs).toContain('jsxDEV');
          expect(platformJs).toContain('foo');
          expect(platformJs).toContain('bar');
          expect(serverJs).toContain('jsxDEV');
          expect(serverJs).toContain('foo');
          expect(serverJs).toContain('bar');

          // react-element-info-unique plugin
          expect(platformJs).toContain('data-qa-file');
          expect(serverJs).toContain('data-qa-file');

          // todo close in afterEach
          await devServer.close();
        });

        it('css-modules: should process CSS Modules and emit css chunks for client build', async () => {
          const devServer = await start(
            {
              name: 'app-css-modules',
              rootDir: testSuiteFolder,
              noRebuild: true,
            },
            { plugins, projects }
          );

          await devServer.buildPromise;

          const platformJs = await (
            await fetch(`http://localhost:${devServer.staticPort}/dist/client/platform.js`)
          ).text();
          const platformCss = await (
            await fetch(`http://localhost:${devServer.staticPort}/dist/client/platform.css`)
          ).text();
          const serverJs = await (
            await fetch(`http://localhost:${devServer.staticPort}/dist/server/server.js`)
          ).text();
          const serverCssResponse = await fetch(
            `http://localhost:${devServer.staticPort}/dist/server/platform.css`
          );

          expect(platformJs).toContain('style-module__header_');
          expect(platformCss).toContain('style-module__header_');
          expect(platformCss).toContain('color: red;');
          expect(platformCss).not.toContain('-webkit-user-select: none;');
          expect(platformCss).toContain('padding: 8px;');
          expect(serverJs).toContain('style-module__header_');
          expect(serverCssResponse.status).toBe(404);

          // todo close in afterEach
          await devServer.close();
        });

        it('postcss: should respect postcss.config.js with plain configuration', async () => {
          const devServer = await start(
            {
              name: 'app-postcss',
              rootDir: testSuiteFolder,
              noRebuild: true,
            },
            { plugins, projects }
          );

          await devServer.buildPromise;

          const platformCss = await (
            await fetch(`http://localhost:${devServer.staticPort}/dist/client/platform.css`)
          ).text();

          expect(platformCss).toContain('-webkit-user-select: none;');
          expect(platformCss).toContain('padding: 8px;');

          // todo close in afterEach
          await devServer.close();
        });

        it('postcss: should respect postcss.config.js with function configuration', async () => {
          const devServer = await start(
            {
              name: 'app-postcss-fn',
              rootDir: testSuiteFolder,
              noRebuild: true,
            },
            { plugins, projects }
          );

          await devServer.buildPromise;

          const platformCss = await (
            await fetch(`http://localhost:${devServer.staticPort}/dist/client/platform.css`)
          ).text();

          expect(platformCss).toContain('-webkit-user-select: none;');
          expect(platformCss).toContain('padding: 8px;');

          // todo close in afterEach
          await devServer.close();
        });

        it('file-system-pages: "@tramvai/api/lib/virtual/file-system-pages" import should be updated after changes in "routes" and "pages" directories', async () => {
          const devServer = await start(
            {
              name: 'app-fs-routing',
              rootDir: testSuiteFolder,
            },
            { plugins, projects }
          );

          await devServer.buildPromise;
          // TODO: immediate rebuild because "pages" folder is absent
          await sleep(200);

          let platformJs = await (
            await fetch(`http://localhost:${devServer.staticPort}/dist/client/platform.js`)
          ).text();
          let serverJs = await (
            await fetch(`http://localhost:${devServer.staticPort}/dist/server/server.js`)
          ).text();

          expect(platformJs).toContain('foo');
          expect(serverJs).toContain('foo');

          // MARK: NEW FILE IN EXISTED FOLDER

          const newRouteFile = path.resolve(
            fixturesFolder,
            `application`,
            'fs-routing',
            'routes',
            'bar',
            'index.tsx'
          );

          // TODO: support concurrent tests
          await fs.promises.mkdir(path.dirname(newRouteFile), { recursive: true });
          await fs.promises.writeFile(
            newRouteFile,
            `const Page = () => <h1>Page</h1>;
export default Page;`,
            'utf-8'
          );

          await sleep(100);

          platformJs = await (
            await fetch(`http://localhost:${devServer.staticPort}/dist/client/platform.js`)
          ).text();
          serverJs = await (
            await fetch(`http://localhost:${devServer.staticPort}/dist/server/server.js`)
          ).text();

          expect(platformJs).toContain('bar');
          expect(serverJs).toContain('bar');

          // MARK: NEW FOLDER AND FILE

          const newPagesFile = path.resolve(
            fixturesFolder,
            `application`,
            'fs-routing',
            'pages',
            'baz',
            'index.tsx'
          );

          // TODO: support concurrent tests
          await fs.promises.mkdir(path.dirname(newPagesFile), { recursive: true });
          await fs.promises.writeFile(
            newPagesFile,
            `const Cmp = () => <h1>Cmp</h1>;
export default Cmp;`,
            'utf-8'
          );

          await sleep(100);

          platformJs = await (
            await fetch(`http://localhost:${devServer.staticPort}/dist/client/platform.js`)
          ).text();
          serverJs = await (
            await fetch(`http://localhost:${devServer.staticPort}/dist/server/server.js`)
          ).text();

          expect(platformJs).toContain('baz');
          expect(serverJs).toContain('baz');

          // MARK: CHANGED FILE

          const changedRouteFile = path.resolve(
            fixturesFolder,
            `application`,
            'fs-routing',
            'routes',
            'bar',
            'TEST.tsx'
          );

          // TODO: support concurrent tests
          await fs.promises.rename(newRouteFile, changedRouteFile);

          await sleep(100);

          platformJs = await (
            await fetch(`http://localhost:${devServer.staticPort}/dist/client/platform.js`)
          ).text();
          serverJs = await (
            await fetch(`http://localhost:${devServer.staticPort}/dist/server/server.js`)
          ).text();

          expect(platformJs).not.toContain('bar');
          expect(serverJs).not.toContain('bar');

          // todo close in afterEach
          await devServer.close();
        }, 10000);

        it('define: should replace constants', async () => {
          const devServer = await start(
            {
              name: 'app-config-to-env',
              rootDir: testSuiteFolder,
              noRebuild: true,
            },
            { plugins, projects }
          );

          await devServer.buildPromise;

          const platformJs = await (
            await fetch(`http://localhost:${devServer.staticPort}/dist/client/platform.js`)
          ).text();
          const serverJs = await (
            await fetch(`http://localhost:${devServer.staticPort}/dist/server/server.js`)
          ).text();

          expect(platformJs).toContain('enableFsPages ${true}');
          expect(platformJs).toContain('customPagesDir');
          expect(platformJs).toContain('customRoutesDir');
          expect(platformJs).toContain('from-options');
          expect(platformJs).toContain('enableConcurrentFeatures ${true}');
          expect(platformJs).toContain("enableViewTransitions ${'true'}");
          expect(platformJs).toContain("enableReactTransitions ${'true'}");
          expect(platformJs).toContain('development');
          expect(platformJs).toContain('app-config-to-env');

          expect(serverJs).toContain('enableFsPages ${true}');
          expect(serverJs).toContain('customPagesDir');
          expect(serverJs).toContain('customRoutesDir');
          expect(serverJs).toContain('from-options');
          expect(serverJs).toContain('enableConcurrentFeatures ${true}');
          expect(serverJs).toContain("enableViewTransitions ${'true'}");
          expect(serverJs).toContain("enableReactTransitions ${'true'}");
          expect(serverJs).toContain('development');
          expect(serverJs).toContain('app-config-to-env');

          // todo close in afterEach
          await devServer.close();
        });
      });
    });

    // describe('api: application build', () => {});
  });
}
/* eslint-enable no-useless-escape, no-template-curly-in-string, max-nested-callbacks */
