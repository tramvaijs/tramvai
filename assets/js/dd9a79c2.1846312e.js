"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[715],{3905:(e,t,n)=>{n.d(t,{Zo:()=>m,kt:()=>u});var o=n(7294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,o)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,o,a=function(e,t){if(null==e)return{};var n,o,a={},r=Object.keys(e);for(o=0;o<r.length;o++)n=r[o],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(o=0;o<r.length;o++)n=r[o],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var p=o.createContext({}),l=function(e){var t=o.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},m=function(e){var t=l(e.components);return o.createElement(p.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return o.createElement(o.Fragment,{},t)}},c=o.forwardRef((function(e,t){var n=e.components,a=e.mdxType,r=e.originalType,p=e.parentName,m=s(e,["components","mdxType","originalType","parentName"]),c=l(n),u=a,h=c["".concat(p,".").concat(u)]||c[u]||d[u]||r;return n?o.createElement(h,i(i({ref:t},m),{},{components:n})):o.createElement(h,i({ref:t},m))}));function u(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var r=n.length,i=new Array(r);i[0]=c;var s={};for(var p in t)hasOwnProperty.call(t,p)&&(s[p]=t[p]);s.originalType=e,s.mdxType="string"==typeof e?e:a,i[1]=s;for(var l=2;l<r;l++)i[l]=n[l];return o.createElement.apply(null,i)}return o.createElement.apply(null,n)}c.displayName="MDXCreateElement"},1127:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>m,contentTitle:()=>p,default:()=>u,frontMatter:()=>s,metadata:()=>l,toc:()=>d});var o=n(7462),a=n(3366),r=(n(7294),n(3905)),i=["components"],s={id:"state-management",title:"Managing State"},p=void 0,l={unversionedId:"features/child-app/state-management",id:"features/child-app/state-management",title:"Managing State",description:"Explanation",source:"@site/tmp-docs/03-features/015-child-app/05-state-management.md",sourceDirName:"03-features/015-child-app",slug:"/features/child-app/state-management",permalink:"/docs/features/child-app/state-management",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/get-started/overview.md/tmp-docs/03-features/015-child-app/05-state-management.md",tags:[],version:"current",sidebarPosition:5,frontMatter:{id:"state-management",title:"Managing State"},sidebar:"sidebar",previous:{title:"Styling and Assets",permalink:"/docs/features/child-app/styling-and-assets"},next:{title:"Lifecycle",permalink:"/docs/features/child-app/lifecycle"}},m={},d=[{value:"Explanation",id:"explanation",level:2},{value:"Usage",id:"usage",level:2},{value:"Installation",id:"installation",level:3},{value:"Create store",id:"create-store",level:3},{value:"Connect store",id:"connect-store",level:3},{value:"Read and update store",id:"read-and-update-store",level:3},{value:"How to",id:"how-to",level:2},{value:"How to subscribe to Root App store?",id:"how-to-subscribe-to-root-app-store",level:3}],c={toc:d};function u(e){var t=e.components,n=(0,a.Z)(e,i);return(0,r.kt)("wrapper",(0,o.Z)({},c,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("h2",{id:"explanation"},"Explanation"),(0,r.kt)("p",null,"All ",(0,r.kt)("a",{parentName:"p",href:"/docs/features/state-management"},"@tramvai/state")," features are available in Child App with connected ",(0,r.kt)("inlineCode",{parentName:"p"},"CommonChildAppModule")," module."),(0,r.kt)("p",null,"State Management is almost completely isolated from Root App and other of Child Apps. Every microfrontend can register its own stores and actions."),(0,r.kt)("p",null,"In general, State Management usage is completely the same as in usual tramvai applications."),(0,r.kt)("h2",{id:"usage"},"Usage"),(0,r.kt)("h3",{id:"installation"},"Installation"),(0,r.kt)("p",null,"First, you need to install ",(0,r.kt)("inlineCode",{parentName:"p"},"@tramvai/module-common")," module and ",(0,r.kt)("inlineCode",{parentName:"p"},"@tramvai/state")," library in your Child App:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-bash"},"npx tramvai add @tramvai/module-common\nnpx tramvai add @tramvai/state\n")),(0,r.kt)("p",null,"Then, connect ",(0,r.kt)("inlineCode",{parentName:"p"},"CommonChildAppModule")," from this module in your ",(0,r.kt)("inlineCode",{parentName:"p"},"createChildApp")," function:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"import { createChildApp } from '@tramvai/child-app-core';\nimport { CommonChildAppModule } from '@tramvai/module-common';\nimport { RootCmp } from './components/root';\n\n// eslint-disable-next-line import/no-default-export\nexport default createChildApp({\n  name: 'fancy-child',\n  render: RootCmp,\n  modules: [CommonChildAppModule],\n  providers: [],\n});\n")),(0,r.kt)("h3",{id:"create-store"},"Create store"),(0,r.kt)("p",null,"For example, let's create a simple counter store:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts",metastring:'title="stores/counter.ts"',title:'"stores/counter.ts"'},"import { createReducer, createEvent } from '@tramvai/state';\n\nexport const increment = createEvent('increment');\n\nexport const CounterStore = createReducer('counter', 0)\n  .on(increment, (state, payload) => state + 1);\n")),(0,r.kt)("h3",{id:"connect-store"},"Connect store"),(0,r.kt)("p",null,"Now, let's connect this store to our Child App through ",(0,r.kt)("inlineCode",{parentName:"p"},"COMBINE_REDUCERS")," token:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"import { provide } from '@tramvai/core';\nimport { createChildApp } from '@tramvai/child-app-core';\nimport { CommonChildAppModule, COMBINE_REDUCERS } from '@tramvai/module-common';\nimport { RootCmp } from './components/root';\nimport { CounterStore } from './stores/counter';\n\n// eslint-disable-next-line import/no-default-export\nexport default createChildApp({\n  name: 'fancy-child',\n  render: RootCmp,\n  modules: [CommonChildAppModule],\n  providers: [\n    // highlight-start\n    provide({\n      provide: COMBINE_REDUCERS,\n      multi: true,\n      useValue: [testStore],\n    }),\n    // highlight-end\n  ],\n});\n")),(0,r.kt)("h3",{id:"read-and-update-store"},"Read and update store"),(0,r.kt)("p",null,"Simplest way to read data from store is to use ",(0,r.kt)("a",{parentName:"p",href:"/docs/features/state-management#usestore"},"useStore")," hook. For event dispatching, you need to get Store instance from DI with ",(0,r.kt)("a",{parentName:"p",href:"/docs/references/tramvai/react#usedi"},"useDi")," hook and ",(0,r.kt)("inlineCode",{parentName:"p"},"STORE_TOKEN"),":"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-tsx",metastring:'title="components/root.tsx"',title:'"components/root.tsx"'},"import { useDi } from '@tramvai/react';\nimport { useStore } from '@tramvai/state';\nimport { STORE_TOKEN } from '@tramvai/module-common';\nimport { CounterStore, increment, decrement } from '../stores/counter';\n\nexport const RootCmp = () => {\n  // get Store instance from DI\n  const store = useDi(STORE_TOKEN);\n  // subscribe to counter reducer state\n  const counter = useStore(CounterStore);\n\n  // bind events to dispatch\n  const handleIncrement = () => store.dispatch(increment());\n\n  return (\n    <>\n      <h1>Count is: {counter}</h1>\n      <button onClick={handleIncrement}>increment</button>\n    </>\n  );\n};\n")),(0,r.kt)("h2",{id:"how-to"},"How to"),(0,r.kt)("h3",{id:"how-to-subscribe-to-root-app-store"},"How to subscribe to Root App store?"),(0,r.kt)("p",null,"By default, Child App cannot read data from Root App stores, but the you can specify the set of Root App stores that might be used inside Child App."),(0,r.kt)("p",null,"It may be done using ",(0,r.kt)("inlineCode",{parentName:"p"},"CHILD_APP_INTERNAL_ROOT_STATE_ALLOWED_STORE_TOKEN")," token. This token defines the list of allowed Root App store names that might be used inside Child App."),(0,r.kt)("admonition",{type:"warning"},(0,r.kt)("p",{parentName:"admonition"},"This token is considered undesirable to use as it leads to high coupling with stores from Root App and this way stores in Root App might not change their public interface. But, in most cases, changes in stores ignore breaking change tracking and may breaks backward-compatibility. So ",(0,r.kt)("strong",{parentName:"p"},"do not use this token if you can"),", and if you should - use as little as possible from Root App and provide some fallback in case of wrong data.")),(0,r.kt)("p",null,"For example, let's subscribe to ",(0,r.kt)("a",{parentName:"p",href:"/docs/references/modules/client-hints#media"},"MediaStore from @tramvai/module-client-hints"),":"),(0,r.kt)("ol",null,(0,r.kt)("li",{parentName:"ol"},(0,r.kt)("p",{parentName:"li"},"Specify stores that might be used inside Child App"),(0,r.kt)("pre",{parentName:"li"},(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"import { createChildApp, CHILD_APP_INTERNAL_ROOT_STATE_ALLOWED_STORE_TOKEN } from '@tramvai/child-app-core';\nimport { CommonChildAppModule } from '@tramvai/module-common';\nimport { MediaStore } from '@tramvai/module-client-hints';\nimport { RootCmp } from './components/root';\n\n// eslint-disable-next-line import/no-default-export\nexport default createChildApp({\n  name: 'fancy-child',\n  render: RootCmp,\n  // highlight-next-line\n  modules: [CommonChildAppModule],\n  providers: [\n    provide({\n      provide: CHILD_APP_INTERNAL_ROOT_STATE_ALLOWED_STORE_TOKEN,\n      multi: true,\n      // also you can use store string key, \"media\" for MediaStore\n      useValue: [MediaStore],\n    }),\n  ],\n});\n"))),(0,r.kt)("li",{parentName:"ol"},(0,r.kt)("p",{parentName:"li"},"Use the specified Root App stores the same way as usual stores"),(0,r.kt)("pre",{parentName:"li"},(0,r.kt)("code",{parentName:"pre",className:"language-tsx"},"import React from 'react';\nimport { useStore } from '@tramvai/state';\nimport { MediaStore } from '@tramvai/module-client-hints';\n\nexport const StateCmp = () => {\n  const media = useStore(MediaStore);\n\n  return <div>Supposed screen size: {media.width}x{media.height}</div>;\n};\n")))))}u.isMDXComponent=!0}}]);