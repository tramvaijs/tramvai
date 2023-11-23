"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[7606],{3905:(e,t,r)=>{r.d(t,{Zo:()=>c,kt:()=>u});var n=r(7294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function o(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function p(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},i=Object.keys(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var l=n.createContext({}),s=function(e){var t=n.useContext(l),r=t;return e&&(r="function"==typeof e?e(t):o(o({},t),e)),r},c=function(e){var t=s(e.components);return n.createElement(l.Provider,{value:t},e.children)},m={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},d=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,i=e.originalType,l=e.parentName,c=p(e,["components","mdxType","originalType","parentName"]),d=s(r),u=a,f=d["".concat(l,".").concat(u)]||d[u]||m[u]||i;return r?n.createElement(f,o(o({ref:t},c),{},{components:r})):n.createElement(f,o({ref:t},c))}));function u(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=r.length,o=new Array(i);o[0]=d;var p={};for(var l in t)hasOwnProperty.call(t,l)&&(p[l]=t[l]);p.originalType=e,p.mdxType="string"==typeof e?e:a,o[1]=p;for(var s=2;s<i;s++)o[s]=r[s];return n.createElement.apply(null,o)}return n.createElement.apply(null,r)}d.displayName="MDXCreateElement"},7873:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>c,contentTitle:()=>l,default:()=>u,frontMatter:()=>p,metadata:()=>s,toc:()=>m});var n=r(7462),a=r(3366),i=(r(7294),r(3905)),o=["components"],p={id:"overview",title:"Overview"},l=void 0,s={unversionedId:"get-started/overview",id:"get-started/overview",title:"Overview",description:"tramvai is a lightweight web framework for building SSR applications with a modular system and DI to quickly extend the functionality of applications.",source:"@site/tmp-docs/01-get-started/01-overview.md",sourceDirName:"01-get-started",slug:"/get-started/overview",permalink:"/docs/get-started/overview",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/get-started/overview.md/tmp-docs/01-get-started/01-overview.md",tags:[],version:"current",sidebarPosition:1,frontMatter:{id:"overview",title:"Overview"},sidebar:"sidebar",next:{title:"Quick Start",permalink:"/docs/get-started/quick-start"}},c={},m=[{value:"Key features",id:"key-features",level:2}],d={toc:m};function u(e){var t=e.components,r=(0,a.Z)(e,o);return(0,i.kt)("wrapper",(0,n.Z)({},d,r,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"tramvai"))," is a lightweight web framework for building SSR applications with a modular system and DI to quickly extend the functionality of applications."),(0,i.kt)("h2",{id:"key-features"},"Key features"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("p",{parentName:"li"},"\u2708\ufe0f ",(0,i.kt)("strong",{parentName:"p"},"Universal")),(0,i.kt)("p",{parentName:"li"},"Creates SSR ",(0,i.kt)("inlineCode",{parentName:"p"},"React")," applications - includes solid server with metrics, health checks and graceful degradation support")),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("p",{parentName:"li"},"\ud83d\udc89 ",(0,i.kt)("strong",{parentName:"p"},"Dependency Injection")),(0,i.kt)("p",{parentName:"li"},"Provides simple and powerful DI system, inspired by ",(0,i.kt)("inlineCode",{parentName:"p"},"Angular")," and ",(0,i.kt)("inlineCode",{parentName:"p"},"Nest.js")," best practices")),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("p",{parentName:"li"},"\ud83e\udde9 ",(0,i.kt)("strong",{parentName:"p"},"Modular")),(0,i.kt)("p",{parentName:"li"},"Every application build from list of feature modules - doing one thing right!")),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("p",{parentName:"li"},"\u26a1 ",(0,i.kt)("strong",{parentName:"p"},"Fast and lightweight")),(0,i.kt)("p",{parentName:"li"},"Enforces best web-performance techniques - resources preloading and inlining, lazy hydration \ud83d\ude80, modern ES bundles, tree-shakable libraries")),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("p",{parentName:"li"},"\ud83d\udd17 ",(0,i.kt)("strong",{parentName:"p"},"Chain of commands")),(0,i.kt)("p",{parentName:"li"},"Elegant pattern for complete control over application life-cycle - predictable flow for every HTTP request into application, running async actions in parallel, limits the duration of server-side actions")),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("p",{parentName:"li"},"\ud83e\uddf1 ",(0,i.kt)("strong",{parentName:"p"},"Micro Frontends")),(0,i.kt)("p",{parentName:"li"},"Heavily integrated solution for Micro Frontends with SSR and Module Federation")),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("p",{parentName:"li"},"\ud83d\udee0\ufe0f ",(0,i.kt)("strong",{parentName:"p"},"Tooling")),(0,i.kt)("p",{parentName:"li"},"Functional CLI for generating, develop, analyze, and bundling ",(0,i.kt)("inlineCode",{parentName:"p"},"tramvai")," applications - powered by ",(0,i.kt)("inlineCode",{parentName:"p"},"webpack@5")," and ",(0,i.kt)("inlineCode",{parentName:"p"},"swc"))),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("p",{parentName:"li"},"\ud83e\uddea ",(0,i.kt)("strong",{parentName:"p"},"Testing")),(0,i.kt)("p",{parentName:"li"},"Complete set of unit and integration testing utilites - powered by ",(0,i.kt)("inlineCode",{parentName:"p"},"jest")," and ",(0,i.kt)("inlineCode",{parentName:"p"},"testing-library"))),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("p",{parentName:"li"},"\ud83d\udd4a\ufe0f ",(0,i.kt)("strong",{parentName:"p"},"Migrations")),(0,i.kt)("p",{parentName:"li"},"Automatic migrations with ",(0,i.kt)("inlineCode",{parentName:"p"},"jscodeshift")," codemodes"))))}u.isMDXComponent=!0}}]);