// @ts-ignore
// eslint-disable-next-line import/no-unresolved, import/no-extraneous-dependencies
import React from 'react';
// @ts-ignore
// eslint-disable-next-line import/no-unresolved, import/no-extraneous-dependencies
import { createElement } from 'parse5';
// @ts-ignore
// eslint-disable-next-line import/no-unresolved, import/no-extraneous-dependencies
import * as Parse5 from 'parse5';
// @ts-ignore
// eslint-disable-next-line import/no-unresolved, import/no-extraneous-dependencies
import OtherLibraryDefaultExport from 'other-library';
// Using React.createElement (should be modified)
export const ReactComponent = ()=>{
    return React.createElement('div', {
        className: 'react',
        "data-qa-file": "non_react_create_element"
    }, React.createElement('p', {
        "data-qa-file": "non_react_create_element"
    }, 'This is React'));
};
// Using createElement from other library (should NOT be modified)
export const OtherLibraryComponent = ()=>{
    return createElement('div', {
        className: 'other'
    }, createElement('p', null, 'This is other library'));
};
// Using createElement from Parse5 (should NOT be modified)
export const Parse5Component = ()=>{
    // @ts-ignore
    return Parse5.createElement('div', {
        className: 'parse5'
    }, // @ts-ignore
    Parse5.createElement('p', null, 'This is parse5'));
};
// Using createElement from OtherLibraryDefaultExport (should NOT be modified)
export const OtherLibraryDefaultExportComponent = ()=>{
    return OtherLibraryDefaultExport.createElement('div', {
        className: 'OtherLibraryDefaultExport'
    }, OtherLibraryDefaultExport.createElement('p', null, 'This is OtherLibraryDefaultExport'));
};
