"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[5465],{3905:(e,t,n)=>{n.d(t,{Zo:()=>l,kt:()=>d});var r=n(7294);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function c(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var p=r.createContext({}),i=function(e){var t=r.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):c(c({},t),e)),n},l=function(e){var t=i(e.components);return r.createElement(p.Provider,{value:t},e.children)},m={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},u=r.forwardRef((function(e,t){var n=e.components,o=e.mdxType,a=e.originalType,p=e.parentName,l=s(e,["components","mdxType","originalType","parentName"]),u=i(n),d=o,y=u["".concat(p,".").concat(d)]||u[d]||m[d]||a;return n?r.createElement(y,c(c({ref:t},l),{},{components:n})):r.createElement(y,c({ref:t},l))}));function d(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var a=n.length,c=new Array(a);c[0]=u;var s={};for(var p in t)hasOwnProperty.call(t,p)&&(s[p]=t[p]);s.originalType=e,s.mdxType="string"==typeof e?e:o,c[1]=s;for(var i=2;i<a;i++)c[i]=n[i];return r.createElement.apply(null,c)}return r.createElement.apply(null,n)}u.displayName="MDXCreateElement"},2832:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>l,contentTitle:()=>p,default:()=>d,frontMatter:()=>s,metadata:()=>i,toc:()=>m});var r=n(7462),o=n(3366),a=(n(7294),n(3905)),c=["components"],s={},p=void 0,i={unversionedId:"how-to/ssr-async-components",id:"how-to/ssr-async-components",title:"ssr-async-components",description:"When using dynamic import to load React components, we lose the ability to render them on the server.",source:"@site/tmp-docs/how-to/ssr-async-components.md",sourceDirName:"how-to",slug:"/how-to/ssr-async-components",permalink:"/docs/how-to/ssr-async-components",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/get-started/overview.md/tmp-docs/how-to/ssr-async-components.md",tags:[],version:"current",frontMatter:{},sidebar:"sidebar",previous:{title:"react-query-usage",permalink:"/docs/how-to/react-query-usage"},next:{title:"How to update tramvai?",permalink:"/docs/how-to/tramvai-update"}},l={},m=[],u={toc:m};function d(e){var t=e.components,n=(0,o.Z)(e,c);return(0,a.kt)("wrapper",(0,r.Z)({},u,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"When using dynamic ",(0,a.kt)("inlineCode",{parentName:"p"},"import")," to load React components, we lose the ability to render them on the server.\nThis problem is solved by the library ",(0,a.kt)("a",{parentName:"p",href:"/docs/references/tramvai/react#lazy"},"@tramvai/react lazy")),(0,a.kt)("p",null,(0,a.kt)("details",null,(0,a.kt)("summary",null,"Example of connecting a lazy component in a bundle"),(0,a.kt)("p",null,(0,a.kt)("pre",{parentName:"p"},(0,a.kt)("code",{parentName:"pre",className:"language-typescript"},"import { createApp, createBundle } from '@tramvai/core';\nimport { lazy } from '@tramvai/react';\nimport { modules } from '../common';\n\nconst bundle = createBundle({\n  name: 'mainDefault',\n  components: {\n    // wrap the import in a lazy call so that the component is successfully rendered on the server\n    // and the scripts/styles for the component are preloaded on the client\n    pageDefault: lazy(() => import('./pages/page')),\n  },\n});\n\ncreateApp({\n  name: 'ssr-async-components',\n  modules: [...modules],\n  bundles: {\n    mainDefault: () => Promise.resolve({ default: bundle }),\n  },\n});\n\n"))))))}d.isMDXComponent=!0}}]);