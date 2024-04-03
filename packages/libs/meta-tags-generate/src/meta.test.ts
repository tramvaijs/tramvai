/**
 * @jest-environment jsdom
 */

import { Meta } from './Meta';
import { Render } from './Render';
import { Update } from './Update';

const converters = {
  title: (value) => ({ tag: 'title', innerHtml: value }),
  ogTitle: (value) => ({ tag: 'meta', attributes: { property: 'og:title', content: value } }),
  canonical: (value) => ({ tag: 'link', attributes: { rel: 'canonical', href: value } }),
};

const generateMeta = (transformValue?) => {
  const defaultMeta = (walker) => {
    walker.updateMeta(0, {
      title: 's',
      ogTitle: 'd',
      ogAlt: { tag: 'meta', attributes: { k: 's' } },
    });
  };
  const configMeta = (walker) => {
    walker.updateMeta(10, { title: 'g', canonical: 'l' });
  };
  return new Meta({ list: [defaultMeta, configMeta], converters, transformValue });
};

describe('meta - integrate tests', () => {
  it('Наполнение данными и преобразование в строку', () => {
    const meta = generateMeta();
    expect(meta.dataCollection()).toMatchSnapshot();

    const render = new Render(meta);
    expect(render.render()).toMatchSnapshot();
  });

  it('Наполнение данными и обновление в dom', () => {
    const meta = generateMeta();
    new Update(meta).update();

    expect(document.head).toMatchSnapshot();
  });

  it('Преобразовываем значения с приоритетом выше дефолтного', () => {
    const meta = generateMeta((item) => {
      if (item.priority > 0) {
        // eslint-disable-next-line no-param-reassign
        item.value = 'transform';
      }
      return item;
    });
    expect(meta.dataCollection()).toMatchSnapshot();

    const render = new Render(meta);
    expect(render.render()).toMatchSnapshot();
  });

  it('Очистка дефолтных meta параметров', () => {
    const defaultMeta = (walker) => {
      walker.updateMeta(0, {
        title: 's',
        ogTitle: 'd',
        canonical: 'b',
        ogAlt: { tag: 'meta', attributes: { k: 's' } },
      });
    };
    const configMeta = (walker) => {
      walker.updateMeta(10, { title: null, canonical: null });
    };
    const meta = new Meta({ list: [defaultMeta, configMeta], converters });

    expect(meta.dataCollection()).toMatchSnapshot();
    const render = new Render(meta);
    expect(render.render()).toMatchSnapshot();

    new Update(meta).update();

    expect(document.head).toMatchSnapshot();
  });

  it('Не перетираем null значения с высоким приоритетом', () => {
    const meta = generateMeta();
    meta.metaWalk.updateMeta(20, { test: null });
    meta.metaWalk.updateMeta(10, { test: 'string' });

    expect(meta.metaWalk.state).toMatchSnapshot();

    const render = new Render(meta);
    expect(render.render()).toMatchSnapshot();
  });

  it('Сериализация и десериализация стейта в metaWalk', () => {
    const meta = generateMeta();

    meta.metaWalk.updateMeta(20, { title: 'hello' });
    const serializableState = meta.metaWalk.getSerializableState();

    expect(serializableState).toEqual([['title', { value: 'hello', priority: 20 }]]);

    const newMeta = generateMeta();

    expect(newMeta.metaWalk.get('title')).toBeUndefined();

    newMeta.metaWalk.mergeValuesFromSerializableState(serializableState);
    expect(newMeta.metaWalk.get('title')).toEqual({ value: 'hello', priority: 20 });
  });
});
