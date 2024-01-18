"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[2918],{3905:(e,n,t)=>{t.d(n,{Zo:()=>d,kt:()=>u});var r=t(7294);function o(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function a(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function i(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?a(Object(t),!0).forEach((function(n){o(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):a(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function p(e,n){if(null==e)return{};var t,r,o=function(e,n){if(null==e)return{};var t,r,o={},a=Object.keys(e);for(r=0;r<a.length;r++)t=a[r],n.indexOf(t)>=0||(o[t]=e[t]);return o}(e,n);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)t=a[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(o[t]=e[t])}return o}var l=r.createContext({}),s=function(e){var n=r.useContext(l),t=n;return e&&(t="function"==typeof e?e(n):i(i({},n),e)),t},d=function(e){var n=s(e.components);return r.createElement(l.Provider,{value:n},e.children)},c={inlineCode:"code",wrapper:function(e){var n=e.children;return r.createElement(r.Fragment,{},n)}},m=r.forwardRef((function(e,n){var t=e.components,o=e.mdxType,a=e.originalType,l=e.parentName,d=p(e,["components","mdxType","originalType","parentName"]),m=s(t),u=o,v=m["".concat(l,".").concat(u)]||m[u]||c[u]||a;return t?r.createElement(v,i(i({ref:n},d),{},{components:t})):r.createElement(v,i({ref:n},d))}));function u(e,n){var t=arguments,o=n&&n.mdxType;if("string"==typeof e||o){var a=t.length,i=new Array(a);i[0]=m;var p={};for(var l in n)hasOwnProperty.call(n,l)&&(p[l]=n[l]);p.originalType=e,p.mdxType="string"==typeof e?e:o,i[1]=p;for(var s=2;s<a;s++)i[s]=t[s];return r.createElement.apply(null,i)}return r.createElement.apply(null,t)}m.displayName="MDXCreateElement"},5481:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>d,contentTitle:()=>l,default:()=>u,frontMatter:()=>p,metadata:()=>s,toc:()=>c});var r=t(7462),o=t(3366),a=(t(7294),t(3905)),i=["components"],p={id:"provider",title:"Provider",sidebar_position:3},l=void 0,s={unversionedId:"concepts/provider",id:"concepts/provider",title:"Provider",description:"provider is a simple object that provides an implementation for an interface (identifier) \u200b\u200bfor a particular dependency. An implementation can be a constant value (string, function, symbol, class instance), factory, or class. A factory or class is initialized upon request to the corresponding identifier. It is possible to register several providers for one token, if the multi parameter is present.",source:"@site/tmp-docs/concepts/provider.md",sourceDirName:"concepts",slug:"/concepts/provider",permalink:"/docs/concepts/provider",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/tmp-docs/concepts/provider.md",tags:[],version:"current",sidebarPosition:3,frontMatter:{id:"provider",title:"Provider",sidebar_position:3},sidebar:"sidebar",previous:{title:"Dependency Injection",permalink:"/docs/concepts/di"},next:{title:"Module",permalink:"/docs/concepts/module"}},d={},c=[{value:"Format",id:"format",level:2},{value:"Types of providers",id:"types-of-providers",level:2},{value:"Factory",id:"factory",level:3},{value:"Class",id:"class",level:3},{value:"Value",id:"value",level:3},{value:"Multi providers",id:"multi-providers",level:2},{value:"Dependencies (deps)",id:"dependencies-deps",level:2},{value:"Format",id:"format-1",level:3},{value:"Optional Dependencies",id:"optional-dependencies",level:3},{value:"Multi dependencies",id:"multi-dependencies",level:3},{value:"Multi optional dependencies",id:"multi-optional-dependencies",level:3},{value:"Circular dependency",id:"circular-dependency",level:3},{value:"Scope",id:"scope",level:2},{value:"Tokens",id:"tokens",level:2},{value:"Multi token",id:"multi-token",level:3},{value:"Scoped token",id:"scoped-token",level:3}],m={toc:c};function u(e){var n=e.components,t=(0,o.Z)(e,i);return(0,a.kt)("wrapper",(0,r.Z)({},m,t,{components:n,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"provider is a simple object that provides an implementation for an interface (identifier) \u200b\u200bfor a particular dependency. An implementation can be a constant value (string, function, symbol, class instance), factory, or class. A factory or class is initialized upon request to the corresponding identifier. It is possible to register several providers for one token, if the ",(0,a.kt)("inlineCode",{parentName:"p"},"multi")," parameter is present."),(0,a.kt)("h2",{id:"format"},"Format"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-tsx"},"type Provider = {\n  provide: Token; // provider id\n  useValue?: any; // implementation of the identifier\n  useFactory?: () => any; // implementation of the identifier\n  useClass?: Class; // implementation of the identifier\n  deps?: Record<string, Token>; // list of dependencies that the provider needs to work\n  scope?: 'request' | 'singleton'; // If a singleton, then the container will register one instance of the provider for all client requests. If request will create its own instance for each client and Request\n};\n")),(0,a.kt)("h2",{id:"types-of-providers"},"Types of providers"),(0,a.kt)("h3",{id:"factory"},"Factory"),(0,a.kt)("p",null,"When the instance is initialized, the function passed to ",(0,a.kt)("inlineCode",{parentName:"p"},"useFactory")," will be called, if ",(0,a.kt)("inlineCode",{parentName:"p"},"deps")," were specified, then the function will be called with the object of implementations as the first argument."),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"ExtractDependencyType")," helper is used to get the resolved type of the dependency. Inside ",(0,a.kt)("inlineCode",{parentName:"p"},"useFactory"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"deps")," will already has correct types."),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-tsx"},"import { provide, ExtractDependencyType } from '@tramvai/core';\n\nclass Implement {\n  constructor({ logger }: { logger: ExtractDependencyType<typeof LOGGER> }) {}\n}\n\nconst provider = provide({\n  provide: TOKEN,\n  useFactory: (deps) => new Implement(deps),\n  deps: {\n    logger: LOGGER,\n  },\n});\n")),(0,a.kt)("h3",{id:"class"},"Class"),(0,a.kt)("p",null,"When the instance is initialized, the class passed to ",(0,a.kt)("inlineCode",{parentName:"p"},"useClass")," will be created, if ",(0,a.kt)("inlineCode",{parentName:"p"},"deps")," were specified, then the class will be called with the object of implementations as the first argument"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-tsx"},"import { provide, ExtractDependencyType } from '@tramvai/core';\n\nclass Implement {\n  constructor({ logger }: { logger: ExtractDependencyType<typeof LOGGER> }) {}\n}\n\nconst provider = provide({\n  provide: TOKEN,\n  useClass: Implement,\n  deps: {\n    logger: LOGGER,\n  },\n});\n")),(0,a.kt)("h3",{id:"value"},"Value"),(0,a.kt)("p",null,"Sets the provider's value to the data that was passed in the ",(0,a.kt)("inlineCode",{parentName:"p"},"useValue")," parameter, no additional initialization will be performed and ",(0,a.kt)("inlineCode",{parentName:"p"},"deps")," cannot be used"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-tsx"},"import { provide } from '@tramvai/core';\n\nconst provider = provide({\n  provide: TOKEN,\n  useValue: { appName: 'APP' },\n});\n")),(0,a.kt)("h2",{id:"multi-providers"},"Multi providers"),(0,a.kt)("p",null,"We may need to be able to register multiple implementations for a single token. For example, several actions for one step. To implement this, you need to pass the ",(0,a.kt)("inlineCode",{parentName:"p"},"multi")," parameter to the token options. In this case, an array of providers is stored in the di container:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-tsx"},"import { provide, createToken } from '@tramvai/core';\n\nconst MULTI_TOKEN = createToken<{ route: string }>('multi token', { multi: true });\n\nconst providers = [\n  provide({\n    provide: MULTI_TOKEN,\n    useValue: { route: '/' },\n  }),\n  provide({\n    provide: MULTI_TOKEN,\n    useValue: { route: '/cards' },\n  }),\n];\n")),(0,a.kt)("h2",{id:"dependencies-deps"},"Dependencies (deps)"),(0,a.kt)("p",null,"Needed to specify the dependencies that are needed for the provider to work. When creating a provider, dependency instances will be created, which are specified in deps and passed to the provider as the first argument. The keys of the deps object will be the implementations that will be sent to the provider. In this case, if the provider is not found in the global DI, an error will be thrown notifying that the current token was not found."),(0,a.kt)("h3",{id:"format-1"},"Format"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-tsx"},"type Provider = {\n  deps: {\n    [key: string]:\n      | Token\n      | {\n          token: Token;\n          optional?: boolean;\n          multi?: boolean;\n        };\n  };\n};\n")),(0,a.kt)("h3",{id:"optional-dependencies"},"Optional Dependencies"),(0,a.kt)("p",null,"We don't always need mandatory dependencies to work. And we want to point out that the dependency is not necessary to work and it is not necessary to throw an error. To do this, you can use ",(0,a.kt)("inlineCode",{parentName:"p"},"optional")," helper (add the ",(0,a.kt)("inlineCode",{parentName:"p"},"optional")," parameter underhood), which will disable throwing an error if there is no dependency. Instead of implementing the dependency, the provider will receive the value ",(0,a.kt)("inlineCode",{parentName:"p"},"null"),"."),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-tsx"},"import { provide, optional, ExtractDependencyType } from '@tramvai/core';\n\nclass Implement {\n  constructor({ logger }: { logger: ExtractDependencyType<typeof LOGGER> | null }) {}\n}\n\nconst provider = provide({\n  provide: TOKEN,\n  useClass: Implement,\n  deps: {\n    logger: optional(LOGGER),\n  },\n});\n")),(0,a.kt)("h3",{id:"multi-dependencies"},"Multi dependencies"),(0,a.kt)("p",null,"Some providers are multi-providers and instead of one implementation, we will receive an array of implementations. Type inference for ",(0,a.kt)("inlineCode",{parentName:"p"},"deps")," inside ",(0,a.kt)("inlineCode",{parentName:"p"},"provide")," helper will be done automatically, for provider implementation use ",(0,a.kt)("inlineCode",{parentName:"p"},"ExtractDependencyType")," helper."),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-tsx"},"import { provide, createToken, ExtractDependencyType } from '@tramvai/core';\n\nconst COMMANDS_TOKEN = createToken<Command>('commands', { multi: true });\n\nclass Implement {\n  // commands: Command[]\n  constructor({ commands }: { commands: ExtractDependencyType<typeof COMMANDS_TOKEN> }) {\n    commands.forEach();\n  }\n}\n\nconst provider = provide({\n  provide: TOKEN,\n  useClass: Implement,\n  deps: {\n    commands: COMMANDS_TOKEN,\n  },\n});\n")),(0,a.kt)("h3",{id:"multi-optional-dependencies"},"Multi optional dependencies"),(0,a.kt)("p",null,"For ",(0,a.kt)("inlineCode",{parentName:"p"},"multi")," and ",(0,a.kt)("inlineCode",{parentName:"p"},"optional")," dependencies, if provider was not founded, empty ",(0,a.kt)("inlineCode",{parentName:"p"},"[]")," will be resolved, as opposed to ",(0,a.kt)("inlineCode",{parentName:"p"},"null")," for standard tokens."),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-tsx"},"import { provide, optional, createToken, ExtractDependencyType } from '@tramvai/core';\n\nconst COMMANDS_TOKEN = createToken<Command>('commands', { multi: true });\n\nclass Implement {\n  // commands: Command[]\n  constructor({ commands }: { commands: ExtractDependencyType<typeof COMMANDS_TOKEN> }) {\n    commands.forEach();\n  }\n}\n\nconst provider = provide({\n  provide: TOKEN,\n  useClass: Implement,\n  deps: {\n    commands: optional(COMMANDS_TOKEN),\n  },\n});\n")),(0,a.kt)("h3",{id:"circular-dependency"},"Circular dependency"),(0,a.kt)("p",null,"DI does not allow declaring dependencies that depend on each other, for example:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-tsx"},"import { provide } from '@tramvai/core';\n\nconst providers = [\n  provide({\n    provide: A,\n    deps: {\n      B: B,\n    },\n  }),\n  provide({\n    provide: B,\n    deps: {\n      A: A,\n    },\n  }),\n];\n")),(0,a.kt)("p",null,"In this example, we will not be able to correctly create provider instances and the code will throw an error."),(0,a.kt)("p",null,"Such providers should reconsider and make a common part in a separate class, and provider and used in conjunction ",(0,a.kt)("inlineCode",{parentName:"p"},"A")," and ",(0,a.kt)("inlineCode",{parentName:"p"},"B")),(0,a.kt)("h2",{id:"scope"},"Scope"),(0,a.kt)("blockquote",null,(0,a.kt)("p",{parentName:"blockquote"},"Scope only affects providers at server-side, where child DI containers are created for each request.\nIn the browser, you can consider that all providers have a ",(0,a.kt)("inlineCode",{parentName:"p"},"Singleton")," scope.")),(0,a.kt)("p",null,"Allows you to create singleton instances that will be shared between multiple clients. In standard behavior, each declared provider will be automatically deleted and recreated for each new client. This functionality was made in order for us to be able to store both singletons, for example, cache, and various personalized data. For example, user status and personalization."),(0,a.kt)("p",null,"By default, all providers have the value ",(0,a.kt)("inlineCode",{parentName:"p"},"Scope.REQUEST"),", which means that provider values \u200b\u200bwill be generated for each client. The exception is the ",(0,a.kt)("inlineCode",{parentName:"p"},"useValue")," providers, which behave like a singleton."),(0,a.kt)("admonition",{type:"tip"},(0,a.kt)("p",{parentName:"admonition"},"It is incorrect to use ",(0,a.kt)("inlineCode",{parentName:"p"},"Scope.REQUEST")," providers as dependencies of ",(0,a.kt)("inlineCode",{parentName:"p"},"Scope.SINGLETON")," providers. Only one ",(0,a.kt)("inlineCode",{parentName:"p"},"Request")," provider instance will be created for ",(0,a.kt)("inlineCode",{parentName:"p"},"Singleton")," providers. If this ",(0,a.kt)("inlineCode",{parentName:"p"},"Request")," provider is stateful, it can lead to unexpected behavior. If provider is stateless, ",(0,a.kt)("inlineCode",{parentName:"p"},"Singleton")," scope is optimal for performance.")),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-tsx"},"import { provide } from '@tramvai/core';\n\nconst provider = provide({\n  provide: CACHE,\n  useFactory: Cache,\n  scope: Scope.SINGLETON,\n});\n")),(0,a.kt)("p",null,"In this case, the ",(0,a.kt)("inlineCode",{parentName:"p"},"CACHE")," provider will be registered as a global singleton, since the ",(0,a.kt)("inlineCode",{parentName:"p"},"scope")," parameter was passed and a single instance for all users will be used."),(0,a.kt)("h2",{id:"tokens"},"Tokens"),(0,a.kt)("p",null,"Tokens are used as an identifier for the provider in DI. By the value of the token, the provider is registered and the implementation is searched."),(0,a.kt)("p",null,"Our recommendation is to use CAMEL_CASE for tokens names. Also, you need to pass TS interface to ",(0,a.kt)("inlineCode",{parentName:"p"},"createToken")," generic function to correct type inference, and a ",(0,a.kt)("strong",{parentName:"p"},"unique")," string as token name to avoid possible collisions."),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-tsx"},"import { provide, createToken } from '@tramvai/core';\n\nconst LOGGER_TOKEN = createToken<Logger>('my-app-scope logger');\n\nconst provider = provide({\n  provide: LOGGER_TOKEN,\n  useClass: Logger,\n});\n")),(0,a.kt)("h3",{id:"multi-token"},"Multi token"),(0,a.kt)("p",null,"As in ",(0,a.kt)("a",{parentName:"p",href:"#multi-providers"},"multi providers example"),", you need to pass ",(0,a.kt)("inlineCode",{parentName:"p"},"{ multi: true }")," options to ",(0,a.kt)("inlineCode",{parentName:"p"},"createToken"),"."),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-tsx"},"import { provide, createToken } from '@tramvai/core';\n\nconst MULTI_TOKEN = createToken<() => void>('multi token', { multi: true });\n")),(0,a.kt)("h3",{id:"scoped-token"},"Scoped token"),(0,a.kt)("p",null,"It is possible to create ",(0,a.kt)("a",{parentName:"p",href:"#scope"},"scoped provider")," automatically, by passing ",(0,a.kt)("inlineCode",{parentName:"p"},"scope")," parameter to ",(0,a.kt)("inlineCode",{parentName:"p"},"createToken")," options. It is very useful for popular tokens, like ",(0,a.kt)("inlineCode",{parentName:"p"},"commandLineRunnerTokens"),"."),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-tsx"},"import { provide, createToken, Scope } from '@tramvai/core';\n\nconst CACHE = createToken<Cache>('cache', { scope: Scope.SINGLETON });\n\nconst provider = provide({\n  provide: CACHE,\n  useFactory: Cache,\n});\n")),(0,a.kt)("p",null,"You can always override this behaviour by declare different ",(0,a.kt)("inlineCode",{parentName:"p"},"scope")," parameter in provider."))}u.isMDXComponent=!0}}]);