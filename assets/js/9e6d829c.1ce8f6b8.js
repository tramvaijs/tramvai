"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[9893],{3905:function(e,n,t){t.d(n,{Zo:function(){return s},kt:function(){return u}});var a=t(7294);function i(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function l(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);n&&(a=a.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,a)}return t}function o(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?l(Object(t),!0).forEach((function(n){i(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):l(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function r(e,n){if(null==e)return{};var t,a,i=function(e,n){if(null==e)return{};var t,a,i={},l=Object.keys(e);for(a=0;a<l.length;a++)t=l[a],n.indexOf(t)>=0||(i[t]=e[t]);return i}(e,n);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(a=0;a<l.length;a++)t=l[a],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(i[t]=e[t])}return i}var p=a.createContext({}),d=function(e){var n=a.useContext(p),t=n;return e&&(t="function"==typeof e?e(n):o(o({},n),e)),t},s=function(e){var n=d(e.components);return a.createElement(p.Provider,{value:n},e.children)},c={inlineCode:"code",wrapper:function(e){var n=e.children;return a.createElement(a.Fragment,{},n)}},m=a.forwardRef((function(e,n){var t=e.components,i=e.mdxType,l=e.originalType,p=e.parentName,s=r(e,["components","mdxType","originalType","parentName"]),m=d(t),u=i,f=m["".concat(p,".").concat(u)]||m[u]||c[u]||l;return t?a.createElement(f,o(o({ref:n},s),{},{components:t})):a.createElement(f,o({ref:n},s))}));function u(e,n){var t=arguments,i=n&&n.mdxType;if("string"==typeof e||i){var l=t.length,o=new Array(l);o[0]=m;var r={};for(var p in n)hasOwnProperty.call(n,p)&&(r[p]=n[p]);r.originalType=e,r.mdxType="string"==typeof e?e:i,o[1]=r;for(var d=2;d<l;d++)o[d]=t[d];return a.createElement.apply(null,o)}return a.createElement.apply(null,t)}m.displayName="MDXCreateElement"},222:function(e,n,t){t.r(n),t.d(n,{assets:function(){return p},contentTitle:function(){return o},default:function(){return c},frontMatter:function(){return l},metadata:function(){return r},toc:function(){return d}});var a=t(7462),i=(t(7294),t(3905));const l={id:"lifecycle",title:"Lifecycle"},o=void 0,r={unversionedId:"features/child-app/lifecycle",id:"features/child-app/lifecycle",title:"Lifecycle",description:"Explanation",source:"@site/tmp-docs/03-features/015-child-app/06-lifecycle.md",sourceDirName:"03-features/015-child-app",slug:"/features/child-app/lifecycle",permalink:"/docs/features/child-app/lifecycle",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/tmp-docs/03-features/015-child-app/06-lifecycle.md",tags:[],version:"current",sidebarPosition:6,frontMatter:{id:"lifecycle",title:"Lifecycle"},sidebar:"sidebar",previous:{title:"Managing State",permalink:"/docs/features/child-app/state-management"},next:{title:"Data Fetching",permalink:"/docs/features/child-app/data-fetching"}},p={},d=[{value:"Explanation",id:"explanation",level:2},{value:"Server flow",id:"server-flow",level:3},{value:"Client flow",id:"client-flow",level:3},{value:"SPA transition flow",id:"spa-transition-flow",level:3},{value:"Usage",id:"usage",level:2},{value:"Installation",id:"installation",level:3},{value:"Add new command",id:"add-new-command",level:3},{value:"How to",id:"how-to",level:2},{value:"How to preload Child App before SPA-navigation?",id:"how-to-preload-child-app-before-spa-navigation",level:3}],s={toc:d};function c(e){let{components:n,...l}=e;return(0,i.kt)("wrapper",(0,a.Z)({},s,l,{components:n,mdxType:"MDXLayout"}),(0,i.kt)("h2",{id:"explanation"},"Explanation"),(0,i.kt)("p",null,"Child Apps have their own ",(0,i.kt)("inlineCode",{parentName:"p"},"CommandLineRunner")," flow, which is very similar to the ",(0,i.kt)("a",{parentName:"p",href:"/docs/features/app-lifecycle"},"Root App lifecycle"),", with the exception that there is no global command line stages like ",(0,i.kt)("inlineCode",{parentName:"p"},"init")," and ",(0,i.kt)("inlineCode",{parentName:"p"},"listen"),", only request-scoped stages."),(0,i.kt)("p",null,"Root Application controls when Child Apps command lines will be executed, it will be done in own command line stages, and Root App will try to execute all used on current page Child Apps command lines in parallel."),(0,i.kt)("h3",{id:"server-flow"},"Server flow"),(0,i.kt)("p",null,"Used when page is processed on server."),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"customer")," command line: ","[",(0,i.kt)("inlineCode",{parentName:"li"},"customerStart")," -> ",(0,i.kt)("inlineCode",{parentName:"li"},"resolveUserDeps")," -> ",(0,i.kt)("inlineCode",{parentName:"li"},"resolvePageDeps"),"]"),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"clear")," command line: ","[",(0,i.kt)("inlineCode",{parentName:"li"},"clear"),"]")),(0,i.kt)("p",null,(0,i.kt)("img",{alt:"command-line-runner",src:t(339).Z,width:"1012",height:"546"})),(0,i.kt)("p",null,"Stage when Root App will start this command lines can be different depending on the Child App was preloading or not:"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},"If Child App was preloaded before Root App ",(0,i.kt)("inlineCode",{parentName:"li"},"resolvePageDeps")," then ",(0,i.kt)("inlineCode",{parentName:"li"},"customer")," line list is executed on Root App ",(0,i.kt)("inlineCode",{parentName:"li"},"resolvePageDeps")," line"),(0,i.kt)("li",{parentName:"ul"},"If Child App was preloaded on Root App ",(0,i.kt)("inlineCode",{parentName:"li"},"resolvePageDeps")," then ",(0,i.kt)("inlineCode",{parentName:"li"},"customer")," line list is executed as soon as Child App was loaded. ",(0,i.kt)("inlineCode",{parentName:"li"},"preload")," call must be awaited in order to prevent Root App CommandLineRunner to passing to next line. That still counts as executing on ",(0,i.kt)("inlineCode",{parentName:"li"},"resolvePageDeps")," line."),(0,i.kt)("li",{parentName:"ul"},"Child-app ",(0,i.kt)("inlineCode",{parentName:"li"},"clear")," line list is executed on Root App ",(0,i.kt)("inlineCode",{parentName:"li"},"clear")," line for every Child App that was preloaded on previous lines")),(0,i.kt)("h3",{id:"client-flow"},"Client flow"),(0,i.kt)("p",null,"Used when page is hydrated on client."),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"customer")," command line: ","[",(0,i.kt)("inlineCode",{parentName:"li"},"customerStart")," -> ",(0,i.kt)("inlineCode",{parentName:"li"},"resolveUserDeps")," -> ",(0,i.kt)("inlineCode",{parentName:"li"},"resolvePageDeps"),"]"),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"clear")," command line: ","[",(0,i.kt)("inlineCode",{parentName:"li"},"clear"),"]")),(0,i.kt)("p",null,"If specific child-app was preloaded on server then it behaves identical to server flow:"),(0,i.kt)("p",null,(0,i.kt)("img",{alt:"command-line-runner",src:t(4766).Z,width:"1012",height:"546"})),(0,i.kt)("p",null,"If specific child-app was not preloaded on server but used on current page then the flow will be:"),(0,i.kt)("p",null,(0,i.kt)("img",{alt:"command-line-runner",src:t(8231).Z,width:"1141",height:"573"})),(0,i.kt)("h3",{id:"spa-transition-flow"},"SPA transition flow"),(0,i.kt)("p",null,"Used on client for subsequent navigations without page reloading."),(0,i.kt)("p",null,"Child App is considered not preloaded on SPA-navigation for next page, when:"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},"it is not ",(0,i.kt)("a",{parentName:"li",href:"/docs/features/child-app/connect#preload-automatically-for-page-or-layout"},"automatically preloaded")),(0,i.kt)("li",{parentName:"ul"},"it is not ",(0,i.kt)("a",{parentName:"li",href:"/docs/features/child-app/connect#preload-manually"},"manually preloaded")),(0,i.kt)("li",{parentName:"ul"},"or it is preloaded first time at client-side (or you can ",(0,i.kt)("a",{parentName:"li",href:"#how-to-preload-child-app-before-spa-navigation"},"force Child App loading before navigation"),")")),(0,i.kt)("p",null,"If specific child-app was preloaded before and was preloaded for the next page:"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"spa")," command line: ","[",(0,i.kt)("inlineCode",{parentName:"li"},"resolveUserDeps")," -> ",(0,i.kt)("inlineCode",{parentName:"li"},"resolvePageDeps")," -> ",(0,i.kt)("inlineCode",{parentName:"li"},"spaTransition"),"]"),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"afterSpa")," command line: ","[",(0,i.kt)("inlineCode",{parentName:"li"},"afterSpaTransition"),"]")),(0,i.kt)("p",null,(0,i.kt)("img",{alt:"command-line-runner",src:t(11).Z,width:"941",height:"551"})),(0,i.kt)("p",null,"If specific child-app was not preloaded before or was preloaded for the next page first time:"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"customer")," command line: ","[",(0,i.kt)("inlineCode",{parentName:"li"},"customerStart")," -> ",(0,i.kt)("inlineCode",{parentName:"li"},"resolveUserDeps")," -> ",(0,i.kt)("inlineCode",{parentName:"li"},"resolvePageDeps"),"]"),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"clear")," command line: ","[",(0,i.kt)("inlineCode",{parentName:"li"},"clear"),"]")),(0,i.kt)("p",null,(0,i.kt)("img",{alt:"command-line-runner",src:t(4472).Z,width:"1011",height:"622"})),(0,i.kt)("h2",{id:"usage"},"Usage"),(0,i.kt)("p",null,"Command line stages is a good place to make common actions for current page, for example:"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},"add new assets (scripts, fonts, etc.)"),(0,i.kt)("li",{parentName:"ul"},"services configuration"),(0,i.kt)("li",{parentName:"ul"},"fetch some global data"),(0,i.kt)("li",{parentName:"ul"},"basic metrics, analytics")),(0,i.kt)("p",null,"For other cases, especially API calls, prefer to use ",(0,i.kt)("a",{parentName:"p",href:"/docs/features/child-app/data-fetching#actions"},"Actions"),"."),(0,i.kt)("admonition",{type:"tip"},(0,i.kt)("p",{parentName:"admonition"},"It is important to make command line stages as fast as possible, because they are directly delaying response for user. Few tips how to make page response fast:"),(0,i.kt)("ul",{parentName:"admonition"},(0,i.kt)("li",{parentName:"ul"},"Use ",(0,i.kt)("a",{parentName:"li",href:"/docs/features/child-app/data-fetching#actions"},"Actions")," for requests - they are executed in parallel with Root App Actions"),(0,i.kt)("li",{parentName:"ul"},"If you still need to fetch data in command line and use it in different Actions / services, try to cache this data at ",(0,i.kt)("a",{parentName:"li",href:"/docs/features/child-app/data-fetching#http-client"},"HTTP Client")," level - this cache can be shared between all Child Apps and requests"))),(0,i.kt)("h3",{id:"installation"},"Installation"),(0,i.kt)("p",null,"First, you need to install ",(0,i.kt)("inlineCode",{parentName:"p"},"@tramvai/module-common")," module in your Child App:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-bash"},"npx tramvai add @tramvai/module-common\n")),(0,i.kt)("p",null,"Then, connect ",(0,i.kt)("inlineCode",{parentName:"p"},"CommonChildAppModule")," from this module in your ",(0,i.kt)("inlineCode",{parentName:"p"},"createChildApp")," function:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-ts"},"import { createChildApp } from '@tramvai/child-app-core';\nimport { CommonChildAppModule } from '@tramvai/module-common';\nimport { RootCmp } from './components/root';\n\n// eslint-disable-next-line import/no-default-export\nexport default createChildApp({\n  name: 'fancy-child',\n  render: RootCmp,\n  modules: [CommonChildAppModule],\n  providers: [],\n});\n")),(0,i.kt)("h3",{id:"add-new-command"},"Add new command"),(0,i.kt)("p",null,"It is important to use ",(0,i.kt)("inlineCode",{parentName:"p"},"commandLineListTokens")," from ",(0,i.kt)("inlineCode",{parentName:"p"},"@tramvai/child-app-core")," to add commands in Child App. Common mistake is to import this object from ",(0,i.kt)("inlineCode",{parentName:"p"},"@tramvai/core"),", but it will work only in Root App."),(0,i.kt)("p",null,"For example, let's add log for every Child App ",(0,i.kt)("inlineCode",{parentName:"p"},"CommandLineRunner")," execution start:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-ts"},"import { provide } from '@tramvai/core';\n// highlight-next-line\nimport { createChildApp, commandLineListTokens } from '@tramvai/child-app-core';\nimport { CommonChildAppModule } from '@tramvai/module-common';\nimport { RootCmp } from './components/root';\n\n// eslint-disable-next-line import/no-default-export\nexport default createChildApp({\n  name: 'fancy-child',\n  render: RootCmp,\n  modules: [CommonChildAppModule],\n  providers: [\n    // highlight-start\n    provide({\n      provide: commandLineListTokens.customerStart,\n      useFactory: ({ logger }) => {\n        const log = logger('fancy-child');\n\n        return function customerStart() {\n          log.info('fancy-child command line started');\n        };\n      },\n    }),\n    // highlight-end\n  ],\n});\n")),(0,i.kt)("p",null,"You can see this log both on server-side and client-side, when page with ",(0,i.kt)("inlineCode",{parentName:"p"},"fancy-child")," Child App will be rendered."),(0,i.kt)("h2",{id:"how-to"},"How to"),(0,i.kt)("h3",{id:"how-to-preload-child-app-before-spa-navigation"},"How to preload Child App before SPA-navigation?"),(0,i.kt)("p",null,"By default, when specific Child App is used first time on next page on SPA transition, his preloading will not block this transition and new screen from rendering."),(0,i.kt)("p",null,"You can change this behaviour with ",(0,i.kt)("a",{parentName:"p",href:"/docs/features/child-app/connect#preload-manually"},"manual preloading"),":"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-ts"},"import { provide, commandLineListTokens } from '@tramvai/core';\nimport { CHILD_APP_PRELOAD_MANAGER_TOKEN } from '@tramvai/module-child-app';\nimport { PAGE_SERVICE_TOKEN } from '@tramvai/tokens-router';\n\nconst provider = provide({\n  provide: commandLineListTokens.resolvePageDeps,\n  useFactory: ({ preloadManager, pageService }) => {\n    let isSpaNavigation = false;\n\n    return function preloadFancyChildApp() {\n      // for SPA-navigation to specific page with this Child App\n      if (isSpaNavigation && pageService.getCurrentUrl().pathname === '/fancy-child/') {\n        // wait for preloading\n        return preloadManager.preload({ name: 'fancy-child' });\n      }\n\n      // second call of `resolvePageDeps` command means that it is SPA-navigation\n      if (!isSpaNavigation) {\n        isSpaNavigation = true;\n      }\n    };\n  },\n  deps: {\n    preloadManager: CHILD_APP_PRELOAD_MANAGER_TOKEN,\n    pageService: PAGE_SERVICE_TOKEN,\n  },\n});\n")))}c.isMDXComponent=!0},4766:function(e,n,t){n.Z=t.p+"assets/images/command-line-runner-client-loaded.drawio-ddac1ebc56488016a1582526794d63dd.svg"},8231:function(e,n,t){n.Z=t.p+"assets/images/command-line-runner-client-not-loaded.drawio-253b44790c96c7eae116862497a9a82d.svg"},339:function(e,n,t){n.Z=t.p+"assets/images/command-line-runner-server.drawio-ddac1ebc56488016a1582526794d63dd.svg"},11:function(e,n,t){n.Z=t.p+"assets/images/command-line-runner-spa-loaded.drawio-c313e9c27f017e616076c42cb4f2d606.svg"},4472:function(e,n,t){n.Z=t.p+"assets/images/command-line-runner-spa-not-loaded.drawio-aa4f4addf20f8af4563ff432e4f5543f.svg"}}]);