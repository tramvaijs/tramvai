// eslint-disable-next-line import/no-extraneous-dependencies
import React from 'react';
const element = React.createElement('div', Object.assign({}, {
    "data-qa-file": "ts_add_file_tag"
}));
const obj = {
    role: 'button'
};
const withSpreadElement = React.createElement('div', Object.assign({
    "data-qa-file": "ts_add_file_tag"
}, {
    ...obj
}));
const withObjPassedElement = React.createElement('div', Object.assign({
    "data-qa-file": "ts_add_file_tag"
}, {
    role: 'button'
}));
const withVariablePassedElemeent = React.createElement('div', Object.assign({
    "data-qa-file": "ts_add_file_tag"
}, obj));
