---
id: assets
title: Images and Fonts
---

## Images

### Raster

**Supported formats:** `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`

Import of raster image emits a separate file, while default export returns URL string and named export returns `image` object with the following interface:

```ts
interface ImageObject {
  src: string;
  width: number;
  height: number;
  blurDataURL: string;
}
```

Example with named export and automatic `aspect-ratio` calculation based on real image width and height:

```tsx
import { image } from './images/mountains.jpeg';

const Image = () => {
  const { src, width, height } = image;

  // <img src="${ASSETS_PREFIX}/dist/client/9930f34d1d49796027f2a18ea89e6ccf.jpeg" width="1104" height="460" />
  return <img src={src} width={width} height={height} />;
};
```

Example with default export:

:::warning

Usage without `width` and `height` attributes not recommended, it will degrade the Cumulative Layout Shift metric

:::

```tsx
import src from './images/mountains.jpeg';

const Image = () => {
  // <img src="${ASSETS_PREFIX}/dist/client/9930f34d1d49796027f2a18ea89e6ccf.jpeg" />
  return <img src={src} />;
};
```

### Vector

Import of `.svg` images emits a separate file and have different behavior on server and client side, because of some legacy coupling with our internal UI-kit library. By default, on server side, it will return image source code as a string, and on client side, it will return an URL string.

This default behavior not very useful, so we recommend to use imports with `svgr` [resource query](https://webpack.js.org/configuration/module/#ruleresourcequery).

#### React component

Imports with `.svg?react` resource query will return React component, created by [svgr library](https://react-svgr.com/):

```tsx
import Image from './images/logo.svg?react';

const Logo = () => {
  // <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80.9 72.2" width="100" height="100">...</svg>
  return <Image width="100" height="100" />;
};
```

All properties to this `Image` component will be passed to root `svg` tag.

### Optimization

By default, **raster** images doesn't have any optimization, and you have a few options for it:

- run the image once through tools like [Squoosh](https://github.com/GoogleChromeLabs/squoosh)
- optimize images in runtime with services like [imgproxy](https://imgproxy.net/)
- in `tramvai.json` turn on [image-webpack-loader](https://github.com/tcoopman/image-webpack-loader) with [imagemin](https://github.com/imagemin/imagemin) under the hood

For automatic `imagemin` processing use option `imageOptimization`:

```json title="tramvai.json"
{
  "projects": {
    "appName": {
      "imageOptimization": {
        // enable image optimization
        "enabled": true,
        // options for the detailed settings (https://github.com/tcoopman/image-webpack-loader#options)
        "options": {}
      }
    }
  }
}
```

For **vector** images, on contrast, [svgo](https://github.com/svg/svgo) always enabled.

### Typings

To prevent typescript issues with image imports, make sure that your custom types declaration contains `@tramvai/cli` package reference:

```ts title="typings.d.ts"
/// <reference types="@tramvai/cli" />
```

## Fonts

Simpliest way to add Web Fonts in your project is to use `RENDER_SLOTS` token, example with `Lato` Google Font:

```ts
import { RENDER_SLOTS, ResourceType, ResourceSlot } from '@tramvai/tokens-render';

provide({
  provide: RENDER_SLOTS,
  multi: true,
  useValue: {
    type: ResourceType.style,
    slot: ResourceSlot.HEAD_CORE_STYLES,
    payload: 'https://fonts.googleapis.com/css2?family=Lato&display=swap',
  },
});
```

Also, for faster text rendering, you can preload used fonts:

```ts
import { RENDER_SLOTS, ResourceType, ResourceSlot } from '@tramvai/tokens-render';

provde({
  provide: RENDER_SLOTS,
  multi: true,
  useValue: {
    type: ResourceType.preloadLink,
    slot: ResourceSlot.HEAD_CORE_SCRIPTS,
    payload: 'https://fonts.gstatic.com/s/lato/v20/S6uyw4BMUTPHjx4wXiWtFCc.woff2',
    attrs: {
      as: 'font',
      type: 'font/woff2',
      crossOrigin: 'anonymous',
    },
  },
});
```

### Custom Web Fonts

**Supported formats:** `.woff2`

Recommended way to add custom fonts - import nessesary font in `@font-face` directive:

```css title="app.module.css"
:global {
  @font-face {
    font-family: 'CascadiaCode';
    src: url('./fonts/CascadiaCodePL.woff2') format('woff2');
  }

  html {
    font-family: CascadiaCode;
  }
}
```

Then just import this CSS file in application entry:

```ts title="index.ts"
import './app.module.css';
```

Result CSS will looks like this:

```css
@font-face {
  font-family: 'CascadiaCode';
  src: url(${ASSETS_PREFIX}/dist/client/20d46cabfe465e8d.woff2) format('woff2');
}
html {
  font-family: CascadiaCode;
}
```

And preload your font as in previous example:

```ts
import { RENDER_SLOTS, ResourceType, ResourceSlot } from '@tramvai/tokens-render';
import font from './fonts/CascadiaCodePL.woff2';

provide({
  provide: RENDER_SLOTS,
  multi: true,
  useValue: {
    type: ResourceType.preloadLink,
    slot: ResourceSlot.HEAD_CORE_SCRIPTS,
    payload: font,
    attrs: {
      as: 'font',
      type: 'font/woff2',
      crossOrigin: 'anonymous',
    },
  },
});
```

### Typings

To prevent typescript issues with import `*.woff2` file, make sure that your custom types declaration contains `@tramvai/cli` package reference:

```ts title="typings.d.ts"
/// <reference types="@tramvai/cli" />
```
