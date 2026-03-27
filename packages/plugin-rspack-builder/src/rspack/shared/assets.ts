import path from 'node:path';
import fs from 'node:fs';

import SparkMD5 from 'spark-md5';
import type { PathData, RuleSetRule } from '@rspack/core';

import { Container, optional } from '@tinkoff/dippy';
import { CONFIG_SERVICE_TOKEN } from '@tramvai/api/lib/config';
import { getSvgoOptions } from '@tramvai/plugin-base-builder/lib/shared/assets';

import { RSPACK_TRANSPILER_TOKEN, resolveRspackTranspilerParameters } from './transpiler';

export const createAssetsRules = ({
  di,
  buildTarget,
}: {
  di: Container;
  buildTarget: 'client' | 'server';
}): RuleSetRule[] => {
  const config = di.get(CONFIG_SERVICE_TOKEN);
  const transpiler = di.get(optional(RSPACK_TRANSPILER_TOKEN))!;
  const transpilerParameters = resolveRspackTranspilerParameters({ di, buildTarget });

  // TODO: integration test for custom plugins
  const svgoOptions = getSvgoOptions(config);
  const rules: RuleSetRule[] = [];

  rules.push({
    test: /\.woff2?$/,
    type: 'asset',
    generator: {
      emit: buildTarget === 'client',
    },
  });

  // import of .svg images emits a separate file and have different behavior on server and client side,
  // because of some legacy coupling with our internal UI-kit library.
  // by default, on server side, it will return image source code as a string, and on client side, it will return an URL string.
  if (buildTarget === 'client') {
    rules.push({
      test: /\.svg$/,
      resourceQuery: { not: /react/ },
      type: 'asset/resource',
      generator: {
        filename: (pathInfo: PathData) => {
          // hash computation exactly how it is working in react-ui-kit
          // TODO: it leads to high coherence with ui-kit, better change it to some other method
          const fileContent = fs.readFileSync(
            path.join(config.rootDir, pathInfo.filename!),
            'utf-8'
          );
          return `${SparkMD5.hash(fileContent)}.svg`;
        },
      },
    });
  } else {
    rules.push({
      test: /\.svg$/,
      resourceQuery: { not: /react/ },
      type: 'asset/source',
    });
  }

  // based on https://github.com/facebook/create-react-app/issues/11213#issuecomment-883466601
  rules.push({
    test: /\.svg$/,
    // TODO: `issuer: /\.tsx?$/` need or not?
    resourceQuery: /react/,
    use: [
      {
        loader: transpiler.loader,
        options: transpiler.configFactory({ ...transpilerParameters, typescript: true }),
      },
      {
        loader: '@svgr/webpack',
        options: { babel: false, svgo: svgoOptions },
      },
    ],
  });

  rules.push({
    test: /\.(png|jpe?g|gif|webp)$/,
    loader: require.resolve('@tramvai/plugin-base-builder/lib/loaders/image-loader'),
  });

  rules.push({
    test: /\.(mp4|webm|avif)$/,
    type: 'asset/resource',
    generator: {
      emit: buildTarget === 'client',
    },
  });

  return rules;
};
