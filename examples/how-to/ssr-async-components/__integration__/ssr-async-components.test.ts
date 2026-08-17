import { resolve } from 'path';
import { testApp } from '@tramvai/internal-test-utils/testApp';
import { testAppInBrowser } from '@tramvai/internal-test-utils/browser';

describe('ssr-async-components', () => {
  const { getApp } = testApp({
    target: 'ssr-async-components',
    cwd: resolve(__dirname, '..', '..'),
  });
  const { getPageWrapper } = testAppInBrowser(getApp);

  it('ssr render', async () => {
    const { render } = await getApp();

    const { head } = await render('/');

    expect(head).toMatchInlineSnapshot(`
      "
          <meta charset="UTF-8" >
          

          

          
          <link crossorigin="anonymous"
            fetchpriority="high"
            as="script"
            rel="preload"
            href="\${STATIC_URL}/dist/client/runtime.js"
          >
          <link crossorigin="anonymous"
            fetchpriority="high"
            as="script"
            rel="preload"
            href="\${STATIC_URL}/dist/client/pages-page.chunk.js"
          >
          <link crossorigin="anonymous"
            fetchpriority="high"
            as="script"
            rel="preload"
            href="\${STATIC_URL}/dist/client/InnerPageInitial.chunk.js"
          >
          <link crossorigin="anonymous"
            fetchpriority="high"
            as="script"
            rel="preload"
            href="\${STATIC_URL}/dist/client/react.js"
          >
          <link crossorigin="anonymous"
            fetchpriority="high"
            as="script"
            rel="preload"
            href="\${STATIC_URL}/dist/client/tramvai.js"
          >
          <link crossorigin="anonymous"
            fetchpriority="high"
            as="script"
            rel="preload"
            href="\${STATIC_URL}/dist/client/platform.js"
          >
          <script></script>
          

          
          <link crossorigin="anonymous"
            data-critical="true"
            fetchpriority="high"
            rel="stylesheet"
            href="\${STATIC_URL}/dist/client/pages-page.chunk.css"
          >
          <link crossorigin="anonymous"
            data-critical="true"
            fetchpriority="high"
            rel="stylesheet"
            href="\${STATIC_URL}/dist/client/InnerPageInitial.chunk.css"
          >
          

          
          <script defer="defer"
            crossorigin="anonymous"
            data-critical="true"
            fetchpriority="high"
            src="\${STATIC_URL}/dist/client/runtime.js"
          ></script>
          

          

          

          

          

          
          <script defer="defer"
            crossorigin="anonymous"
            data-critical="true"
            fetchpriority="high"
            src="\${STATIC_URL}/dist/client/pages-page.chunk.js"
          ></script>
          <script defer="defer"
            crossorigin="anonymous"
            data-critical="true"
            fetchpriority="high"
            src="\${STATIC_URL}/dist/client/InnerPageInitial.chunk.js"
          ></script>
          <script defer="defer"
            crossorigin="anonymous"
            data-critical="true"
            fetchpriority="high"
            src="\${STATIC_URL}/dist/client/react.js"
          ></script>
          <script defer="defer"
            crossorigin="anonymous"
            data-critical="true"
            fetchpriority="high"
            src="\${STATIC_URL}/dist/client/tramvai.js"
          ></script>
          <script defer="defer"
            crossorigin="anonymous"
            data-critical="true"
            fetchpriority="high"
            src="\${STATIC_URL}/dist/client/platform.js"
          ></script>
          

          

          

          

          
        "
    `);
  });

  it('should render components on render', async () => {
    const { page } = await getPageWrapper('/');
    const rootTest = await page.$('#root-test');
    const innerOnClick = await page.$('#inner-page-initial');

    expect(rootTest).toBeDefined();
    expect(
      await rootTest?.evaluate((element) => {
        const styles = window.getComputedStyle(element);
        return { color: styles.color, textAlign: styles.textAlign };
      })
    ).toEqual({
      color: 'rgb(0, 0, 0)',
      textAlign: 'left',
    });

    expect(innerOnClick).toBeDefined();
    expect(
      await innerOnClick?.evaluate((element) => {
        const styles = window.getComputedStyle(element.querySelector('h3')!);
        return { color: styles.color, textAlign: styles.textAlign };
      })
    ).toEqual({
      color: 'rgb(0, 0, 255)',
      textAlign: 'center',
    });
  });

  it('should load new component', async () => {
    const { page } = await getPageWrapper('/');
    const showButton = await page.$('#root-button-show');

    await showButton?.click();

    await page.waitForSelector('#inner-page-onclick');

    const innerElement = await page.$('#inner-page-onclick');

    expect(innerElement).toBeDefined();
    expect(
      await innerElement?.evaluate((element) => {
        const styles = window.getComputedStyle(element);
        return { color: styles.color, textAlign: styles.textAlign };
      })
    ).toEqual({
      color: 'rgb(255, 0, 0)',
      textAlign: 'right',
    });
  });
});
