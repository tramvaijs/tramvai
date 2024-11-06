"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[4781],{3905:function(e,t,n){n.d(t,{Zo:function(){return p},kt:function(){return m}});var a=n(7294);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function s(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function i(e,t){if(null==e)return{};var n,a,o=function(e,t){if(null==e)return{};var n,a,o={},r=Object.keys(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var c=a.createContext({}),l=function(e){var t=a.useContext(c),n=t;return e&&(n="function"==typeof e?e(t):s(s({},t),e)),n},p=function(e){var t=l(e.components);return a.createElement(c.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},d=a.forwardRef((function(e,t){var n=e.components,o=e.mdxType,r=e.originalType,c=e.parentName,p=i(e,["components","mdxType","originalType","parentName"]),d=l(n),m=o,v=d["".concat(c,".").concat(m)]||d[m]||u[m]||r;return n?a.createElement(v,s(s({ref:t},p),{},{components:n})):a.createElement(v,s({ref:t},p))}));function m(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var r=n.length,s=new Array(r);s[0]=d;var i={};for(var c in t)hasOwnProperty.call(t,c)&&(i[c]=t[c]);i.originalType=e,i.mdxType="string"==typeof e?e:o,s[1]=i;for(var l=2;l<r;l++)s[l]=n[l];return a.createElement.apply(null,s)}return a.createElement.apply(null,n)}d.displayName="MDXCreateElement"},1332:function(e,t,n){n.r(t),n.d(t,{assets:function(){return c},contentTitle:function(){return s},default:function(){return u},frontMatter:function(){return r},metadata:function(){return i},toc:function(){return l}});var a=n(7462),o=(n(7294),n(3905));const r={},s=void 0,i={unversionedId:"references/tramvai/test/unit",id:"references/tramvai/test/unit",title:"unit",description:"Helpers library for writing tramvai specific unit-tests",source:"@site/tmp-docs/references/tramvai/test/unit.md",sourceDirName:"references/tramvai/test",slug:"/references/tramvai/test/unit",permalink:"/docs/references/tramvai/test/unit",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/tmp-docs/references/tramvai/test/unit.md",tags:[],version:"current",frontMatter:{},sidebar:"sidebar",previous:{title:"unit-jest",permalink:"/docs/references/tramvai/test/unit-jest"},next:{title:"state",permalink:"/docs/references/tramvai/state"}},c={},l=[{value:"Installation",id:"installation",level:2},{value:"How to",id:"how-to",level:2},{value:"Testing reducers",id:"testing-reducers",level:3},{value:"Testing actions",id:"testing-actions",level:3},{value:"Testing tramvai module",id:"testing-tramvai-module",level:3},{value:"Testing module in isolation",id:"testing-module-in-isolation",level:4},{value:"Testing module in conjunction with other modules",id:"testing-module-in-conjunction-with-other-modules",level:4},{value:"Adding providers to DI",id:"adding-providers-to-di",level:3},{value:"Create app only for testing",id:"create-app-only-for-testing",level:3}],p={toc:l};function u(e){let{components:t,...n}=e;return(0,o.kt)("wrapper",(0,a.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"Helpers library for writing tramvai specific unit-tests"),(0,o.kt)("p",null,"It might be even more useful when used with ",(0,o.kt)("a",{parentName:"p",href:"/docs/references/tramvai/test/mocks"},(0,o.kt)("inlineCode",{parentName:"a"},"@tramvai/test-mocks"))),(0,o.kt)("h2",{id:"installation"},"Installation"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-bash"},"npm i --save-dev @tramvai/test-unit\n")),(0,o.kt)("h2",{id:"how-to"},"How to"),(0,o.kt)("h3",{id:"testing-reducers"},"Testing reducers"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},"import { testReducer } from '@tramvai/test-unit';\n\nit('test', async () => {\n  const { dispatch, getState } = testReducer(reducer);\n\n  expect(getState()).toEqual([]);\n\n  dispatch(event(1));\n\n  expect(getState()).toEqual([1]);\n});\n")),(0,o.kt)("p",null,(0,o.kt)("details",null,(0,o.kt)("summary",null,"More examples"),(0,o.kt)("p",null,(0,o.kt)("pre",{parentName:"p"},(0,o.kt)("code",{parentName:"pre",className:"language-typescript"},"import { createEvent, createReducer } from '@tramvai/state';\nimport { testReducer } from './testReducer';\n\ndescribe('test/unit/testReducer', () => {\n  it('should handle state change', () => {\n    const handle = jest.fn((state: number[], payload: number) => {\n      return [...state, payload];\n    });\n    const event = createEvent<number>('push');\n    const reducer = createReducer('test', [] as number[]).on(event, handle);\n\n    const { dispatch, getState } = testReducer(reducer);\n\n    expect(getState()).toEqual([]);\n    expect(handle).not.toHaveBeenCalled();\n\n    dispatch(event(1));\n\n    expect(getState()).toEqual([1]);\n    expect(handle).toHaveBeenCalledWith([], 1);\n\n    dispatch(event(3));\n\n    expect(getState()).toEqual([1, 3]);\n    expect(handle).toHaveBeenCalledWith([1], 3);\n  });\n\n  it('should handle several tests reducers at separate', () => {\n    const event = createEvent<number>('push');\n    const reducer = createReducer('test', [] as number[]).on(event, (state, payload) => {\n      return [...state, payload];\n    });\n\n    const test1 = testReducer(reducer);\n    const test2 = testReducer(reducer);\n\n    expect(test1.getState()).toEqual([]);\n    expect(test2.getState()).toEqual([]);\n\n    test1.dispatch(event(1));\n\n    expect(test1.getState()).toEqual([1]);\n    expect(test2.getState()).toEqual([]);\n\n    test2.dispatch(event(2));\n\n    expect(test1.getState()).toEqual([1]);\n    expect(test2.getState()).toEqual([2]);\n  });\n});\n\n"))))),(0,o.kt)("h3",{id:"testing-actions"},"Testing actions"),(0,o.kt)("p",null,"Tramvai context and DI will be created automatically, otherwise you can directly pass it as an argument."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},"import { testAction } from '@tramvai/test-unit';\n\nit('test', async () => {\n  const { run, context } = testAction(action, { initialState: { a: 1 } });\n\n  expect(await run(true)).toBe('hello');\n  expect(await run(false)).toBe('world');\n\n  context.getState(); // { a: 1 }\n});\n")),(0,o.kt)("p",null,(0,o.kt)("details",null,(0,o.kt)("summary",null,"More examples"),(0,o.kt)("p",null,(0,o.kt)("pre",{parentName:"p"},(0,o.kt)("code",{parentName:"pre",className:"language-typescript"},"import { createAction, declareAction } from '@tramvai/core';\nimport { createEvent } from '@tramvai/state';\nimport { createMockStore } from '@tramvai/test-mocks';\nimport { testAction } from './testAction';\n\ndescribe('test/unit/state/testAction', () => {\n  it('should call action', async () => {\n    const action = createAction({\n      name: 'test',\n      fn: (context, payload: boolean) => {\n        if (payload) {\n          return 'hello';\n        }\n\n        return 'world';\n      },\n    });\n\n    const { run } = testAction(action);\n\n    expect(await run(true)).toBe('hello');\n    expect(await run(false)).toBe('world');\n  });\n\n  it('should call action with custom context', async () => {\n    const store = createMockStore();\n    const event = createEvent<string>('test');\n\n    const action = declareAction({\n      name: 'dispatch',\n      fn(payload: string) {\n        return this.dispatch(event(`action${payload}`));\n      },\n    });\n\n    const spyDispatch = jest.spyOn(store, 'dispatch');\n\n    const { run } = testAction(action, { store });\n\n    await run('ping');\n\n    expect(spyDispatch).toHaveBeenCalledWith({ payload: 'actionping', type: 'test' });\n\n    await run('pong');\n\n    expect(spyDispatch).toHaveBeenCalledWith({ payload: 'actionpong', type: 'test' });\n  });\n\n  it('should not require payload', async () => {\n    const action = declareAction({\n      name: 'no-payload',\n      fn() {\n        return 'empty';\n      },\n    });\n\n    const { run } = testAction(action);\n\n    await expect(run()).resolves.toBe('empty');\n  });\n});\n\n"))))),(0,o.kt)("h3",{id:"testing-tramvai-module"},"Testing tramvai module"),(0,o.kt)("h4",{id:"testing-module-in-isolation"},"Testing module in isolation"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},"import { testModule } from '@tramvai/test-unit';\n\nit('test', async () => {\n  const { di, module, runLine } = testModule(TestModule);\n\n  expect(module).toBeInstanceOf(TestModule);\n  expect(di.get('testToken')).toEqual({ a: 1 });\n\n  // Run only specific command line in order to execute handlers for this line inside module\n  await runLine(commandLineListTokens.generatePage);\n});\n")),(0,o.kt)("h4",{id:"testing-module-in-conjunction-with-other-modules"},"Testing module in conjunction with other modules"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},"import { createTestApp } from '@tramvai/test-unit';\n\nit('test', async () => {\n  const { app } = await createTestApp({ modules: [TestModule, DependentModule] });\n\n  // get tokens from di implemented by module\n  expect(app.di.get('testToken')).toEqual({ a: 1 });\n});\n")),(0,o.kt)("p",null,(0,o.kt)("details",null,(0,o.kt)("summary",null,"More examples"),(0,o.kt)("p",null,(0,o.kt)("pre",{parentName:"p"},(0,o.kt)("code",{parentName:"pre",className:"language-typescript"},"import { commandLineListTokens, DI_TOKEN, Module } from '@tramvai/core';\nimport { Container } from '@tinkoff/dippy';\nimport { testModule } from './testModule';\n\ndescribe('test/unit/module/testModule`', () => {\n  it('should test module', () => {\n    const mockConstructor = jest.fn();\n\n    @Module({\n      providers: [\n        {\n          provide: 'testToken',\n          useFactory: () => {\n            return { a: 1 };\n          },\n        },\n      ],\n      deps: {\n        di: DI_TOKEN,\n        optToken: { token: 'optional_token', optional: true },\n      },\n    })\n    class TestModule {\n      constructor(deps: any) {\n        mockConstructor(deps);\n      }\n    }\n\n    const { di, module } = testModule(TestModule);\n\n    expect(module).toBeInstanceOf(TestModule);\n    expect(mockConstructor).toHaveBeenCalledWith({ di: expect.any(Container), optToken: null });\n    expect(di.get('testToken')).toEqual({ a: 1 });\n  });\n\n  it('should test command line', async () => {\n    const mock = jest.fn();\n\n    @Module({\n      providers: [\n        {\n          provide: commandLineListTokens.generatePage,\n          multi: true,\n          useFactory: () => {\n            return mock;\n          },\n        },\n      ],\n    })\n    class TestModule {}\n\n    const { runLine } = testModule(TestModule);\n\n    expect(() => runLine(commandLineListTokens.customerStart)).toThrow();\n    expect(mock).not.toHaveBeenCalled();\n\n    await runLine(commandLineListTokens.generatePage);\n\n    expect(mock).toHaveBeenCalledWith();\n  });\n});\n\n"))))),(0,o.kt)("h3",{id:"adding-providers-to-di"},"Adding providers to DI"),(0,o.kt)("p",null,"Most of the helpers accepts option ",(0,o.kt)("inlineCode",{parentName:"p"},"providers")," which allows to redefine already existing providers or add new."),(0,o.kt)("p",null,"For example, passing ",(0,o.kt)("inlineCode",{parentName:"p"},"providers")," to helper ",(0,o.kt)("inlineCode",{parentName:"p"},"testAction")," allows to access this provider inside action itself:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-tsx"},"import { declareAction } from '@tramvai/core';\nimport { testAction } from '@tramvai/test-unit';\n\nconst action = declareAction({\n  name: 'action',\n  fn() {\n    console.log(this.deps.test); // token value\n  },\n  deps: {\n    test: 'token name',\n  },\n});\n\nit('test', async () => {\n  const { run } = testAction(action, {\n    providers: [\n      {\n        provide: 'token name',\n        useValue: 'token value',\n      },\n    ],\n  });\n});\n")),(0,o.kt)("h3",{id:"create-app-only-for-testing"},"Create app only for testing"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},"import { createTestApp } from '@tramvai/test-unit';\n\nit('test', async () => {\n  const { app } = await createTestApp({ modules: [TestModule, DependentModule] });\n\n  // get tokens from di implemented by module\n  expect(app.di.get('testToken')).toEqual({ a: 1 });\n});\n")),(0,o.kt)("p",null,(0,o.kt)("details",null,(0,o.kt)("summary",null,"More examples"),(0,o.kt)("p",null,(0,o.kt)("pre",{parentName:"p"},(0,o.kt)("code",{parentName:"pre",className:"language-typescript"},"import http from 'http';\nimport { ENV_MANAGER_TOKEN } from '@tramvai/tokens-common';\nimport { SERVER_TOKEN } from '@tramvai/tokens-server';\nimport { CommonModule } from '@tramvai/module-common';\nimport detectPort from 'detect-port';\nimport { createTestApp } from './createTestApp';\n\ndescribe('test/unit/app/createTestApp', () => {\n  beforeEach(async () => {\n    process.env.PORT = (await detectPort(0)).toString();\n    process.env.PORT_STATIC = (await detectPort(0)).toString();\n  });\n\n  it('should return app', async () => {\n    const { app, close } = await createTestApp();\n    const envManager = app.di.get(ENV_MANAGER_TOKEN);\n\n    expect(envManager.get('FRONT_LOG_API')).toBe('test');\n    expect(envManager.get('TEST_ENV')).toBeUndefined();\n    expect(app.di.get(SERVER_TOKEN)).toBeInstanceOf(http.Server);\n\n    return close();\n  });\n\n  it('should specify env', async () => {\n    const { app, close } = await createTestApp({\n      env: {\n        TEST_ENV: '1234',\n      },\n    });\n\n    const envManager = app.di.get(ENV_MANAGER_TOKEN);\n\n    expect(envManager.get('FRONT_LOG_API')).toBe('test');\n    expect(envManager.get('TEST_ENV')).toBe('1234');\n\n    return close();\n  });\n\n  it('should ignore default modules', async () => {\n    const { app } = await createTestApp({\n      excludeDefaultModules: true,\n      modules: [CommonModule],\n    });\n\n    expect(() => app.di.get(SERVER_TOKEN)).toThrow('Token not found');\n  });\n\n  it('should return mocker instance', async () => {\n    const { mocker, close } = await createTestApp();\n\n    expect(mocker).toBeDefined();\n\n    return close();\n  });\n});\n\n"))))))}u.isMDXComponent=!0}}]);