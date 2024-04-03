// eslint-disable-next-line import/no-extraneous-dependencies
import React from 'react';

const element = React.createElement('div');

const obj = { role: 'button' };
const withSpreadElement = React.createElement('div', { ...obj });
const withObjPassedElement = React.createElement('div', { role: 'button' });
const withVariablePassedElemeent = React.createElement('div', obj);
