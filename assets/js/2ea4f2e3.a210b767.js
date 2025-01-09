"use strict";(globalThis.webpackChunk=globalThis.webpackChunk||[]).push([[8624],{3905:(e,t,r)=>{r.d(t,{Zo:()=>p,kt:()=>f});var n=r(7294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function s(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function o(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},i=Object.keys(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var c=n.createContext({}),l=function(e){var t=n.useContext(c),r=t;return e&&(r="function"==typeof e?e(t):s(s({},t),e)),r},p=function(e){var t=l(e.components);return n.createElement(c.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},m=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,i=e.originalType,c=e.parentName,p=o(e,["components","mdxType","originalType","parentName"]),m=l(r),f=a,d=m["".concat(c,".").concat(f)]||m[f]||u[f]||i;return r?n.createElement(d,s(s({ref:t},p),{},{components:r})):n.createElement(d,s({ref:t},p))}));function f(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=r.length,s=new Array(i);s[0]=m;var o={};for(var c in t)hasOwnProperty.call(t,c)&&(o[c]=t[c]);o.originalType=e,o.mdxType="string"==typeof e?e:a,s[1]=o;for(var l=2;l<i;l++)s[l]=r[l];return n.createElement.apply(null,s)}return n.createElement.apply(null,r)}m.displayName="MDXCreateElement"},9717:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>c,contentTitle:()=>s,default:()=>u,frontMatter:()=>i,metadata:()=>o,toc:()=>l});var n=r(7462),a=(r(7294),r(3905));const i={},s=void 0,o={unversionedId:"references/libs/meta-tags-generate",id:"references/libs/meta-tags-generate",title:"meta-tags-generate",description:"Library for generating and updating meta-tags in browser.",source:"@site/tmp-docs/references/libs/meta-tags-generate.md",sourceDirName:"references/libs",slug:"/references/libs/meta-tags-generate",permalink:"/docs/references/libs/meta-tags-generate",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/tmp-docs/references/libs/meta-tags-generate.md",tags:[],version:"current",frontMatter:{},sidebar:"sidebar",previous:{title:"measure-fastify-requests",permalink:"/docs/references/libs/measure-fastify-requests"},next:{title:"minicss",permalink:"/docs/references/libs/minicss"}},c={},l=[{value:"Api",id:"api",level:2}],p={toc:l};function u({components:e,...t}){return(0,a.kt)("wrapper",(0,n.Z)({},p,t,{components:e,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"Library for generating and updating meta-tags in browser."),(0,a.kt)("p",null,"Link to complete SEO and Meta documentation - ",(0,a.kt)("a",{parentName:"p",href:"https://tramvai.dev/docs/features/seo/"},"https://tramvai.dev/docs/features/seo/")),(0,a.kt)("h2",{id:"api"},"Api"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"Meta({ list: [] }): Meta")," - object used for constructing an instance of meta-tags based on passed sources"),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"Render(meta: Meta): { render(): string }")," - render of specific ",(0,a.kt)("em",{parentName:"li"},"Meta")," instance as a string. Used in SSR"),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"Update(meta: Meta): { update(): void }")," - updates meta-tags layout in browser. Used in browser while SPA-navigations")))}u.isMDXComponent=!0}}]);