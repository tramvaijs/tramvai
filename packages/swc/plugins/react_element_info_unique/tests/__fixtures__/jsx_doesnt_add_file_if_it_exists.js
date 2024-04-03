// @ts-ignore
// eslint-disable-next-line import/no-unresolved, import/no-extraneous-dependencies
import React from 'react';
const Header = ()=>{
    return <h1 data-qa-file="tag_from_user">Hello World</h1>;
};
export const Component = ()=>{
    return <div data-qa-file="tag_from_user">

      <Header data-qa-file="tag_from_user"/>

      <p className="hello" data-qa-file="tag_from_user" style={{
        color: 'red'
    }}>

        Opapapa

      </p>

    </div>;
};
