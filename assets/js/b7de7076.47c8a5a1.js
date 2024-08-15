"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[9653],{3905:(e,t,r)=>{r.d(t,{Zo:()=>s,kt:()=>m});var n=r(7294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function o(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function i(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?o(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function c(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},o=Object.keys(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var l=n.createContext({}),p=function(e){var t=n.useContext(l),r=t;return e&&(r="function"==typeof e?e(t):i(i({},t),e)),r},s=function(e){var t=p(e.components);return n.createElement(l.Provider,{value:t},e.children)},f={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},u=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,o=e.originalType,l=e.parentName,s=c(e,["components","mdxType","originalType","parentName"]),u=p(r),m=a,y=u["".concat(l,".").concat(m)]||u[m]||f[m]||o;return r?n.createElement(y,i(i({ref:t},s),{},{components:r})):n.createElement(y,i({ref:t},s))}));function m(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=r.length,i=new Array(o);i[0]=u;var c={};for(var l in t)hasOwnProperty.call(t,l)&&(c[l]=t[l]);c.originalType=e,c.mdxType="string"==typeof e?e:a,i[1]=c;for(var p=2;p<o;p++)i[p]=r[p];return n.createElement.apply(null,i)}return n.createElement.apply(null,r)}u.displayName="MDXCreateElement"},1352:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>s,contentTitle:()=>l,default:()=>m,frontMatter:()=>c,metadata:()=>p,toc:()=>f});var n=r(7462),a=r(3366),o=(r(7294),r(3905)),i=["components"],c={},l=void 0,p={unversionedId:"references/libs/tinkoff-layout",id:"references/libs/tinkoff-layout",title:"tinkoff-layout",description:"Installation",source:"@site/tmp-docs/references/libs/tinkoff-layout.md",sourceDirName:"references/libs",slug:"/references/libs/tinkoff-layout",permalink:"/docs/references/libs/tinkoff-layout",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/tmp-docs/references/libs/tinkoff-layout.md",tags:[],version:"current",frontMatter:{},sidebar:"sidebar",previous:{title:"terminus",permalink:"/docs/references/libs/terminus"},next:{title:"tinkoff-request-http-client-adapter",permalink:"/docs/references/libs/tinkoff-request-http-client-adapter"}},s={},f=[{value:"Installation",id:"installation",level:2}],u={toc:f};function m(e){var t=e.components,r=(0,a.Z)(e,i);return(0,o.kt)("wrapper",(0,n.Z)({},u,r,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("h2",{id:"installation"},"Installation"),(0,o.kt)("p",null,"Install ",(0,o.kt)("inlineCode",{parentName:"p"},"@tinkoff/layout-factory")," using your package manager, e.g. for npm:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-bash"},"npm i @tinkoff/layout-factory\n")),(0,o.kt)("p",null,"Create new layout object"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-tsx"},"import React from 'react';\nimport { createLayout } from '@tinkoff/layout-factory';\nimport { Content, Page, Feedback } from './components';\nimport { layoutWrapper, feedbackWrapper } from './wrappers';\n\nconst MyLayout = createLayout({\n  components: {\n    page: Page,\n    content: Content,\n    feedback: Feedback,\n  },\n  wrappers: {\n    layout: layoutWrapper,\n    feedback: feedbackWrapper,\n  },\n});\n")))}m.isMDXComponent=!0}}]);