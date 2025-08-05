import type { ManifestEntry } from 'workbox-build';

type PwaIconItem = {
  src: string;
  sizes: string;
  type?: string;
  density?: number;
  purpose?: string;
};

export type WebManifestOptions = {
  /**
   * @title Create webmanifest file
   * @default false
   */
  enabled?: boolean;
  /**
   * @title Name of generated manifest file (will be placed in "output.client" directory). You can use `[hash]` placeholder for manifest cache busting in production mode
   * @default "/manifest.[hash].json"
   */
  dest?: string;
  /**
   * @title prefer to use "pwa.sw.scope" instead, this field will be generated automatically
   */
  scope?: string;
  name?: string;
  short_name?: string;
  description?: string;
  // @todo - example or default with `/?standalone=true`?
  start_url?: string;
  display?: string;
  /**
   * @title prefer to use "pwa.meta.themeColor" instead, this field will be generated automatically
   */
  theme_color?: string;
  background_color?: string;
  /**
   * @title prefer to use "pwa.icon" instead, this field will be generated automatically
   */
  icons?: Array<PwaIconItem>;
};

export type PwaIconOptions = {
  /**
   * @title Path to icon file (relative to "root" directory)
   */
  src: string;
  /**
   * @title Folder for generated icons (will be placed in "output.client" directory)
   * @default "pwa-icons"
   */
  dest?: string;
  /**
   * @title Icon sizes
   * @default [36, 48, 72, 96, 144, 192, 512]
   */
  sizes?: number[];
};

export type PwaMetaOptions = {
  /**
   * @title "viewport" meta tag
   */
  viewport?: string;
  /**
   * @title "theme-color" meta tag
   */
  themeColor?: string;
  /**
   * @title "mobile-web-app-capable" meta tag
   */
  mobileApp?: string;
  /**
   * @title "apple-mobile-web-app-capable" meta tag
   */
  mobileAppIOS?: string;
  /**
   * @title "apple-mobile-web-app-title" meta tag
   */
  appleTitle?: string;
  /**
   * @title "apple-mobile-web-app-status-bar-style" meta tag
   */
  appleStatusBarStyle?: string;
};

/**
 * @title PWA configuration (works with `TramvaiPwaModule` from `@tramvai/module-progressive-web-app` library)
 * @default {}
 */
export type PWAConfig = {
  /**
   * @title Service-Worker configuration
   * @default {}
   */
  sw?: {
    /**
     * @title Path to sw.ts file (relative to "root" directory)
     * @default "sw.ts"
     */
    src?: string;
    /**
     * @title Name of generated SW file (will be placed in "output.client" directory)
     * @default "sw.js"
     */
    dest?: string;
    /**
     * @title Scope of SW (see https://developers.google.com/web/ilt/pwa/introduction-to-service-worker#registration_and_scope)
     * @default "/"
     */
    scope?: string;
  };
  // @todo optional workbox-window?
  /**
   * @title Workbox configuration
   * @default {}
   */
  workbox: {
    /**
     * @title Connect `InjectManifest` from `workbox-webpack-plugin` library
     * @default false
     */
    enabled?: boolean;
    /**
     * @title Array of regexp specifiers used to exclude assets from the precache manifest
     */
    exclude?: string[];
    /**
     * @title Array of regexp specifiers used to include assets in the precache manifest
     */
    include?: string[];
    /**
     * @title Array of chunk names used to include in the precache manifest
     */
    chunks?: string[];
    /**
     * @title Array of chunk names used to exclude from the precache manifest
     */
    excludeChunks?: string[];
    /**
     * @title A list of entries to be included in the precache manifest, in addition to any entries that are generated as part of the build configuration
     */
    additionalManifestEntries?: Array<string | ManifestEntry>;
  };
  /**
   * @title WebManifest content (manifest.json or webmanifest will be generated based on this options)
   * @default {}
   */
  webmanifest?: WebManifestOptions;
  /**
   * @title PWA icons options
   * @default {}
   */
  icon?: PwaIconOptions;
  /**
   * @title PWA meta options
   * @default {}
   */
  meta?: PwaMetaOptions;
};
