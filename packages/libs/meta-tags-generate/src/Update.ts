import eachObj from '@tinkoff/utils/object/each';
import type { Meta } from './Meta';
import { META_DATA_ATTR } from './constants';
import type { PatchMeta, TagRecord } from './Meta.h';

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
  private patchMeta({ head, addTags, removeTagsArray }: PatchMeta) {
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
   * Обновляет метатеги в head
   * @param {boolean} shouldPatchMeta - если true, то метатеги будут обновлены точчечно, иначе все метатеги будут удалены и добавлены заново
   */
  update(shouldPatchMeta: boolean = false) {
    const head = document.head || document.querySelector('head');
    const addTags = this.meta.dataCollection().map(create);
    const removeTags = head.querySelectorAll(`[${META_DATA_ATTR}]`);

    const fragment = document.createDocumentFragment();

    // Преобразуем NodeList в массив для удобства работы
    const removeTagsArray = Array.from(removeTags);

    if (shouldPatchMeta) {
      this.patchMeta({ head, addTags, removeTagsArray });
    } else {
      // Удаляем все существующие метатеги
      removeTagsArray.forEach((tag) => head.removeChild(tag));
    }

    addTags.forEach((tag) => fragment.appendChild(tag));

    head.insertBefore(fragment, head.firstChild);
  }
}
