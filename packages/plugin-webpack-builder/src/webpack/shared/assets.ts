import SparkMD5 from 'spark-md5';
import type webpack from 'webpack';

import { Container, optional } from '@tinkoff/dippy';
import { CONFIG_SERVICE_TOKEN } from '@tramvai/api/lib/config';
import { getSvgoOptions } from '@tramvai/plugin-base-builder/lib/shared/assets';

import { BUILD_TARGET_TOKEN } from '@tramvai/plugin-base-builder/lib/build-config';
import { WEBPACK_TRANSPILER_TOKEN, resolveWebpackTranspilerParameters } from './transpiler';

export const createAssetsRules = ({ di }: { di: Container }): webpack.RuleSetRule[] => {
  const config = di.get(CONFIG_SERVICE_TOKEN);
  const buildTarget = di.get(BUILD_TARGET_TOKEN);
  const transpiler = di.get(optional(WEBPACK_TRANSPILER_TOKEN))!;
  const transpilerParameters = resolveWebpackTranspilerParameters({ di });

  // TODO: integration test for custom plugins
  const svgoOptions = getSvgoOptions(config);
  const rules: webpack.RuleSetRule[] = [];

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
        filename: (pathInfo: any) => {
          // hash computation exactly how it is working in react-ui-kit
          // TODO: it leads to high coherence with ui-kit, better change it to some other method
          return `${SparkMD5.hash(pathInfo.module.originalSource().source().toString())}.svg`;
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
