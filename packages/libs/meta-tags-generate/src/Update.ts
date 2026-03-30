import eachObj from '@tinkoff/utils/object/each';

import { META_DATA_ATTR } from './constants';
import type { Meta } from './Meta';
import type { PatchMeta, TagRecord, TagPlacement } from './Meta.h';

const create = ({ tag, attributes, innerHtml }: TagRecord) => {
  const newElement = document.createElement(tag);

  if (innerHtml) {
    newElement.innerHTML = innerHtml;
  }

  attributes &&
    eachObj((value, key) => {
      newElement.setAttribute(key, value || '');
    }, attributes);

  newElement.setAttribute(META_DATA_ATTR, 'true');

  return newElement;
};

export class Update {
  meta: Meta;

  constructor(meta: Meta) {
    this.meta = meta;
  }

  /**
   * Если среди добавляемых тегов есть хотя бы один тег meta с name="robots", то удаляются
   * все теги meta с name="robots".Это сделано для того, чтобы не допустить дублирования таких тегов.
   * Остальные метатеги в head обновляются точечно.
   */
  private patchHeadMeta({ head, addTags, removeTagsArray }: PatchMeta) {
    let shouldRemoveRobotsMeta = false;

    addTags.forEach((newTag) => {
      let existingTag;

      if (newTag.tagName.toLowerCase() === 'title') {
        existingTag = removeTagsArray.find((tag) => tag.tagName.toLowerCase() === 'title');
      } else if (
        newTag.tagName.toLowerCase() === 'meta' &&
        newTag.getAttribute('name') === 'robots'
      ) {
        // Если есть хоть один тег meta у которого name="robots", удаляем все теги meta с name="robots"
        shouldRemoveRobotsMeta = true;
      } else if (newTag.tagName.toLowerCase() === 'meta') {
        // Ищем совпадения по атрибутам name или property, исключая теги с name="robots"
        const newTagName = newTag.getAttribute('name');
        const newTagProperty = newTag.getAttribute('property');

        existingTag = removeTagsArray.find(
          (tag) =>
            tag.tagName.toLowerCase() === 'meta' &&
            ((newTagName && tag.getAttribute('name') === newTagName) ||
              (newTagProperty && tag.getAttribute('property') === newTagProperty)) &&
            tag.getAttribute('name') !== 'robots'
        );
      } else if (newTag.tagName.toLowerCase() === 'link') {
        // Обрабатываем <link> с атрибутом rel="canonical"
        existingTag = removeTagsArray.find(
          (tag) =>
            tag.tagName.toLowerCase() === 'link' &&
            tag.getAttribute('rel') === 'canonical' &&
            tag.getAttribute('href') === newTag.getAttribute('href')
        );
      }

      // Если совпадение найдено, удаляем старый тег
      if (existingTag) {
        head.removeChild(existingTag);
      }
    });

    if (shouldRemoveRobotsMeta) {
      // Удаляем все теги meta с name="robots"
      removeTagsArray
        .filter((tag) => tag.getAttribute('name') === 'robots')
        .forEach((existingTag) => {
          head.removeChild(existingTag);
        });
    }
  }

  /**
   * Обновляет метатеги в указанном месте (head или body)
   * @param {Object} options - Опции для обновления метатегов
   * @param {TagPlacement} [options.placement='head'] - Место, где будут обновлены метатеги (head или body)
   * @param {boolean} [options.shouldPatchHeadMeta=false] - если true, то метатеги внутри head будут обновлены точчечно, иначе все метатеги будут удалены и добавлены заново
   */
  update(options?: { placement?: TagPlacement; shouldPatchHeadMeta?: boolean }) {
    const { placement = 'head', shouldPatchHeadMeta = false } = options ?? {};

    const placementElement = document[placement] || document.querySelector(placement);
    const isHeadPlacementElement = placementElement instanceof HTMLHeadElement;

    const fragment = document.createDocumentFragment();
    const addTags = this.meta.dataCollection(placement).map(create);

    const removeTags = placementElement.querySelectorAll(`[${META_DATA_ATTR}]`);

    // Преобразуем NodeList в массив для удобства работы
    const removeTagsArray = Array.from(removeTags);

    if (shouldPatchHeadMeta && isHeadPlacementElement) {
      this.patchHeadMeta({ head: placementElement, addTags, removeTagsArray });
    } else {
      // Удаляем все существующие метатеги
      removeTagsArray.forEach((tag) => placementElement.removeChild(tag));
    }

    addTags.forEach((tag) => fragment.appendChild(tag));

    if (isHeadPlacementElement) {
      placementElement.insertBefore(fragment, placementElement.firstChild);
    } else {
      const { childNodes } = placementElement;
      let bodyTailAnalyticsStart: ChildNode | null = null;

      const BODY_TAIL_ANALYTICS_START_PLACEMENT = 'START OF SLOT body:tail:analytics';

      for (let i = 0; i < childNodes.length; i++) {
        const child = childNodes[i];
        if (
          child.nodeType === Node.COMMENT_NODE &&
          child.textContent?.trim() === BODY_TAIL_ANALYTICS_START_PLACEMENT
        ) {
          bodyTailAnalyticsStart = child;
          break;
        }
      }

      if (bodyTailAnalyticsStart) {
        placementElement.insertBefore(fragment, bodyTailAnalyticsStart.nextSibling);
        return;
      }

      placementElement.appendChild(fragment);
    }
  }
}
