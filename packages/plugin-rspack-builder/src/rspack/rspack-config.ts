import { RspackOptions } from '@rspack/core';
import { createToken } from '@tinkoff/dippy';
import { Configuration, InputParameters } from '@tramvai/api/lib/config';
import type { BuildType, BuildMode, BuildTarget } from '@tramvai/plugin-base-builder/lib/types';

export type RspackConfigurationFactory = (
  inputParameters: InputParameters,
  extraConfiguration: Partial<Configuration>
) => Promise<RspackOptions>;

/**
 * @description Build type defines Tramvai type of the build - regular application or Child App
 */
export const BUILD_TYPE_TOKEN = createToken<BuildType>('tramvai rspack build type');

/**
 * @description Build type defines target of the build - server or client
 */
export const BUILD_TARGET_TOKEN = createToken<BuildTarget>('tramvai rspack build target');

/**
 * @description Build env defines production or development environment
 */
export const BUILD_MODE_TOKEN = createToken<BuildMode>('tramvai rspack build env');
