"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[5328],{3905:(e,t,r)=>{r.d(t,{Zo:()=>s,kt:()=>m});var n=r(7294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function o(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function l(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?o(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function i(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},o=Object.keys(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var c=n.createContext({}),u=function(e){var t=n.useContext(c),r=t;return e&&(r="function"==typeof e?e(t):l(l({},t),e)),r},s=function(e){var t=u(e.components);return n.createElement(c.Provider,{value:t},e.children)},p={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},d=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,o=e.originalType,c=e.parentName,s=i(e,["components","mdxType","originalType","parentName"]),d=u(r),m=a,f=d["".concat(c,".").concat(m)]||d[m]||p[m]||o;return r?n.createElement(f,l(l({ref:t},s),{},{components:r})):n.createElement(f,l({ref:t},s))}));function m(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=r.length,l=new Array(o);l[0]=d;var i={};for(var c in t)hasOwnProperty.call(t,c)&&(i[c]=t[c]);i.originalType=e,i.mdxType="string"==typeof e?e:a,l[1]=i;for(var u=2;u<o;u++)l[u]=r[u];return n.createElement.apply(null,l)}return n.createElement.apply(null,r)}d.displayName="MDXCreateElement"},9874:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>s,contentTitle:()=>c,default:()=>m,frontMatter:()=>i,metadata:()=>u,toc:()=>p});var n=r(7462),a=r(3366),o=(r(7294),r(3905)),l=["components"],i={},c=void 0,u={unversionedId:"references/modules/cache-warmup",id:"references/modules/cache-warmup",title:"cache-warmup",description:"Module to execute warmup of the cache when app starts.",source:"@site/tmp-docs/references/modules/cache-warmup.md",sourceDirName:"references/modules",slug:"/references/modules/cache-warmup",permalink:"/docs/references/modules/cache-warmup",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/get-started/overview.md/tmp-docs/references/modules/cache-warmup.md",tags:[],version:"current",frontMatter:{},sidebar:"sidebar",previous:{title:"autoscroll",permalink:"/docs/references/modules/autoscroll"},next:{title:"cross-version-tests",permalink:"/docs/references/modules/child-app/__integration__/cross-version-tests"}},s={},p=[{value:"Installation",id:"installation",level:2},{value:"Explanation",id:"explanation",level:2},{value:"User-agent",id:"user-agent",level:3},{value:"Debug",id:"debug",level:2}],d={toc:p};function m(e){var t=e.components,r=(0,a.Z)(e,l);return(0,o.kt)("wrapper",(0,n.Z)({},d,r,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"Module to execute warmup of the cache when app starts."),(0,o.kt)("h2",{id:"installation"},"Installation"),(0,o.kt)("p",null,"By default, the module is already included in ",(0,o.kt)("inlineCode",{parentName:"p"},"@tramvai/module-server")," and no additional actions are needed."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-tsx"},"import { createApp } from '@tramvai/core';\nimport { CacheWarmupModule } from '@tramvai/module-cache-warmup';\n\ncreateApp({\n  modules: [CacheWarmupModule],\n});\n")),(0,o.kt)("h2",{id:"explanation"},"Explanation"),(0,o.kt)("blockquote",null,(0,o.kt)("p",{parentName:"blockquote"},"Module is executed only when ",(0,o.kt)("inlineCode",{parentName:"p"},"NODE_ENV === production"),".")),(0,o.kt)("ol",null,(0,o.kt)("li",{parentName:"ol"},"When app starts the module will request list of app urls from papi-route ",(0,o.kt)("inlineCode",{parentName:"li"},"bundleInfo"),"."),(0,o.kt)("li",{parentName:"ol"},"For every url from the response it sends ",(0,o.kt)("inlineCode",{parentName:"li"},"2")," requests: one for mobile and one for desktop device. But only ",(0,o.kt)("inlineCode",{parentName:"li"},"2")," requests are running simultaneously in total.")),(0,o.kt)("h3",{id:"user-agent"},"User-agent"),(0,o.kt)("p",null,"In order to emulate mobile or desktop device next user-agent strings are used:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-js"},"[\n  /** Chrome on Mac OS */\n  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.87 Safari/537.36',\n  /**  Chrome on Mobile */\n  'Mozilla/5.0 (Linux; Android 7.0; SM-G930V Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.125 Mobile Safari/537.36',\n];\n")),(0,o.kt)("h2",{id:"debug"},"Debug"),(0,o.kt)("p",null,"This module logs with id ",(0,o.kt)("inlineCode",{parentName:"p"},"cache-warmup")))}m.isMDXComponent=!0}}]);