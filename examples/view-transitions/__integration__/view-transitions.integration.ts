import { getAlbumId } from '../src/test-ids';
import { test } from './test.fixture';

test.describe('View Transitions', async () => {
  test('Calling `document.startViewTransition`', async ({ app, page, ViewTransitions, I }) => {
    await I.gotoPage(app.serverUrl);

    await ViewTransitions.mockStartViewTransition();

    await page.click(`#${getAlbumId(1)}`);

    test.expect(await ViewTransitions.getViewTransitions()).toEqual([
      {
        pathname: '/album/1/',
        types: ['tramvai_vt_forward'],
      },
    ]);
  });

  test('Calling `document.startViewTransition` on backwards navigation', async ({
    app,
    page,
    ViewTransitions,
    I,
  }) => {
    await I.gotoPage(app.serverUrl);

    await ViewTransitions.mockStartViewTransition();

    await page.click(`#${getAlbumId(1)}`);

    await page.goBack();

    test.expect(await ViewTransitions.getViewTransitions()).toEqual([
      {
        pathname: '/album/1/',
        types: ['tramvai_vt_forward'],
      },
      {
        pathname: '/home/',
        types: ['tramvai_vt_back'],
      },
    ]);
  });

  test('Should correctly alternate between forward/back transitions in complex navigation patterns', async ({
    app,
    page,
    ViewTransitions,
    I,
  }) => {
    await I.gotoPage(app.serverUrl);

    await ViewTransitions.mockStartViewTransition();

    await page.click(`#${getAlbumId(1)}`);

    await page.goBack();

    await page.click(`#${getAlbumId(1)}`);
    await page.click(`#${getAlbumId(2)}`);

    await page.goBack();

    test.expect(await ViewTransitions.getViewTransitions()).toEqual([
      {
        pathname: '/album/1/',
        types: ['tramvai_vt_forward'],
      },
      {
        pathname: '/home/',
        types: ['tramvai_vt_back'],
      },
      {
        pathname: '/album/1/',
        types: ['tramvai_vt_forward'],
      },
      {
        pathname: '/album/2/',
        types: ['tramvai_vt_forward'],
      },
      {
        pathname: '/album/1/',
        types: ['tramvai_vt_back'],
      },
    ]);
  });

  test('Should handle multiple consecutive back navigations from deep history stack', async ({
    app,
    page,
    ViewTransitions,
    I,
  }) => {
    await I.gotoPage(app.serverUrl);

    await ViewTransitions.mockStartViewTransition();

    await page.click(`#${getAlbumId(1)}`);
    await page.click(`#${getAlbumId(2)}`);
    await page.click(`#${getAlbumId(3)}`);
    await page.click(`#${getAlbumId(4)}`);
    await page.goBack();
    await page.goBack();
    await page.goBack();
    await page.goBack();

    test.expect(await ViewTransitions.getViewTransitions()).toEqual([
      {
        pathname: '/album/1/',
        types: ['tramvai_vt_forward'],
      },
      {
        pathname: '/album/2/',
        types: ['tramvai_vt_forward'],
      },
      {
        pathname: '/album/3/',
        types: ['tramvai_vt_forward'],
      },
      {
        pathname: '/album/4/',
        types: ['tramvai_vt_forward'],
      },
      {
        pathname: '/album/3/',
        types: ['tramvai_vt_back'],
      },
      {
        pathname: '/album/2/',
        types: ['tramvai_vt_back'],
      },
      {
        pathname: '/album/1/',
        types: ['tramvai_vt_back'],
      },
      {
        pathname: '/home/',
        types: ['tramvai_vt_back'],
      },
    ]);
  });
});
