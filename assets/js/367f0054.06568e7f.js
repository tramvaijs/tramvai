"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[6274],{3905:function(e,t,n){n.d(t,{Zo:function(){return u},kt:function(){return m}});var r=n(7294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function p(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var l=r.createContext({}),s=function(e){var t=r.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},u=function(e){var t=s(e.components);return r.createElement(l.Provider,{value:t},e.children)},c={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},d=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,o=e.originalType,l=e.parentName,u=p(e,["components","mdxType","originalType","parentName"]),d=s(n),m=a,f=d["".concat(l,".").concat(m)]||d[m]||c[m]||o;return n?r.createElement(f,i(i({ref:t},u),{},{components:n})):r.createElement(f,i({ref:t},u))}));function m(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=n.length,i=new Array(o);i[0]=d;var p={};for(var l in t)hasOwnProperty.call(t,l)&&(p[l]=t[l]);p.originalType=e,p.mdxType="string"==typeof e?e:a,i[1]=p;for(var s=2;s<o;s++)i[s]=n[s];return r.createElement.apply(null,i)}return r.createElement.apply(null,n)}d.displayName="MDXCreateElement"},2981:function(e,t,n){n.r(t),n.d(t,{assets:function(){return l},contentTitle:function(){return i},default:function(){return c},frontMatter:function(){return o},metadata:function(){return p},toc:function(){return s}});var r=n(7462),a=(n(7294),n(3905));const o={id:"add-page",title:"Add new page"},i=void 0,p={unversionedId:"tutorial/add-page",id:"tutorial/add-page",title:"Add new page",description:"tramvai supports file-system based routing.",source:"@site/tmp-docs/02-tutorial/02-add-page.md",sourceDirName:"02-tutorial",slug:"/tutorial/add-page",permalink:"/docs/tutorial/add-page",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/tmp-docs/02-tutorial/02-add-page.md",tags:[],version:"current",sidebarPosition:2,frontMatter:{id:"add-page",title:"Add new page"},sidebar:"sidebar",previous:{title:"Create application",permalink:"/docs/tutorial/new-app"},next:{title:"Create HTTP client",permalink:"/docs/tutorial/create-http-client"}},l={},s=[],u={toc:s};function c(e){let{components:t,...n}=e;return(0,a.kt)("wrapper",(0,r.Z)({},u,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"tramvai")," supports file-system based routing.\nDetailed documentation is available in ",(0,a.kt)("a",{parentName:"p",href:"/docs/features/routing/file-system-pages"},"File-System Pages")," section."),(0,a.kt)("p",null,"In this tutorial we will use the automatic way of generating new routes in the application, for which you only need to create a ",(0,a.kt)("inlineCode",{parentName:"p"},"react")," page component, following the naming conventions."),(0,a.kt)("admonition",{type:"info"},(0,a.kt)("p",{parentName:"admonition"},"In addition to automatic routes generation, there are several more flexible options for adding pages to the application, but requiring more manual work.\nIn this tutorial we use the simplest and most convenient option.")),(0,a.kt)("p",null,"Let's take a more detailed look at routing, taking the main page of our ",(0,a.kt)("inlineCode",{parentName:"p"},"Pokedex")," - the page with the list of pokemon - as an example."),(0,a.kt)("p",null,"The page available on the url ",(0,a.kt)("inlineCode",{parentName:"p"},"http://localhost:3000/")," is located in the component ",(0,a.kt)("inlineCode",{parentName:"p"},"routes/index.tsx"),".\nBy default, all ",(0,a.kt)("inlineCode",{parentName:"p"},"react")," components in the ",(0,a.kt)("inlineCode",{parentName:"p"},"routes")," folder are interpreted as application routes, and a ",(0,a.kt)("inlineCode",{parentName:"p"},"/")," route will be generated based on the component named ",(0,a.kt)("inlineCode",{parentName:"p"},"routes/index.tsx"),"."),(0,a.kt)("p",null,"\u231b Replace the contents of the home page component:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-tsx",metastring:'{11} title="routes/index.tsx"',"{11}":!0,title:'"routes/index.tsx"'},"import React from 'react';\n\nexport const PokemonList = () => {\n  return <>Hi! This is PokemonList component :)</>;\n};\n\nexport default PokemonList;\n")),(0,a.kt)("admonition",{type:"info"},(0,a.kt)("p",{parentName:"admonition"},"You need to use default export to be able to extract the page component into a separate chunk, and load it by demand")),(0,a.kt)("p",null,"Module ",(0,a.kt)("a",{parentName:"p",href:"/docs/references/modules/router/base"},"@tramvai/module-router")," is responsible for routing and automatically adding file-system based routes to the application."),(0,a.kt)("p",null,"Our ",(0,a.kt)("inlineCode",{parentName:"p"},"PokemonList")," page is now registered in the app, and it will be automatically rendered on the ",(0,a.kt)("inlineCode",{parentName:"p"},"/")," route, and available on ",(0,a.kt)("inlineCode",{parentName:"p"},"http://localhost:3000/"),"!"),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("a",{parentName:"strong",href:"/docs/tutorial/create-http-client"},"Next lesson"))))}c.isMDXComponent=!0}}]);