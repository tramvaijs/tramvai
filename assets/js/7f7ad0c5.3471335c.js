"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[8403],{3905:(e,t,n)=>{n.d(t,{Zo:()=>l,kt:()=>u});var r=n(7294);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function p(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function i(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var s=r.createContext({}),c=function(e){var t=r.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):p(p({},t),e)),n},l=function(e){var t=c(e.components);return r.createElement(s.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},m=r.forwardRef((function(e,t){var n=e.components,o=e.mdxType,a=e.originalType,s=e.parentName,l=i(e,["components","mdxType","originalType","parentName"]),m=c(n),u=o,f=m["".concat(s,".").concat(u)]||m[u]||d[u]||a;return n?r.createElement(f,p(p({ref:t},l),{},{components:n})):r.createElement(f,p({ref:t},l))}));function u(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var a=n.length,p=new Array(a);p[0]=m;var i={};for(var s in t)hasOwnProperty.call(t,s)&&(i[s]=t[s]);i.originalType=e,i.mdxType="string"==typeof e?e:o,p[1]=i;for(var c=2;c<a;c++)p[c]=n[c];return r.createElement.apply(null,p)}return r.createElement.apply(null,n)}m.displayName="MDXCreateElement"},9027:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>l,contentTitle:()=>s,default:()=>u,frontMatter:()=>i,metadata:()=>c,toc:()=>d});var r=n(7462),o=n(3366),a=(n(7294),n(3905)),p=["components"],i={},s=void 0,c={unversionedId:"references/tramvai/test/child-app",id:"references/tramvai/test/child-app",title:"child-app",description:"Helpers library for writing unit tests for tramvai child-app",source:"@site/tmp-docs/references/tramvai/test/child-app.md",sourceDirName:"references/tramvai/test",slug:"/references/tramvai/test/child-app",permalink:"/docs/references/tramvai/test/child-app",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/get-started/overview.md/tmp-docs/references/tramvai/test/child-app.md",tags:[],version:"current",frontMatter:{},sidebar:"sidebar",previous:{title:"@tramvai/types-actions-state-context",permalink:"/docs/references/tramvai/types-actions-state-context"},next:{title:"integration-jest",permalink:"/docs/references/tramvai/test/integration-jest"}},l={},d=[{value:"How to",id:"how-to",level:2},{value:"Test child-app main component render",id:"test-child-app-main-component-render",level:3},{value:"Test child-app di",id:"test-child-app-di",level:3}],m={toc:d};function u(e){var t=e.components,n=(0,o.Z)(e,p);return(0,a.kt)("wrapper",(0,r.Z)({},m,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"Helpers library for writing unit tests for tramvai child-app"),(0,a.kt)("p",null,"Uses ",(0,a.kt)("a",{parentName:"p",href:"/docs/references/tramvai/test/unit"},(0,a.kt)("inlineCode",{parentName:"a"},"@tramvai/test-unit"))," under hood to create test root-app that will wrap child-app."),(0,a.kt)("h2",{id:"how-to"},"How to"),(0,a.kt)("h3",{id:"test-child-app-main-component-render"},"Test child-app main component render"),(0,a.kt)("p",null,"You can get React Component returned by child-app from return value of ",(0,a.kt)("inlineCode",{parentName:"p"},"testChildApp")," function and use for example ",(0,a.kt)("inlineCode",{parentName:"p"},"testComponent")," helper from the ",(0,a.kt)("a",{parentName:"p",href:"/docs/references/tramvai/test/react"},(0,a.kt)("inlineCode",{parentName:"a"},"@tramvai/test-react"))),(0,a.kt)("admonition",{type:"warning"},(0,a.kt)("p",{parentName:"admonition"},"To properly render child-app component pass as props to it its di and optionally props object, that will be passed to the underlying child-app component.")),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-ts"},"import { testComponent } from '@tramvai/test-react';\nimport childApp from './child-app.tsx';\n\n(async () => {\n  const {\n    childApp: { Component, di },\n    close,\n  } = await testChildApp(childApp);\n  const { render } = testComponent(<Component di={di} props={{ test: 'abc' }} />);\n\n  expect(render.getByTestId('from-root').textContent).toBe('Value from Root: abc');\n})();\n")),(0,a.kt)("h3",{id:"test-child-app-di"},"Test child-app di"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-ts"},"import childApp from './child-app.tsx';\n\n(async () => {\n  const {\n    childApp: { di },\n    close,\n  } = await testChildApp(childApp);\n\n  expect(di.get(CHILD_APP_BASE_TOKEN)).toBe(\"I'm little child app\");\n})();\n")),(0,a.kt)("p",null,(0,a.kt)("details",null,(0,a.kt)("summary",null,"More examples"),(0,a.kt)("p",null,(0,a.kt)("pre",{parentName:"p"},(0,a.kt)("code",{parentName:"pre",className:"language-typescript"},"/**\n * @jest-environment jsdom\n */\nimport { testComponent } from '@tramvai/test-react';\nimport { testChildApp } from './testChildApp';\nimport BaseChildApp, { CHILD_APP_BASE_TOKEN } from './__fixtures__/base';\n\ndescribe('test/childApp/testChildApp', () => {\n  it('base test', async () => {\n    const {\n      childApp: { di, Component },\n      close,\n    } = await testChildApp(BaseChildApp);\n    const { render, rerender } = testComponent(\n      <Component di={di} props={{ fromRoot: 'test123' }} />\n    );\n\n    expect(render.getByTestId('token').textContent).toBe(\"Children App: I'm little child app\");\n    expect(render.getByTestId('from-root').textContent).toBe('Value from Root: test123');\n\n    expect(di.get(CHILD_APP_BASE_TOKEN)).toBe(\"I'm little child app\");\n\n    rerender(<Component di={di} props={{ fromRoot: 'root' }} />);\n\n    expect(render.getByTestId('from-root').textContent).toBe('Value from Root: root');\n\n    return close();\n  });\n});\n\n"))))))}u.isMDXComponent=!0}}]);