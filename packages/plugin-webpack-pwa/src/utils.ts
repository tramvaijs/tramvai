import { PWAConfig } from './types';
import { InjectManifest } from 'workbox-webpack-plugin';

export function getWorkboxOptions({
  swSrc,
  swDest,
  workbox = {},
  mode,
  assetsPrefix,
  scope,
}: {
  swSrc: string;
  swDest: string;
  workbox: PWAConfig['workbox'];
  scope: string;
  mode: 'development' | 'production';
  assetsPrefix: string;
}) {
  const isProduction = mode === 'production';

  const workboxOptions: InjectManifest['config'] = {
    swSrc,
    swDest,
    exclude: [/hmr\.js$/, /\.map$/, /\.hot-update\./],
    maximumFileSizeToCacheInBytes: isProduction ? 5 * 1024 * 1024 : 10 * 1024 * 1024,
    chunks: workbox.chunks,
    excludeChunks: workbox.excludeChunks,
    additionalManifestEntries: [
      // @todo CSR fallback or all static pages?
      // do not forget about revision and possible conflict with modifyURLPrefix
    ],
    manifestTransforms: [
      (manifest, compilation: any) => {
        return {
          // we need to have a relative webmanifest url for precaching
          manifest: manifest.map((asset) => {
            const assetName = asset.url.replace(assetsPrefix!, '');
            // in development build `publicPath` is localhost, in production is empty string
            const publicPath = compilation.outputOptions?.publicPath || assetsPrefix;
            const assetInfo = compilation.assetsInfo.get(asset.url.replace(publicPath, ''));

            if (assetInfo?._webmanifestFilename) {
              return {
                ...asset,
                url: `${scope}${assetName}`,
              };
            }
            return asset;
          }),
        };
      },
    ],
  };

  if (workbox.include) {
    workboxOptions.include = workbox.include.map((expr: string) => new RegExp(expr));
  }

  if (workbox.exclude) {
    workboxOptions.exclude = [
      ...workboxOptions.exclude!,
      ...workbox.exclude.map((expr: string) => new RegExp(expr)),
    ];
  }

  if (workbox.additionalManifestEntries) {
    workboxOptions.additionalManifestEntries = [
      ...workboxOptions.additionalManifestEntries!,
      ...workbox.additionalManifestEntries,
    ];
  }

  if (isProduction) {
    workboxOptions.dontCacheBustURLsMatching = /\/\w+?\.[\w\d]+?\.(js|css|gif|png|jpe?g|svg)$/;

    workboxOptions.modifyURLPrefix = {
      '': assetsPrefix!,
    };
  }

  // @todo: break hmr on client when sw.ts is changed - infinity loop !!!
  return workboxOptions;
}
