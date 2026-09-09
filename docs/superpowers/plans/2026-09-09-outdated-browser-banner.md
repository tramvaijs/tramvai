# Outdated Browser Banner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Новый модуль `@tramvai/module-outdated-browser`, который отдаёт статический HTML-баннер об устаревшем браузере в слот `body:start`, работает без JavaScript, не создаёт CLS и позволяет приложению переопределить стили.

**Architecture:** Сервер определяет статус браузера по `User-Agent` и browserslist приложения. При статусе «устарел» в ответ добавляются готовый HTML в `body:start` и инлайновый CSS в `head:core-styles`. При статусе «UA не распознан» дополнительно уходит синхронный ES3-скрипт фича-детекта, который до первой отрисовки снимает скрытие. При статусе «браузер свежий» в ответ не добавляется ничего. Скрытие баннера реализовано на CSS через скрытый чекбокс и `label`, инлайновый скрипт лишь сохраняет решение в cookie.

**Tech Stack:** TypeScript, `@tinkoff/dippy` DI, `@tinkoff/user-agent`, `@tramvai/tokens-render`, `@tramvai/module-client-hints`, `@tramvai/safe-strings`, jest через пресет `@tramvai/test-unit-jest`, Playwright для интеграционных тестов.

**Spec:** `docs/superpowers/specs/2026-09-09-outdated-browser-banner-design.md`

## Global Constraints

- Пакет живёт в `packages/modules/outdated-browser`, npm-имя `@tramvai/module-outdated-browser`.
- Версии всех внутренних зависимостей в `package.json` записываются строкой `0.0.0-stub`, как во всех остальных пакетах монорепозитория.
- Инлайновые скрипты собираются только конкатенацией строковых литералов. Запрещено получать код скрипта через `Function.prototype.toString`, потому что транспайлер может оставить современный синтаксис.
- Код инлайновых скриптов только ES3: никаких стрелочных функций, шаблонных строк, `const`, `let`, `Object.assign`, опциональной цепочки.
- CSS баннера только уровня CSS2.1 плюс `:checked` и соседний комбинатор. Запрещены flexbox, grid, CSS-переменные, `gap`, логические свойства.
- Весь текст из токенов экранируется через `encodeForHTMLContext` из `@tramvai/safe-strings` перед вставкой в HTML.
- Имена классов и идентификаторы берутся только из `src/constants.ts`, литералы в других файлах не дублируются.
- Юнит-тесты лежат рядом с исходником в файлах `*.spec.ts` и запускаются командой `yarn jest --config packages/modules/outdated-browser/jest.config.js`.
- Коммиты делаются после каждой задачи, сообщение в стиле Conventional Commits.

---

## File Structure

| Файл | Ответственность |
|---|---|
| `src/constants.ts` | имена классов, id чекбокса, имя глобального флага, значения по умолчанию |
| `src/tokens.ts` | публичные токены DI и их типы |
| `src/private-tokens.ts` | внутренний токен вычисленного состояния запроса |
| `src/shared/detect.ts` | `detectBrowserSupport`, чистая функция над User-Agent |
| `src/server/sanitize.ts` | `sanitizeHref`, `isValidCookieName` |
| `src/server/banner.ts` | `renderBannerHtml` |
| `src/server/styles.ts` | `buildBannerCss` |
| `src/server/inlineScripts.ts` | `buildFlagScript`, `buildFeatureDetectScript`, `buildDismissScript` |
| `src/server/state.ts` | `computeState`, вся логика принятия решения |
| `src/server/providers.ts` | провайдеры `RENDER_SLOTS`, `Vary`, части ключа кэша |
| `src/browser/providers.ts` | флаг из глобальной переменной |
| `src/react/useIsOutdatedBrowser.ts` | React-хук |
| `src/server.ts` | точка входа сервера, поле `main` |
| `src/browser.ts` | точка входа браузера, поле `browser` |

---

### Task 1: Каркас пакета, константы, токены и детект

**Files:**
- Create: `packages/modules/outdated-browser/package.json`
- Create: `packages/modules/outdated-browser/project.json`
- Create: `packages/modules/outdated-browser/tsconfig.json`
- Create: `packages/modules/outdated-browser/jest.config.js`
- Create: `packages/modules/outdated-browser/src/constants.ts`
- Create: `packages/modules/outdated-browser/src/tokens.ts`
- Create: `packages/modules/outdated-browser/src/shared/detect.ts`
- Test: `packages/modules/outdated-browser/src/shared/detect.spec.ts`

**Interfaces:**
- Consumes: `isBrowserSatisfiesRequirements` и тип `UserAgent` из `@tinkoff/user-agent`.
- Produces: `detectBrowserSupport(userAgent, options) => BrowserSupportStatus`, где `BrowserSupportStatus = 'outdated' | 'modern' | 'unknown'`. Все константы из `constants.ts`. Все токены и типы из `tokens.ts`, включая `OutdatedBrowserOptions`, `OutdatedBrowserContent`, `OutdatedBrowserRenderPayload`.

- [ ] **Step 1: Создать каркас пакета**

`packages/modules/outdated-browser/package.json`:

```json
{
  "name": "@tramvai/module-outdated-browser",
  "version": "0.0.0-stub",
  "description": "Outdated browser banner, rendered as static HTML and working without JavaScript",
  "main": "lib/server.js",
  "module": "lib/server.es.js",
  "browser": "lib/browser.js",
  "typings": "lib/server.d.ts",
  "files": [
    "lib"
  ],
  "sideEffects": false,
  "repository": {
    "type": "git",
    "url": "git+ssh://git@github.com/tramvaijs/tramvai.git"
  },
  "scripts": {
    "build": "tramvai-build --forPublish --preserveModules",
    "watch": "tsc -w"
  },
  "publishConfig": {
    "registry": "https://registry.npmjs.org/"
  },
  "dependencies": {
    "@tinkoff/user-agent": "0.0.0-stub",
    "@tramvai/safe-strings": "0.0.0-stub",
    "@tramvai/tokens-common": "0.0.0-stub",
    "@tramvai/tokens-cookie": "0.0.0-stub",
    "@tramvai/tokens-render": "0.0.0-stub"
  },
  "peerDependencies": {
    "@tinkoff/dippy": "^1.0.0",
    "@tramvai/core": "0.0.0-stub",
    "@tramvai/module-client-hints": "0.0.0-stub",
    "@tramvai/react": "0.0.0-stub",
    "@tramvai/tokens-core": "0.0.0-stub",
    "react": ">=16.14.0",
    "tslib": "^2.4.0"
  },
  "license": "Apache-2.0"
}
```

`packages/modules/outdated-browser/project.json`:

```json
{
  "name": "@tramvai/module-outdated-browser",
  "sourceRoot": "packages/modules/outdated-browser/src",
  "projectType": "library",
  "targets": {
    "build-publish": {
      "outputs": [
        "packages/modules/outdated-browser/package.json",
        "packages/modules/outdated-browser/lib"
      ],
      "executor": "@tramvai/nx-plugin:build"
    }
  }
}
```

`packages/modules/outdated-browser/tsconfig.json`:

```json
{
  "extends": "../../../tsconfig.lib.json",
  "include": ["./src"],
  "compilerOptions": {
    "outDir": "./lib",
    "declarationDir": "./lib",
    "rootDir": "./src",
    "strict": true
  },
  "references": [
    { "path": "../../tramvai/core" },
    { "path": "../../tramvai/react" },
    { "path": "../../tokens/common" },
    { "path": "../../tokens/cookie" },
    { "path": "../../tokens/core" },
    { "path": "../../tokens/render" },
    { "path": "../../libs/safe-strings" },
    { "path": "../../libs/user-agent" },
    { "path": "../client-hints" }
  ]
}
```

`packages/modules/outdated-browser/jest.config.js`:

```js
module.exports = {
  preset: '@tramvai/test-unit-jest',
  rootDir: __dirname,
};
```

- [ ] **Step 2: Написать `src/constants.ts`**

```ts
export const BANNER_CLASS = 'tramvai-outdated-browser';
export const TEXT_CLASS = 'tramvai-outdated-browser__text';
export const LINK_CLASS = 'tramvai-outdated-browser__link';
export const CLOSE_CLASS = 'tramvai-outdated-browser__close';
export const CHECKBOX_CLASS = 'tramvai-outdated-browser__checkbox';
export const CHECKBOX_ID = 'tramvai-outdated-browser-hide';
export const DETECTED_CLASS = 'tramvai-outdated-browser-detected';
export const GLOBAL_FLAG = '__TRAMVAI_OUTDATED_BROWSER__';

export const DEFAULT_COOKIE_NAME = 'tramvai_outdated_browser_hidden';
export const DEFAULT_COOKIE_MAX_AGE = 2592000;
export const DEFAULT_Z_INDEX = 2147483000;

/**
 * Строка ES3-выражения. Истина означает, что браузер не проходит проверку.
 * Синтаксис намеренно примитивный, выражение исполняется в самом старом браузере.
 */
export const DEFAULT_FEATURE_DETECT_CONDITION =
  "!(('Promise' in window)&&('fetch' in window)&&('assign' in Object)&&('from' in Array)&&('IntersectionObserver' in window))";
```

- [ ] **Step 3: Написать `src/tokens.ts`**

```ts
import { createToken, Scope } from '@tinkoff/dippy';

export type FeatureDetectMode = 'unknown-only' | 'always' | 'off';

export interface OutdatedBrowserOptions {
  /** Явный browserslist. По умолчанию берётся конфиг приложения. */
  browserslist?: string[];
  /** Окружение browserslist, по умолчанию `defaults`. */
  env?: string;
  /** Режим второго слоя детекта, по умолчанию `unknown-only`. */
  featureDetect?: FeatureDetectMode;
  /** ES3-выражение, истина означает устаревший браузер. */
  featureDetectCondition?: string;
  cookieName?: string;
  /** Время жизни cookie скрытия в секундах, по умолчанию 30 дней. */
  cookieMaxAge?: number;
  zIndex?: number;
  /** Дополнять ли заголовок Vary. По умолчанию true. */
  vary?: boolean;
}

export interface OutdatedBrowserContent {
  message: string;
  linkText: string;
  linkHref: string;
  closeLabel: string;
}

export interface OutdatedBrowserRenderPayload {
  content: OutdatedBrowserContent;
  className: string | null;
}

export const OUTDATED_BROWSER_OPTIONS_TOKEN = createToken<OutdatedBrowserOptions>(
  'outdatedBrowser options',
  { scope: Scope.SINGLETON }
);

export const OUTDATED_BROWSER_CONTENT_TOKEN = createToken<OutdatedBrowserContent>(
  'outdatedBrowser content'
);

export const OUTDATED_BROWSER_CLASSNAME_TOKEN = createToken<string>('outdatedBrowser className');

export const OUTDATED_BROWSER_EXTRA_CSS_TOKEN = createToken<string>('outdatedBrowser extra css', {
  multi: true,
});

export const OUTDATED_BROWSER_RENDER_TOKEN =
  createToken<(payload: OutdatedBrowserRenderPayload) => string>('outdatedBrowser render');

export const IS_OUTDATED_BROWSER_TOKEN = createToken<boolean>('isOutdatedBrowser');
```

- [ ] **Step 4: Написать падающий тест `src/shared/detect.spec.ts`**

```ts
import { detectBrowserSupport } from './detect';

const CHROME_60 =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36';
const CHROME_120 =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

describe('detectBrowserSupport', () => {
  it('reports outdated for a browser below the browserslist threshold', () => {
    expect(detectBrowserSupport(CHROME_60, { browserslist: ['chrome >= 90'] })).toBe('outdated');
  });

  it('reports modern for a browser above the browserslist threshold', () => {
    expect(detectBrowserSupport(CHROME_120, { browserslist: ['chrome >= 90'] })).toBe('modern');
  });

  it('reports unknown when there is no user agent', () => {
    expect(detectBrowserSupport(null, { browserslist: ['chrome >= 90'] })).toBe('unknown');
  });

  it('reports unknown when the user agent cannot be recognised', () => {
    expect(detectBrowserSupport('CustomCrawler/1.0', { browserslist: ['chrome >= 90'] })).toBe(
      'unknown'
    );
  });

  it('reports unknown when the browser is absent from the browserslist', () => {
    expect(detectBrowserSupport(CHROME_120, { browserslist: ['firefox >= 90'] })).toBe('unknown');
  });
});
```

- [ ] **Step 5: Запустить тест и убедиться, что он падает**

Run: `yarn jest --config packages/modules/outdated-browser/jest.config.js detect`
Expected: FAIL, модуль `./detect` не найден.

- [ ] **Step 6: Написать `src/shared/detect.ts`**

```ts
import { isBrowserSatisfiesRequirements } from '@tinkoff/user-agent';
import type { UserAgent } from '@tinkoff/user-agent';

export type BrowserSupportStatus = 'outdated' | 'modern' | 'unknown';

export interface DetectOptions {
  browserslist?: string[];
  env?: string;
}

/**
 * `isBrowserSatisfiesRequirements` возвращает null, когда браузер не найден в browserslist.
 * `forceMinimumUnknownVersions` в исходниках библиотеки описан как режим для детекта старых браузеров.
 */
export const detectBrowserSupport = (
  userAgent: UserAgent | string | null | undefined,
  { browserslist, env }: DetectOptions = {}
): BrowserSupportStatus => {
  if (!userAgent) {
    return 'unknown';
  }

  let satisfies: boolean | null;

  try {
    satisfies = isBrowserSatisfiesRequirements(userAgent, browserslist, {
      env,
      forceMinimumUnknownVersions: true,
    });
  } catch (error) {
    return 'unknown';
  }

  if (satisfies === null) {
    return 'unknown';
  }

  return satisfies ? 'modern' : 'outdated';
};
```

- [ ] **Step 7: Запустить тест и убедиться, что он проходит**

Run: `yarn jest --config packages/modules/outdated-browser/jest.config.js detect`
Expected: PASS, пять тестов.

- [ ] **Step 8: Прописать ссылки TypeScript и собрать пакет**

Run: `yarn references && yarn build`
Expected: сборка проходит без ошибок.

- [ ] **Step 9: Коммит**

```bash
git add packages/modules/outdated-browser tsconfig.solution.json
git commit -m "feat(outdated-browser): add package scaffolding, tokens and browser support detection"
```

---

### Task 2: Санитайзеры ссылки и имени cookie

**Files:**
- Create: `packages/modules/outdated-browser/src/server/sanitize.ts`
- Test: `packages/modules/outdated-browser/src/server/sanitize.spec.ts`

**Interfaces:**
- Consumes: ничего из предыдущих задач.
- Produces: `sanitizeHref(href: string | null | undefined) => string | null` и `isValidCookieName(name: string) => boolean`.

- [ ] **Step 1: Написать падающий тест `src/server/sanitize.spec.ts`**

```ts
import { isValidCookieName, sanitizeHref } from './sanitize';

describe('sanitizeHref', () => {
  it.each([
    ['https://example.com/update', 'https://example.com/update'],
    ['http://example.com/update', 'http://example.com/update'],
    ['//cdn.example.com/update', '//cdn.example.com/update'],
    ['/update-browser', '/update-browser'],
    ['update-browser', 'update-browser'],
    ['  https://example.com  ', 'https://example.com'],
  ])('keeps a safe href %s', (input, expected) => {
    expect(sanitizeHref(input)).toBe(expected);
  });

  it.each([
    'javascript:alert(1)',
    'JaVaScRiPt:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'vbscript:msgbox(1)',
    'java\nscript:alert(1)',
    '',
    '   ',
  ])('rejects an unsafe href %s', (input) => {
    expect(sanitizeHref(input)).toBeNull();
  });

  it('rejects a missing href', () => {
    expect(sanitizeHref(undefined)).toBeNull();
    expect(sanitizeHref(null)).toBeNull();
  });
});

describe('isValidCookieName', () => {
  it('accepts an RFC 6265 token', () => {
    expect(isValidCookieName('tramvai_outdated_browser_hidden')).toBe(true);
  });

  it.each(['name with space', 'name;drop', 'name"quote', 'name=value', ''])(
    'rejects %s',
    (input) => {
      expect(isValidCookieName(input)).toBe(false);
    }
  );
});
```

- [ ] **Step 2: Запустить тест и убедиться, что он падает**

Run: `yarn jest --config packages/modules/outdated-browser/jest.config.js sanitize`
Expected: FAIL, модуль `./sanitize` не найден.

- [ ] **Step 3: Написать `src/server/sanitize.ts`**

```ts
const ABSOLUTE_SCHEME = /^([a-z][a-z0-9+.\-]*):/i;
const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/;
const COOKIE_NAME = /^[A-Za-z0-9!#$%&'*+\-.^_`|~]+$/;

/**
 * Экранирования недостаточно: `javascript:alert(1)` не содержит символов,
 * которые экранирует encodeForHTMLContext, поэтому схема проверяется отдельно.
 */
export const sanitizeHref = (href: string | null | undefined): string | null => {
  if (typeof href !== 'string') {
    return null;
  }

  const trimmed = href.trim();

  if (!trimmed) {
    return null;
  }

  // управляющие символы позволяют протащить схему мимо проверки
  if (CONTROL_CHARACTERS.test(trimmed)) {
    return null;
  }

  const match = ABSOLUTE_SCHEME.exec(trimmed);

  if (!match) {
    // относительный или протокол-относительный адрес
    return trimmed;
  }

  const scheme = match[1].toLowerCase();

  return scheme === 'http' || scheme === 'https' ? trimmed : null;
};

export const isValidCookieName = (name: string): boolean => {
  return typeof name === 'string' && COOKIE_NAME.test(name);
};
```

- [ ] **Step 4: Запустить тест и убедиться, что он проходит**

Run: `yarn jest --config packages/modules/outdated-browser/jest.config.js sanitize`
Expected: PASS.

- [ ] **Step 5: Коммит**

```bash
git add packages/modules/outdated-browser/src/server
git commit -m "feat(outdated-browser): add href and cookie name sanitizers"
```

---

### Task 3: Сборка HTML баннера

**Files:**
- Create: `packages/modules/outdated-browser/src/server/banner.ts`
- Test: `packages/modules/outdated-browser/src/server/banner.spec.ts`

**Interfaces:**
- Consumes: `sanitizeHref` из Task 2, константы из Task 1, тип `OutdatedBrowserRenderPayload` из Task 1.
- Produces: `renderBannerHtml(payload: OutdatedBrowserRenderPayload) => string`.

Кнопка закрытия это `label`, привязанный к скрытому чекбоксу, который стоит перед баннером как соседний элемент. Это единственный способ скрыть баннер без JavaScript. `label` идёт первым внутри баннера, потому что при `float: right` элемент, стоящий после текста, сваливается на следующую строку.

- [ ] **Step 1: Написать падающий тест `src/server/banner.spec.ts`**

```ts
import { BANNER_CLASS, CHECKBOX_ID, LINK_CLASS } from '../constants';
import { renderBannerHtml } from './banner';

const content = {
  message: 'Your browser is out of date',
  linkText: 'How to update',
  linkHref: 'https://example.com/update',
  closeLabel: 'Hide',
};

describe('renderBannerHtml', () => {
  it('renders a checkbox that precedes the banner as a sibling', () => {
    const html = renderBannerHtml({ content, className: null });

    expect(html.indexOf('id="' + CHECKBOX_ID + '"')).toBeLessThan(
      html.indexOf('class="' + BANNER_CLASS + '"')
    );
  });

  it('renders the close label before the text so that the float does not wrap', () => {
    const html = renderBannerHtml({ content, className: null });

    expect(html.indexOf('for="' + CHECKBOX_ID + '"')).toBeLessThan(html.indexOf(content.message));
  });

  it('renders the message and the link', () => {
    const html = renderBannerHtml({ content, className: null });

    expect(html).toContain('Your browser is out of date');
    expect(html).toContain('href="https://example.com/update"');
    expect(html).toContain('How to update');
  });

  it('appends a custom class name to the banner root', () => {
    const html = renderBannerHtml({ content, className: 'my-banner' });

    expect(html).toContain('class="' + BANNER_CLASS + ' my-banner"');
  });

  it('escapes html in the content', () => {
    const html = renderBannerHtml({
      content: { ...content, message: '<img src=x onerror=alert(1)>' },
      className: null,
    });

    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;img');
  });

  it('drops the link when the href scheme is not safe', () => {
    const html = renderBannerHtml({
      content: { ...content, linkHref: 'javascript:alert(1)' },
      className: null,
    });

    expect(html).not.toContain(LINK_CLASS);
    expect(html).toContain('Your browser is out of date');
  });

  it('contains no javascript', () => {
    const html = renderBannerHtml({ content, className: null });

    expect(html).not.toContain('<script');
    expect(html).not.toContain('onclick');
  });
});
```

- [ ] **Step 2: Запустить тест и убедиться, что он падает**

Run: `yarn jest --config packages/modules/outdated-browser/jest.config.js banner`
Expected: FAIL, модуль `./banner` не найден.

- [ ] **Step 3: Написать `src/server/banner.ts`**

```ts
import { encodeForHTMLContext } from '@tramvai/safe-strings';
import {
  BANNER_CLASS,
  CHECKBOX_CLASS,
  CHECKBOX_ID,
  CLOSE_CLASS,
  LINK_CLASS,
  TEXT_CLASS,
} from '../constants';
import type { OutdatedBrowserRenderPayload } from '../tokens';
import { sanitizeHref } from './sanitize';

export const renderBannerHtml = ({ content, className }: OutdatedBrowserRenderPayload): string => {
  const message = encodeForHTMLContext(content.message);
  const closeLabel = encodeForHTMLContext(content.closeLabel);
  const href = sanitizeHref(content.linkHref);
  const rootClass = className
    ? BANNER_CLASS + ' ' + encodeForHTMLContext(className)
    : BANNER_CLASS;

  const link = href
    ? '<a class="' +
      LINK_CLASS +
      '" href="' +
      encodeForHTMLContext(href) +
      '" rel="noopener noreferrer">' +
      encodeForHTMLContext(content.linkText) +
      '</a>'
    : '';

  return (
    '<input type="checkbox" id="' +
    CHECKBOX_ID +
    '" class="' +
    CHECKBOX_CLASS +
    '" aria-hidden="true" tabindex="-1">' +
    '<div class="' +
    rootClass +
    '" role="alert">' +
    '<label class="' +
    CLOSE_CLASS +
    '" for="' +
    CHECKBOX_ID +
    '" title="' +
    closeLabel +
    '" aria-label="' +
    closeLabel +
    '">&#215;</label>' +
    '<span class="' +
    TEXT_CLASS +
    '">' +
    message +
    '</span>' +
    link +
    '</div>'
  );
};
```

- [ ] **Step 4: Запустить тест и убедиться, что он проходит**

Run: `yarn jest --config packages/modules/outdated-browser/jest.config.js banner`
Expected: PASS, семь тестов.

- [ ] **Step 5: Коммит**

```bash
git add packages/modules/outdated-browser/src/server
git commit -m "feat(outdated-browser): render banner markup with a css-only dismiss control"
```

---

### Task 4: Сборка CSS баннера

**Files:**
- Create: `packages/modules/outdated-browser/src/server/styles.ts`
- Test: `packages/modules/outdated-browser/src/server/styles.spec.ts`

**Interfaces:**
- Consumes: константы из Task 1.
- Produces: `buildBannerCss(options: BuildBannerCssOptions) => string`, где `BuildBannerCssOptions = { zIndex: number; hiddenByDefault: boolean; extraCss?: string[] }`.

Правило скрытия `.checkbox:checked ~ .banner` имеет специфичность 0-3-0 и выигрывает у правила показа `.detected .banner` со специфичностью 0-2-0, поэтому кнопка закрытия работает и в режиме фича-детекта. Дополнительно правило скрытия ставится последним.

- [ ] **Step 1: Написать падающий тест `src/server/styles.spec.ts`**

```ts
import { BANNER_CLASS, CHECKBOX_CLASS, DETECTED_CLASS } from '../constants';
import { buildBannerCss } from './styles';

describe('buildBannerCss', () => {
  it('keeps the banner in the normal flow and paints it above fixed layouts', () => {
    const css = buildBannerCss({ zIndex: 500, hiddenByDefault: false });

    expect(css).toContain('position:relative');
    expect(css).toContain('z-index:500');
    expect(css).not.toContain('position:fixed');
  });

  it('hides the banner by default and shows it under the detected class', () => {
    const css = buildBannerCss({ zIndex: 500, hiddenByDefault: true });

    expect(css).toContain('.' + BANNER_CLASS + '{display:none}');
    expect(css).toContain('.' + DETECTED_CLASS + ' .' + BANNER_CLASS + '{display:block}');
  });

  it('does not hide the banner when it is rendered visible', () => {
    const css = buildBannerCss({ zIndex: 500, hiddenByDefault: false });

    expect(css).not.toContain('.' + BANNER_CLASS + '{display:none}');
  });

  it('puts the dismiss rule last so that it wins over the detected rule', () => {
    const css = buildBannerCss({ zIndex: 500, hiddenByDefault: true });
    const dismissRule = '.' + CHECKBOX_CLASS + ':checked~.' + BANNER_CLASS + '{display:none}';

    expect(css).toContain(dismissRule);
    expect(css.indexOf(dismissRule)).toBeGreaterThan(css.indexOf(DETECTED_CLASS));
  });

  it('appends application css at the very end', () => {
    const css = buildBannerCss({
      zIndex: 500,
      hiddenByDefault: false,
      extraCss: ['.my-header{top:48px}'],
    });

    expect(css.endsWith('.my-header{top:48px}')).toBe(true);
  });

  it('uses no css features that break in old browsers', () => {
    const css = buildBannerCss({ zIndex: 500, hiddenByDefault: true });

    expect(css).not.toContain('flex');
    expect(css).not.toContain('grid');
    expect(css).not.toContain('var(--');
    expect(css).not.toContain('gap:');
  });
});
```

- [ ] **Step 2: Запустить тест и убедиться, что он падает**

Run: `yarn jest --config packages/modules/outdated-browser/jest.config.js styles`
Expected: FAIL, модуль `./styles` не найден.

- [ ] **Step 3: Написать `src/server/styles.ts`**

```ts
import {
  BANNER_CLASS,
  CHECKBOX_CLASS,
  CLOSE_CLASS,
  DETECTED_CLASS,
  LINK_CLASS,
  TEXT_CLASS,
} from '../constants';

export interface BuildBannerCssOptions {
  zIndex: number;
  hiddenByDefault: boolean;
  extraCss?: string[];
}

export const buildBannerCss = ({
  zIndex,
  hiddenByDefault,
  extraCss = [],
}: BuildBannerCssOptions): string => {
  const base =
    '.' +
    CHECKBOX_CLASS +
    '{position:absolute;width:1px;height:1px;margin:-1px;padding:0;border:0;overflow:hidden;clip:rect(0 0 0 0)}' +
    '.' +
    BANNER_CLASS +
    '{position:relative;z-index:' +
    zIndex +
    ';box-sizing:border-box;margin:0;padding:12px 16px;background:#fff4d5;color:#3b3222;' +
    'border-bottom:1px solid #e5d9b4;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;' +
    'font-size:14px;line-height:1.4;text-align:left}' +
    '.' +
    CLOSE_CLASS +
    '{float:right;margin-left:16px;padding:0 4px;font-size:18px;line-height:1.2;color:inherit;cursor:pointer}' +
    '.' +
    TEXT_CLASS +
    '{display:inline}' +
    '.' +
    LINK_CLASS +
    '{margin-left:8px;color:#1a56b0;text-decoration:underline}';

  const visibility = hiddenByDefault
    ? '.' +
      BANNER_CLASS +
      '{display:none}' +
      '.' +
      DETECTED_CLASS +
      ' .' +
      BANNER_CLASS +
      '{display:block}'
    : '';

  // ставится последним, чтобы выигрывать у правила показа и по порядку, и по специфичности
  const dismiss = '.' + CHECKBOX_CLASS + ':checked~.' + BANNER_CLASS + '{display:none}';

  return base + visibility + dismiss + extraCss.join('');
};
```

- [ ] **Step 4: Запустить тест и убедиться, что он проходит**

Run: `yarn jest --config packages/modules/outdated-browser/jest.config.js styles`
Expected: PASS, шесть тестов.

- [ ] **Step 5: Коммит**

```bash
git add packages/modules/outdated-browser/src/server
git commit -m "feat(outdated-browser): build inline banner css compatible with old browsers"
```

---

### Task 5: Инлайновые ES3-скрипты

**Files:**
- Create: `packages/modules/outdated-browser/src/server/inlineScripts.ts`
- Test: `packages/modules/outdated-browser/src/server/inlineScripts.spec.ts`

**Interfaces:**
- Consumes: константы из Task 1.
- Produces: `buildFlagScript() => string`, `buildFeatureDetectScript(condition: string) => string`, `buildDismissScript(params: { cookieName: string; cookieMaxAge: number; expires: string }) => string`.

Скрипты собираются конкатенацией строк, а не через `toString` от функции, потому что транспайлер настроен на цели сборки приложения и может оставить синтаксис, который не распарсится в целевом старом браузере.

- [ ] **Step 1: Написать падающий тест `src/server/inlineScripts.spec.ts`**

```ts
import { CHECKBOX_ID, DETECTED_CLASS, GLOBAL_FLAG } from '../constants';
import { buildDismissScript, buildFeatureDetectScript, buildFlagScript } from './inlineScripts';

const MODERN_SYNTAX = [/=>/, /`/, /\bconst\b/, /\blet\b/, /\?\./, /\.\.\./];

const expectEs3 = (source: string) => {
  MODERN_SYNTAX.forEach((pattern) => {
    expect(source).not.toMatch(pattern);
  });
};

describe('buildFlagScript', () => {
  it('sets the global flag', () => {
    expect(buildFlagScript()).toBe('window.' + GLOBAL_FLAG + '=1;');
  });
});

describe('buildFeatureDetectScript', () => {
  const script = buildFeatureDetectScript('window.__TEST__');

  it('embeds the condition', () => {
    expect(script).toContain('if(window.__TEST__)');
  });

  it('sets the flag and the class on the document element', () => {
    expect(script).toContain('window.' + GLOBAL_FLAG + '=1');
    expect(script).toContain(DETECTED_CLASS);
    expect(script).toContain('document.documentElement');
  });

  it('swallows its own errors so that it cannot break the page', () => {
    expect(script).toContain('try{');
    expect(script).toContain('catch');
  });

  it('uses only es3 syntax', () => {
    expectEs3(script);
  });

  it('adds the detected class before the first paint by preserving existing classes', () => {
    // eslint-disable-next-line no-new-func
    const run = new Function(
      'window',
      'document',
      buildFeatureDetectScript('true')
    ) as (w: Record<string, unknown>, d: { documentElement: { className: string } }) => void;
    const win: Record<string, unknown> = {};
    const doc = { documentElement: { className: 'existing' } };

    run(win, doc);

    expect(doc.documentElement.className).toBe('existing ' + DETECTED_CLASS);
    expect(win[GLOBAL_FLAG]).toBe(1);
  });
});

describe('buildDismissScript', () => {
  const script = buildDismissScript({
    cookieName: 'ob_hidden',
    cookieMaxAge: 60,
    expires: 'Thu, 09 Oct 2026 00:00:00 GMT',
  });

  it('binds to the dismiss checkbox', () => {
    expect(script).toContain(CHECKBOX_ID);
    expect(script).toContain('addEventListener');
    expect(script).toContain('attachEvent');
  });

  it('writes the cookie with both max-age and expires', () => {
    expect(script).toContain('ob_hidden=1');
    expect(script).toContain('max-age=60');
    expect(script).toContain('expires=Thu, 09 Oct 2026 00:00:00 GMT');
    expect(script).toContain('path=/');
  });

  it('uses only es3 syntax', () => {
    expectEs3(script);
  });
});
```

- [ ] **Step 2: Запустить тест и убедиться, что он падает**

Run: `yarn jest --config packages/modules/outdated-browser/jest.config.js inlineScripts`
Expected: FAIL, модуль `./inlineScripts` не найден.

- [ ] **Step 3: Написать `src/server/inlineScripts.ts`**

```ts
import { CHECKBOX_ID, DETECTED_CLASS, GLOBAL_FLAG } from '../constants';

export interface DismissScriptParams {
  cookieName: string;
  cookieMaxAge: number;
  /** Значение атрибута expires, уже приведённое к UTC-строке. */
  expires: string;
}

export const buildFlagScript = (): string => {
  return 'window.' + GLOBAL_FLAG + '=1;';
};

/**
 * Синхронный скрипт для head. Выполняется до первой отрисовки, поэтому снятие
 * скрытия баннера не сдвигает контент и не даёт CLS.
 */
export const buildFeatureDetectScript = (condition: string): string => {
  return (
    '(function(){try{if(' +
    condition +
    '){window.' +
    GLOBAL_FLAG +
    '=1;var d=document.documentElement;' +
    'd.className=d.className?d.className+" ' +
    DETECTED_CLASS +
    '":"' +
    DETECTED_CLASS +
    '";}}catch(e){}})();'
  );
};

/**
 * Ставится в конец body, потому что ему нужен уже существующий в DOM чекбокс.
 * Само скрытие работает на CSS и не зависит от этого скрипта.
 */
export const buildDismissScript = ({
  cookieName,
  cookieMaxAge,
  expires,
}: DismissScriptParams): string => {
  return (
    '(function(){try{var e=document.getElementById("' +
    CHECKBOX_ID +
    '");if(!e){return;}var h=function(){if(e.checked){document.cookie="' +
    cookieName +
    '=1;path=/;max-age=' +
    cookieMaxAge +
    ';expires=' +
    expires +
    '";}};if(e.addEventListener){e.addEventListener("change",h,false);}' +
    'else if(e.attachEvent){e.attachEvent("onchange",h);}}catch(t){}})();'
  );
};
```

- [ ] **Step 4: Запустить тест и убедиться, что он проходит**

Run: `yarn jest --config packages/modules/outdated-browser/jest.config.js inlineScripts`
Expected: PASS, девять тестов.

- [ ] **Step 5: Коммит**

```bash
git add packages/modules/outdated-browser/src/server
git commit -m "feat(outdated-browser): build es3 inline scripts for feature detect and dismiss"
```

---

### Task 6: Вычисление состояния запроса

**Files:**
- Create: `packages/modules/outdated-browser/src/private-tokens.ts`
- Create: `packages/modules/outdated-browser/src/server/state.ts`
- Test: `packages/modules/outdated-browser/src/server/state.spec.ts`

**Interfaces:**
- Consumes: `detectBrowserSupport` из Task 1, `isValidCookieName` из Task 2, константы и типы из Task 1.
- Produces: `computeState(params) => OutdatedBrowserState` и токен `OUTDATED_BROWSER_STATE_TOKEN`. Поля состояния: `status`, `isOutdated`, `dismissed`, `renderBanner`, `bannerHiddenByDefault`, `emitFeatureDetectScript`, `emitFlagScript`, `cookieName`, `cookieMaxAge`, `featureDetectCondition`, `zIndex`.

Это ядро логики модуля. Скрипт фича-детекта отправляется даже тому, кто уже скрыл баннер, потому что флаг «браузер устарел» должен оставаться корректным для React. Разметка и CSS в этом случае не отправляются.

- [ ] **Step 1: Написать падающий тест `src/server/state.spec.ts`**

```ts
import { DEFAULT_COOKIE_NAME, DEFAULT_Z_INDEX } from '../constants';
import { computeState } from './state';

const CHROME_60 =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36';
const CHROME_120 =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const UNKNOWN = 'CustomCrawler/1.0';

const build = (userAgent: string | null, cookies = {}, options = {}) =>
  computeState({
    userAgent,
    cookies,
    options: { browserslist: ['chrome >= 90'], ...options },
  });

describe('computeState', () => {
  it('renders a visible banner for an outdated browser', () => {
    const state = build(CHROME_60);

    expect(state.status).toBe('outdated');
    expect(state.isOutdated).toBe(true);
    expect(state.renderBanner).toBe(true);
    expect(state.bannerHiddenByDefault).toBe(false);
    expect(state.emitFlagScript).toBe(true);
    expect(state.emitFeatureDetectScript).toBe(false);
  });

  it('sends nothing at all for a modern browser', () => {
    const state = build(CHROME_120);

    expect(state.status).toBe('modern');
    expect(state.isOutdated).toBe(false);
    expect(state.renderBanner).toBe(false);
    expect(state.emitFlagScript).toBe(false);
    expect(state.emitFeatureDetectScript).toBe(false);
  });

  it('sends a hidden banner and a feature detect script for an unknown user agent', () => {
    const state = build(UNKNOWN);

    expect(state.status).toBe('unknown');
    expect(state.isOutdated).toBe(false);
    expect(state.renderBanner).toBe(true);
    expect(state.bannerHiddenByDefault).toBe(true);
    expect(state.emitFeatureDetectScript).toBe(true);
  });

  it('sends a hidden banner to every browser when featureDetect is always', () => {
    const state = build(CHROME_120, {}, { featureDetect: 'always' });

    expect(state.renderBanner).toBe(true);
    expect(state.bannerHiddenByDefault).toBe(true);
    expect(state.emitFeatureDetectScript).toBe(true);
  });

  it('sends nothing for an unknown user agent when featureDetect is off', () => {
    const state = build(UNKNOWN, {}, { featureDetect: 'off' });

    expect(state.renderBanner).toBe(false);
    expect(state.emitFeatureDetectScript).toBe(false);
  });

  it('skips the banner when the dismiss cookie is set', () => {
    const state = build(CHROME_60, { [DEFAULT_COOKIE_NAME]: '1' });

    expect(state.dismissed).toBe(true);
    expect(state.renderBanner).toBe(false);
    expect(state.isOutdated).toBe(true);
  });

  it('still reports the flag to react when the banner is dismissed', () => {
    const state = build(UNKNOWN, { [DEFAULT_COOKIE_NAME]: '1' });

    expect(state.renderBanner).toBe(false);
    expect(state.emitFeatureDetectScript).toBe(true);
  });

  it('reads the dismiss cookie under a custom name', () => {
    const state = build(CHROME_60, { my_cookie: '1' }, { cookieName: 'my_cookie' });

    expect(state.cookieName).toBe('my_cookie');
    expect(state.dismissed).toBe(true);
  });

  it('falls back to the default cookie name when the configured one is not a valid token', () => {
    const state = build(CHROME_60, {}, { cookieName: 'bad name;' });

    expect(state.cookieName).toBe(DEFAULT_COOKIE_NAME);
  });

  it('applies the default z-index', () => {
    expect(build(CHROME_60).zIndex).toBe(DEFAULT_Z_INDEX);
  });
});
```

- [ ] **Step 2: Запустить тест и убедиться, что он падает**

Run: `yarn jest --config packages/modules/outdated-browser/jest.config.js state`
Expected: FAIL, модуль `./state` не найден.

- [ ] **Step 3: Написать `src/server/state.ts`**

```ts
import type { UserAgent } from '@tinkoff/user-agent';
import {
  DEFAULT_COOKIE_MAX_AGE,
  DEFAULT_COOKIE_NAME,
  DEFAULT_FEATURE_DETECT_CONDITION,
  DEFAULT_Z_INDEX,
} from '../constants';
import type { OutdatedBrowserOptions } from '../tokens';
import type { BrowserSupportStatus } from '../shared/detect';
import { detectBrowserSupport } from '../shared/detect';
import { isValidCookieName } from './sanitize';

export interface OutdatedBrowserState {
  status: BrowserSupportStatus;
  isOutdated: boolean;
  dismissed: boolean;
  renderBanner: boolean;
  bannerHiddenByDefault: boolean;
  emitFeatureDetectScript: boolean;
  emitFlagScript: boolean;
  cookieName: string;
  cookieMaxAge: number;
  featureDetectCondition: string;
  zIndex: number;
}

export interface ComputeStateParams {
  userAgent: UserAgent | string | null | undefined;
  cookies: Record<string, string | undefined>;
  options: OutdatedBrowserOptions;
}

export const computeState = ({
  userAgent,
  cookies,
  options,
}: ComputeStateParams): OutdatedBrowserState => {
  const featureDetect = options.featureDetect ?? 'unknown-only';
  const cookieName =
    options.cookieName && isValidCookieName(options.cookieName)
      ? options.cookieName
      : DEFAULT_COOKIE_NAME;
  const cookieMaxAge = options.cookieMaxAge ?? DEFAULT_COOKIE_MAX_AGE;

  const status = detectBrowserSupport(userAgent, {
    browserslist: options.browserslist,
    env: options.env,
  });

  const dismissed = cookies[cookieName] === '1';
  const featureDetectActive =
    featureDetect === 'always' || (featureDetect === 'unknown-only' && status === 'unknown');

  return {
    status,
    isOutdated: status === 'outdated',
    dismissed,
    renderBanner: !dismissed && (status === 'outdated' || featureDetectActive),
    bannerHiddenByDefault: status !== 'outdated',
    // отправляется даже скрывшему баннер, чтобы флаг для react остался корректным
    emitFeatureDetectScript: featureDetectActive,
    emitFlagScript: status === 'outdated',
    cookieName,
    cookieMaxAge,
    featureDetectCondition: options.featureDetectCondition ?? DEFAULT_FEATURE_DETECT_CONDITION,
    zIndex: options.zIndex ?? DEFAULT_Z_INDEX,
  };
};
```

- [ ] **Step 4: Написать `src/private-tokens.ts`**

```ts
import { createToken, Scope } from '@tinkoff/dippy';
import type { OutdatedBrowserState } from './server/state';

export const OUTDATED_BROWSER_STATE_TOKEN = createToken<OutdatedBrowserState>(
  'outdatedBrowser state',
  { scope: Scope.REQUEST }
);
```

- [ ] **Step 5: Запустить тест и убедиться, что он проходит**

Run: `yarn jest --config packages/modules/outdated-browser/jest.config.js state`
Expected: PASS, десять тестов.

- [ ] **Step 6: Коммит**

```bash
git add packages/modules/outdated-browser/src
git commit -m "feat(outdated-browser): compute per-request banner state"
```

---

### Task 7: Токен части ключа кэша и его учёт в page-render-mode

**Files:**
- Modify: `packages/tokens/render/src/index.ts`
- Modify: `packages/modules/page-render-mode/src/staticPages.ts:102-109`
- Test: `packages/modules/page-render-mode/src/staticPages.spec.ts`

**Interfaces:**
- Consumes: ничего из предыдущих задач.
- Produces: `RENDER_CACHE_KEY_PART_TOKEN` типа `() => string`, multi, request-скоуп, экспортируется из `@tramvai/tokens-render`. Дефолтная фабрика `STATIC_PAGES_KEY_TOKEN` склеивает части через дефис, пустые части отбрасываются.

Существующий `STATIC_PAGES_KEY_TOKEN` объявлен одиночным провайдером с дефолтом `''`, приложения переопределяют его целиком. Модуль баннера не может его предоставить, не отобрав ключ у приложения, поэтому вводится отдельный multi-токен для вкладов. Токен живёт в пакете токенов, потому что предоставляет его один модуль, а потребляет другой.

- [ ] **Step 1: Написать падающий тест `packages/modules/page-render-mode/src/staticPages.spec.ts`**

```ts
import { provide } from '@tramvai/core';
import { getDiWrapper } from '@tramvai/test-helpers';
import { RENDER_CACHE_KEY_PART_TOKEN } from '@tramvai/tokens-render';
import { STATIC_PAGES_KEY_TOKEN } from './tokens';
import { staticPagesProviders } from './staticPages';

const resolveKey = (parts: string[]) => {
  const { di } = getDiWrapper({
    providers: [
      ...staticPagesProviders,
      ...parts.map((part) =>
        provide({
          provide: RENDER_CACHE_KEY_PART_TOKEN,
          multi: true,
          useFactory: () => () => part,
        })
      ),
    ],
  });

  return di.get(STATIC_PAGES_KEY_TOKEN)();
};

describe('STATIC_PAGES_KEY_TOKEN', () => {
  it('is empty when nothing contributes a part', () => {
    expect(resolveKey([])).toBe('');
  });

  it('uses a single contributed part', () => {
    expect(resolveKey(['ob'])).toBe('ob');
  });

  it('joins several parts with a dash', () => {
    expect(resolveKey(['mobile', 'ob'])).toBe('mobile-ob');
  });

  it('drops empty parts', () => {
    expect(resolveKey(['', 'ob', ''])).toBe('ob');
  });
});
```

Массив `staticPagesProviders` уже экспортируется из `packages/modules/page-render-mode/src/staticPages.ts:58`, дополнительных изменений экспорта не требуется.

- [ ] **Step 2: Запустить тест и убедиться, что он падает**

Run: `yarn jest --config packages/modules/page-render-mode/jest.config.js staticPages`
Expected: FAIL, `RENDER_CACHE_KEY_PART_TOKEN` не экспортируется.

Если у пакета нет `jest.config.js`, создать его по образцу из Task 1 с `rootDir: __dirname`.

- [ ] **Step 3: Добавить токен в `packages/tokens/render/src/index.ts`**

Дописать в конец файла:

```ts
/**
 * @description
 * Part of the rendered page cache key. Modules that make the response depend on
 * the request (for example the outdated browser banner) contribute a part here,
 * and the default static pages cache key joins all of them.
 */
export const RENDER_CACHE_KEY_PART_TOKEN = createToken<() => string>('render cache key part', {
  multi: true,
  scope: Scope.REQUEST,
});
```

`Scope` уже импортирован в этом файле первой строкой импорта из `@tinkoff/dippy`.

- [ ] **Step 4: Заменить провайдер в `packages/modules/page-render-mode/src/staticPages.ts:102-109`**

Было:

```ts
  provide({
    provide: STATIC_PAGES_KEY_TOKEN,
    useFactory: () => {
      return () => {
        return '';
      };
    },
  }),
```

Стало:

```ts
  provide({
    provide: STATIC_PAGES_KEY_TOKEN,
    useFactory: ({ parts }) => {
      return () => {
        if (!parts) {
          return '';
        }

        return parts
          .map((part) => part())
          .filter(Boolean)
          .join('-');
      };
    },
    deps: {
      parts: { token: RENDER_CACHE_KEY_PART_TOKEN, optional: true },
    },
  }),
```

Добавить `RENDER_CACHE_KEY_PART_TOKEN` в существующий импорт из `@tramvai/tokens-render` в этом файле.

- [ ] **Step 5: Запустить тест и убедиться, что он проходит**

Run: `yarn jest --config packages/modules/page-render-mode/jest.config.js staticPages`
Expected: PASS, четыре теста.

- [ ] **Step 6: Коммит**

```bash
git add packages/tokens/render packages/modules/page-render-mode
git commit -m "feat(tokens-render): add RENDER_CACHE_KEY_PART_TOKEN and compose it in static pages cache key"
```

---

### Task 8: Серверные провайдеры и модуль

**Files:**
- Create: `packages/modules/outdated-browser/src/server/providers.ts`
- Create: `packages/modules/outdated-browser/src/server.ts`
- Test: `packages/modules/outdated-browser/src/server/providers.spec.ts`

**Interfaces:**
- Consumes: всё из задач 1 и 3-7.
- Produces: `serverProviders` и `OutdatedBrowserModule`. Модуль регистрирует ресурсы в слотах `head:core-styles`, `head:performance`, `body:start`, `body:end`, дополняет `Vary` и предоставляет часть ключа кэша.

- [ ] **Step 1: Написать падающий тест `src/server/providers.spec.ts`**

```ts
import { provide } from '@tramvai/core';
import { getDiWrapper } from '@tramvai/test-helpers';
import { COOKIE_MANAGER_TOKEN } from '@tramvai/tokens-cookie';
import { RESPONSE_MANAGER_TOKEN } from '@tramvai/tokens-common';
import { RENDER_SLOTS, ResourceSlot, ResourceType } from '@tramvai/tokens-render';
import type { PageResource } from '@tramvai/tokens-render';
import { USER_AGENT_TOKEN } from '@tramvai/module-client-hints';
import { parseUserAgentHeader } from '@tinkoff/user-agent';
import { BANNER_CLASS } from '../constants';
import { IS_OUTDATED_BROWSER_TOKEN, OUTDATED_BROWSER_OPTIONS_TOKEN } from '../tokens';
import { serverProviders } from './providers';

const CHROME_60 =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36';
const CHROME_120 =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const headers: Record<string, string> = {};

const setup = ({ userAgent, cookies = {}, options = {}, extraProviders = [] }: any) => {
  const { di } = getDiWrapper({
    providers: [
      ...serverProviders,
      provide({ provide: USER_AGENT_TOKEN, useValue: parseUserAgentHeader(userAgent) }),
      provide({
        provide: COOKIE_MANAGER_TOKEN,
        useValue: { get: (name: string) => cookies[name], all: () => cookies, set: () => {}, remove: () => {} },
      }),
      provide({
        provide: RESPONSE_MANAGER_TOKEN,
        useValue: {
          getHeader: (key: string) => headers[key],
          getHeaders: () => headers,
          setHeader: (key: string, value: string) => {
            headers[key] = value;
          },
        },
      }),
      provide({
        provide: OUTDATED_BROWSER_OPTIONS_TOKEN,
        useValue: { browserslist: ['chrome >= 90'], ...options },
      }),
      ...extraProviders,
    ],
  });

  const resources: PageResource[] = ([] as PageResource[]).concat(
    ...(di.get({ token: RENDER_SLOTS, multi: true }) as any[])
  );

  return { di, resources };
};

beforeEach(() => {
  Object.keys(headers).forEach((key) => delete headers[key]);
});

describe('outdated browser render slots', () => {
  it('renders markup, styles and scripts for an outdated browser', () => {
    const { resources } = setup({ userAgent: CHROME_60 });

    const markup = resources.find((item) => item.slot === ResourceSlot.BODY_START);
    const styles = resources.find((item) => item.slot === ResourceSlot.HEAD_CORE_STYLES);
    const dismiss = resources.find((item) => item.slot === ResourceSlot.BODY_END);

    expect(markup!.type).toBe(ResourceType.asIs);
    expect(markup!.payload).toContain(BANNER_CLASS);
    expect(styles!.type).toBe(ResourceType.inlineStyle);
    expect(dismiss!.type).toBe(ResourceType.inlineScript);
  });

  it('renders nothing for a modern browser', () => {
    const { resources } = setup({ userAgent: CHROME_120 });

    expect(resources).toHaveLength(0);
  });

  it('renders a hidden banner and a feature detect script for an unknown user agent', () => {
    const { resources } = setup({ userAgent: 'CustomCrawler/1.0' });

    const styles = resources.find((item) => item.slot === ResourceSlot.HEAD_CORE_STYLES);
    const detect = resources.find((item) => item.slot === ResourceSlot.HEAD_PERFORMANCE);

    expect(styles!.payload).toContain('{display:none}');
    expect(detect!.type).toBe(ResourceType.inlineScript);
  });

  it('renders no markup when the banner is dismissed', () => {
    const { resources } = setup({
      userAgent: CHROME_60,
      cookies: { tramvai_outdated_browser_hidden: '1' },
    });

    expect(resources.find((item) => item.slot === ResourceSlot.BODY_START)).toBeUndefined();
  });

  it('exposes the outdated flag through di', () => {
    expect(setup({ userAgent: CHROME_60 }).di.get(IS_OUTDATED_BROWSER_TOKEN)).toBe(true);
    expect(setup({ userAgent: CHROME_120 }).di.get(IS_OUTDATED_BROWSER_TOKEN)).toBe(false);
  });
});
```

- [ ] **Step 2: Запустить тест и убедиться, что он падает**

Run: `yarn jest --config packages/modules/outdated-browser/jest.config.js providers`
Expected: FAIL, модуль `./providers` не найден.

- [ ] **Step 3: Написать `src/server/providers.ts`**

```ts
import { provide } from '@tramvai/core';
import { commandLineListTokens } from '@tramvai/tokens-core';
import { RESPONSE_MANAGER_TOKEN } from '@tramvai/tokens-common';
import { COOKIE_MANAGER_TOKEN } from '@tramvai/tokens-cookie';
import {
  RENDER_CACHE_KEY_PART_TOKEN,
  RENDER_SLOTS,
  ResourceSlot,
  ResourceType,
} from '@tramvai/tokens-render';
import type { PageResource } from '@tramvai/tokens-render';
import { USER_AGENT_TOKEN } from '@tramvai/module-client-hints';
import { OUTDATED_BROWSER_STATE_TOKEN } from '../private-tokens';
import {
  IS_OUTDATED_BROWSER_TOKEN,
  OUTDATED_BROWSER_CLASSNAME_TOKEN,
  OUTDATED_BROWSER_CONTENT_TOKEN,
  OUTDATED_BROWSER_EXTRA_CSS_TOKEN,
  OUTDATED_BROWSER_OPTIONS_TOKEN,
  OUTDATED_BROWSER_RENDER_TOKEN,
} from '../tokens';
import { renderBannerHtml } from './banner';
import { buildDismissScript, buildFeatureDetectScript, buildFlagScript } from './inlineScripts';
import { computeState } from './state';
import { buildBannerCss } from './styles';

const VARY_VALUES = ['User-Agent', 'Cookie'];

export const serverProviders = [
  provide({
    provide: OUTDATED_BROWSER_OPTIONS_TOKEN,
    useValue: {},
  }),
  provide({
    provide: OUTDATED_BROWSER_CONTENT_TOKEN,
    useValue: {
      message: 'Your browser is out of date, some parts of this site may not work correctly.',
      linkText: 'How to update',
      linkHref: 'https://browser-update.org/update-browser.html',
      closeLabel: 'Hide',
    },
  }),
  provide({
    provide: OUTDATED_BROWSER_STATE_TOKEN,
    useFactory: ({ userAgent, cookieManager, options }) => {
      return computeState({
        userAgent,
        cookies: cookieManager.all(),
        options,
      });
    },
    deps: {
      userAgent: { token: USER_AGENT_TOKEN, optional: true },
      cookieManager: COOKIE_MANAGER_TOKEN,
      options: OUTDATED_BROWSER_OPTIONS_TOKEN,
    },
  }),
  provide({
    provide: IS_OUTDATED_BROWSER_TOKEN,
    useFactory: ({ state }) => state.isOutdated,
    deps: { state: OUTDATED_BROWSER_STATE_TOKEN },
  }),
  provide({
    provide: RENDER_SLOTS,
    multi: true,
    useFactory: ({ state, content, className, extraCss, customRender }) => {
      const resources: PageResource[] = [];

      if (state.emitFlagScript) {
        resources.push({
          type: ResourceType.inlineScript,
          slot: ResourceSlot.HEAD_PERFORMANCE,
          payload: buildFlagScript(),
        });
      }

      if (state.emitFeatureDetectScript) {
        resources.push({
          type: ResourceType.inlineScript,
          slot: ResourceSlot.HEAD_PERFORMANCE,
          payload: buildFeatureDetectScript(state.featureDetectCondition),
        });
      }

      if (!state.renderBanner) {
        return resources;
      }

      const payload = { content, className: className ?? null };

      resources.push({
        type: ResourceType.inlineStyle,
        slot: ResourceSlot.HEAD_CORE_STYLES,
        payload: buildBannerCss({
          zIndex: state.zIndex,
          hiddenByDefault: state.bannerHiddenByDefault,
          extraCss: extraCss ?? [],
        }),
      });

      resources.push({
        type: ResourceType.asIs,
        slot: ResourceSlot.BODY_START,
        payload: customRender ? customRender(payload) : renderBannerHtml(payload),
      });

      resources.push({
        type: ResourceType.inlineScript,
        slot: ResourceSlot.BODY_END,
        payload: buildDismissScript({
          cookieName: state.cookieName,
          cookieMaxAge: state.cookieMaxAge,
          expires: new Date(Date.now() + state.cookieMaxAge * 1000).toUTCString(),
        }),
      });

      return resources;
    },
    deps: {
      state: OUTDATED_BROWSER_STATE_TOKEN,
      content: OUTDATED_BROWSER_CONTENT_TOKEN,
      className: { token: OUTDATED_BROWSER_CLASSNAME_TOKEN, optional: true },
      extraCss: { token: OUTDATED_BROWSER_EXTRA_CSS_TOKEN, optional: true },
      customRender: { token: OUTDATED_BROWSER_RENDER_TOKEN, optional: true },
    },
  }),
  provide({
    provide: RENDER_CACHE_KEY_PART_TOKEN,
    multi: true,
    useFactory: ({ state }) => {
      return () => (state.renderBanner ? 'outdated-browser' : '');
    },
    deps: { state: OUTDATED_BROWSER_STATE_TOKEN },
  }),
  provide({
    provide: commandLineListTokens.customerStart,
    multi: true,
    useFactory: ({ options, responseManager }) => {
      return function outdatedBrowserVary() {
        if (options.vary === false) {
          return;
        }

        const current = responseManager.getHeader('Vary');
        const values = (Array.isArray(current) ? current.join(',') : current ?? '')
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);

        VARY_VALUES.forEach((value) => {
          if (!values.some((item) => item.toLowerCase() === value.toLowerCase())) {
            values.push(value);
          }
        });

        responseManager.setHeader('Vary', values.join(', '));
      };
    },
    deps: {
      options: OUTDATED_BROWSER_OPTIONS_TOKEN,
      responseManager: RESPONSE_MANAGER_TOKEN,
    },
  }),
];
```

- [ ] **Step 4: Написать `src/server.ts`**

```ts
import { declareModule } from '@tramvai/core';
import { serverProviders } from './server/providers';

export * from './tokens';
export { useIsOutdatedBrowser } from './react/useIsOutdatedBrowser';

export const OutdatedBrowserModule = declareModule({
  name: 'OutdatedBrowserModule',
  providers: serverProviders,
});
```

Файл `src/react/useIsOutdatedBrowser.ts` создаётся в Task 9. До этого сборка не пройдёт, поэтому реэкспорт хука добавляется тем же коммитом, что и Task 9. На этом шаге строку с реэкспортом хука не добавлять, добавить её в Task 9.

- [ ] **Step 5: Запустить тест и убедиться, что он проходит**

Run: `yarn jest --config packages/modules/outdated-browser/jest.config.js providers`
Expected: PASS, пять тестов.

- [ ] **Step 6: Коммит**

```bash
git add packages/modules/outdated-browser/src
git commit -m "feat(outdated-browser): wire server providers, render slots and vary header"
```

---

### Task 9: Браузерная точка входа и React-хук

**Files:**
- Create: `packages/modules/outdated-browser/src/browser/providers.ts`
- Create: `packages/modules/outdated-browser/src/browser.ts`
- Create: `packages/modules/outdated-browser/src/react/useIsOutdatedBrowser.ts`
- Modify: `packages/modules/outdated-browser/src/server.ts`
- Test: `packages/modules/outdated-browser/src/browser/providers.spec.ts`

**Interfaces:**
- Consumes: `GLOBAL_FLAG` из Task 1, `IS_OUTDATED_BROWSER_TOKEN` из Task 1.
- Produces: `browserProviders`, `OutdatedBrowserModule` из браузерной точки входа, `useIsOutdatedBrowser(): boolean`.

В браузере значение берётся из `window.__TRAMVAI_OUTDATED_BROWSER__`, который выставляют инлайновые скрипты. Отдельная синхронизация состояния не нужна, глобальная переменная переживает SPA-навигации.

- [ ] **Step 1: Написать падающий тест `src/browser/providers.spec.ts`**

```ts
/**
 * @jest-environment jsdom
 */
import { getDiWrapper } from '@tramvai/test-helpers';
import { GLOBAL_FLAG } from '../constants';
import { IS_OUTDATED_BROWSER_TOKEN } from '../tokens';
import { browserProviders } from './providers';

const resolve = () => getDiWrapper({ providers: [...browserProviders] }).di.get(
  IS_OUTDATED_BROWSER_TOKEN
);

describe('browser IS_OUTDATED_BROWSER_TOKEN', () => {
  afterEach(() => {
    delete (window as any)[GLOBAL_FLAG];
  });

  it('is false when the inline scripts did not set the flag', () => {
    expect(resolve()).toBe(false);
  });

  it('is true when the inline scripts set the flag', () => {
    (window as any)[GLOBAL_FLAG] = 1;

    expect(resolve()).toBe(true);
  });
});
```

- [ ] **Step 2: Запустить тест и убедиться, что он падает**

Run: `yarn jest --config packages/modules/outdated-browser/jest.config.js browser`
Expected: FAIL, модуль `./providers` не найден.

- [ ] **Step 3: Написать `src/browser/providers.ts`**

```ts
import { provide } from '@tramvai/core';
import { GLOBAL_FLAG } from '../constants';
import { IS_OUTDATED_BROWSER_TOKEN } from '../tokens';

export const browserProviders = [
  provide({
    provide: IS_OUTDATED_BROWSER_TOKEN,
    useFactory: () => {
      return typeof window !== 'undefined' && Boolean((window as any)[GLOBAL_FLAG]);
    },
  }),
];
```

- [ ] **Step 4: Написать `src/react/useIsOutdatedBrowser.ts`**

```ts
import { useDi } from '@tramvai/react';
import { IS_OUTDATED_BROWSER_TOKEN } from '../tokens';

// объект зависимости вынесен из хука: useDi мемоизирует результат по ссылке на него
const DEP = { token: IS_OUTDATED_BROWSER_TOKEN, optional: true } as const;

export const useIsOutdatedBrowser = (): boolean => {
  return useDi(DEP) ?? false;
};
```

- [ ] **Step 5: Написать `src/browser.ts`**

```ts
import { declareModule } from '@tramvai/core';
import { browserProviders } from './browser/providers';

export * from './tokens';
export { useIsOutdatedBrowser } from './react/useIsOutdatedBrowser';

export const OutdatedBrowserModule = declareModule({
  name: 'OutdatedBrowserModule',
  providers: browserProviders,
});
```

- [ ] **Step 6: Дописать реэкспорт хука в `src/server.ts`**

Добавить после `export * from './tokens';`:

```ts
export { useIsOutdatedBrowser } from './react/useIsOutdatedBrowser';
```

- [ ] **Step 7: Запустить тесты и сборку**

Run: `yarn jest --config packages/modules/outdated-browser/jest.config.js`
Expected: PASS, все файлы тестов.

Run: `yarn build`
Expected: сборка проходит без ошибок.

- [ ] **Step 8: Коммит**

```bash
git add packages/modules/outdated-browser/src
git commit -m "feat(outdated-browser): add browser entry point and useIsOutdatedBrowser hook"
```

---

### Task 10: Интеграционные тесты

**Files:**
- Create: `packages/modules/outdated-browser/__integration__/index.ts`
- Create: `packages/modules/outdated-browser/__integration__/page-default.tsx`
- Create: `packages/modules/outdated-browser/__integration__/constants.ts`
- Create: `packages/modules/outdated-browser/__integration__/outdated-browser.integration.ts`
- Create: `packages/modules/outdated-browser/jest.integration.config.js`

**Interfaces:**
- Consumes: `OutdatedBrowserModule` из Task 8, `useIsOutdatedBrowser` из Task 9.
- Produces: тестовое приложение, проверяющее поведение в реальном HTTP-ответе.

Проверяется именно то, ради чего писался модуль: баннер приходит в HTML до контейнера React, скрытие работает при выключенном JavaScript, и для свежего браузера ответ не содержит ничего лишнего.

- [ ] **Step 1: Создать тестовое приложение `__integration__/index.ts`**

```ts
import { createApp, createBundle, provide } from '@tramvai/core';
import { OutdatedBrowserModule, OUTDATED_BROWSER_OPTIONS_TOKEN } from '@tramvai/module-outdated-browser';
import { ROUTES_TOKEN } from '@tramvai/tokens-router';
import { lazy } from '@tramvai/react';
import { modules } from '../../../../test/shared/common';

const bundle = createBundle({
  name: 'mainDefault',
  components: {
    pageDefault: lazy(() => import('./page-default')),
  },
});

createApp({
  name: 'outdated-browser',
  modules: [...modules, OutdatedBrowserModule],
  providers: [
    provide({
      provide: OUTDATED_BROWSER_OPTIONS_TOKEN,
      useValue: { browserslist: ['chrome >= 90'] },
    }),
    provide({
      provide: ROUTES_TOKEN,
      useValue: [{ name: 'main', path: '/' }],
    }),
  ],
  bundles: {
    mainDefault: () => Promise.resolve({ default: bundle }),
  },
});
```

- [ ] **Step 2: Создать страницу `__integration__/page-default.tsx`**

```tsx
import React from 'react';
import { useIsOutdatedBrowser } from '@tramvai/module-outdated-browser';

export default function PageDefault() {
  const isOutdated = useIsOutdatedBrowser();

  return <div data-testid="outdated-flag">{String(isOutdated)}</div>;
}
```

- [ ] **Step 3: Создать `__integration__/constants.ts`**

```ts
export const CHROME_60 =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36';
export const CHROME_120 =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
export const BANNER_SELECTOR = '.tramvai-outdated-browser';
export const CLOSE_SELECTOR = '.tramvai-outdated-browser__close';
```

- [ ] **Step 4: Создать `jest.integration.config.js`**

```js
module.exports = {
  preset: '@tramvai/test-integration-jest',
  testMatch: ['**/__integration__/**/?(*.)+(integration).[jt]s?(x)'],
};
```

- [ ] **Step 5: Написать `__integration__/outdated-browser.integration.ts`**

```ts
import { testApp } from '@tramvai/test-integration';
import { BANNER_SELECTOR, CHROME_120, CHROME_60, CLOSE_SELECTOR } from './constants';

describe('outdated browser banner', () => {
  const { getApp } = testApp({ name: 'outdated-browser' });

  it('renders the banner into the html for an outdated browser', async () => {
    const app = getApp();
    const { statusCode, body } = await app.request('/', {
      headers: { 'user-agent': CHROME_60 },
    });

    expect(statusCode).toBe(200);
    expect(body).toContain('tramvai-outdated-browser');
    // баннер стоит до контейнера react, поэтому виден даже если бандл не исполнился
    expect(body.indexOf('tramvai-outdated-browser')).toBeLessThan(body.indexOf('id="root"'));
  });

  it('sends nothing for a modern browser', async () => {
    const app = getApp();
    const { body } = await app.request('/', {
      headers: { 'user-agent': CHROME_120 },
    });

    expect(body).not.toContain('tramvai-outdated-browser');
  });

  it('adds user agent and cookie to the vary header', async () => {
    const app = getApp();
    const { headers } = await app.request('/', {
      headers: { 'user-agent': CHROME_60 },
    });

    expect(String(headers.vary).toLowerCase()).toContain('user-agent');
    expect(String(headers.vary).toLowerCase()).toContain('cookie');
  });

  it('does not render the banner when the dismiss cookie is set', async () => {
    const app = getApp();
    const { body } = await app.request('/', {
      headers: {
        'user-agent': CHROME_60,
        cookie: 'tramvai_outdated_browser_hidden=1',
      },
    });

    expect(body).not.toContain('tramvai-outdated-browser__text');
  });

  it('hides the banner without javascript', async () => {
    const app = getApp();
    const { page } = await app.render('/', {
      userAgent: CHROME_60,
      javaScriptEnabled: false,
    });

    await expect(page.locator(BANNER_SELECTOR)).toBeVisible();
    await page.locator(CLOSE_SELECTOR).click();
    await expect(page.locator(BANNER_SELECTOR)).toBeHidden();
  });
});
```

- [ ] **Step 6: Запустить интеграционные тесты**

Run: `yarn jest --config packages/modules/outdated-browser/jest.integration.config.js`
Expected: PASS, пять тестов.

Тестовый харнесс `test/shared/common` и точный API `testApp` в этом чекауте могут отсутствовать. В этом случае привести файлы в соответствие с рабочим примером из `packages/modules/client-hints/__integration__/`, сохранив набор проверок без изменений.

- [ ] **Step 7: Коммит**

```bash
git add packages/modules/outdated-browser/__integration__ packages/modules/outdated-browser/jest.integration.config.js
git commit -m "test(outdated-browser): cover ssr markup, dismissal without javascript and vary header"
```

---

### Task 11: Документация

**Files:**
- Create: `packages/modules/outdated-browser/README.md`

**Interfaces:**
- Consumes: публичный API из задач 1, 8 и 9.
- Produces: страницу документации. README пакета автоматически попадает на сайт документации в раздел модулей.

- [ ] **Step 1: Написать `README.md`**

Документ должен содержать перечисленные ниже разделы. Все примеры кода должны быть рабочими и соответствовать сигнатурам из плана.

1. Заголовок `# Outdated browser` и абзац о том, что модуль отдаёт баннер статическим HTML до контейнера React, поэтому баннер виден даже когда бандл приложения не исполнился в старом браузере.
2. Установка через `npm i --save @tramvai/module-outdated-browser` в блоке с пометкой `npm2yarn` и подключение `OutdatedBrowserModule` в `createApp`. Указать, что модуль требует подключённого `@tramvai/module-client-hints`.
3. Раздел «Как это работает» с таблицей трёх исходов детекта из спецификации.
4. Раздел «Настройка» с таблицей всех полей `OutdatedBrowserOptions` и значениями по умолчанию.
5. Раздел «Контент» с примером провайдера `OUTDATED_BROWSER_CONTENT_TOKEN`, включая пример подключения перевода через собственный i18n приложения.
6. Раздел «Стилизация». Объяснить, что баннер лежит в обычном потоке и получает высокий `z-index`, поэтому для типовой фиксированной шапки ничего делать не нужно. Показать три уровня кастомизации: `OUTDATED_BROWSER_CLASSNAME_TOKEN`, `OUTDATED_BROWSER_EXTRA_CSS_TOKEN` и `OUTDATED_BROWSER_RENDER_TOKEN`. Для последнего явно предупредить, что при замене разметки нужно сохранить чекбокс с `id="tramvai-outdated-browser-hide"` перед корнем баннера, иначе перестанет работать скрытие без JavaScript.
7. Раздел «Кэширование». Описать, что модуль дополняет `Vary` значениями `User-Agent` и `Cookie`, предупредить о падении эффективности CDN и показать опцию `vary: false`. Описать вклад в ключ кэша статических страниц и оговорить, что приложение, переопределяющее `STATIC_PAGES_KEY_TOKEN` целиком, теряет этот вклад.
8. Раздел «Флаг в React» с примером `useIsOutdatedBrowser`.

- [ ] **Step 2: Проверить примеры на соответствие коду**

Run: `yarn jest --config packages/modules/outdated-browser/jest.config.js`
Expected: PASS. Дополнительно вручную сверить имена токенов в README с `src/tokens.ts`.

- [ ] **Step 3: Коммит**

```bash
git add packages/modules/outdated-browser/README.md
git commit -m "docs(outdated-browser): document setup, styling and caching"
```

---

## Self-Review

**Покрытие спецификации**

| Требование спецификации | Задача |
|---|---|
| Статический HTML в `body:start`, работа без JS | 3, 8 |
| Три исхода детекта | 1, 6, 8 |
| Фича-детект до первой отрисовки, нулевой CLS | 5, 8 |
| Скрытие на CSS плюс cookie | 3, 4, 5, 8 |
| Позиционирование в потоке с высоким `z-index` | 4 |
| Три уровня кастомизации стилей | 8, 11 |
| Совместимость CSS со старыми браузерами | 4 |
| ES3 в инлайновых скриптах | 5 |
| Слоты рендера | 8 |
| Флаг и хук для React | 8, 9 |
| `Vary` | 8 |
| Часть ключа кэша | 7, 8 |
| Экранирование и проверка схемы ссылки | 2, 3 |
| Проверка имени cookie | 2, 6 |
| Документация | 11 |

**Согласованность имён**

`detectBrowserSupport`, `computeState`, `renderBannerHtml`, `buildBannerCss`, `buildFlagScript`, `buildFeatureDetectScript`, `buildDismissScript`, `sanitizeHref`, `isValidCookieName`, `serverProviders`, `browserProviders`, `useIsOutdatedBrowser`. Имена совпадают во всех задачах, где они объявляются и используются.

**Известное отклонение**

Task 8 создаёт `src/server.ts` без реэкспорта хука, Task 9 дописывает реэкспорт. Это сделано намеренно, чтобы каждая задача оставалась собираемой по отдельности. Шаг явно отмечен в обеих задачах.
