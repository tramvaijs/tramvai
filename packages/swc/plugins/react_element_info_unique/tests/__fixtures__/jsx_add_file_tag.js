// @ts-ignore
// eslint-disable-next-line import/no-unresolved, import/no-extraneous-dependencies
import React from 'react';
const Header = ()=>{
    return <h1 data-qa-file="jsx_add_file_tag">Hello World</h1>;
};
export const Component = ()=>{
    return <div data-qa-file="jsx_add_file_tag">

      <Header data-qa-file="jsx_add_file_tag"/>

      <p className="hello" data-qa-file="jsx_add_file_tag">Opapapa</p>

    </div>;
};
