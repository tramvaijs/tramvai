/**
 * @jest-environment @tramvai/test-unit-jest/lib/jsdom-environment
 */

import { Module, provide } from '@tramvai/core';
import { META_UPDATER_TOKEN } from '../../tokens';
import { META_DEFAULT_TOKEN } from '../../tokens';
import { testMetaUpdater } from './metaUpdater';
import { META_PRIORITY_APP } from '../../constants';

describe('testMetaUpdater', () => {
  it('should allow to test metaUpdater', async () => {
    const metaUpdater = jest.fn<
      ReturnType<typeof META_UPDATER_TOKEN>,
      Parameters<typeof META_UPDATER_TOKEN>
    >((walker) => {
      walker.updateMeta(META_PRIORITY_APP, {
        title: 'test title',
      });
    });
    @Module({
      providers: [
        provide({
          provide: META_UPDATER_TOKEN,
          multi: true,
          useValue: metaUpdater,
        }),
      ],
    })
    class CustomModule {}
    const { renderMeta } = testMetaUpdater({
      modules: [CustomModule],
    });

    const { render, metaWalk } = renderMeta();

    expect(metaWalk.get('title')).toEqual({ priority: 20, value: 'test title' });
    expect(render).toMatch('<title data-meta-dynamic="true">test title</title>');
  });

  it('should allow to specify default meta', async () => {
    const { renderMeta } = testMetaUpdater({
      providers: [
        provide({
          provide: META_DEFAULT_TOKEN,
          useValue: {
            title: 'default title',
          },
        }),
      ],
    });

    const { render } = renderMeta();

    expect(render).toMatch('<title data-meta-dynamic="true">default title</title>');
  });

  it('metaObj passed - should update meta tags from metaObj', async () => {
    const TEST_DEFAULT_TITLE = 'test default title';
    const TEST_APPLIED_TITLE = 'test applied title';

    const { renderMeta } = testMetaUpdater({});

    const { metaWalk, applyMeta } = renderMeta();

    metaWalk.updateMeta(META_PRIORITY_APP, {
      title: TEST_DEFAULT_TITLE,
    });

    applyMeta({ metaObj: { title: TEST_APPLIED_TITLE } });

    expect(document.title).toBe(TEST_APPLIED_TITLE);
    expect(metaWalk.get('title')).toMatchObject({
      priority: META_PRIORITY_APP,
      value: TEST_APPLIED_TITLE,
    });
  });

  it('metaObj not passed - should update meta tags from metaWalk without resetting its state', async () => {
    const TEST_DEFAULT_TITLE = 'test default title';

    const { renderMeta } = testMetaUpdater({});

    const { metaWalk, applyMeta } = renderMeta();

    metaWalk.updateMeta(META_PRIORITY_APP, {
      title: TEST_DEFAULT_TITLE,
    });

    applyMeta();

    expect(document.title).toBe(TEST_DEFAULT_TITLE);
    expect(metaWalk.get('title')).toEqual({ priority: 20, value: 'test default title' });
  });
});
