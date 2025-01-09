"use strict";(globalThis.webpackChunk=globalThis.webpackChunk||[]).push([[702],{3905:(e,t,r)=>{r.d(t,{Zo:()=>p,kt:()=>f});var n=r(7294);function s(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function a(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function i(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?a(Object(r),!0).forEach((function(t){s(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):a(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function o(e,t){if(null==e)return{};var r,n,s=function(e,t){if(null==e)return{};var r,n,s={},a=Object.keys(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||(s[r]=e[r]);return s}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(s[r]=e[r])}return s}var l=n.createContext({}),u=function(e){var t=n.useContext(l),r=t;return e&&(r="function"==typeof e?e(t):i(i({},t),e)),r},p=function(e){var t=u(e.components);return n.createElement(l.Provider,{value:t},e.children)},c={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},m=n.forwardRef((function(e,t){var r=e.components,s=e.mdxType,a=e.originalType,l=e.parentName,p=o(e,["components","mdxType","originalType","parentName"]),m=u(r),f=s,y=m["".concat(l,".").concat(f)]||m[f]||c[f]||a;return r?n.createElement(y,i(i({ref:t},p),{},{components:r})):n.createElement(y,i({ref:t},p))}));function f(e,t){var r=arguments,s=t&&t.mdxType;if("string"==typeof e||s){var a=r.length,i=new Array(a);i[0]=m;var o={};for(var l in t)hasOwnProperty.call(t,l)&&(o[l]=t[l]);o.originalType=e,o.mdxType="string"==typeof e?e:s,i[1]=o;for(var u=2;u<a;u++)i[u]=r[u];return n.createElement.apply(null,i)}return n.createElement.apply(null,r)}m.displayName="MDXCreateElement"},5495:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>l,contentTitle:()=>i,default:()=>c,frontMatter:()=>a,metadata:()=>o,toc:()=>u});var n=r(7462),s=(r(7294),r(3905));const a={},i=void 0,o={unversionedId:"references/libs/measure-fastify-requests",id:"references/libs/measure-fastify-requests",title:"measure-fastify-requests",description:"Library for measuring RED metrics in the fastify app",source:"@site/tmp-docs/references/libs/measure-fastify-requests.md",sourceDirName:"references/libs",slug:"/references/libs/measure-fastify-requests",permalink:"/docs/references/libs/measure-fastify-requests",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/tmp-docs/references/libs/measure-fastify-requests.md",tags:[],version:"current",frontMatter:{},sidebar:"sidebar",previous:{title:"measure-express-requests",permalink:"/docs/references/libs/measure-express-requests"},next:{title:"meta-tags-generate",permalink:"/docs/references/libs/meta-tags-generate"}},l={},u=[{value:"Example",id:"example",level:2}],p={toc:u};function c({components:e,...t}){return(0,s.kt)("wrapper",(0,n.Z)({},p,t,{components:e,mdxType:"MDXLayout"}),(0,s.kt)("p",null,"Library for measuring RED metrics in the fastify app"),(0,s.kt)("h2",{id:"example"},"Example"),(0,s.kt)("pre",null,(0,s.kt)("code",{parentName:"pre",className:"language-ts"},"import fastify from 'fastify';\nimport { fastifyMeasureRequests } from '@tinkoff/measure-fastify-requests';\nimport { Counter, Histogram } from 'prom-client';\n\nconst app = fastify();\n\napp.register(fastifyMeasureRequests, {\n  metrics: {\n    counter: (opt) => new Counter(opt),\n    histogram: (opt) => new Histogram(opt),\n  },\n});\n")),(0,s.kt)("p",null,"In the prom-client registry new metrics will be available:"),(0,s.kt)("ul",null,(0,s.kt)("li",{parentName:"ul"},(0,s.kt)("inlineCode",{parentName:"li"},"http_requests_total")," - number of incoming requests;"),(0,s.kt)("li",{parentName:"ul"},(0,s.kt)("inlineCode",{parentName:"li"},"http_requests_errors")," - number of errors in the incoming requests;"),(0,s.kt)("li",{parentName:"ul"},(0,s.kt)("inlineCode",{parentName:"li"},"http_requests_execution_time")," - histogram with the request handler execution time."),(0,s.kt)("li",{parentName:"ul"},(0,s.kt)("inlineCode",{parentName:"li"},"http_requests_first_byte_time")," - histogram with the request handler first byte sent time.")))}c.isMDXComponent=!0}}]);