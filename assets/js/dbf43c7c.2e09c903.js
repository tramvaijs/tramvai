"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[4776],{3905:(e,t,a)=>{a.d(t,{Zo:()=>p,kt:()=>m});var i=a(7294);function n(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function r(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,i)}return a}function o(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?r(Object(a),!0).forEach((function(t){n(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):r(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function l(e,t){if(null==e)return{};var a,i,n=function(e,t){if(null==e)return{};var a,i,n={},r=Object.keys(e);for(i=0;i<r.length;i++)a=r[i],t.indexOf(a)>=0||(n[a]=e[a]);return n}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(i=0;i<r.length;i++)a=r[i],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(n[a]=e[a])}return n}var s=i.createContext({}),d=function(e){var t=i.useContext(s),a=t;return e&&(a="function"==typeof e?e(t):o(o({},t),e)),a},p=function(e){var t=d(e.components);return i.createElement(s.Provider,{value:t},e.children)},c={inlineCode:"code",wrapper:function(e){var t=e.children;return i.createElement(i.Fragment,{},t)}},u=i.forwardRef((function(e,t){var a=e.components,n=e.mdxType,r=e.originalType,s=e.parentName,p=l(e,["components","mdxType","originalType","parentName"]),u=d(a),m=n,h=u["".concat(s,".").concat(m)]||u[m]||c[m]||r;return a?i.createElement(h,o(o({ref:t},p),{},{components:a})):i.createElement(h,o({ref:t},p))}));function m(e,t){var a=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var r=a.length,o=new Array(r);o[0]=u;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l.mdxType="string"==typeof e?e:n,o[1]=l;for(var d=2;d<r;d++)o[d]=a[d];return i.createElement.apply(null,o)}return i.createElement.apply(null,a)}u.displayName="MDXCreateElement"},7124:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>p,contentTitle:()=>s,default:()=>m,frontMatter:()=>l,metadata:()=>d,toc:()=>c});var i=a(7462),n=a(3366),r=(a(7294),a(3905)),o=["components"],l={id:"overview",title:"Introduction to tramvai",sidebar_position:1},s=void 0,d={unversionedId:"concepts/overview",id:"concepts/overview",title:"Introduction to tramvai",description:"tramvai is a lightweight web framework for building SSR applications with a modular system and DI to quickly extend the functionality of applications.",source:"@site/tmp-docs/concepts/overview.md",sourceDirName:"concepts",slug:"/concepts/overview",permalink:"/docs/concepts/overview",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/get-started/overview.md/tmp-docs/concepts/overview.md",tags:[],version:"current",sidebarPosition:1,frontMatter:{id:"overview",title:"Introduction to tramvai",sidebar_position:1},sidebar:"sidebar",previous:{title:"PWA (Progressive Web App)",permalink:"/docs/features/pwa"},next:{title:"Dependency Injection",permalink:"/docs/concepts/di"}},p={},c=[{value:"Main features",id:"main-features",level:2},{value:"Approaches used",id:"approaches-used",level:2},{value:"Modularity",id:"modularity",level:3},{value:"Standardization",id:"standardization",level:3},{value:"Performance",id:"performance",level:3},{value:"Universal",id:"universal",level:3},{value:"Splitting into external libraries",id:"splitting-into-external-libraries",level:3},{value:"DI with interface taken from Nest or Angular DI",id:"di-with-interface-taken-from-nest-or-angular-di",level:3},{value:"Soft migration option",id:"soft-migration-option",level:3},{value:"Why was it developed",id:"why-was-it-developed",level:2},{value:"tramvai",id:"tramvai",level:3},{value:"Alternatives",id:"alternatives",level:4},{value:"next.js",id:"nextjs",level:5},{value:"fusion.js",id:"fusionjs",level:5},{value:"nest.js",id:"nestjs",level:5},{value:"@tinkoff/dippy",id:"tinkoffdippy",level:3},{value:"Alternatives",id:"alternatives-1",level:4},{value:"inversify",id:"inversify",level:5},{value:"state",id:"state",level:3},{value:"Alternatives",id:"alternatives-2",level:4},{value:"redux",id:"redux",level:5},{value:"reatom",id:"reatom",level:5},{value:"effector",id:"effector",level:5},{value:"Concepts",id:"concepts",level:2},{value:"Module",id:"module",level:3},{value:"DI system",id:"di-system",level:3},{value:"CommandLineRunner",id:"commandlinerunner",level:3}],u={toc:c};function m(e){var t=e.components,l=(0,n.Z)(e,o);return(0,r.kt)("wrapper",(0,i.Z)({},u,l,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"tramvai")," is a lightweight web framework for building SSR applications with a modular system and DI to quickly extend the functionality of applications."),(0,r.kt)("h2",{id:"main-features"},"Main features"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("strong",{parentName:"li"},"Modular approach")," - you can extend the functionality of applications using modules"),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("strong",{parentName:"li"},"Universal")," - Works equally well for browsers and server"),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("strong",{parentName:"li"},"Fast")," - lightweight, does not affect the overall performance of the application, maximizes parallelization of actions on the server")),(0,r.kt)("h2",{id:"approaches-used"},"Approaches used"),(0,r.kt)("p",null,(0,r.kt)("img",{alt:"tramvai main",src:a(5814).Z,width:"1494",height:"970"})),(0,r.kt)("h3",{id:"modularity"},"Modularity"),(0,r.kt)("p",null,"The architecture ",(0,r.kt)("inlineCode",{parentName:"p"},"tramvai")," is based on the idea that we have all the functionality divided into various modules and all communication between the modules is based on common interfaces, interacting through ",(0,r.kt)("inlineCode",{parentName:"p"},"DI"),". This architecture makes it possible to easily add new functionality to the application, and replace existing functionality."),(0,r.kt)("h3",{id:"standardization"},"Standardization"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"tramvai")," is a framework that allows you to maintain and create applications with the same architecture for many teams with the ability to share code between projects, as it ",(0,r.kt)("inlineCode",{parentName:"p"},"tramvai")," is a lightweight layer that helps to interact different modules in the application"),(0,r.kt)("h3",{id:"performance"},"Performance"),(0,r.kt)("p",null,"The core ",(0,r.kt)("inlineCode",{parentName:"p"},"tramvai")," together with ",(0,r.kt)("inlineCode",{parentName:"p"},"DI")," weighs 4 kb, everything else is implemented through third-party modules that extend the functionality of the application. This makes it possible to make applications of the minimum size, excluding unnecessary features. The architecture and modules are designed with a concept ",(0,r.kt)("inlineCode",{parentName:"p"},"performance first")," for maximum parallelization, according to best practice."),(0,r.kt)("h3",{id:"universal"},"Universal"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"tramvai")," it is an SSR-first framework and takes into account all the features and problems associated with the server, client and the interaction between them:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},"All modules are developed for both the browser and the server"),(0,r.kt)("li",{parentName:"ul"},"Common interfaces are used"),(0,r.kt)("li",{parentName:"ul"},"A ",(0,r.kt)("a",{parentName:"li",href:"/docs/concepts/command-line-runner"},"chain of commands")," on the server and the browser is used which allows you to perform actions in determining the lifetime of the application"),(0,r.kt)("li",{parentName:"ul"},"The ",(0,r.kt)("a",{parentName:"li",href:"/docs/concepts/action"},"action system")," allows you to equally request data on the server and in the browser, using various features (e.g. repetition in the browser of an action that crashed on the server)")),(0,r.kt)("h3",{id:"splitting-into-external-libraries"},"Splitting into external libraries"),(0,r.kt)("p",null,"When developing ",(0,r.kt)("inlineCode",{parentName:"p"},"tramvai")," we try to use open source solutions, or create basic libraries that are in no way related to ",(0,r.kt)("inlineCode",{parentName:"p"},"tramvai")," and can be used in other projects and frameworks."),(0,r.kt)("h3",{id:"di-with-interface-taken-from-nest-or-angular-di"},"DI with interface taken from Nest or Angular DI"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"DI")," is the core part of ",(0,r.kt)("inlineCode",{parentName:"p"},"tramvai")," that allows you to reduce code cohesion and separation of functionality into modules. ",(0,r.kt)("inlineCode",{parentName:"p"},"tramvai")," use a library ",(0,r.kt)("inlineCode",{parentName:"p"},"@tinkoff/dippy")," that implements the ",(0,r.kt)("inlineCode",{parentName:"p"},"DI")," container. The internal interface ",(0,r.kt)("inlineCode",{parentName:"p"},"DI")," repeats the interface ",(0,r.kt)("inlineCode",{parentName:"p"},"Nest"),", which allows you to conveniently describe the dependencies and implementations of classes."),(0,r.kt)("h3",{id:"soft-migration-option"},"Soft migration option"),(0,r.kt)("p",null,"A million + lines of code have already been written on ",(0,r.kt)("inlineCode",{parentName:"p"},"tinkoff.ru")," and the new solution should not break the existing code, and also require applications from a difficult and long transition"),(0,r.kt)("h2",{id:"why-was-it-developed"},"Why was it developed"),(0,r.kt)("h3",{id:"tramvai"},"tramvai"),(0,r.kt)("p",null,"Often, React applications are a constructor from different libraries that have been included in the project. This works well on a small scale, but it does not work well for large applications with 70+ developers, since in this approach it is easy to connect your own and disperse radically in the application architecture. This problem is taken over ",(0,r.kt)("inlineCode",{parentName:"p"},"tramvai")," and standardized and implemented by a common application architecture that all product teams use."),(0,r.kt)("p",null,"There are not many open source solutions on github that implement the architecture of large applications."),(0,r.kt)("h4",{id:"alternatives"},"Alternatives"),(0,r.kt)("h5",{id:"nextjs"},"next.js"),(0,r.kt)("p",null,"One of the best simple React frameworks that takes care of server-side rendering and routing. At the same time, this is a lightweight framework that does not standardize in any way and does not solve the problems with the modularity of components. Therefore, most of the code that was written on ",(0,r.kt)("inlineCode",{parentName:"p"},"tramvai")," would have to be written for ",(0,r.kt)("inlineCode",{parentName:"p"},"next.js")," and try to somehow implement, since in ",(0,r.kt)("inlineCode",{parentName:"p"},"next.js")," the ability to extend functionality is very limited"),(0,r.kt)("h5",{id:"fusionjs"},"fusion.js"),(0,r.kt)("p",null,"A similar framework that evolved and emerged at the same time with ",(0,r.kt)("inlineCode",{parentName:"p"},"tramvai"),". Fusion.js does not have a full-fledged DI, a limited ability to move functionality into modules and the entire architecture is built on the basis of middlewares, and there are difficulties around the hard-coded priorities of plugins and the lack of parallelization of actions"),(0,r.kt)("h5",{id:"nestjs"},"nest.js"),(0,r.kt)("p",null,"An excellent backend framework that uses similar DI, but is not completely sharpened for SSR. And when using it, we had to have 2 architectures, one for the backend, the other written by ourselves for the client"),(0,r.kt)("h3",{id:"tinkoffdippy"},"@tinkoff/dippy"),(0,r.kt)("p",null,"Lightweight DI library with Angular-like interface. In the open source, there are not so many different DI options that allow you to separate class implementations, both basic general and specific for each client."),(0,r.kt)("h4",{id:"alternatives-1"},"Alternatives"),(0,r.kt)("h5",{id:"inversify"},"inversify"),(0,r.kt)("p",null,"This is the most popular library for creating DI, with:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},"weighs 11kb, compared to dippy 1.2kb"),(0,r.kt)("li",{parentName:"ul"},"a low-level API that requires different wrappers to implement a modular system."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"ts-nest")," this is an example of a wrapper over inversify that has weak support and only the wrapper contains about the same code as ",(0,r.kt)("inlineCode",{parentName:"li"},"@tinkoff/dippy"))),(0,r.kt)("h3",{id:"state"},"state"),(0,r.kt)("p",null,"The ",(0,r.kt)("a",{parentName:"p",href:"/docs/features/state-management"},"state management library")," built into tramvai is almost completely similar to the Redux interface, with few nuances:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},"Allows you to sign components only for updating certain reducers, solving the problem with performance"),(0,r.kt)("li",{parentName:"ul"},"There is a lot of code written using the deprecated version of the state and you can't just switch to another solution")),(0,r.kt)("h4",{id:"alternatives-2"},"Alternatives"),(0,r.kt)("h5",{id:"redux"},"redux"),(0,r.kt)("p",null,"Moving to pure redux will not solve the problems, it will only add performance-related ones"),(0,r.kt)("h5",{id:"reatom"},"reatom"),(0,r.kt)("p",null,"Very similar to our state manager, a new library that addresses the issue of updates and performance. A good candidate to take some features from. Full transition is very expensive due to the codebase"),(0,r.kt)("h5",{id:"effector"},"effector"),(0,r.kt)("p",null,"Interesting library that has a focus on the client side and is not very suitable for SSR"),(0,r.kt)("h2",{id:"concepts"},"Concepts"),(0,r.kt)("h3",{id:"module"},"Module"),(0,r.kt)("p",null,"The main basic elements of the ",(0,r.kt)("inlineCode",{parentName:"p"},"tramvai")," architecture that contain the implementation of functionality. At the same time, it is assumed that such modules will not be huge and a large number of different types will appear."),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/docs/concepts/module"},"Documentation")),(0,r.kt)("h3",{id:"di-system"},"DI system"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"tramvai")," is built on a DI system that stores the implementation of functionality and receiving implementations for tokens and keys. This allows you to implement communications between modules based only on interfaces, while having the ability to change implementations as needed."),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/docs/concepts/di"},"Documentation")),(0,r.kt)("h3",{id:"commandlinerunner"},"CommandLineRunner"),(0,r.kt)("p",null,"Runner for a list of actions that modules can attach actions to. There are 2 types of action lists:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},"Application initialization"),(0,r.kt)("li",{parentName:"ul"},"Processing a request for a client")),(0,r.kt)("p",null,"Within the framework of this list of actions, routes, user status, page rendering and html return to the client are received."),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/docs/concepts/command-line-runner"},"Documentation")))}m.isMDXComponent=!0},5814:(e,t,a)=>{a.d(t,{Z:()=>i});const i=a.p+"assets/images/tramvai-main-39c88cba185dd6017a0849ada565298f.jpg"}}]);