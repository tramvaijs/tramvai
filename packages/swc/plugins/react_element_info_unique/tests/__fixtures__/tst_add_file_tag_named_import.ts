// eslint-disable-next-line import/no-extraneous-dependencies
import { createElement } from 'react';

const element = createElement('div');

const obj = { role: 'button' };
const withSpreadElement = createElement('div', { ...obj });
const withObjPassedElement = createElement('div', { role: 'button' });
const withVariablePassedElemeent = createElement('div', obj);
