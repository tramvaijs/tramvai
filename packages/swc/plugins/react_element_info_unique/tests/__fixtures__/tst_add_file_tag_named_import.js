// eslint-disable-next-line import/no-extraneous-dependencies
import { createElement } from 'react';
const element = createElement('div', Object.assign({}, {
    "data-qa-file": "tst_add_file_tag_named_import"
}));
const obj = {
    role: 'button'
};
const withSpreadElement = createElement('div', Object.assign({
    "data-qa-file": "tst_add_file_tag_named_import"
}, {
    ...obj
}));
const withObjPassedElement = createElement('div', Object.assign({
    "data-qa-file": "tst_add_file_tag_named_import"
}, {
    role: 'button'
}));
const withVariablePassedElemeent = createElement('div', Object.assign({
    "data-qa-file": "tst_add_file_tag_named_import"
}, obj));
