import sizeOf from 'image-size';
import type { LoaderContext } from 'webpack';
import { interpolateName } from 'loader-utils';
import { getImageMiniatureDataURL } from './getImageMiniatureURL';

/**
 * Reuse file-loader logic, but return a object with src and size of image
 */
export default async function (this: LoaderContext<{}>, content: Buffer) {
  const result = require('file-loader').call(this, content);
  const dimensions = sizeOf(this.resourcePath);
  const options = this.getOptions();

  const extension = interpolateName(this, '[ext]', options);

  const dataURL = await getImageMiniatureDataURL(content, extension);

  return result.replace(
    /^export default (__webpack_public_path__ \+ .+);$/,
    `const path = $1;

export default path;

export const image = {
  src: $1,
  width: ${JSON.stringify(dimensions.width)},
  height: ${JSON.stringify(dimensions.height)},
  blurDataURL: ${JSON.stringify(dataURL)},
};`
  );
}

export const raw = true;
