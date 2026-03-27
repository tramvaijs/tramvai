import type webpack from 'webpack';
import { createToken } from '@tinkoff/dippy';
import type { Container } from '@tinkoff/dippy';
import type { BuildType, BuildTarget, BuildMode } from '@tramvai/plugin-base-builder/lib/types';

export type WebpackConfigurationFactory = (options: {
  di: Container;
}) => Promise<webpack.Configuration>;

/**
 * @description Build type defines Tramvai type of the build - regular application or Child App
 */
export const BUILD_TYPE_TOKEN = createToken<BuildType>('tramvai webpack build type');

/**
 * @description Build type defines target of the build - server or client
 */
export const BUILD_TARGET_TOKEN = createToken<BuildTarget>('tramvai webpack build target');

/**
 * @description Build env defines production or development environment
 */
export const BUILD_MODE_TOKEN = createToken<BuildMode>('tramvai webpack build env');
