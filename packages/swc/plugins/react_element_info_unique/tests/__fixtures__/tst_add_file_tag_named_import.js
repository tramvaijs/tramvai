// eslint-disable-next-line import/no-extraneous-dependencies
import { createElement } from 'react';
const element = createElement('div', {
    "data-qa-file": "tst_add_file_tag_named_import"
});
const obj = {
    role: 'button'
};
const withSpreadElement = createElement('div', {
    ...obj,
    "data-qa-file": "tst_add_file_tag_named_import",
});
const withObjPassedElement = createElement('div', {
    role: 'button',
    "data-qa-file": "tst_add_file_tag_named_import",
});
const withVariablePassedElemeent = createElement('div', Object.assign({
    "data-qa-file": "tst_add_file_tag_named_import"
}, obj));
