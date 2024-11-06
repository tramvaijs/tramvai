"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[6059],{3905:function(e,t,r){r.d(t,{Zo:function(){return p},kt:function(){return d}});var n=r(7294);function o(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function a(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function c(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?a(Object(r),!0).forEach((function(t){o(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):a(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function i(e,t){if(null==e)return{};var r,n,o=function(e,t){if(null==e)return{};var r,n,o={},a=Object.keys(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||(o[r]=e[r]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(o[r]=e[r])}return o}var s=n.createContext({}),u=function(e){var t=n.useContext(s),r=t;return e&&(r="function"==typeof e?e(t):c(c({},t),e)),r},p=function(e){var t=u(e.components);return n.createElement(s.Provider,{value:t},e.children)},l={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},f=n.forwardRef((function(e,t){var r=e.components,o=e.mdxType,a=e.originalType,s=e.parentName,p=i(e,["components","mdxType","originalType","parentName"]),f=u(r),d=o,y=f["".concat(s,".").concat(d)]||f[d]||l[d]||a;return r?n.createElement(y,c(c({ref:t},p),{},{components:r})):n.createElement(y,c({ref:t},p))}));function d(e,t){var r=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var a=r.length,c=new Array(a);c[0]=f;var i={};for(var s in t)hasOwnProperty.call(t,s)&&(i[s]=t[s]);i.originalType=e,i.mdxType="string"==typeof e?e:o,c[1]=i;for(var u=2;u<a;u++)c[u]=r[u];return n.createElement.apply(null,c)}return n.createElement.apply(null,r)}f.displayName="MDXCreateElement"},5169:function(e,t,r){r.r(t),r.d(t,{assets:function(){return s},contentTitle:function(){return c},default:function(){return l},frontMatter:function(){return a},metadata:function(){return i},toc:function(){return u}});var n=r(7462),o=(r(7294),r(3905));const a={},c=void 0,i={unversionedId:"references/tokens/react-query",id:"references/tokens/react-query",title:"react-query",description:"Tramvai tokens for integration and extension react-query module.",source:"@site/tmp-docs/references/tokens/react-query.md",sourceDirName:"references/tokens",slug:"/references/tokens/react-query",permalink:"/docs/references/tokens/react-query",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/tmp-docs/references/tokens/react-query.md",tags:[],version:"current",frontMatter:{},sidebar:"sidebar",previous:{title:"metrics",permalink:"/docs/references/tokens/metrics"},next:{title:"render",permalink:"/docs/references/tokens/render"}},s={},u=[{value:"Tokens list",id:"tokens-list",level:2}],p={toc:u};function l(e){let{components:t,...r}=e;return(0,o.kt)("wrapper",(0,n.Z)({},p,r,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"Tramvai tokens for integration and extension ",(0,o.kt)("a",{parentName:"p",href:"/docs/references/modules/react-query"},"react-query module"),"."),(0,o.kt)("h2",{id:"tokens-list"},"Tokens list"),(0,o.kt)("p",null,(0,o.kt)("pre",{parentName:"p"},(0,o.kt)("code",{parentName:"pre",className:"language-typescript"},"import { createToken } from '@tinkoff/dippy';\nimport type { ActionConditionsParameters } from '@tramvai/core';\nimport type { QueryClient, DefaultOptions, DehydratedState } from '@tanstack/react-query';\n\ndeclare module '@tanstack/react-query' {\n  interface QueryOptions {\n    // settings custom options for the query that might be used later in the tramvai modules\n    tramvaiOptions?: {\n      conditions?: ActionConditionsParameters;\n    };\n  }\n}\n\n/**\n * @description\n * [react-query client](https://tanstack.com/query/v4/docs/reference/QueryClient)\n */\n\nexport const QUERY_CLIENT_TOKEN = createToken<QueryClient>('reactQuery queryClient');\n\n/**\n * @description\n * [default options for the react-query](https://tanstack.com/query/v4/docs/guides/important-defaults)\n */\nexport const QUERY_CLIENT_DEFAULT_OPTIONS_TOKEN = createToken<DefaultOptions>(\n  'reactQuery queryClientDefaultOptions'\n);\n\n/**\n * @description\n * [react-query state](https://tanstack.com/query/v4/docs/reference/hydration#dehydrate) that was initialized on the server\n */\nexport const QUERY_CLIENT_DEHYDRATED_STATE_TOKEN = createToken<DehydratedState>(\n  'reactQuery queryClientDehydratedState'\n);\n\nexport const QUERY_DEHYDRATE_STATE_NAME_TOKEN = createToken<string>(\n  'reactQuery dehydrate state name'\n);\n\n"))))}l.isMDXComponent=!0}}]);