"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[5462],{3905:function(n,e,t){t.d(e,{Zo:function(){return l},kt:function(){return C}});var o=t(7294);function r(n,e,t){return e in n?Object.defineProperty(n,e,{value:t,enumerable:!0,configurable:!0,writable:!0}):n[e]=t,n}function i(n,e){var t=Object.keys(n);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(n);e&&(o=o.filter((function(e){return Object.getOwnPropertyDescriptor(n,e).enumerable}))),t.push.apply(t,o)}return t}function p(n){for(var e=1;e<arguments.length;e++){var t=null!=arguments[e]?arguments[e]:{};e%2?i(Object(t),!0).forEach((function(e){r(n,e,t[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(n,Object.getOwnPropertyDescriptors(t)):i(Object(t)).forEach((function(e){Object.defineProperty(n,e,Object.getOwnPropertyDescriptor(t,e))}))}return n}function a(n,e){if(null==n)return{};var t,o,r=function(n,e){if(null==n)return{};var t,o,r={},i=Object.keys(n);for(o=0;o<i.length;o++)t=i[o],e.indexOf(t)>=0||(r[t]=n[t]);return r}(n,e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(n);for(o=0;o<i.length;o++)t=i[o],e.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(n,t)&&(r[t]=n[t])}return r}var c=o.createContext({}),s=function(n){var e=o.useContext(c),t=e;return n&&(t="function"==typeof n?n(e):p(p({},e),n)),t},l=function(n){var e=s(n.components);return o.createElement(c.Provider,{value:e},n.children)},d={inlineCode:"code",wrapper:function(n){var e=n.children;return o.createElement(o.Fragment,{},e)}},u=o.forwardRef((function(n,e){var t=n.components,r=n.mdxType,i=n.originalType,c=n.parentName,l=a(n,["components","mdxType","originalType","parentName"]),u=s(t),C=r,h=u["".concat(c,".").concat(C)]||u[C]||d[C]||i;return t?o.createElement(h,p(p({ref:e},l),{},{components:t})):o.createElement(h,p({ref:e},l))}));function C(n,e){var t=arguments,r=e&&e.mdxType;if("string"==typeof n||r){var i=t.length,p=new Array(i);p[0]=u;var a={};for(var c in e)hasOwnProperty.call(e,c)&&(a[c]=e[c]);a.originalType=n,a.mdxType="string"==typeof n?n:r,p[1]=a;for(var s=2;s<i;s++)p[s]=t[s];return o.createElement.apply(null,p)}return o.createElement.apply(null,t)}u.displayName="MDXCreateElement"},5645:function(n,e,t){t.r(e),t.d(e,{assets:function(){return c},contentTitle:function(){return p},default:function(){return d},frontMatter:function(){return i},metadata:function(){return a},toc:function(){return s}});var o=t(7462),r=(t(7294),t(3905));const i={},p=void 0,a={unversionedId:"references/tokens/child-app",id:"references/tokens/child-app",title:"child-app",description:"@inline src/index.ts",source:"@site/tmp-docs/references/tokens/child-app.md",sourceDirName:"references/tokens",slug:"/references/tokens/child-app",permalink:"/docs/references/tokens/child-app",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/tmp-docs/references/tokens/child-app.md",tags:[],version:"current",frontMatter:{},sidebar:"sidebar",previous:{title:"server",permalink:"/docs/references/modules/server"},next:{title:"common",permalink:"/docs/references/tokens/common"}},c={},s=[],l={toc:s};function d(n){let{components:e,...t}=n;return(0,r.kt)("wrapper",(0,o.Z)({},l,t,{components:e,mdxType:"MDXLayout"}),(0,r.kt)("p",null,(0,r.kt)("pre",{parentName:"p"},(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"import type { ComponentType } from 'react';\nimport type { Container } from '@tinkoff/dippy';\nimport { Scope, createToken } from '@tinkoff/dippy';\nimport type { Route } from '@tinkoff/router';\nimport type { Command, PageAction } from '@tramvai/core';\nimport type { ActionsRegistry, INITIAL_APP_STATE_TOKEN } from '@tramvai/tokens-common';\nimport type { LazyComponentWrapper } from '@tramvai/react';\nimport type { StoreClass } from '@tramvai/state';\nimport type { ChunkExtractor } from '@loadable/server';\nimport type {\n  ChildAppLoader,\n  ChildAppDiManager,\n  ChildAppPreloadManager,\n  ChildAppCommandLineRunner,\n  ChildAppRequestConfig,\n  WrapperProps,\n  RootStateSubscription,\n  ChildAppStateManager,\n  ChildAppFinalConfig,\n  ChildAppRenderManager,\n  ChildAppResolutionConfig,\n  ResolutionConfig,\n  HostProvidedContracts,\n  ChildRequiredContracts,\n  ChildAppContractManager,\n  ChildProvidedContracts,\n  HostRequiredContracts,\n  ChildContractsFallback,\n  HostContractsFallback,\n  ChildAppErrorBoundaryHandler,\n} from './types';\n\nexport * from './types';\n\nconst multiOptions = { multi: true } as const;\n\n/**\n * @public\n * @description CommandLineRunner steps specific for child app\n */\nexport const commandLineListTokens = {\n  // section: client processing\n  customerStart: createToken<Command>('child-app customer_start', multiOptions), // \u0418\u043d\u0438\u0446\u0438\u0430\u043b\u0438\u0437\u0430\u0446\u0438\u044f \u043a\u043b\u0438\u0435\u043d\u0442\u0430\n  resolveUserDeps: createToken<Command>('child-app resolve_user_deps', multiOptions), // \u041f\u043e\u043b\u0443\u0447\u0435\u043d\u0438\u0435 \u0434\u0430\u043d\u043d\u044b\u0445 \u043e \u043a\u043b\u0438\u0435\u043d\u0442\u0435\n  resolvePageDeps: createToken<Command>('child-app resolve_page_deps', multiOptions), // \u041f\u043e\u043b\u0443\u0447\u0435\u043d\u0438\u0435 \u0434\u0430\u043d\u043d\u044b\u0445 \u043d\u0435\u043e\u0431\u0445\u043e\u0434\u0438\u043c\u044b\u0445 \u0434\u043b\u044f \u0440\u043e\u0443\u0442\u0430\n\n  // section: clear data\n  clear: createToken<Command>('child-app clear', multiOptions), // \u041e\u0447\u0438\u0441\u0442\u043a\u0430 \u0434\u0430\u043d\u043d\u044b\u0445\n\n  // section: spa transitions\n  spaTransition: createToken<Command>('child-app spa_transition', multiOptions),\n\n  // section: after spa transitions\n  afterSpaTransition: createToken<Command>('child-app after_spa_transition', multiOptions),\n};\n\n/**\n * @public\n * @description Contains child app configs that was used to figure out how to load child apps\n */\nexport const CHILD_APP_RESOLUTION_CONFIGS_TOKEN = createToken<\n  | ChildAppResolutionConfig\n  | ChildAppResolutionConfig[]\n  | (() =>\n      | ChildAppResolutionConfig\n      | ChildAppResolutionConfig[]\n      | Promise<ChildAppResolutionConfig>\n      | Promise<ChildAppResolutionConfig[]>)\n>('child-app resolve configs', multiOptions);\n\n/**\n * @public\n * @description Used to resolve and extend resolution configs for child-apps\n */\nexport const CHILD_APP_RESOLUTION_CONFIG_MANAGER_TOKEN = createToken<{\n  resolve(config: ChildAppRequestConfig): ResolutionConfig | undefined;\n  init(): Promise<void>;\n}>('child-app resolution config manager');\n\n/**\n * @public\n * @description Used to resolve external config with urls to external code entries\n */\nexport const CHILD_APP_RESOLVE_CONFIG_TOKEN = createToken<\n  (config: ChildAppRequestConfig) => ChildAppFinalConfig | undefined\n>('child-app resolve external config');\n\n/**\n * @public\n * @description Base url for external urls for child apps on client\n */\nexport const CHILD_APP_RESOLVE_BASE_URL_TOKEN = createToken<string | undefined>(\n  'child-app resolve external base url'\n);\n\n/**\n * @public\n * @description Allows to preload child app for the specific page\n */\nexport const CHILD_APP_PRELOAD_MANAGER_TOKEN = createToken<ChildAppPreloadManager>(\n  'child-app preload manager'\n);\n\n/**\n * @public\n * @description Contains child app config that was used to load current child app\n */\nexport const CHILD_APP_INTERNAL_CONFIG_TOKEN = createToken<ChildAppFinalConfig>(\n  'child-app current config'\n);\n\n/**\n * @private\n * @description Global actions of child app\n */\nexport const CHILD_APP_INTERNAL_ACTION_TOKEN = createToken<PageAction | PageAction[]>(\n  'child-app action',\n  multiOptions\n);\n\n/**\n * @private\n * @description Registry of child app actions\n */\nexport const CHILD_APP_ACTIONS_REGISTRY_TOKEN = createToken<ActionsRegistry>(\n  'child-app actions registry'\n);\n\n/**\n * @deprecated use CHILD_APP_INTERNAL_ROOT_STATE_ALLOWED_STORE_TOKEN\n * @public\n * @description Subscription on a root state updates\n */\nexport const CHILD_APP_INTERNAL_ROOT_STATE_SUBSCRIPTION_TOKEN = createToken<RootStateSubscription>(\n  'child-app root state subscription',\n  multiOptions\n);\n\n/**\n * @public\n * @description Root-app stores that might be used inside child-app\n */\nexport const CHILD_APP_INTERNAL_ROOT_STATE_ALLOWED_STORE_TOKEN = createToken<StoreClass | string>(\n  'child-app root state allowed store',\n  multiOptions\n);\n\n/**\n * @public\n * @description Allows to recreate token implementation the same way as in root di, but specific to child-app di\n */\nexport const CHILD_APP_INTERNAL_ROOT_DI_BORROW_TOKEN = createToken<any>(\n  'child-app root di borrow',\n  multiOptions\n);\n\n/**\n * @private\n * @description boolean flag indicating that current di if for a child-app\n */\nexport const IS_CHILD_APP_DI_TOKEN = createToken<boolean>('child-app isChildApp Di');\n\n/**\n * @private\n * @description boolean flag indicating that current child-app version support contracts\n */\nexport const IS_CHILD_APP_CONTRACTS_COMPATIBLE_TOKEN = createToken<boolean>(\n  'child-app contracts compatible'\n);\n\n/**\n * @private\n * @description Manages Singleton-Scope DIs for every child app\n */\nexport const CHILD_APP_SINGLETON_DI_MANAGER_TOKEN = createToken<ChildAppDiManager>(\n  'child-app singleton di manager'\n);\n\n/**\n * @private\n * @description Manages Request-Scope DIs for every child app\n */\nexport const CHILD_APP_DI_MANAGER_TOKEN = createToken<ChildAppDiManager>('child-app di manager');\n\n/**\n * @private\n * @description Bridge from React render to di providers for child apps\n */\nexport const CHILD_APP_RENDER_MANAGER_TOKEN = createToken<ChildAppRenderManager>(\n  'child-app render manager'\n);\n\n/**\n * @private\n * @description Manages state dehydration for child-app\n */\nexport const CHILD_APP_STATE_MANAGER_TOKEN =\n  createToken<ChildAppStateManager>('child-app state manager');\n\n/**\n * @private\n * @description Manages loading child-app resources from the external place\n */\nexport const CHILD_APP_LOADER_TOKEN = createToken<ChildAppLoader>('child-app loader');\n\n/**\n * @private\n * @description Implements CommandLineRunner for child apps\n */\nexport const CHILD_APP_COMMAND_LINE_RUNNER_TOKEN = createToken<ChildAppCommandLineRunner>(\n  'child-app command runner'\n);\n\n/**\n * @private\n * @description Stores the common server-dehydrated state for all of child apps\n */\nexport const CHILD_APP_COMMON_INITIAL_STATE_TOKEN = createToken<\n  Record<string, typeof INITIAL_APP_STATE_TOKEN>\n>('child-app initialAppState');\n\n/**\n * @private\n * @description Used as render function for a child app. Usually implemented as a wrapper over child app render itself with an additional logic for di and connections to root app\n */\nexport const CHILD_APP_INTERNAL_RENDER_TOKEN =\n  createToken<ComponentType<WrapperProps<any>>>('child-app render');\n\n/**\n * @private\n * @description Instance of loadable ChunkExtractor for specific child app\n */\nexport const CHILD_APP_INTERNAL_CHUNK_EXTRACTOR = createToken<ChunkExtractor>(\n  'child-app chunk extractor'\n);\n\n/**\n * @public\n * @description Service to work with Child Apps page components and actions\n */\nexport const CHILD_APP_PAGE_SERVICE_TOKEN =\n  createToken<ChildAppPageService>('child-app page service');\n\n/**\n * @public\n * @description Child Apps page components list\n */\nexport const CHILD_APP_PAGE_COMPONENTS_TOKEN = createToken<Record<string, ChildAppPageComponent>>(\n  'child-app page components',\n  { multi: true }\n);\n\n/**\n * @private\n * @description Children for `createChildApp.render` component\n */\nexport const CHILD_APP_RENDER_CHILDREN_TOKEN = createToken<ComponentType<{ di: Container }>>(\n  'child-app render children'\n);\n\nexport interface ChildAppPageService {\n  resolveComponent(route?: Route): Promise<void>;\n  getComponentName(route?: Route): string | void;\n  getComponent(route?: Route): ChildAppPageComponent | void;\n  getActions(route?: Route): PageAction[];\n}\n\nexport type ChildAppPageComponent = ComponentType<{}> & {\n  actions?: PageAction[];\n};\n\nexport type ChildAppPageComponentDecl =\n  | ChildAppPageComponent\n  | LazyComponentWrapper<ChildAppPageComponent>;\n\nexport type RootDiAccessMode =\n  | { mode: 'blacklist'; list: string[] }\n  | { mode: 'whitelist'; list: string[] };\n\n/**\n * @public\n *\n * @description\n * Allows to control access to root di for Child Apps. By default, all Child Apps have access to root di without any restrictions.\n * Access modes overview:\n * - `blacklist` - list of Child Apps that are not allowed to access root di as fallback\n * - `whitelist` - list of Child Apps that are allowed to access root di as fallback\n *\n * @example\n * - allow only for one \"header\" Child App - `{ mode: 'whitelist', list: ['header'] }`\n * - allow for all except \"header\" Child App - `{ mode: 'blacklist', list: ['header'] }`\n * - allow full access - `{ mode: 'blacklist', list: [] }`\n * - block any access - `{ mode: 'whitelist', list: [] }`\n */\nexport const CHILD_APP_ROOT_DI_ACCESS_MODE_TOKEN = createToken<RootDiAccessMode>(\n  'child-app root di access mode',\n  { scope: Scope.SINGLETON }\n);\n\nexport const CHILD_APP_CONTRACT_MANAGER = createToken<ChildAppContractManager>(\n  'child-app contract manager',\n  { scope: Scope.SINGLETON }\n);\n\nexport const CHILD_PROVIDED_CONTRACTS = createToken<ChildProvidedContracts>(\n  'child-app child provided contracts',\n  { multi: true, scope: Scope.SINGLETON }\n);\n\nexport const HOST_PROVIDED_CONTRACTS = createToken<HostProvidedContracts>(\n  'child-app host provided contracts',\n  { multi: true, scope: Scope.SINGLETON }\n);\n\nexport const CHILD_REQUIRED_CONTRACTS = createToken<ChildRequiredContracts>(\n  'child-app child required contracts',\n  { multi: true, scope: Scope.SINGLETON }\n);\n\nexport const HOST_REQUIRED_CONTRACTS = createToken<HostRequiredContracts>(\n  'child-app host required contracts',\n  { multi: true, scope: Scope.SINGLETON }\n);\n\nexport const CHILD_CONTRACTS_FALLBACK = createToken<ChildContractsFallback>(\n  'child-app child contracts fallback',\n  {\n    multi: true,\n  }\n);\n\nexport const HOST_CONTRACTS_FALLBACK = createToken<HostContractsFallback>(\n  'child-app host contracts fallback',\n  {\n    multi: true,\n  }\n);\n\nexport const CHILD_APP_ERROR_BOUNDARY_TOKEN = createToken<ChildAppErrorBoundaryHandler>(\n  'child-app reactErrorBoundaryHandlers',\n  {\n    multi: true,\n  }\n);\n\n"))))}d.isMDXComponent=!0}}]);