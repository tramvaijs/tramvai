// eslint-disable-next-line import/no-extraneous-dependencies
import React from 'react';
const element = React.createElement('div', {
    "data-qa-file": "ts_add_file_tag"
});
const obj = {
    role: 'button'
};
const withSpreadElement = React.createElement('div', {
    ...obj,
    "data-qa-file": "ts_add_file_tag"
});
const withObjPassedElement = React.createElement('div', {
    role: 'button',
    "data-qa-file": "ts_add_file_tag"
});
const withVariablePassedElemeent = React.createElement('div', Object.assign({
    "data-qa-file": "ts_add_file_tag"
}, obj));
