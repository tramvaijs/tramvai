"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[9535],{3905:(e,t,l)=>{l.d(t,{Zo:()=>c,kt:()=>u});var r=l(7294);function n(e,t,l){return t in e?Object.defineProperty(e,t,{value:l,enumerable:!0,configurable:!0,writable:!0}):e[t]=l,e}function i(e,t){var l=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),l.push.apply(l,r)}return l}function a(e){for(var t=1;t<arguments.length;t++){var l=null!=arguments[t]?arguments[t]:{};t%2?i(Object(l),!0).forEach((function(t){n(e,t,l[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(l)):i(Object(l)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(l,t))}))}return e}function o(e,t){if(null==e)return{};var l,r,n=function(e,t){if(null==e)return{};var l,r,n={},i=Object.keys(e);for(r=0;r<i.length;r++)l=i[r],t.indexOf(l)>=0||(n[l]=e[l]);return n}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)l=i[r],t.indexOf(l)>=0||Object.prototype.propertyIsEnumerable.call(e,l)&&(n[l]=e[l])}return n}var s=r.createContext({}),p=function(e){var t=r.useContext(s),l=t;return e&&(l="function"==typeof e?e(t):a(a({},t),e)),l},c=function(e){var t=p(e.components);return r.createElement(s.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},f=r.forwardRef((function(e,t){var l=e.components,n=e.mdxType,i=e.originalType,s=e.parentName,c=o(e,["components","mdxType","originalType","parentName"]),f=p(l),u=n,m=f["".concat(s,".").concat(u)]||f[u]||d[u]||i;return l?r.createElement(m,a(a({ref:t},c),{},{components:l})):r.createElement(m,a({ref:t},c))}));function u(e,t){var l=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var i=l.length,a=new Array(i);a[0]=f;var o={};for(var s in t)hasOwnProperty.call(t,s)&&(o[s]=t[s]);o.originalType=e,o.mdxType="string"==typeof e?e:n,a[1]=o;for(var p=2;p<i;p++)a[p]=l[p];return r.createElement.apply(null,a)}return r.createElement.apply(null,l)}f.displayName="MDXCreateElement"},3220:(e,t,l)=>{l.r(t),l.d(t,{assets:()=>c,contentTitle:()=>s,default:()=>u,frontMatter:()=>o,metadata:()=>p,toc:()=>d});var r=l(7462),n=l(3366),i=(l(7294),l(3905)),a=["components"],o={},s=void 0,p={unversionedId:"references/libs/main-polyfills",id:"references/libs/main-polyfills",title:"main-polyfills",description:"Tramvai has polyfills integration:",source:"@site/tmp-docs/references/libs/main-polyfills.md",sourceDirName:"references/libs",slug:"/references/libs/main-polyfills",permalink:"/docs/references/libs/main-polyfills",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/get-started/overview.md/tmp-docs/references/libs/main-polyfills.md",tags:[],version:"current",frontMatter:{},sidebar:"sidebar",previous:{title:"logger",permalink:"/docs/references/libs/logger"},next:{title:"measure-express-requests",permalink:"/docs/references/libs/measure-express-requests"}},c={},d=[{value:"Setup",id:"setup",level:2},{value:"Install polyfills pack",id:"install-polyfills-pack",level:4},{value:"Create a file polyfill.ts",id:"create-a-file-polyfillts",level:4},{value:"Set up @tramvai/cli",id:"set-up-tramvaicli",level:4},{value:"How polyfills loading works",id:"how-polyfills-loading-works",level:2},{value:"Replacing the polyfills loading check",id:"replacing-the-polyfills-loading-check",level:2},{value:"Why would it be necessary?",id:"why-would-it-be-necessary",level:3},{value:"Important tips",id:"important-tips",level:3},{value:"Replacing the check",id:"replacing-the-check",level:2}],f={toc:d};function u(e){var t=e.components,l=(0,n.Z)(e,a);return(0,i.kt)("wrapper",(0,r.Z)({},f,l,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"Tramvai has polyfills integration:"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},"there is a separate library ",(0,i.kt)("inlineCode",{parentName:"li"},"@tinkoff/pack-polyfills")," that contains all the necessary polyfills"),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"@tramvai/cli")," build polyfills in a separate file"),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"@tramvai/module-render")," contains code that only loads polyfills where they are needed")),(0,i.kt)("h2",{id:"setup"},"Setup"),(0,i.kt)("h4",{id:"install-polyfills-pack"},"Install polyfills pack"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-bash"},"npm i --save @tinkoff/pack-polyfills\n")),(0,i.kt)("h4",{id:"create-a-file-polyfillts"},"Create a file polyfill.ts"),(0,i.kt)("p",null,"You need to create a file ",(0,i.kt)("inlineCode",{parentName:"p"},"polyfill.ts")," inside your project, for example ",(0,i.kt)("inlineCode",{parentName:"p"},"src/polyfill.ts")," and connect the polyfills inside:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-tsx"},"import '@tinkoff/pack-polyfills';\n")),(0,i.kt)("h4",{id:"set-up-tramvaicli"},"Set up @tramvai/cli"),(0,i.kt)("p",null,"After that, we need to tell ",(0,i.kt)("inlineCode",{parentName:"p"},"@tramvai/cli")," that our project has polyfills. To do this, in ",(0,i.kt)("inlineCode",{parentName:"p"},"tramvai.json")," we add for our project the line ",(0,i.kt)("inlineCode",{parentName:"p"},'"polyfill: "src/polyfill.ts"')," in ",(0,i.kt)("inlineCode",{parentName:"p"},"projects[APP_ID].polyfill")," example:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "projects": {\n    "pfphome": {\n      "name": "pfphome",\n      "root": "src",\n      "type": "application",\n      "polyfill": "src/polyfill.ts"\n    }\n  }\n}\n')),(0,i.kt)("h2",{id:"how-polyfills-loading-works"},"How polyfills loading works"),(0,i.kt)("p",null,"On the ",(0,i.kt)("inlineCode",{parentName:"p"},"@tramvai/cli")," side, we have configured to build the polyfills into a separate file, so it doesn't mix with the main code. On every build we will have a file with polyfills."),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/docs/references/modules/render"},"module-render")," if it finds polyfills in the build, then for each client embeds inline code that checks the availability of features in the browser and if the browser does not support any of the features, then we consider the browser is legacy and load polyfills. An example of a check: ",(0,i.kt)("inlineCode",{parentName:"p"},"'!window.Promise.prototype.finally || !window.URL || !window.URLSearchParams || !window.AbortController || !window.IntersectionObserver || !Object.fromEntries || !window.ResizeObserver'")),(0,i.kt)("h2",{id:"replacing-the-polyfills-loading-check"},"Replacing the polyfills loading check"),(0,i.kt)("h3",{id:"why-would-it-be-necessary"},"Why would it be necessary?"),(0,i.kt)("p",null,"If you do not fit the standard check for supported features in the browser and polyfills do not load in browsers where they should. In this case, it is better to create issue and we will update the check, or you can replace the check with another."),(0,i.kt)("h3",{id:"important-tips"},"Important tips"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"POLYFILL_CONDITION")," should return true if the browser does not support some features"),(0,i.kt)("li",{parentName:"ul"},"You should not load polyfiles into all browsers"),(0,i.kt)("li",{parentName:"ul"},"It is better to extend ",(0,i.kt)("inlineCode",{parentName:"li"},"DEFAULT_POLYFILL_CONDITION")," with additional checks, rather than replacing it")),(0,i.kt)("h2",{id:"replacing-the-check"},"Replacing the check"),(0,i.kt)("p",null,"To do this, we need to set provider ",(0,i.kt)("inlineCode",{parentName:"p"},"POLYFILL_CONDITION"),", which is in ",(0,i.kt)("inlineCode",{parentName:"p"},"import { POLYFILL_CONDITION } from '@tramvai/module-render'")," and pass a new line."),(0,i.kt)("p",null,"Example: This is a synthetic example, but suppose we want to additionally check for the presence of window.Promise in the browser, to do this we extend ",(0,i.kt)("inlineCode",{parentName:"p"},"DEFAULT_POLYFILL_CONDITION")," string. The resulting expression should return true if the browsers do not support the feature."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-tsx"},"import { POLYFILL_CONDITION, DEFAULT_POLYFILL_CONDITION } from '@tramvai/module-render';\nimport { provide } from '@tramvai/core';\n\nconst provider = provide({\n  provide: POLYFILL_CONDITION,\n  useValue: `${DEFAULT_POLYFILL_CONDITION} || !window.Promise`,\n});\n")))}u.isMDXComponent=!0}}]);