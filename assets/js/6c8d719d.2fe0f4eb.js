"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[8243],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>d});var r=n(7294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function c(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var i=r.createContext({}),l=function(e){var t=r.useContext(i),n=t;return e&&(n="function"==typeof e?e(t):c(c({},t),e)),n},p=function(e){var t=l(e.components);return r.createElement(i.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},m=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,o=e.originalType,i=e.parentName,p=s(e,["components","mdxType","originalType","parentName"]),m=l(n),d=a,k=m["".concat(i,".").concat(d)]||m[d]||u[d]||o;return n?r.createElement(k,c(c({ref:t},p),{},{components:n})):r.createElement(k,c({ref:t},p))}));function d(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=n.length,c=new Array(o);c[0]=m;var s={};for(var i in t)hasOwnProperty.call(t,i)&&(s[i]=t[i]);s.originalType=e,s.mdxType="string"==typeof e?e:a,c[1]=s;for(var l=2;l<o;l++)c[l]=n[l];return r.createElement.apply(null,c)}return r.createElement.apply(null,n)}m.displayName="MDXCreateElement"},888:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>i,default:()=>d,frontMatter:()=>s,metadata:()=>l,toc:()=>u});var r=n(7462),a=n(3366),o=(n(7294),n(3905)),c=["components"],s={},i=void 0,l={unversionedId:"references/tramvai/test/mocks",id:"references/tramvai/test/mocks",title:"mocks",description:"Library for creating mocks for various tramvai entities",source:"@site/tmp-docs/references/tramvai/test/mocks.md",sourceDirName:"references/tramvai/test",slug:"/references/tramvai/test/mocks",permalink:"/docs/references/tramvai/test/mocks",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/get-started/overview.md/tmp-docs/references/tramvai/test/mocks.md",tags:[],version:"current",frontMatter:{},sidebar:"sidebar",previous:{title:"jsdom",permalink:"/docs/references/tramvai/test/jsdom"},next:{title:"playwright",permalink:"/docs/references/tramvai/test/playwright"}},p={},u=[{value:"\u041f\u043e\u0434\u043a\u043b\u044e\u0447\u0435\u043d\u0438\u0435",id:"\u043f\u043e\u0434\u043a\u043b\u044e\u0447\u0435\u043d\u0438\u0435",level:2},{value:"Api",id:"api",level:2},{value:"STORE_TOKEN",id:"store_token",level:3},{value:"Empty State",id:"empty-state",level:4},{value:"Initial State",id:"initial-state",level:4},{value:"DI",id:"di",level:3},{value:"Context",id:"context",level:3},{value:"Router",id:"router",level:3}],m={toc:u};function d(e){var t=e.components,n=(0,a.Z)(e,c);return(0,o.kt)("wrapper",(0,r.Z)({},m,n,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"Library for creating mocks for various tramvai entities"),(0,o.kt)("h2",{id:"\u043f\u043e\u0434\u043a\u043b\u044e\u0447\u0435\u043d\u0438\u0435"},"\u041f\u043e\u0434\u043a\u043b\u044e\u0447\u0435\u043d\u0438\u0435"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-bash"},"npm i --save-dev @tramvai/test-mocks\n")),(0,o.kt)("h2",{id:"api"},"Api"),(0,o.kt)("h3",{id:"store_token"},"STORE_TOKEN"),(0,o.kt)("p",null,"Creates mock instance for token STORE_TOKEN which used in app as a common storage for store"),(0,o.kt)("h4",{id:"empty-state"},"Empty State"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},"import { createMockStore } from '@tramvai/test-mocks';\n\nconst store = createMockStore();\nconst state = store.getState();\n\nstore.dispatch('event');\n")),(0,o.kt)("h4",{id:"initial-state"},"Initial State"),(0,o.kt)("p",null,"Pass required stores, initial state will be applied automatically:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},"import { createMockStore } from '@tramvai/test-mocks';\n\nconst reducer = createReducer('test', 'value');\n\nconst store = createMockStore({ stores: [reducer] });\n\nconst state = store.getState(); // { test: 'value' }\n")),(0,o.kt)("p",null,"Or pass just initialState, fake reducers will be created under the hood:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},"import { createMockStore } from '@tramvai/test-mocks';\n\nconst initialState = { a: 1, b: 2 };\n\nconst store = createMockStore({ initialState });\n\nconst state = store.getState(); // { a: 1, b: 2 }\n")),(0,o.kt)("p",null,"Also you can change initial state of passed reducer:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},"import { createMockStore } from '@tramvai/test-mocks';\n\nconst initialState = { test: 'modified' };\nconst reducer = createReducer('test', 'default');\n\nconst store = createMockStore({ stores: [reducer], initialState });\n\nconst state = store.getState(); // { test: 'modified' }\n")),(0,o.kt)("p",null,(0,o.kt)("details",null,(0,o.kt)("summary",null,"More examples"),(0,o.kt)("p",null,(0,o.kt)("pre",{parentName:"p"},(0,o.kt)("code",{parentName:"pre",className:"language-typescript"},"import { createReducer, createEvent } from '@tramvai/state';\nimport { createMockStore } from './store';\n\ndescribe('test/unit/mocks/store', () => {\n  it('should create empty store', () => {\n    const store = createMockStore();\n    const spyGetState = jest.spyOn(store, 'getState');\n\n    expect(store.getState()).toEqual({});\n    expect(spyGetState).toHaveBeenCalled();\n  });\n\n  it('should update stores with dispatch', () => {\n    const event = createEvent<string>('testEvent');\n    const reducer = createReducer('test', { a: 'test' }).on(event, (_, data) => {\n      return {\n        a: data,\n      };\n    });\n    const store = createMockStore({ stores: [reducer] });\n\n    expect(store.getState()).toEqual({ test: { a: 'test' } });\n\n    store.dispatch(event('dispatched'));\n\n    expect(store.getState()).toEqual({ test: { a: 'dispatched' } });\n  });\n\n  it('should create store by initialState', () => {\n    const initialState = { a: 1, b: 2 };\n    const reducerA = createReducer('a', {});\n    const reducerB = createReducer('b', {});\n    const store = createMockStore({ stores: [reducerA, reducerB], initialState });\n\n    expect(store.getState()).toEqual(initialState);\n  });\n\n  it('should create fake reducer stores for every key in initialState', () => {\n    const initialState = { a: 1, b: 2 };\n    const reducerC = createReducer('c', 3);\n    const store = createMockStore({ stores: [reducerC], initialState });\n\n    expect(store.getState()).toEqual({\n      a: 1,\n      b: 2,\n      c: 3,\n    });\n  });\n});\n\n"))))),(0,o.kt)("h3",{id:"di"},"DI"),(0,o.kt)("p",null,"Creates mock instance of DI-container"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},"import { createMockDi } from '@tramvai/test-mocks';\n\nconst di = createMockDi();\n\nconst dep = di.get(SOME_TOKEN);\n")),(0,o.kt)("h3",{id:"context"},"Context"),(0,o.kt)("p",null,"Creates mock instance for CONTEXT_TOKEN"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},"import { createMockContext } from '@tramvai/test-mocks';\n\nit('test', async () => {\n  const context = createMockContext();\n\n  await context.dispatch('event');\n  await context.executeAction(action);\n\n  const spyExecuteAction = jest.spyOn(context, 'executeAction');\n\n  expect(spyExecuteAction).toHaveBeenCalled();\n});\n")),(0,o.kt)("p",null,(0,o.kt)("details",null,(0,o.kt)("summary",null,"More examples"),(0,o.kt)("p",null,(0,o.kt)("pre",{parentName:"p"},(0,o.kt)("code",{parentName:"pre",className:"language-typescript"},"import { createEvent, createReducer } from '@tramvai/state';\nimport { createMockContext } from './context';\n\ndescribe('test/unit/mocks/context', () => {\n  it('should create consumer context', () => {\n    const context = createMockContext();\n\n    expect(context.executeAction).toBeInstanceOf(Function);\n    expect(context.getState).toBeInstanceOf(Function);\n    expect(context.dispatch).toBeInstanceOf(Function);\n\n    expect(context.getState()).toEqual({});\n  });\n\n  it('should dispatch data', async () => {\n    const event = createEvent<string>('mockEvent');\n    const reducer = createReducer('a', 'data').on(event, (_, data) => data);\n    const context = createMockContext({\n      stores: [reducer],\n    });\n\n    const spyDispatch = jest.spyOn(context, 'dispatch');\n\n    await context.dispatch(event('mock1'));\n\n    expect(spyDispatch).toHaveBeenCalledWith(event('mock1'));\n\n    expect(context.getState()).toEqual({ a: 'mock1' });\n  });\n});\n\n"))))),(0,o.kt)("h3",{id:"router"},"Router"),(0,o.kt)("p",null,"Creates mock instance for ",(0,o.kt)("inlineCode",{parentName:"p"},"@tinkoff/router")),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},"import { createMockRouter } from '@tramvai/test-mocks';\n\ndescribe('test', () => {\n  it('should create router mock', () => {\n    const router = createMockRouter();\n\n    expect(router.getCurrentRoute()).toMatchObject({ path: '/' });\n    expect(router.getCurrentUrl()).toMatchObject({ path: '/' });\n  });\n\n  it('should allow to specify currentRoute', () => {\n    const router = createMockRouter({ currentRoute: { name: 'page', path: '/page/test/' } });\n\n    expect(router.getCurrentRoute()).toMatchObject({ path: '/page/test/' });\n    expect(router.getCurrentUrl()).toMatchObject({ path: '/page/test/' });\n  });\n});\n")))}d.isMDXComponent=!0}}]);