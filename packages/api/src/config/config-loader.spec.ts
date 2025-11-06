import path from 'node:path';
import fs from 'node:fs';
import { typescriptLoader } from './config-loader';

const configPath = path.join(__dirname, '__fixtures__', 'tramvai.config.ts');
const configContent = fs.readFileSync(configPath, 'utf-8');

describe('api/config/loader', () => {
  it('should return module from typescript config', async () => {
    const loader = typescriptLoader();
    expect(await loader(configPath, configContent)).toMatchInlineSnapshot(`
      {
        "plugins": [
          [Function],
          [Function],
          [Function],
        ],
        "projects": {
          "cli-rewrited": {
            "fileSystemPages": {
              "enabled": true,
              "pagesDir": false,
            },
            "name": "cli-rewrited",
            "pwa": {
              "sw": {
                "scope": "/scope/",
              },
              "webmanifest": {
                "dest": "/manifest.[hash].webmanifest",
                "enabled": true,
                "name": "T-Bank",
                "short_name": "Т-Банк",
              },
              "workbox": {
                "enabled": true,
              },
            },
            "splitChunks": {
              "frameworkChunk": false,
              "mode": "granularChunks",
            },
            "type": "application",
          },
        },
      }
    `);
  });
});
