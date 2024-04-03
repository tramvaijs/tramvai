import { FIRST_ALBUM_ID } from '../src/test-ids';
import { test } from './test.fixture';

test.describe('View Transitions', async () => {
  test('Calling `document.startViewTransition`', async ({ app, page, ViewTransitions, I }) => {
    await I.gotoPage(app.serverUrl);

    await ViewTransitions.mockStartViewTransition();

    await page.click(`#${FIRST_ALBUM_ID}`);

    test.expect(await ViewTransitions.getViewTransitions()).toEqual(['/album/1/']);
  });

  test('Calling `document.startViewTransition` on backwards navigation', async ({
    app,
    page,
    ViewTransitions,
    I,
  }) => {
    await I.gotoPage(app.serverUrl);

    await ViewTransitions.mockStartViewTransition();

    await page.click(`#${FIRST_ALBUM_ID}`);

    await page.goBack();

    test.expect(await ViewTransitions.getViewTransitions()).toEqual(['/album/1/', '/home/']);
  });
});
