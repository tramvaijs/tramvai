/**
 * @jest-environment @tramvai/test-unit-jest/lib/jsdom-environment
 */

import { Module, provide } from '@tramvai/core';

import { META_PRIORITY_APP } from '../../constants';
import { META_DEFAULT_TOKEN, META_UPDATER_TOKEN } from '../../tokens';

import {
  jsonLdMock,
  stringifiedJsonLdMock,
  stringifiedUpdatedJsonLdMock,
  updatedJsonLdMock,
} from './constants';
import { testMetaUpdater } from './metaUpdater';

describe('testMetaUpdater', () => {
  it('should allow to test metaUpdater', async () => {
    const metaUpdater = jest.fn<
      ReturnType<typeof META_UPDATER_TOKEN>,
      Parameters<typeof META_UPDATER_TOKEN>
    >((walker) => {
      walker.updateMeta(META_PRIORITY_APP, {
        title: 'test title',
        jsonLd: jsonLdMock,
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

    const TEST_TITLE = 'test title';

    const { head, body, metaWalk } = renderMeta();

    expect(metaWalk.get('title')).toEqual({ priority: 20, value: TEST_TITLE });
    expect(metaWalk.get('jsonLd')).toEqual({ priority: 20, value: jsonLdMock });

    expect(head).toMatch(`<title data-meta-dynamic="true">${TEST_TITLE}</title>`);
    expect(body).toMatch(
      `<script type="application/ld+json" data-meta-dynamic="true">${stringifiedJsonLdMock}</script>`
    );
  });

  it('should allow to specify default meta', async () => {
    const TEST_DEFAULT_TITLE = 'test default title';

    const { renderMeta } = testMetaUpdater({
      providers: [
        provide({
          provide: META_DEFAULT_TOKEN,
          useValue: {
            title: TEST_DEFAULT_TITLE,
            jsonLd: jsonLdMock,
          },
        }),
      ],
    });

    const { head, body } = renderMeta();

    expect(head).toMatch(`<title data-meta-dynamic="true">${TEST_DEFAULT_TITLE}</title>`);
    expect(body).toMatch(
      `<script type="application/ld+json" data-meta-dynamic="true">${stringifiedJsonLdMock}</script>`
    );
  });

  it('metaObj passed - should update meta tags from metaObj', async () => {
    const TEST_DEFAULT_TITLE = 'test default title';
    const TEST_APPLIED_TITLE = 'test applied title';

    const { renderMeta } = testMetaUpdater({});

    const { metaWalk, applyMeta } = renderMeta();

    metaWalk.updateMeta(META_PRIORITY_APP, {
      title: TEST_DEFAULT_TITLE,
      jsonLd: jsonLdMock,
    });

    applyMeta({ metaObj: { title: TEST_APPLIED_TITLE, jsonLd: updatedJsonLdMock } });

    expect(document.title).toBe(TEST_APPLIED_TITLE);
    expect(document.body.lastElementChild?.textContent).toBe(stringifiedUpdatedJsonLdMock);

    expect(metaWalk.get('title')).toMatchObject({
      priority: META_PRIORITY_APP,
      value: TEST_APPLIED_TITLE,
    });
    expect(metaWalk.get('jsonLd')).toMatchObject({
      priority: META_PRIORITY_APP,
      value: updatedJsonLdMock,
    });
  });

  it('metaObj not passed - should update meta tags from metaWalk without resetting its state', async () => {
    const TEST_DEFAULT_TITLE = 'test default title';

    const { renderMeta } = testMetaUpdater({});

    const { metaWalk, applyMeta } = renderMeta();

    metaWalk.updateMeta(META_PRIORITY_APP, {
      title: TEST_DEFAULT_TITLE,
      jsonLd: jsonLdMock,
    });

    applyMeta();

    expect(document.title).toBe(TEST_DEFAULT_TITLE);
    expect(document.body.lastElementChild?.textContent).toBe(stringifiedJsonLdMock);

    expect(metaWalk.get('title')).toEqual({ priority: 20, value: TEST_DEFAULT_TITLE });
    expect(metaWalk.get('jsonLd')).toMatchObject({
      priority: META_PRIORITY_APP,
      value: jsonLdMock,
    });
  });
});
