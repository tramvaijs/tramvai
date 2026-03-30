/**
 * @jest-environment @tramvai/test-unit-jest/lib/jsdom-environment
 */

import isObject from '@tinkoff/utils/is/object';
import has from '@tinkoff/utils/object/has';

import { Meta } from '../Meta';
import { Render } from '../Render';
import { Update } from '../Update';

const jsonLdMock = {
  '@graph': [
    {
      name: 'Т‑Бизнес',
      '@type': 'Product',
    },
  ],
  '@context': 'http://schema.org',
};

const updatedJsonLdMock = {
  '@graph': [
    {
      name: 'Т‑Банк',
      '@type': 'Product',
    },
  ],
  '@context': 'http://schema.org',
};

const defaultTransformValue = (item) => {
  const { priority, value } = item;

  const isObjectValue = isObject(value);
  const isTagRecord = has('tag', value);
  if (isObjectValue && !isTagRecord) {
    return {
      priority,
      value: JSON.stringify(value),
    };
  }

  return item;
};

const converters = {
  title: (value) => ({ tag: 'title', innerHtml: value }),
  ogTitle: (value) => ({ tag: 'meta', attributes: { property: 'og:title', content: value } }),
  canonical: (value) => ({ tag: 'link', attributes: { rel: 'canonical', href: value } }),
  jsonLd: (value) => ({
    tag: 'script',
    innerHtml: value,
    attributes: { type: 'application/ld+json' },
  }),
};

const generateMeta = (transformValue = defaultTransformValue) => {
  const defaultMeta = (walker) => {
    walker.updateMeta(0, {
      title: 's',
      ogTitle: 'd',
      ogAlt: { tag: 'meta', attributes: { k: 's' } },
      jsonLd: jsonLdMock,
    });
  };
  const configMeta = (walker) => {
    walker.updateMeta(10, {
      title: 'g',
      canonical: 'l',
      jsonLd: updatedJsonLdMock,
    });
  };
  return new Meta({ list: [defaultMeta, configMeta], converters, transformValue });
};

describe('meta - integrate tests', () => {
  it('Наполнение данными и преобразование в строку', () => {
    const meta = generateMeta();
    expect(meta.dataCollection()).toMatchSnapshot();

    const renderer = new Render(meta);
    const head = renderer.render({ placement: 'head' });
    const body = renderer.render({ placement: 'body' });

    expect(head).toMatchSnapshot();
    expect(body).toMatchSnapshot();
  });

  it('Наполнение данными и обновление в dom', () => {
    const meta = generateMeta();

    const updater = new Update(meta);
    updater.update({ placement: 'head' });
    updater.update({ placement: 'body' });

    expect(document.head).toMatchSnapshot();
    expect(document.body).toMatchSnapshot();
  });

  it('Преобразовываем значения с приоритетом выше дефолтного', () => {
    const meta = generateMeta((item) => {
      const { priority } = item;

      if (priority === 0) {
        return defaultTransformValue(item);
      }

      return { priority, value: 'transform' };
    });
    expect(meta.dataCollection()).toMatchSnapshot();

    const renderer = new Render(meta);
    const head = renderer.render({ placement: 'head' });
    const body = renderer.render({ placement: 'body' });

    expect(head).toMatchSnapshot();
    expect(body).toMatchSnapshot();
  });

  it('Очистка дефолтных meta параметров', () => {
    const defaultMeta = (walker) => {
      walker.updateMeta(0, {
        title: 's',
        ogTitle: 'd',
        canonical: 'b',
        ogAlt: { tag: 'meta', attributes: { k: 's' } },
        jsonLd: jsonLdMock,
      });
    };
    const configMeta = (walker) => {
      walker.updateMeta(10, { title: null, canonical: null, jsonLd: null });
    };
    const meta = new Meta({ list: [defaultMeta, configMeta], converters });

    expect(meta.dataCollection()).toMatchSnapshot();

    const renderer = new Render(meta);
    const renderedHead = renderer.render({ placement: 'head' });
    const renderedBody = renderer.render({ placement: 'body' });

    expect(renderedHead).toMatchSnapshot();
    expect(renderedBody).toMatchSnapshot();

    const updater = new Update(meta);
    updater.update({ placement: 'head' });
    updater.update({ placement: 'body' });

    expect(document.head).toMatchSnapshot();
    expect(document.body).toMatchSnapshot();
  });

  it('Не перетираем null значения с высоким приоритетом', () => {
    const meta = generateMeta();
    meta.metaWalk.updateMeta(20, { test: null, jsonLd: null });
    meta.metaWalk.updateMeta(10, { test: 'string', jsonLd: jsonLdMock });

    expect(meta.metaWalk.state).toMatchSnapshot();

    const renderer = new Render(meta);
    const head = renderer.render({ placement: 'head' });
    const body = renderer.render({ placement: 'body' });

    expect(head).toMatchSnapshot();
    expect(body).toMatchSnapshot();
  });

  it('Сериализация и десериализация стейта в metaWalk', () => {
    const meta = generateMeta();

    meta.metaWalk.updateMeta(20, { title: 'hello', jsonLd: jsonLdMock });
    const serializableState = meta.metaWalk.getSerializableState();

    expect(serializableState).toEqual([
      ['title', { value: 'hello', priority: 20 }],
      ['jsonLd', { value: jsonLdMock, priority: 20 }],
    ]);

    const newMeta = generateMeta();

    expect(newMeta.metaWalk.get('title')).toBeUndefined();
    expect(newMeta.metaWalk.get('jsonLd')).toBeUndefined();

    newMeta.metaWalk.mergeValuesFromSerializableState(serializableState);
    expect(newMeta.metaWalk.get('title')).toEqual({ value: 'hello', priority: 20 });
    expect(newMeta.metaWalk.get('jsonLd')).toEqual({
      value: jsonLdMock,
      priority: 20,
    });
  });
});
