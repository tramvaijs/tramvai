import path from 'path';
import fs from 'fs';
import { readJson } from 'fs-extra';
import { build } from '@tramvai/cli';

const contenthashPngRegexp = /\.([\w\d]+?)\.png/;

describe('packages/modules/pwa-multi - assets', () => {
  let swFilename: string;
  let swBankFilename: string;
  let statsFilename: string;
  let webmanifestFilename: string;
  let bankWebmanifestFilename: string;
  let iconsFilenames: string[];
  let bankIconsFilenames: string[];

  beforeAll(async () => {
    await build({
      rootDir: path.resolve(__dirname, '../'),
      disableProdOptimization: true,
      target: 'pwa-multi',
      fileCache: false,
    });

    const distClientDirectory = path.resolve(__dirname, '../dist', 'client');

    swFilename = path.join(distClientDirectory, 'service-worker.js');
    swBankFilename = path.join(distClientDirectory, 'service-worker-bank.js');
    statsFilename = path.join(distClientDirectory, 'stats.json');
    webmanifestFilename = path.join(
      distClientDirectory,
      (await fs.promises.readdir(distClientDirectory)).find((filename) =>
        filename.startsWith('manifest.')
      )!
    );
    bankWebmanifestFilename = path.join(
      distClientDirectory,
      (await fs.promises.readdir(distClientDirectory)).find((filename) =>
        filename.startsWith('manifest-bank.')
      )!
    );
    iconsFilenames = (await readJson(webmanifestFilename)).icons.map((icon: any) => {
      return icon.src.replace('http://localhost:4000/dist/client', distClientDirectory);
    });
    bankIconsFilenames = (await readJson(bankWebmanifestFilename)).icons.map((icon: any) => {
      return icon.src.replace('http://localhost:4000/dist/client', distClientDirectory);
    });
  }, 250000);

  describe('Service Workers', () => {
    it('should create main service worker', () => {
      expect(fs.existsSync(swFilename)).toBe(true);
    });

    it('should create bank service worker', () => {
      expect(fs.existsSync(swBankFilename)).toBe(true);
    });

    it('should contain chunks from "include" parameter in main SW', () => {
      const swContent = fs.readFileSync(swFilename, 'utf-8');
      const statsContent: Record<string, any> = require(statsFilename);

      const chunks = ['react', 'platform', 'tramvai-workbox-window']
        .map((chunkname) => {
          return statsContent.assetsByChunkName[chunkname][0];
        })
        .concat(path.basename(webmanifestFilename));

      chunks.forEach((chunkname) => {
        expect(swContent.includes(chunkname)).toBe(true);
      });
    });

    it('should contain chunks from "include" parameter in bank SW', () => {
      const swContent = fs.readFileSync(swBankFilename, 'utf-8');
      const statsContent: Record<string, any> = require(statsFilename);

      const chunks = ['react', 'platform', 'tramvai-workbox-window']
        .map((chunkname) => {
          return statsContent.assetsByChunkName[chunkname][0];
        })
        .concat(path.basename(bankWebmanifestFilename));

      chunks.forEach((chunkname) => {
        expect(swContent.includes(chunkname)).toBe(true);
      });
    });
  });

  describe('Webmanifest', () => {
    let webmanifestContent: Record<string, any>;

    beforeAll(async () => {
      webmanifestContent = JSON.parse(await fs.promises.readFile(webmanifestFilename, 'utf-8'));
    });

    it('should contain hash in filename', () => {
      expect(/\/manifest\.[\w\d]+?\.webmanifest$/.test(webmanifestFilename)).toBe(true);
    });

    it('should use "name" parameter', () => {
      expect(webmanifestContent.name).toBe('my manifest');
      expect(webmanifestContent.short_name).toBe('also my manifest but short');
    });

    it('should borrow scope from "pwa.sw.scope" parameter', () => {
      expect(webmanifestContent.scope).toBe('/scope/');
    });

    it('should borrow theme_color from "pwa.meta.themeColor" parameter', () => {
      expect(webmanifestContent.theme_color).toBe('#ffdd2d');
    });

    it('should contain generated icons', () => {
      expect(
        webmanifestContent.icons.map((icon: any) => {
          return {
            ...icon,
            src: icon.src.replace(contenthashPngRegexp, '.[contenthash].png'),
          };
        })
      ).toEqual([
        {
          src: 'http://localhost:4000/dist/client/images/36x36.[contenthash].png',
          sizes: '36x36',
          type: 'image/png',
        },
        {
          src: 'http://localhost:4000/dist/client/images/512x512.[contenthash].png',
          sizes: '512x512',
          type: 'image/png',
        },
      ]);
    });

    it('icons should be created', () => {
      iconsFilenames.forEach((filename) => {
        expect(fs.existsSync(filename)).toBe(true);
      });
    });
  });

  describe('Webmanifest bank', () => {
    let bankWebmanifestContent: Record<string, any>;

    beforeAll(async () => {
      bankWebmanifestContent = JSON.parse(
        await fs.promises.readFile(bankWebmanifestFilename, 'utf-8')
      );
    });

    it('should contain hash in filename', () => {
      expect(/\/manifest-bank\.[\w\d]+?\.webmanifest$/.test(bankWebmanifestFilename)).toBe(true);
    });

    it('should use "name" parameter', () => {
      expect(bankWebmanifestContent.name).toBe('bank manifest');
      expect(bankWebmanifestContent.short_name).toBe('bank manifest');
    });

    it('should borrow scope from "pwa.sw.scope" parameter', () => {
      expect(bankWebmanifestContent.scope).toBe('/bank/');
    });

    it('theme_color should be empty', () => {
      expect(bankWebmanifestContent.theme_color).toBe('#ffffff');
    });

    it('should contain generated icons', () => {
      expect(
        bankWebmanifestContent.icons.map((icon: any) => {
          return {
            ...icon,
            src: icon.src.replace(contenthashPngRegexp, '.[contenthash].png'),
          };
        })
      ).toEqual([
        {
          src: 'http://localhost:4000/dist/client/images/128x128.[contenthash].png',
          sizes: '128x128',
          type: 'image/png',
        },
        {
          src: 'http://localhost:4000/dist/client/images/256x256.[contenthash].png',
          sizes: '256x256',
          type: 'image/png',
        },
      ]);
    });

    it('icons should be created', () => {
      bankIconsFilenames.forEach((filename) => {
        expect(fs.existsSync(filename)).toBe(true);
      });
    });
  });
});
