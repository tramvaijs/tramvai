"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[9670],{3905:function(e,r,t){t.d(r,{Zo:function(){return s},kt:function(){return f}});var n=t(7294);function o(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function i(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);r&&(n=n.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,n)}return t}function l(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?i(Object(t),!0).forEach((function(r){o(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):i(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}function c(e,r){if(null==e)return{};var t,n,o=function(e,r){if(null==e)return{};var t,n,o={},i=Object.keys(e);for(n=0;n<i.length;n++)t=i[n],r.indexOf(t)>=0||(o[t]=e[t]);return o}(e,r);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)t=i[n],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(o[t]=e[t])}return o}var u=n.createContext({}),a=function(e){var r=n.useContext(u),t=r;return e&&(t="function"==typeof e?e(r):l(l({},r),e)),t},s=function(e){var r=a(e.components);return n.createElement(u.Provider,{value:r},e.children)},d={inlineCode:"code",wrapper:function(e){var r=e.children;return n.createElement(n.Fragment,{},r)}},p=n.forwardRef((function(e,r){var t=e.components,o=e.mdxType,i=e.originalType,u=e.parentName,s=c(e,["components","mdxType","originalType","parentName"]),p=a(t),f=o,m=p["".concat(u,".").concat(f)]||p[f]||d[f]||i;return t?n.createElement(m,l(l({ref:r},s),{},{components:t})):n.createElement(m,l({ref:r},s))}));function f(e,r){var t=arguments,o=r&&r.mdxType;if("string"==typeof e||o){var i=t.length,l=new Array(i);l[0]=p;var c={};for(var u in r)hasOwnProperty.call(r,u)&&(c[u]=r[u]);c.originalType=e,c.mdxType="string"==typeof e?e:o,l[1]=c;for(var a=2;a<i;a++)l[a]=t[a];return n.createElement.apply(null,l)}return n.createElement.apply(null,t)}p.displayName="MDXCreateElement"},6748:function(e,r,t){t.r(r),t.d(r,{assets:function(){return u},contentTitle:function(){return l},default:function(){return d},frontMatter:function(){return i},metadata:function(){return c},toc:function(){return a}});var n=t(7462),o=(t(7294),t(3905));const i={},l=void 0,c={unversionedId:"references/libs/errors",id:"references/libs/errors",title:"errors",description:"Common errors classes",source:"@site/tmp-docs/references/libs/errors.md",sourceDirName:"references/libs",slug:"/references/libs/errors",permalink:"/docs/references/libs/errors",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/tmp-docs/references/libs/errors.md",tags:[],version:"current",frontMatter:{},sidebar:"sidebar",previous:{title:"error-handlers",permalink:"/docs/references/libs/error-handlers"},next:{title:"eslint-plugin-tramvai",permalink:"/docs/references/libs/eslint-plugin-tramvai"}},u={},a=[{value:"Common",id:"common",level:2},{value:"SilentError",id:"silenterror",level:3},{value:"HTTP",id:"http",level:2},{value:"HttpError",id:"httperror",level:3},{value:"RedirectFoundError",id:"redirectfounderror",level:4},{value:"NotFoundError",id:"notfounderror",level:4},{value:"Action",id:"action",level:2},{value:"ConditionFailError",id:"conditionfailerror",level:3},{value:"Execution",id:"execution",level:2},{value:"ExecutionError",id:"executionerror",level:3},{value:"ExecutionAbortError",id:"executionaborterror",level:3},{value:"ExecutionTimeoutError",id:"executiontimeouterror",level:3}],s={toc:a};function d(e){let{components:r,...t}=e;return(0,o.kt)("wrapper",(0,n.Z)({},s,t,{components:r,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"Common errors classes"),(0,o.kt)("h2",{id:"common"},"Common"),(0,o.kt)("h3",{id:"silenterror"},"SilentError"),(0,o.kt)("p",null,"Marks error as silent e.g. throwing such errors should not produce any error logs."),(0,o.kt)("h2",{id:"http"},"HTTP"),(0,o.kt)("h3",{id:"httperror"},"HttpError"),(0,o.kt)("h4",{id:"redirectfounderror"},"RedirectFoundError"),(0,o.kt)("p",null,"Current response should be redirected"),(0,o.kt)("h4",{id:"notfounderror"},"NotFoundError"),(0,o.kt)("p",null,"Current Page was not found in the app"),(0,o.kt)("h2",{id:"action"},"Action"),(0,o.kt)("h3",{id:"conditionfailerror"},"ConditionFailError"),(0,o.kt)("p",null,"Some of the conditions check were failed"),(0,o.kt)("h2",{id:"execution"},"Execution"),(0,o.kt)("h3",{id:"executionerror"},"ExecutionError"),(0,o.kt)("p",null,"Execution was failed due to error in execution callback"),(0,o.kt)("h3",{id:"executionaborterror"},"ExecutionAbortError"),(0,o.kt)("p",null,"Execution was aborted due to AbortSignal abortion"),(0,o.kt)("h3",{id:"executiontimeouterror"},"ExecutionTimeoutError"),(0,o.kt)("p",null,"Execution was aborted due to exceeding timeout execution time"))}d.isMDXComponent=!0}}]);