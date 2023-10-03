import type { META_UPDATER_TOKEN, META_DEFAULT_TOKEN } from './tokens';
import { META_WALK_TOKEN } from './tokens';

export type SeoModuleOptions =
  | {
      metaUpdaters?: typeof META_UPDATER_TOKEN[];
      metaDefault?: typeof META_DEFAULT_TOKEN;
    }
  | any[]; // any[] - легаси типы для старого формата; TODO: убрать

export type MetaRouteConfig = {
  seo?: {
    metaTags?: Record<string, any>;
    shareSchema?: {
      openGraph?: Record<string, string>;
      twitterCard?: Record<string, string>;
    };
    structuredData?: {
      jsonLd?: Record<string, any>;
      microdata?: Record<string, any>;
    };
  };
  analytics?: Record<string, any>;
};

export type PageSeoProperty = MetaRouteConfig['seo'];
