import { safeRequireResolve } from '../../../../utils/safeRequire';

const BLUR_WIDTH = 10;
const BLUR_HEIGHT = 10;

export const getImageMiniatureDataURL = async (content: Buffer, extension: string) => {
  const isSharpInstalled = Boolean(safeRequireResolve('sharp', __dirname));
  if (!isSharpInstalled) {
    return null;
  }

  try {
    const sharp = require('sharp');

    const image = sharp(content, { sequentialRead: true });
    // https://sharp.pixelplumbing.com/api-resize#resize
    image.resize(BLUR_WIDTH, BLUR_HEIGHT, {
      fit: 'inside',
    });
    if (extension === 'jpeg' || extension === 'jpg') {
      image.jpeg({
        progressive: true,
      });
    }

    const optimizedBuffer = await image.toBuffer();

    const dataURL = `data:image/${extension};base64,${optimizedBuffer.toString('base64')}`;

    return dataURL;
  } catch (e) {
    console.error('image placeholder generation error: ', e);
    return null;
  }
};
