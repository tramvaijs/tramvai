---
id: internationalization
title: Internationalization (i18n)
---

## Explanation

The `I18nModule` from `@tramvai/module-i18n` provides core internationalization (i18n) functionality for Tramvai applications. It handles language detection, routing strategies for multi-language URLs, language switching, and SEO meta tags for localized content.

:::info

This module provides the **infrastructure** for managing languages and routing. It does **not** handle translations, dictionaries, or text localization - that responsibility belongs to your application or specialized translation libraries.

:::

### Key features

- Automatically determines user's preferred language based on cookies, browser preferences, and URL
- Supports multiple URL strategies (subpath-based like `/en/about` or no prefix)
- Provides API to programmatically change the application language
- Automatically sets the `lang` attribute on the HTML element
<!-- @TODO: Automatically generates `hreflang` meta tags and sets the `lang` attribute on the HTML element -->

## Installation

Install the module:

```bash
npx tramvai add @tramvai/module-i18n
```

## Usage

### Basic setup

Import and add the module to your application:

```tsx
import { createApp } from '@tramvai/core';
import { I18nModule } from '@tramvai/module-i18n';
import { ClientHintsModule } from '@tramvai/module-client-hints';

createApp({
  name: 'my-app',
  modules: [
    ClientHintsModule,
    I18nModule.forRoot({
      defaultLanguage: 'ru',
      availableLanguages: ['ru', 'en'],
      routingStrategy: 'prefix_except_default',
    }),
  ],
});
```

### Configuration options

Configure the module using `I18nModule.forRoot()` or by providing the `I18N_CONFIGURATION_TOKEN`:

```tsx
import { I18N_CONFIGURATION_TOKEN } from '@tramvai/module-i18n';

const provider = provide({
  provide: I18N_CONFIGURATION_TOKEN,
  useValue: {
    defaultLanguage: 'ru',
    availableLanguages: ['ru', 'en'],
    routingStrategy: 'prefix_except_default',
  },
});
```

## Routing strategies

The module supports different strategies for handling language in URLs, inspired by [Nuxt i18n](https://i18n.nuxtjs.org/docs/guide#strategies):

### `prefix_except_default` (Recommended)

Adds language prefix to URLs for all languages **except** the default one:

```
defaultLanguage: 'ru'
availableLanguages: ['ru', 'en']

/ → Russian
/about → Russian
/en/about → English
```

### `prefix`

Adds language prefix to **all** URLs including the default language:

```
defaultLanguage: 'ru'
availableLanguages: ['ru', 'en']

/ru/ → Russian
/ru/about → Russian
/en/about → English
```

### `prefix_and_default`

Similar to `prefix`, but also allows accessing default language without prefix:

```
defaultLanguage: 'ru'
availableLanguages: ['ru', 'en']

/ → Russian
/ru/ → Russian
/about → Russian
/ru/about → Russian
/en/about → English
```

### `no_prefix`

No language prefix in URLs. Language is determined by cookies, headers, or other means:

```
/ → Determined by detection algorithm
/about → Determined by detection algorithm
```

**Use case:** When using subdomains (en.example.com, ru.example.com) or single-language applications with optional language switching.

### Update strategies

#### Reload

When switching languages, the page is fully reloaded:

```tsx
I18nModule.forRoot({
  updateStrategy: 'reload', // default
});
```

- **Pros:** Simple, guarantees fresh data, no stale state
- **Cons:** Slower, loses client-side state

#### Update

When switching languages, the page updates without reload using SPA navigation:

```tsx
I18nModule.forRoot({
  updateStrategy: 'update',
});
```

- **Pros:** Faster, preserves client-side state
- **Cons:** Requires handling language change in components, potential stale data

:::warning

When using `updateStrategy: 'update'`, make sure your components react to language changes. The `tramvai_i18n` store will be updated, so use `useStore` to subscribe to language changes.

:::

## Language detection

The module automatically detects the user's preferred language using the following priority:

1. **Cookie** (priority `40`, `tramvai_locale` by default) - User's previously selected language
2. **Accept-Language header / navigator.languages** (priority `30`) - Browser language preferences
3. **URL prefix** (priority `20`) - Language extracted from URL path (if routing strategy uses prefixes)
4. **Default language** (priority `10`) - Fallback from configuration

This algorithm is implemented in the `I18N_RESOLVE_LANGUAGE_TOKEN` provider and can be extended by providing multi-token `I18N_RESOLVE_LANGUAGE_SOURCE_TOKEN` (or customized by providing your own implementation of `I18N_RESOLVE_LANGUAGE_TOKEN`).

### Language detection flow

Language detection happens during the command line runner stage specified in `resolveLanguagesCommandLineStage` (default: `customerStart`):

1. `I18N_RESOLVE_AVAILABLE_LANGUAGES_TOKEN` is called to get the list of available languages
2. Available languages are stored in the `tramvai_i18n` store
3. `I18N_RESOLVE_LANGUAGE_TOKEN` is called to detect current language
4. Inside `I18N_RESOLVE_LANGUAGE_TOKEN`, `I18N_RESOLVE_LANGUAGE_SOURCE_TOKEN` providers are executed in order of priority, before first successful result is returned
5. Current language is stored in the store and saved to cookie (if not already set)

## How to

### How to get the current language

In React components, prefer using the `useLanguageService` hook (with automatic `I18nStore` subscription):

```tsx
import { useDi } from '@tramvai/react';
import { useLanguageService } from '@tramvai/module-i18n';

export const MyComponent = () => {
  const i18nService = useLanguageService();
  const currentLanguage = i18nService.getLanguage();

  return <div>Current language: {currentLanguage}</div>;
};
```

As alternative, you can also get the current language directly from the store:

```tsx
import { useStoreSelector } from '@tramvai/state';
import { I18nStore } from '@tramvai/module-i18n';
import { useDi } from '@tramvai/react';

export const MyComponent = () => {
  const currentLanguage = useStoreSelector(I18nStore, (state) => state.language);

  return <div>Current language: {currentLanguage}</div>;
};
```

### How to switch language

```tsx
import { useDi } from '@tramvai/react';
import { useLanguageService } from '@tramvai/module-i18n';

export const MyComponent = () => {
  const i18nService = useLanguageService();

  const switchLanguage = (lang: string) => {
    i18nService.switchLanguage(lang);
  };

  return <button onClick={() => switchLanguage('en')}>Switch to English</button>;
};
```

### How to extend language detection

Extend the language detection algorithm:

```tsx
import { provide } from '@tramvai/core';
import { I18N_RESOLVE_LANGUAGE_SOURCE_TOKEN, LanguageSourcePriority } from '@tramvai/module-i18n';

provide({
  provide: I18N_RESOLVE_LANGUAGE_SOURCE_TOKEN,
  useFactory: ({ config, myApiService, defaultResolve }) => {
    return {
      name: 'my-api',
      // Higher priority than "cookie" source
      priority: LanguageSourcePriority.User,
      resolve: async () => {
        const language = await myApiService.detectLanguage();
        return language;
      },
    };
  },
  deps: {
    config: I18N_CONFIGURATION_TOKEN,
    myApiService: MY_API_SERVICE_TOKEN,
  },
});
```

### How to provide whitelist of available languages

Override the list of available languages (e.g., fetch from API):

```tsx
import { provide } from '@tramvai/core';
import { I18N_RESOLVE_AVAILABLE_LANGUAGES_TOKEN } from '@tramvai/module-i18n';

provide({
  provide: I18N_RESOLVE_AVAILABLE_LANGUAGES_TOKEN,
  useFactory: ({ httpClient }) => {
    return async () => {
      const { payload } = await httpClient.get('/api/available-languages');
      return payload.languages;
    };
  },
  deps: {
    httpClient: HTTP_CLIENT_TOKEN,
  },
});
```

## Examples

### Language switcher component

```tsx
import { useStoreSelector, useActions } from '@tramvai/state';
import { useDi } from '@tramvai/react';
import { useLanguageService, I18nStore } from '@tramvai/module-i18n';

export const LanguageSwitcher = () => {
  const i18nService = useLanguageService();
  const currentLanguage = useStoreSelector(I18nStore, (state) => state.language);
  const availableLanguages = useStoreSelector(I18nStore, (state) => state.availableLanguages);

  const handleChange = (lang: string) => {
    i18nService.switchLanguage(lang);
  };

  return (
    <select value={currentLanguage} onChange={(e) => handleChange(e.target.value)}>
      {availableLanguages.map((lang) => (
        <option key={lang} value={lang}>
          {lang.toUpperCase()}
        </option>
      ))}
    </select>
  );
};
```

### Language-aware links

```tsx
import { useDi } from '@tramvai/react';
import { useLanguageService } from '@tramvai/module-i18n';
import { Link } from '@tramvai/module-router';

export const LocaleLink = ({
  url,
  lang,
  children,
}: {
  url: string;
  lang?: Language;
  children: React.ReactNode;
}) => {
  const i18nService = useLanguageService();

  // Add language prefix to internal links
  const localizedHref = i18nService.addLanguageToUrl(url, lang ?? i18nService.getLanguage());

  return <Link url={localizedHref.pathname}>{children}</Link>;
};
```

### Static Site Generation (SSG)

SSG support with `--lang` flag for generating pages for specific languages is planned but not yet implemented.

As workaround, you can provide a custom header `Accept-Language` for `tramvai static` command to generate pages for specific languages, e.g. with `en` in priority:

```bash
npx tramvai static --header "Accept-Language: en-US,en;q=0.9,ru;q=0.8" --folder "en"
```

## Related Documentation

- [Routing](03-features/07-routing/01-overview.md) - Route configuration and navigation
- [SEO](03-features/013-seo.md) - Meta tags and SEO optimization
- [State Management](03-features/08-state-management.md) - Working with stores
- [Client Hints](references/modules/client-hints.md) - Browser preferences detection
