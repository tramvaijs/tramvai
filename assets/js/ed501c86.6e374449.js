"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[2819],{3905:function(e,t,r){r.d(t,{Zo:function(){return c},kt:function(){return m}});var n=r(7294);function o(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function a(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function i(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?a(Object(r),!0).forEach((function(t){o(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):a(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function u(e,t){if(null==e)return{};var r,n,o=function(e,t){if(null==e)return{};var r,n,o={},a=Object.keys(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||(o[r]=e[r]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(o[r]=e[r])}return o}var l=n.createContext({}),s=function(e){var t=n.useContext(l),r=t;return e&&(r="function"==typeof e?e(t):i(i({},t),e)),r},c=function(e){var t=s(e.components);return n.createElement(l.Provider,{value:t},e.children)},p={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},d=n.forwardRef((function(e,t){var r=e.components,o=e.mdxType,a=e.originalType,l=e.parentName,c=u(e,["components","mdxType","originalType","parentName"]),d=s(r),m=o,f=d["".concat(l,".").concat(m)]||d[m]||p[m]||a;return r?n.createElement(f,i(i({ref:t},c),{},{components:r})):n.createElement(f,i({ref:t},c))}));function m(e,t){var r=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var a=r.length,i=new Array(a);i[0]=d;var u={};for(var l in t)hasOwnProperty.call(t,l)&&(u[l]=t[l]);u.originalType=e,u.mdxType="string"==typeof e?e:o,i[1]=u;for(var s=2;s<a;s++)i[s]=r[s];return n.createElement.apply(null,i)}return n.createElement.apply(null,r)}d.displayName="MDXCreateElement"},7900:function(e,t,r){r.r(t),r.d(t,{assets:function(){return l},contentTitle:function(){return i},default:function(){return p},frontMatter:function(){return a},metadata:function(){return u},toc:function(){return s}});var n=r(7462),o=(r(7294),r(3905));const a={},i=void 0,u={unversionedId:"references/modules/router/base",id:"references/modules/router/base",title:"base",description:"Module for routing in the application. Exports two sub-modules: with client SPA transitions, and no-SPA.",source:"@site/tmp-docs/references/modules/router/base.md",sourceDirName:"references/modules/router",slug:"/references/modules/router/base",permalink:"/docs/references/modules/router/base",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/tmp-docs/references/modules/router/base.md",tags:[],version:"current",frontMatter:{},sidebar:"sidebar",previous:{title:"request-limiter",permalink:"/docs/references/modules/request-limiter"},next:{title:"sentry",permalink:"/docs/references/modules/sentry"}},l={},s=[{value:"Installation",id:"installation",level:2},{value:"Explanation",id:"explanation",level:2},{value:"Exported tokens",id:"exported-tokens",level:2}],c={toc:s};function p(e){let{components:t,...r}=e;return(0,o.kt)("wrapper",(0,n.Z)({},c,r,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"Module for routing in the application. Exports two sub-modules: with client SPA transitions, and no-SPA."),(0,o.kt)("p",null,"Link to complete Router documentation - ",(0,o.kt)("a",{parentName:"p",href:"https://tramvai.dev/docs/features/routing/overview/"},"https://tramvai.dev/docs/features/routing/overview/")),(0,o.kt)("h2",{id:"installation"},"Installation"),(0,o.kt)("p",null,"You need to install ",(0,o.kt)("inlineCode",{parentName:"p"},"@tramvai/module-router"),":"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-bash"},"yarn add @tramvai/module-router\n")),(0,o.kt)("p",null,"And connect in the project:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-tsx"},"import { createApp } from '@tramvai/core';\nimport { NoSpaRouterModule, SpaRouterModule } from '@tramvai/module-router';\n\ncreateApp({\n  name: 'tincoin',\n  modules: [SpaRouterModule],\n  // modules: [ NoSpaRouterModule ], if you want to disable client SPA transitions\n});\n")),(0,o.kt)("h2",{id:"explanation"},"Explanation"),(0,o.kt)("p",null,"The module is based on the library ",(0,o.kt)("a",{parentName:"p",href:"/docs/references/libs/router"},"@tinkoff/router")),(0,o.kt)("h2",{id:"exported-tokens"},"Exported tokens"),(0,o.kt)("p",null,(0,o.kt)("a",{parentName:"p",href:"/docs/references/tokens/router"},"link")))}p.isMDXComponent=!0}}]);