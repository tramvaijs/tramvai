import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';

import findCacheDir from 'find-cache-dir';
import browserslist from 'browserslist';
import { ICruiseResult } from 'dependency-cruiser';

import { disabledRules, featureToRule } from './rulesMap';
import { Rules, TramvaiConfig } from './types';

export function getLibraryEslintConfig(libraryName: string, projectRoot?: string) {
  const libraryRoot = path.dirname(
    require.resolve(libraryName, projectRoot ? { paths: [projectRoot] } : {})
  );

  try {
    return require(`${libraryRoot}/eslint.js`);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to parse custom settings config!');

    return [];
  }
}

export function resolveBrowserslistConfig(projectPath: string): any {
  return browserslist.loadConfig({ path: projectPath });
}

export function getUsedPolyfillsPathsFromLibrary(libraryPath: string): string[] {
  const libraryPolyfillImportsFile = path.join(libraryPath, 'imports.json');

  try {
    return JSON.parse(fs.readFileSync(libraryPolyfillImportsFile, 'utf-8'));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`Failed to get polyfill library `);
    return [];
  }
}

const defaultPolyfillEntryPath = './src/polyfill.ts';
const defaultModernPolyfillEntryPath = './src/modern.polyfill.ts';

export function getUsedPolyfillsPathsFromProject(projectPath: string) {
  const tramvaiConfig = getTramvaiConfig(projectPath);
  const { projects } = tramvaiConfig;

  const applicationConfig = Object.values(projects).find(
    (projectConfig: { type: string }) => projectConfig.type === 'application'
  );
  const { polyfill, modernPolyfill } = applicationConfig;

  const polyfillEntryPath = path.join(projectPath, polyfill ?? defaultPolyfillEntryPath);
  const modernPolyfillEntryPath = path.join(
    projectPath,
    modernPolyfill ?? defaultModernPolyfillEntryPath
  );

  const polyfillImports = [];

  if (fs.existsSync(polyfillEntryPath)) {
    polyfillImports.push(...getImports(polyfillEntryPath, projectPath));
  } else {
    const defaultPolyfillsPath = require.resolve('@tinkoff/pack-polyfills');
    polyfillImports.push(...getImports(defaultPolyfillsPath, projectPath));
  }

  if (fs.existsSync(modernPolyfillEntryPath)) {
    polyfillImports.push(...getImports(modernPolyfillEntryPath, projectPath));
  }

  return polyfillImports;
}

export function patchRules(customPolyfillsPaths: string[], rules: Rules) {
  customPolyfillsPaths.forEach((polyfillPath) => {
    let polyfillName = polyfillPath;

    if (polyfillPath.includes('/core-js/modules/')) {
      polyfillName = path.parse(polyfillPath).name;
    }

    const polyfillRule = featureToRule(polyfillName);

    if (polyfillRule) {
      if (Array.isArray(polyfillRule)) {
        polyfillRule.forEach((ruleName) => {
          rules[ruleName] = 0;
        });
      } else {
        rules[polyfillRule] = 0;
      }
    }
  });

  disabledRules.forEach((ruleName) => {
    rules[ruleName] = 0;
  });
}

function getImports(filePath: string, projectRootPath: string) {
  const packageJSONPath = path.join(projectRootPath, 'package.json');
  const packageJSONHash = getFileContentHash(packageJSONPath);

  const baseCachePath =
    findCacheDir({ name: 'tramvai', cwd: projectRootPath }) ?? 'node_modules/.tramvai';
  const fileContentHash = getFileContentHash(filePath);
  const cachePath = path.join(baseCachePath, `${packageJSONHash}_${fileContentHash}`);

  if (fileContentHash && fs.existsSync(cachePath)) {
    return JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
  }
  const allModules = cruiseSync(filePath);
  const imports = allModules
    .map((item) => item.source)
    .filter((item) => !item.includes('/core-js/internals/'));
  fs.mkdirSync(path.dirname(cachePath), { recursive: true });
  fs.writeFileSync(cachePath, JSON.stringify(imports));

  return imports;
}

function getFileContentHash(filePath: string) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const hash = crypto.createHash('md5');
    hash.update(fileBuffer);

    return hash.digest('hex').slice(0, 6);
  } catch (_err) {}
}

function safeLoadFile(filePath: string | undefined) {
  if (!filePath) {
    return '';
  }

  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (err: any) {
    if (err.code !== 'ENOENT') {
      // eslint-disable-next-line no-console
      console.error(`Failed to read ${filePath}`);
    }

    return '';
  }
}

function cruiseSync(filePath: string): ICruiseResult['modules'] {
  const output = execSync(`npx depcruise ${filePath} --no-config --output-type json`, {
    encoding: 'utf-8',
    maxBuffer: 8192 * 8192,
  });

  return JSON.parse(output).modules;
}

function getTramvaiConfig(projectPath: string) {
  try {
    const tramvaiConfig = fs.readFileSync(`${projectPath}/tramvai.json`, 'utf-8');
    return JSON.parse(tramvaiConfig) as TramvaiConfig;
  } catch (err: any) {
    throw new Error(`Tramvai config cannot be loaded: ${err}`);
  }
}
