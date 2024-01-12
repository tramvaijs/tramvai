import { ResourceSlot, ResourceType } from '@tramvai/tokens-render';
import { ResourcesInliner } from './resourcesInliner';

describe('ResourceInliner', () => {
  const logger = jest.fn();
  const resourcesRegistryCache = {
    filesCache: new Map(),
    sizeCache: new Map(),
    disabledUrlsCache: new Map(),
  };

  it('should remove source-map from inline css', () => {
    const urlToResource = 'https://www.example.com/somestyles.css';
    const sourceMapComment = '//# sourceMappingURL=123.css.map';

    const resourceInliner = new ResourcesInliner({
      resourcesRegistryCache,
      resourceInlineThreshold: {
        threshold: 10000,
      },
      logger,
    });

    resourcesRegistryCache.filesCache.set(
      urlToResource,
      `.somestyles { padding: 3px; }\n${sourceMapComment}`
    );

    const result = resourceInliner.inlineResource({
      payload: urlToResource,
      type: ResourceType.style,
      slot: ResourceSlot.BODY_TAIL,
    });

    expect(result).toEqual([
      {
        payload: '.somestyles { padding: 3px; }',
        slot: 'body:tail',
        type: 'inlineStyle',
      },
      {
        attrs: {
          'data-href': 'https://www.example.com/somestyles.css',
        },
        payload: null,
        slot: 'body:tail',
        type: 'style',
      },
    ]);
  });
});
