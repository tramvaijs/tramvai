"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[122],{3905:function(e,t,n){n.d(t,{Zo:function(){return p},kt:function(){return f}});var r=n(7294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var s=r.createContext({}),u=function(e){var t=r.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},p=function(e){var t=u(e.components);return r.createElement(s.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},c=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,o=e.originalType,s=e.parentName,p=l(e,["components","mdxType","originalType","parentName"]),c=u(n),f=a,m=c["".concat(s,".").concat(f)]||c[f]||d[f]||o;return n?r.createElement(m,i(i({ref:t},p),{},{components:n})):r.createElement(m,i({ref:t},p))}));function f(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=n.length,i=new Array(o);i[0]=c;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l.mdxType="string"==typeof e?e:a,i[1]=l;for(var u=2;u<o;u++)i[u]=n[u];return r.createElement.apply(null,i)}return r.createElement.apply(null,n)}c.displayName="MDXCreateElement"},3886:function(e,t,n){n.r(t),n.d(t,{assets:function(){return s},contentTitle:function(){return i},default:function(){return d},frontMatter:function(){return o},metadata:function(){return l},toc:function(){return u}});var r=n(7462),a=(n(7294),n(3905));const o={id:"hooks-and-guards",title:"Hooks and Guards"},i=void 0,l={unversionedId:"features/routing/hooks-and-guards",id:"features/routing/hooks-and-guards",title:"Hooks and Guards",description:"Guards",source:"@site/tmp-docs/03-features/07-routing/05-hooks-and-guards.md",sourceDirName:"03-features/07-routing",slug:"/features/routing/hooks-and-guards",permalink:"/docs/features/routing/hooks-and-guards",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/tmp-docs/03-features/07-routing/05-hooks-and-guards.md",tags:[],version:"current",sidebarPosition:5,frontMatter:{id:"hooks-and-guards",title:"Hooks and Guards"},sidebar:"sidebar",previous:{title:"Links and Navigation",permalink:"/docs/features/routing/links-and-navigation"},next:{title:"Wildcard Routes",permalink:"/docs/features/routing/wildcard-routes"}},s={},u=[{value:"Guards",id:"guards",level:2},{value:"Rules",id:"rules",level:3},{value:"Possible result",id:"possible-result",level:3},{value:"Hooks",id:"hooks",level:2},{value:"Rules",id:"rules-1",level:3},{value:"List of available hooks",id:"list-of-available-hooks",level:3}],p={toc:u};function d(e){let{components:t,...n}=e;return(0,a.kt)("wrapper",(0,r.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("h2",{id:"guards"},"Guards"),(0,a.kt)("p",null,"Guards allow you to control the availability of a particular route for a specific transition. From the guard, you can block the transition or initiate a redirect."),(0,a.kt)("p",null,"Example:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-ts"},"import { provide } from '@tramvai/core';\nimport { ROUTER_GUARD_TOKEN } from '@tramvai/module-router';\n\nconst provider = provide({\n  provide: ROUTER_GUARD_TOKEN,\n  useValue: async ({ to }) => {\n    if (to.config.blocked) {\n      return false; // block this transition\n    }\n\n    if (typeof to.config.redirect === 'string') {\n      return to.config.redirect; // call a redirect to the specified page\n    }\n\n    if (typeof to.config.needAuth && !isAuth()) {\n      return { url: '/login/', code: '302' }; // redirect to page with NavigateOptions\n    }\n\n    // if nothing is returned, the transition will be performed as usual\n  },\n});\n")),(0,a.kt)("h3",{id:"rules"},"Rules"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"guards are asynchronous and it execution will be awaited inside routing"),(0,a.kt)("li",{parentName:"ul"},"all guards are running in parallel and they are all awaited"),(0,a.kt)("li",{parentName:"ul"},"if several guards return something then the result from a guard that was registered early will be used")),(0,a.kt)("h3",{id:"possible-result"},"Possible result"),(0,a.kt)("p",null,"The behaviour of routing depends on the result of executing guards functions and there result might be next:"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"if all of the guards returns ",(0,a.kt)("inlineCode",{parentName:"li"},"undefined")," then navigation will continue executing"),(0,a.kt)("li",{parentName:"ul"},"if any of the guards returns ",(0,a.kt)("inlineCode",{parentName:"li"},"false")," then navigation is blocked and next action differs on server and client"),(0,a.kt)("li",{parentName:"ul"},"if any of the guards returns ",(0,a.kt)("inlineCode",{parentName:"li"},"string")," it is considered as url to which redirect should be happen"),(0,a.kt)("li",{parentName:"ul"},"if any of the guards returns ",(0,a.kt)("a",{parentName:"li",href:"/docs/features/routing/links-and-navigation#navigateoptions"},(0,a.kt)("inlineCode",{parentName:"a"},"NavigateOptions"))," interface, ",(0,a.kt)("inlineCode",{parentName:"li"},"url")," property from it is considered as url to which redirect should be happen")),(0,a.kt)("h2",{id:"hooks"},"Hooks"),(0,a.kt)("admonition",{type:"info"},(0,a.kt)("p",{parentName:"admonition"},"Hooks are not recommended to usage because you can easy slow down application response time. Always prefer commandLineRunner, Actions or Guards if it is possible.")),(0,a.kt)("p",null,"Transition hooks allow you to perform your asynchronous actions at different stages of the transition."),(0,a.kt)("p",null,"There is a few steps to add transition hooks:"),(0,a.kt)("ol",null,(0,a.kt)("li",{parentName:"ol"},"Get router instance with ",(0,a.kt)("inlineCode",{parentName:"li"},"ROUTER_TOKEN")," token"),(0,a.kt)("li",{parentName:"ol"},"Use methods ",(0,a.kt)("inlineCode",{parentName:"li"},"registerHook"),", ",(0,a.kt)("inlineCode",{parentName:"li"},"registerSyncHook")," to add new hooks to the router"),(0,a.kt)("li",{parentName:"ol"},"Registration should happen as soon as possible so appropriate command line is ",(0,a.kt)("inlineCode",{parentName:"li"},"customerStart")," as it executes before navigation happens.")),(0,a.kt)("p",null,"Example:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-ts"},"import { provide, commandLineListTokens } from '@tramvai/core';\nimport { ROUTER_TOKEN } from '@tramvai/tokens-router';\n\nconst provider = provide({\n  provide: commandLineListTokens.customerStart,\n  useFactory: ({ router }) => {\n    return () => {\n      router.registerHook('beforeNavigate', async ({ from, to, url, fromUrl }) => {\n        console.log(`navigating from ${from} to route ${to}`);\n      });\n    };\n  },\n});\n")),(0,a.kt)("h3",{id:"rules-1"},"Rules"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"all hooks from the same event are running in parallel"),(0,a.kt)("li",{parentName:"ul"},"most of the hooks are asynchronous and are awaited inside router"),(0,a.kt)("li",{parentName:"ul"},"if some error happens when running hook it will be logged to console but wont affect navigation (except for the ",(0,a.kt)("inlineCode",{parentName:"li"},"beforeResolve")," hook - error for it will be rethrown)")),(0,a.kt)("h3",{id:"list-of-available-hooks"},"List of available hooks"),(0,a.kt)("p",null,"Async hooks:"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("p",{parentName:"li"},(0,a.kt)("strong",{parentName:"p"},"navigate hooks")," - asynchronous hooks only for ",(0,a.kt)("inlineCode",{parentName:"p"},"navigate")," calls:"),(0,a.kt)("ul",{parentName:"li"},(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"beforeResolve")),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"beforeNavigate")),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"afterNavigate")))),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("p",{parentName:"li"},(0,a.kt)("strong",{parentName:"p"},"updateCurrentRoute hooks")," - asynchronous hooks only for ",(0,a.kt)("inlineCode",{parentName:"p"},"updateCurrentRoute")," calls:"),(0,a.kt)("ul",{parentName:"li"},(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"beforeUpdateCurrent")),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"afterUpdateCurrent"))))),(0,a.kt)("p",null,"Sync hooks:"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"change")," - runs when any of changes to current route\\url happens")))}d.isMDXComponent=!0}}]);