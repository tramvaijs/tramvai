"use strict";(globalThis.webpackChunk=globalThis.webpackChunk||[]).push([[3358],{3905:(e,t,n)=>{n.d(t,{Zo:()=>c,kt:()=>m});var a=n(7294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function i(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},o=Object.keys(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var p=a.createContext({}),u=function(e){var t=a.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},c=function(e){var t=u(e.components);return a.createElement(p.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},s=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,o=e.originalType,p=e.parentName,c=i(e,["components","mdxType","originalType","parentName"]),s=u(n),m=r,h=s["".concat(p,".").concat(m)]||s[m]||d[m]||o;return n?a.createElement(h,l(l({ref:t},c),{},{components:n})):a.createElement(h,l({ref:t},c))}));function m(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var o=n.length,l=new Array(o);l[0]=s;var i={};for(var p in t)hasOwnProperty.call(t,p)&&(i[p]=t[p]);i.originalType=e,i.mdxType="string"==typeof e?e:r,l[1]=i;for(var u=2;u<o;u++)l[u]=n[u];return a.createElement.apply(null,l)}return a.createElement.apply(null,n)}s.displayName="MDXCreateElement"},9194:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>l,default:()=>d,frontMatter:()=>o,metadata:()=>i,toc:()=>u});var a=n(7462),r=(n(7294),n(3905));const o={id:"bundle",title:"Bundle",sidebar_position:7},l=void 0,i={unversionedId:"concepts/bundle",id:"concepts/bundle",title:"Bundle",description:"Bundles allow you to select components, reducers and actions common for different pages. Bundles are registered for the entire application, the name of the current bundle is taken from the current route, if they match, the application initializes the bundle:",source:"@site/tmp-docs/concepts/bundle.md",sourceDirName:"concepts",slug:"/concepts/bundle",permalink:"/docs/concepts/bundle",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/tmp-docs/concepts/bundle.md",tags:[],version:"current",sidebarPosition:7,frontMatter:{id:"bundle",title:"Bundle",sidebar_position:7},sidebar:"sidebar",previous:{title:"Action",permalink:"/docs/concepts/action"},next:{title:"Versioning",permalink:"/docs/concepts/versioning"}},p={},u=[{value:"Dynamic bundle import",id:"dynamic-bundle-import",level:2},{value:"Default bundle",id:"default-bundle",level:2},{value:"Create a bundle",id:"create-a-bundle",level:4},{value:"Connect the bundle",id:"connect-the-bundle",level:4}],c={toc:u};function d({components:e,...t}){return(0,r.kt)("wrapper",(0,a.Z)({},c,t,{components:e,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"Bundles allow you to select components, reducers and actions common for different pages. Bundles are registered for the entire application, the name of the current bundle is taken from the current route, if they match, the application initializes the bundle:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},"searches in the bundle for components that match the ",(0,r.kt)("inlineCode",{parentName:"li"},"pageComponent")," and ",(0,r.kt)("inlineCode",{parentName:"li"},"layoutComponent")," from the route, saves them to the general case of components, then these components are used by the ",(0,r.kt)("inlineCode",{parentName:"li"},"RenderModule")," when rendering the page"),(0,r.kt)("li",{parentName:"ul"},"saves actions to the general action register"),(0,r.kt)("li",{parentName:"ul"},"registers new reducers")),(0,r.kt)("p",null,"Interface details ",(0,r.kt)("a",{parentName:"p",href:"/docs/references/tramvai/core#createBundle"},"createBundle")),(0,r.kt)("h2",{id:"dynamic-bundle-import"},"Dynamic bundle import"),(0,r.kt)("p",null,"To highlight unnecessary code on each page, each bundle passed to ",(0,r.kt)("inlineCode",{parentName:"p"},"createApp")," must have the signature ",(0,r.kt)("inlineCode",{parentName:"p"},"() => Promise<{default: Bundle}>"),". All the code shared with the modules plugged into the application will remain in the main chunk of the application, and many bundles will weigh only a few KB, but as soon as one of the components of the bundle includes a heavy dependency, for example, a library with forms, it will completely fall into the corresponding bundle."),(0,r.kt)("p",null,"It is recommended to use ",(0,r.kt)("a",{parentName:"p",href:"https://webpack.js.org/guides/code-splitting/#dynamic-imports"},"dynamic import")," with the magic comment ",(0,r.kt)("inlineCode",{parentName:"p"},"webpackChunkName")," to specify the name of the new chunk, for example:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-tsx"},"() => import(/* webpackChunkName: \"mainDefault\" */ './bundles/mainDefault');\n")),(0,r.kt)("h2",{id:"default-bundle"},"Default bundle"),(0,r.kt)("p",null,"Each route must have properties ",(0,r.kt)("inlineCode",{parentName:"p"},"bundle")," with the name of the bundle, ",(0,r.kt)("inlineCode",{parentName:"p"},"pageComponent")," and ",(0,r.kt)("inlineCode",{parentName:"p"},"layoutComponent")," with the names of the corresponding components. The default values \u200b\u200bare as follows:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"bundle: 'mainDefault'")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"pageComponent: 'pageDefault'")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"layoutComponent: 'layoutDefault'"))),(0,r.kt)("p",null,"When using the standard ",(0,r.kt)("inlineCode",{parentName:"p"},"RenderModule"),", the ",(0,r.kt)("inlineCode",{parentName:"p"},"LayoutModule")," is included, which will provide the ",(0,r.kt)("inlineCode",{parentName:"p"},"layoutDefault")," and a separate mechanism for extending and overriding layout in the application, so there is no need to add the ",(0,r.kt)("inlineCode",{parentName:"p"},"layoutDefault")," property to the ",(0,r.kt)("inlineCode",{parentName:"p"},"components")," list of the bundle."),(0,r.kt)("p",null,"To create a bundle that will run on all application pages that do not have specific route settings, two steps are enough:"),(0,r.kt)("h4",{id:"create-a-bundle"},"Create a bundle"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-tsx"},"import { createBundle } from '@tramvai/core';\nimport { MainPage } from './pages/MainPage';\n\nexport default createBundle({\n  name: 'mainDefault',\n  components: {\n    pageDefault: MainPage,\n  },\n  reducers: [],\n  actions: [],\n});\n")),(0,r.kt)("h4",{id:"connect-the-bundle"},"Connect the bundle"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-tsx"},"import { createApp } from '@tramvai/core';\n\ncreateApp({\n  name: 'myApp',\n  modules: [\n    // ...\n  ],\n  providers: [\n    // ...\n  ],\n  bundles: {\n    mainDefault: () => import(/* webpackChunkName: \"mainDefault\" */ './bundles/mainDefault'),\n  },\n});\n")))}d.isMDXComponent=!0}}]);