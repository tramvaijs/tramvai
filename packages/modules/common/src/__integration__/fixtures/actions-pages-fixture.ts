import { expect, test } from '@playwright/test';
import type { Page, ConsoleMessage } from '@playwright/test';
import type { StartCliResult } from '@tramvai/test-integration';
import type { TestFixture } from '@playwright/test';
import type { ModuleTramvai } from '@tramvai/internal-test-utils/fixtures/tramvai';
import pathOr from '@tinkoff/utils/object/pathOr';
import compose from '@tinkoff/utils/function/compose';
import keys from '@tinkoff/utils/object/keys';
import type { ActionStatus } from '../stores/actionTestReducer';

export class ActionPagesCO {
  private page: Page;
  private app: StartCliResult;
  private tramvai: ModuleTramvai;

  constructor(page: Page, app: StartCliResult, tramvai: ModuleTramvai) {
    this.page = page;
    this.app = app;
    this.tramvai = tramvai;
  }

  async expectOnServerWasExecutedActions(actions: string[]) {
    await test.step(`checks that [data-testid="actions-server"] will contain actions: "${actions.join(',')}"`, async () => {
      const serverActions = await this.page.getByTestId('actions-server').textContent();
      expect(serverActions).toBe(actions.join(','));
    });
  }

  async expectOnClientWasExecutedActions(actions: string[]) {
    await test.step(`checks that [data-testid="actions-client"] will contain actions: "${actions.join(',')}"`, async () => {
      const clientActions = await this.page.getByTestId('actions-client').textContent();
      expect(clientActions).toBe(actions.join(','));
    });
  }

  private getGlobalActionTramvaiState() {
    return test.step('getting global actionTramvai store state', () => {
      return this.tramvai.getState('actionTramvai');
    });
  }

  getActionsExecutedOnServerFromTramvaiState() {
    return test.step('getting all executed action from store', async () => {
      return compose(keys, pathOr(['serverState'], {}))(await this.getGlobalActionTramvaiState());
    });
  }

  getActionDataExecutedOnServerFromTramvaiState(actionName: string) {
    return test.step('getting all executed action from store', async () => {
      return pathOr(
        ['serverState', actionName],
        undefined,
        await this.getGlobalActionTramvaiState()
      );
    });
  }

  expectActionTestPageHasFollowingStatus(status: ActionStatus[]) {
    return test.step(`expect actionTestPage has following status: ${status.join(',')}`, async () => {
      const statusOnPage = await this.page.getByTestId('status').textContent();
      expect(statusOnPage).toBe(status.join(','));
    });
  }

  waitTillActionTestPageWillHaveFollowingStatus(status: ActionStatus[]) {
    return test.step(`waits until [data-testid="status"] will contain "${status}"`, async () => {
      return this.page.waitForFunction(
        (expectedStatus) =>
          // @ts-ignore
          document.querySelector('[data-testid="status"]').innerText === expectedStatus,
        status.join(',')
      );
    });
  }

  public getReasonFrom(message: ConsoleMessage): Promise<string> {
    return message
      .args()[2]
      .getProperty('error')
      .then((result) => result.getProperty('reason'))
      .then((result) => result.jsonValue());
  }
}

export const actionPagesFixture: TestFixture<
  ActionPagesCO,
  { page: Page; app: StartCliResult; tramvai: ModuleTramvai }
> = async ({ page, app, tramvai }, use) => {
  const actionPagesCO = new ActionPagesCO(page, app, tramvai);
  await use(actionPagesCO);
};
