import { createToken } from '@tinkoff/dippy';
import type { BuildType, BuildTarget, BuildMode } from './types';

/**
 * @description Build type defines Tramvai type of the build - regular application or Child App
 */
export const BUILD_TYPE_TOKEN = createToken<BuildType>('tramvai build type');

/**
 * @description Build type defines target of the build - server or client
 */
export const BUILD_TARGET_TOKEN = createToken<BuildTarget>('tramvai build target');

/**
 * @description Build env defines production or development environment
 */
export const BUILD_MODE_TOKEN = createToken<BuildMode>('tramvai build env');
