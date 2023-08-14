"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[9275],{3905:(e,t,r)=>{r.d(t,{Zo:()=>d,kt:()=>m});var n=r(7294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function l(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function s(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},i=Object.keys(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var o=n.createContext({}),u=function(e){var t=n.useContext(o),r=t;return e&&(r="function"==typeof e?e(t):l(l({},t),e)),r},d=function(e){var t=u(e.components);return n.createElement(o.Provider,{value:t},e.children)},p={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},v=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,i=e.originalType,o=e.parentName,d=s(e,["components","mdxType","originalType","parentName"]),v=u(r),m=a,c=v["".concat(o,".").concat(m)]||v[m]||p[m]||i;return r?n.createElement(c,l(l({ref:t},d),{},{components:r})):n.createElement(c,l({ref:t},d))}));function m(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=r.length,l=new Array(i);l[0]=v;var s={};for(var o in t)hasOwnProperty.call(t,o)&&(s[o]=t[o]);s.originalType=e,s.mdxType="string"==typeof e?e:a,l[1]=s;for(var u=2;u<i;u++)l[u]=r[u];return n.createElement.apply(null,l)}return n.createElement.apply(null,r)}v.displayName="MDXCreateElement"},2775:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>d,contentTitle:()=>o,default:()=>m,frontMatter:()=>s,metadata:()=>u,toc:()=>p});var n=r(7462),a=r(3366),i=(r(7294),r(3905)),l=["components"],s={},o=void 0,u={unversionedId:"references/libs/env-validators",id:"references/libs/env-validators",title:"env-validators",description:"Tiny library with validators for env variables",source:"@site/tmp-docs/references/libs/env-validators.md",sourceDirName:"references/libs",slug:"/references/libs/env-validators",permalink:"/docs/references/libs/env-validators",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/get-started/overview.md/tmp-docs/references/libs/env-validators.md",tags:[],version:"current",frontMatter:{},sidebar:"sidebar",previous:{title:"dippy",permalink:"/docs/references/libs/dippy"},next:{title:"error-handlers",permalink:"/docs/references/libs/error-handlers"}},d={},p=[{value:"Installation",id:"installation",level:2},{value:"Validators List",id:"validators-list",level:2},{value:"Validators Interface",id:"validators-interface",level:2},{value:"Usage",id:"usage",level:2},{value:"isUrl",id:"isurl",level:3},{value:"isNumber",id:"isnumber",level:3},{value:"isTrue",id:"istrue",level:3},{value:"isFalse",id:"isfalse",level:3},{value:"isOneOf",id:"isoneof",level:3},{value:"startsWith",id:"startswith",level:3},{value:"endsWith",id:"endswith",level:3},{value:"Combinations of validators",id:"combinations-of-validators",level:2}],v={toc:p};function m(e){var t=e.components,r=(0,a.Z)(e,l);return(0,i.kt)("wrapper",(0,n.Z)({},v,r,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"Tiny library with validators for env variables"),(0,i.kt)("h2",{id:"installation"},"Installation"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-bash"},"npm i --save @tinkoff/env-validators\n")),(0,i.kt)("p",null,"or"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-bash"},"yarn add @tinkoff/env-validators\n")),(0,i.kt)("h2",{id:"validators-list"},"Validators List"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},"isUrl - check if string is valid URL"),(0,i.kt)("li",{parentName:"ul"},"isNumber - check if value is number"),(0,i.kt)("li",{parentName:"ul"},"isTrue - check if value is true"),(0,i.kt)("li",{parentName:"ul"},"isFalse - check if value is false"),(0,i.kt)("li",{parentName:"ul"},"isOneOf - check if value is one of presented")),(0,i.kt)("h2",{id:"validators-interface"},"Validators Interface"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre"},"(value: string) => boolean | string;\n")),(0,i.kt)("p",null,"Returns any boolean (true or false) if value is valid, string with error otherwise"),(0,i.kt)("h2",{id:"usage"},"Usage"),(0,i.kt)("h3",{id:"isurl"},"isUrl"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-tsx"},"import { isUrl } from '@tinkoff/env-validators';\n\nisUrl('https://google.com'); // false\nisUrl('Not valid url'); // 'URL is not valid'\n")),(0,i.kt)("h3",{id:"isnumber"},"isNumber"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-tsx"},"import { isNumber } from '@tinkoff/env-validators';\n\nisNumber('https://google.com'); // value is not a number\nisNumber('5'); // true\n")),(0,i.kt)("h3",{id:"istrue"},"isTrue"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-tsx"},"import { isTrue } from '@tinkoff/env-validators';\n\nisTrue('something'); // value is not a true\nisTrue('true'); // true\n")),(0,i.kt)("h3",{id:"isfalse"},"isFalse"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-tsx"},"import { isFalse } from '@tinkoff/env-validators';\n\nisFalse('true'); // value is not a false\nisFalse('false'); // true\n")),(0,i.kt)("h3",{id:"isoneof"},"isOneOf"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-tsx"},"import { isOneOf } from '@tinkoff/env-validators';\n\nisOneOf(['1', '2', '3'])('isOneOf'); // value is not in list\nisOneOf(['1', '2'])('1'); // true\nisOneOf(['true', 'false'])('true'); // true\n")),(0,i.kt)("h3",{id:"startswith"},"startsWith"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-tsx"},"import { startsWith } from '@tinkoff/env-validators';\n\nstartsWith('https')('http://google.com'); // value should starts with https\nstartsWith('http')('http://yandex.ru'); // true\n")),(0,i.kt)("h3",{id:"endswith"},"endsWith"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-tsx"},"import { endsWith } from '@tinkoff/env-validators';\n\nendsWith('/')('https://google.com'); // value should ends with /\nendsWith('/')('http://yandex.ru/'); // true\n")),(0,i.kt)("p",null,"or to validate ENV variable in @tramvai"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre"},"import { provide } from '@tramvai/core';\nimport { isUrl } from '@tinkoff/env-validators';\nimport { ENV_USED_TOKEN } from '@tramvai/module-common';\n\nproviders: [\n  provide({\n    provide: ENV_USED_TOKEN,\n    multi: true,\n    useValue: [\n      { key: 'TINKOFF_API', validator: isUrl },\n    ],\n  }),\n]\n")),(0,i.kt)("h2",{id:"combinations-of-validators"},"Combinations of validators"),(0,i.kt)("p",null,"To combine two or more validators call ",(0,i.kt)("inlineCode",{parentName:"p"},"combineValidators")," method like this:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre"},"import { endsWith, isUrl, combineValidators } from '@tinkoff/env-validators';\n\ncombineValidators([isUrl, endsWith('/')])('https://google.com'); // 'value should ends with /'\ncombineValidators([isUrl, endsWith('/')])('not url but with backslash/'); // 'URL is not valid'\ncombineValidators([isUrl, endsWith('/')])('not url at all'); // 'URL is not valid; value should ends with /'\ncombineValidators([isUrl, endsWith('/')])('https://google.com/'); // false\n")),(0,i.kt)("p",null,"or to validate ENV variable in @tramvai"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre"},"import { provide } from '@tramvai/core';\nimport { endsWith, isUrl, combineValidators } from '@tinkoff/env-validators';\nimport { ENV_USED_TOKEN } from '@tramvai/module-common';\n\nproviders: [\n  provide({\n    provide: ENV_USED_TOKEN,\n    multi: true,\n    useValue: [\n      { key: 'TINKOFF_API', validator: combineValidators([isUrl, endsWith('/')]) },\n    ],\n  }),\n]\n")))}m.isMDXComponent=!0}}]);