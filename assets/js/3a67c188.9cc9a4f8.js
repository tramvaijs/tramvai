"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[4182],{3905:function(e,n,t){t.d(n,{Zo:function(){return c},kt:function(){return u}});var r=t(7294);function a(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function o(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function i(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?o(Object(t),!0).forEach((function(n){a(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):o(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function l(e,n){if(null==e)return{};var t,r,a=function(e,n){if(null==e)return{};var t,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)t=o[r],n.indexOf(t)>=0||(a[t]=e[t]);return a}(e,n);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)t=o[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var s=r.createContext({}),p=function(e){var n=r.useContext(s),t=n;return e&&(t="function"==typeof e?e(n):i(i({},n),e)),t},c=function(e){var n=p(e.components);return r.createElement(s.Provider,{value:n},e.children)},d={inlineCode:"code",wrapper:function(e){var n=e.children;return r.createElement(r.Fragment,{},n)}},m=r.forwardRef((function(e,n){var t=e.components,a=e.mdxType,o=e.originalType,s=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),m=p(t),u=a,k=m["".concat(s,".").concat(u)]||m[u]||d[u]||o;return t?r.createElement(k,i(i({ref:n},c),{},{components:t})):r.createElement(k,i({ref:n},c))}));function u(e,n){var t=arguments,a=n&&n.mdxType;if("string"==typeof e||a){var o=t.length,i=new Array(o);i[0]=m;var l={};for(var s in n)hasOwnProperty.call(n,s)&&(l[s]=n[s]);l.originalType=e,l.mdxType="string"==typeof e?e:a,i[1]=l;for(var p=2;p<o;p++)i[p]=t[p];return r.createElement.apply(null,i)}return r.createElement.apply(null,t)}m.displayName="MDXCreateElement"},7863:function(e,n,t){t.r(n),t.d(n,{assets:function(){return s},contentTitle:function(){return i},default:function(){return d},frontMatter:function(){return o},metadata:function(){return l},toc:function(){return p}});var r=t(7462),a=(t(7294),t(3905));const o={id:"universal",title:"Separating code for server and client"},i=void 0,l={unversionedId:"guides/universal",id:"guides/universal",title:"Separating code for server and client",description:"The tramvai framework and its core components are universal and work equally well in all environments. tramvai cli collects server and client code into separate assemblies. At the same time, it is required to manually control the execution of user code in the required environment. The main mechanisms for this are package.json, dependency injection and direct checks in the code against the environment.",source:"@site/tmp-docs/guides/universal.md",sourceDirName:"guides",slug:"/guides/universal",permalink:"/docs/guides/universal",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/tmp-docs/guides/universal.md",tags:[],version:"current",frontMatter:{id:"universal",title:"Separating code for server and client"},sidebar:"sidebar",previous:{title:"Creating a tramvai library",permalink:"/docs/guides/tramvai-library"},next:{title:"How to cancel SPA navigation?",permalink:"/docs/how-to/how-cancel-navigation"}},s={},p=[{value:"Application code",id:"application-code",level:3},{value:"process.env",id:"processenv",level:4},{value:"typeof window",id:"typeof-window",level:4},{value:"package.json",id:"packagejson",level:4},{value:"npm packages",id:"npm-packages",level:3},{value:"tramvai modules",id:"tramvai-modules",level:3}],c={toc:p};function d(e){let{components:n,...t}=e;return(0,a.kt)("wrapper",(0,r.Z)({},c,t,{components:n,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"The tramvai framework and its core components are universal and work equally well in all environments. tramvai cli collects server and client code into separate assemblies. At the same time, it is required to manually control the execution of user code in the required environment. The main mechanisms for this are package.json, dependency injection and direct checks in the code against the environment."),(0,a.kt)("p",null,"Learn more about how webpack picks the right files for different ",(0,a.kt)("inlineCode",{parentName:"p"},"target"),", ",(0,a.kt)("a",{parentName:"p",href:"https://www.jonathancreamer.com/how-webpack-decides-what-entry-to-load-from-a-package-json/"},"in this article"),"."),(0,a.kt)("p",null,"User code that depends on the environment can be divided into several types:"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"Application code"),(0,a.kt)("li",{parentName:"ul"},"npm libraries"),(0,a.kt)("li",{parentName:"ul"},"tramvai modules and DI providers")),(0,a.kt)("h3",{id:"application-code"},"Application code"),(0,a.kt)("p",null,"To execute branches of code or in specific environments, several checks can be used:"),(0,a.kt)("h4",{id:"processenv"},"process.env"),(0,a.kt)("p",null,"To exclude code from a production build, regardless of the environment, you can use the variable ",(0,a.kt)("inlineCode",{parentName:"p"},"process.env.NODE_ENV"),":"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-javascript"},"if (process.env.NODE_ENV === 'development') {\n  console.log('debug information');\n}\n")),(0,a.kt)("h4",{id:"typeof-window"},"typeof window"),(0,a.kt)("p",null,"When building a project, you can rely on ",(0,a.kt)("inlineCode",{parentName:"p"},"typeof window"),". Webpack will automatically remove code with a condition that does not match the current environment, for example, the following code will not be included in the server bundle:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-javascript"},"if (typeof window !== 'undefined') {\n  console.log(window.innerWidth, window.innerHeight);\n}\n")),(0,a.kt)("p",null,"To exclude imported libraries from the assembly, you need to replace the top-level ",(0,a.kt)("inlineCode",{parentName:"p"},"import")," with ",(0,a.kt)("inlineCode",{parentName:"p"},"require")," inside the condition:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-javascript"},"if (typeof window !== 'undefined') {\n  const logger = require('@tinkoff/logger');\n  const log = logger('debug');\n\n  log.info(window.location.href);\n}\n")),(0,a.kt)("p",null,"For additional optimizations, the ",(0,a.kt)("a",{parentName:"p",href:"https://github.com/FormidableLabs/babel-plugin-transform-define"},"babel plugin")," is used, which turns ",(0,a.kt)("inlineCode",{parentName:"p"},"typeof window")," from the server assembly to ",(0,a.kt)("inlineCode",{parentName:"p"},"'undefined'"),", and from the client assembly to ",(0,a.kt)("inlineCode",{parentName:"p"},"'object'"),", which allows webpack to cut out unnecessary code, for example, the following condition works similarly to checking ",(0,a.kt)("inlineCode",{parentName:"p"},"process.env.BROWSER"),":"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-javascript"},"if (typeof window !== 'undefined') {\n  console.log(window.innerWidth, window.innerHeight);\n}\n")),(0,a.kt)("h4",{id:"packagejson"},"package.json"),(0,a.kt)("p",null,"If we needed to replace a whole file, and not specific lines of code, we can move it to a separate folder, describe the implementation for all environments, and add ",(0,a.kt)("inlineCode",{parentName:"p"},"package.json"),":"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-javascript"},"// module.server.js\nexport const CONSTANT = 'SERVER_SIDE';\n")),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-javascript"},"// module.client.js\nexport const CONSTANT = 'CLIENT_SIDE';\n")),(0,a.kt)("p",null,"Next, in ",(0,a.kt)("inlineCode",{parentName:"p"},"package.json"),", you need to tell the bundler which code to use for different environments. The ",(0,a.kt)("inlineCode",{parentName:"p"},"main")," field is used for the server bundle, and the ",(0,a.kt)("inlineCode",{parentName:"p"},"browser")," field is used for the client bundle:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "main": "./module.server.js",\n  "browser": "./module.client.js"\n}\n')),(0,a.kt)("admonition",{type:"note"},(0,a.kt)("p",{parentName:"admonition"},"This is a recommended way to use code separation while declaring your own modules in tramvai project.")),(0,a.kt)("h3",{id:"npm-packages"},"npm packages"),(0,a.kt)("p",null,"To create a library, the implementation of which should be different on the server and the client, you need to maintain a common export interface, and configure ",(0,a.kt)("inlineCode",{parentName:"p"},"package.json")," in the same way as in the previous example. For example, the library exports the class ",(0,a.kt)("inlineCode",{parentName:"p"},"Library"),", and the constant ",(0,a.kt)("inlineCode",{parentName:"p"},"LIBRARY_CONSTANT"),"."),(0,a.kt)("p",null,"Let's create two entry points to our library - ",(0,a.kt)("inlineCode",{parentName:"p"},"server.js")," \u0438 ",(0,a.kt)("inlineCode",{parentName:"p"},"client.js"),":"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-javascript"},"// server.js\nexport class Library {\n  constructor() {\n    // ...\n  }\n}\n\nexport const LIBRARY_CONSTANT = 'SERVER_SIDE_LIBRARY';\n")),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-javascript"},"// client.js\nexport class Library {\n  constructor() {\n    // ...\n  }\n}\n\nexport const LIBRARY_CONSTANT = 'CLIENT_SIDE_LIBRARY';\n")),(0,a.kt)("p",null,"Next, in ",(0,a.kt)("inlineCode",{parentName:"p"},"package.json"),", you need to tell the bundler which code to use for different environments. The ",(0,a.kt)("inlineCode",{parentName:"p"},"main")," field is used for the server bundle, and the ",(0,a.kt)("inlineCode",{parentName:"p"},"browser")," field is used for the client bundle:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "name": "library",\n  "version": "0.1.0",\n  "main": "server.js",\n  "browser": "client.js",\n  "dependencies": { ... }\n}\n')),(0,a.kt)("p",null,"After publishing the library, you can import it into the tramvai application, and not worry about which implementation we get:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-javascript"},"import { LIBRARY_CONSTANT } from 'library';\n\n// when starting the application via tramvai start, we will see 'SERVER_SIDE_LIBRARY' in the terminal, and 'CLIENT_SIDE_LIBRARY' in the browser console\nconsole.log(LIBRARY_CONSTANT);\n")),(0,a.kt)("h3",{id:"tramvai-modules"},"tramvai modules"),(0,a.kt)("p",null,"New functionality in the tramvai application is added using modules, and as a rule, the behavior of these modules is radically different in different environments, for example:"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"Rendering the application to a string on the server and hydrating the real DOM on the client"),(0,a.kt)("li",{parentName:"ul"},"Start https server"),(0,a.kt)("li",{parentName:"ul"},"Service worker initialization")),(0,a.kt)("p",null,"For this reason, in the tramvai repository, the standard tramvai module template generated via the ",(0,a.kt)("inlineCode",{parentName:"p"},"npm run generate: module")," command immediately separates the module entry points into ",(0,a.kt)("inlineCode",{parentName:"p"},"server.js")," and ",(0,a.kt)("inlineCode",{parentName:"p"},"client.js")," using ",(0,a.kt)("inlineCode",{parentName:"p"},"package.json")),(0,a.kt)("p",null,"Let's analyze this using the example of creating a module that adds a service to the application for working with ",(0,a.kt)("inlineCode",{parentName:"p"},"cookie"),":"),(0,a.kt)("p",null,"This service should have a common interface:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-tsx"},"export interface ICookie {\n  get(key);\n  set(key, value);\n}\n")),(0,a.kt)("p",null,"And different implementations for server and client environments:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-tsx"},"// src/cookie.server.ts\n// server-side implementation requires Request and Response objects to work with cookies\nexport class Cookie implements ICookie {\n  constructor({ req, res }) {\n    // ...\n  }\n  get(key) {\n    // ...\n  }\n  set(key, value) {\n    // ...\n  }\n}\n")),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-tsx"},"// src/cookie.client.ts\n// the client implementation accesses the Window object directly\nexport class Cookie implements ICookie {\n  get(key) {\n    // ...\n  }\n  set(key, value) {\n    // ...\n  }\n}\n")),(0,a.kt)("p",null,"Add a service to DI using modules:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-tsx"},"// src/server.ts\nimport { Module, Scope, provide } from '@tramvai/core';\nimport { REQUEST, RESPONSE } from '@tramvai/tokens-common';\nimport { Cookie } from './cookie.server';\n\n@Module({\n  providers: [\n    provide({\n      provide: 'cookie',\n      useClass: Cookie,\n      scope: Scope.REQUEST,\n      deps: {\n        req: REQUEST,\n        res: RESPONSE,\n      },\n    }),\n  ],\n})\nexport class CookieModule {}\n")),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-tsx"},"// src/client.ts\nimport { Module, Scope, provide } from '@tramvai/core';\nimport { Cookie } from './cookie.client';\n\n@Module({\n  providers: [\n    provide({\n      provide: 'cookie',\n      useClass: Cookie,\n      scope: Scope.SINGLETON,\n    }),\n  ],\n})\nexport class CookieModule {}\n")),(0,a.kt)("p",null,"Configure ",(0,a.kt)("inlineCode",{parentName:"p"},"package.json"),":"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "name": "@tramvai/module-cookie",\n  "version": "0.1.0",\n  "main": "lib/server.js",\n  "browser": "lib/client.js",\n  "dependencies": { ... }\n}\n')),(0,a.kt)("p",null,"After importing the module into the application, we get universal access to cookies, and do not think about the environment when using:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-tsx"},"import { createApp, commandLineListTokens, provide } from '@tramvai/core';\nimport { CookieModule } from '@tramvai/module-cookie';\n\ncreateApp({\n  name: 'app',\n  modules: [\n    // ...\n    CookieModule,\n  ],\n  providers: [\n    // ...\n    provide({\n      provide: commandLineListTokens.init,\n      useFactory: ({ cookie }) => {\n        console.log('wuid', cookie.get('wuid'));\n      },\n      deps: {\n        cookie: 'cookie',\n      },\n    }),\n  ],\n  // ...\n});\n")))}d.isMDXComponent=!0}}]);