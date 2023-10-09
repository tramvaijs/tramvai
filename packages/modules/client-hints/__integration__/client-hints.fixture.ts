import type { TestFixture, BrowserContext, Page } from '@playwright/test';
import type { UserAgent } from '@tinkoff/user-agent';

export class ClientHintsComponentObject {
  constructor(private context: BrowserContext) {}

  /**
   * @see https://github.com/microsoft/playwright/issues/14361
   */
  async mockHighEntropyValues(implementation: () => Promise<UADataValues | never>) {
    await this.context.exposeFunction('__getHighEntropyValues', implementation);

    await this.context.addInitScript(() => {
      Object.defineProperty(window.navigator, 'userAgentData', {
        value: {
          brands: [],
          platform: '',
          mobile: false,
          // @ts-expect-error
          getHighEntropyValues: window.__getHighEntropyValues,
        },
      });
    });
  }

  async globalClientHints(page: Page): Promise<string | undefined> {
    return page.evaluate('window.__TRAMVAI_USER_AGENT_DATA');
  }

  async userAgentFromDI(page: Page): Promise<UserAgent | null> {
    return page.evaluate('contextExternal.di.get("userAgent")');
  }
}

export const ClientHintsFixture: TestFixture<
  ClientHintsComponentObject,
  { context: BrowserContext }
> = async ({ context }, use) => {
  const clientHints = new ClientHintsComponentObject(context);

  await use(clientHints);
};
