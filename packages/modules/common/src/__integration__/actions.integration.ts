/* eslint-disable max-nested-callbacks */
import { expect } from '@playwright/test';
import { test } from './test-fixture';
import { ActionStatus } from './stores/actionTestReducer';

['before', 'after'].forEach((spaMode) => {
  test.describe(`CommonModule actions [actionsMode="${spaMode}"]`, () => {
    test.beforeEach(async ({ I, app }) => {
      await I.addCookies('Adding cookies: ', [
        { name: 'actionsMode', value: spaMode, domain: app.domain, path: '/' },
      ]);
    });

    test('actions should be executed only on server', async ({ I, app, actionPages }) => {
      await I.gotoPage(`${app.serverUrl}/action-execution-on-server/`);
      const expectedActions = ['action1', 'action2'];

      await actionPages.expectOnServerWasExecutedActions(['action1', 'action2']);
      await actionPages.expectOnClientWasExecutedActions([]);

      expect(await actionPages.getActionsExecutedOnServerFromTramvaiState()).toEqual(
        expect.arrayContaining(expectedActions)
      );
      expect(await actionPages.getActionDataExecutedOnServerFromTramvaiState('action2')).toEqual({
        state: {
          dynamicCondition: {
            environment: 'browser',
          },
        },
        status: 'success',
      });
    });

    test('action should not be cancelled on spa transition', async ({
      I,
      app,
      page,
      tramvai,
      actionPages,
    }) => {
      await I.gotoPage(`${app.serverUrl}/action-test-start/?abort=false`);
      await expect(page.getByText('ActionTestPageStart')).toBeVisible();

      await actionPages.expectActionTestPageHasFollowingStatus([
        ActionStatus.notInitialized,
        ActionStatus.startPagePending,
      ]);

      await tramvai.spaNavigate('/action-test-end/');

      await actionPages.expectActionTestPageHasFollowingStatus([
        ActionStatus.notInitialized,
        ActionStatus.startPagePending,
        ActionStatus.endPagePending,
      ]);

      await actionPages.waitTillActionTestPageWillHaveFollowingStatus([
        ActionStatus.notInitialized,
        ActionStatus.startPagePending,
        ActionStatus.endPagePending,
        ActionStatus.endPageResolved,
      ]);

      await actionPages.waitTillActionTestPageWillHaveFollowingStatus([
        ActionStatus.notInitialized,
        ActionStatus.startPagePending,
        ActionStatus.endPagePending,
        ActionStatus.endPageResolved,
        ActionStatus.startPageResolved,
      ]);
    });

    test('action should be cancelled on spa transition', async ({
      I,
      app,
      page,
      tramvai,
      actionPages,
    }) => {
      await I.gotoPage(`${app.serverUrl}/action-test-start/?abort=true`);
      await expect(page.getByText('ActionTestPageStart')).toBeVisible();

      await actionPages.expectActionTestPageHasFollowingStatus([
        ActionStatus.notInitialized,
        ActionStatus.startPagePending,
      ]);

      await tramvai.spaNavigate('/action-test-end/');

      await actionPages.expectActionTestPageHasFollowingStatus([
        ActionStatus.notInitialized,
        ActionStatus.startPagePending,
        ActionStatus.startPageAborted,
        ActionStatus.endPagePending,
      ]);

      await actionPages.waitTillActionTestPageWillHaveFollowingStatus([
        ActionStatus.notInitialized,
        ActionStatus.startPagePending,
        ActionStatus.startPageAborted,
        ActionStatus.endPagePending,
        ActionStatus.endPageResolved,
      ]);
    });

    test('action should be cancelled if redirect found', async ({
      I,
      app,
      page,
      tramvai,
      actionPages,
    }) => {
      await I.gotoPage(`${app.serverUrl}/action-test-start/?abort=true`);
      await expect(page.getByText('ActionTestPageStart')).toBeVisible();

      await actionPages.expectActionTestPageHasFollowingStatus([
        ActionStatus.notInitialized,
        ActionStatus.startPagePending,
      ]);

      await tramvai.spaNavigate('/action-test-redirect/');

      await actionPages.expectActionTestPageHasFollowingStatus([
        ActionStatus.notInitialized,
        ActionStatus.startPagePending,
      ]);

      await actionPages.waitTillActionTestPageWillHaveFollowingStatus([
        ActionStatus.notInitialized,
        ActionStatus.startPagePending,
        ActionStatus.startPageAborted,
        ActionStatus.endPagePending,
        ActionStatus.endPageResolved,
      ]);
    });
  });
});
/* eslint-enable max-nested-callbacks */
