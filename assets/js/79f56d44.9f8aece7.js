"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[9248],{3905:(e,r,t)=>{t.d(r,{Zo:()=>m,kt:()=>f});var n=t(7294);function o(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function a(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);r&&(n=n.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,n)}return t}function i(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?a(Object(t),!0).forEach((function(r){o(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):a(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}function s(e,r){if(null==e)return{};var t,n,o=function(e,r){if(null==e)return{};var t,n,o={},a=Object.keys(e);for(n=0;n<a.length;n++)t=a[n],r.indexOf(t)>=0||(o[t]=e[t]);return o}(e,r);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(n=0;n<a.length;n++)t=a[n],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(o[t]=e[t])}return o}var c=n.createContext({}),u=function(e){var r=n.useContext(c),t=r;return e&&(t="function"==typeof e?e(r):i(i({},r),e)),t},m=function(e){var r=u(e.components);return n.createElement(c.Provider,{value:r},e.children)},p={inlineCode:"code",wrapper:function(e){var r=e.children;return n.createElement(n.Fragment,{},r)}},l=n.forwardRef((function(e,r){var t=e.components,o=e.mdxType,a=e.originalType,c=e.parentName,m=s(e,["components","mdxType","originalType","parentName"]),l=u(t),f=o,d=l["".concat(c,".").concat(f)]||l[f]||p[f]||a;return t?n.createElement(d,i(i({ref:r},m),{},{components:t})):n.createElement(d,i({ref:r},m))}));function f(e,r){var t=arguments,o=r&&r.mdxType;if("string"==typeof e||o){var a=t.length,i=new Array(a);i[0]=l;var s={};for(var c in r)hasOwnProperty.call(r,c)&&(s[c]=r[c]);s.originalType=e,s.mdxType="string"==typeof e?e:o,i[1]=s;for(var u=2;u<a;u++)i[u]=t[u];return n.createElement.apply(null,i)}return n.createElement.apply(null,t)}l.displayName="MDXCreateElement"},823:(e,r,t)=>{t.r(r),t.d(r,{assets:()=>m,contentTitle:()=>c,default:()=>f,frontMatter:()=>s,metadata:()=>u,toc:()=>p});var n=t(7462),o=t(3366),a=(t(7294),t(3905)),i=["components"],s={id:"how-measure-navigation",title:"How to measure SPA navigation?"},c=void 0,u={unversionedId:"how-to/how-measure-navigation",id:"how-to/how-measure-navigation",title:"How to measure SPA navigation?",description:"In order to measure the spa-transition performance between routes, you have to connect to the router hooks. You can read more about the flow of SPA-transition in this part of the documentation.",source:"@site/tmp-docs/how-to/how-measure-navigation.md",sourceDirName:"how-to",slug:"/how-to/how-measure-navigation",permalink:"/docs/how-to/how-measure-navigation",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/get-started/overview.md/tmp-docs/how-to/how-measure-navigation.md",tags:[],version:"current",frontMatter:{id:"how-measure-navigation",title:"How to measure SPA navigation?"},sidebar:"sidebar",previous:{title:"How to enable modern mode for an application?",permalink:"/docs/how-to/how-enable-modern"},next:{title:"react-query-usage",permalink:"/docs/how-to/react-query-usage"}},m={},p=[],l={toc:p};function f(e){var r=e.components,t=(0,o.Z)(e,i);return(0,a.kt)("wrapper",(0,n.Z)({},l,t,{components:r,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"In order to measure the spa-transition performance between routes, you have to connect to the router hooks. You can read more about the flow of SPA-transition in ",(0,a.kt)("a",{parentName:"p",href:"/docs/features/routing/flow#client-spa-navigation"},"this part")," of the documentation."),(0,a.kt)("p",null,"So, if we want to measure how long it took us to go from one page to another, we can use the following recipe:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-ts"},"import { commandLineListTokens, declareModule, provide } from '@tramvai/core';\nimport { ROUTER_TOKEN } from '@tramvai/tokens-router';\n\n/*\n * You can use your own marks and measures; this is only an example\n * */\nexport const SpaTransitionPerformanceMetrics = declareModule({\n  name: 'SpaTransitionPerformanceMetrics',\n  providers: [\n    provide({\n      provide: commandLineListTokens.customerStart,\n      multi: true,\n      useFactory: ({ router }) => {\n        return () => {\n          router.registerHook('beforeResolve', ({ key }) => {\n            const startKey = `navigation_start:${key}`;\n            performance.mark(startKey);\n          });\n\n          router.registerSyncHook('change', ({ key }) => {\n            const startKey = `navigation_start:${key}`;\n            const endKey = `navigation_end:${key}`;\n            const measureKey = `spa_navigation:${key}`;\n\n            afterFrame(() => {\n              if (process.env.__TRAMVAI_CONCURRENT_FEATURES) {\n                afterFrame(() => {\n                  performance.mark(endKey);\n                  performance.measure(measureKey, startKey, endKey);\n\n                  performance.clearMeasures();\n                  [startKey, endKey].forEach((name) => performance.clearMarks(name));\n                });\n              } else {\n                performance.mark(endKey);\n                performance.measure(measureKey, startKey, endKey);\n\n                performance.clearMeasures();\n                [startKey, endKey].forEach((name) => performance.clearMarks(name));\n              }\n            });\n          });\n        };\n      },\n      deps: {\n        router: ROUTER_TOKEN,\n      },\n    }),\n  ],\n});\n")),(0,a.kt)("p",null,"Be careful, current recipe is inaccurate in terms of measure time for spa-navigation. But it is something you can use to compare relative metrics while boosting performance of your pages."))}f.isMDXComponent=!0}}]);