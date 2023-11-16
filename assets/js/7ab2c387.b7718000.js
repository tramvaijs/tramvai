"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[813],{3905:(e,t,r)=>{r.d(t,{Zo:()=>p,kt:()=>d});var n=r(7294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function o(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function l(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},i=Object.keys(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var s=n.createContext({}),u=function(e){var t=n.useContext(s),r=t;return e&&(r="function"==typeof e?e(t):o(o({},t),e)),r},p=function(e){var t=u(e.components);return n.createElement(s.Provider,{value:t},e.children)},c={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},m=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,i=e.originalType,s=e.parentName,p=l(e,["components","mdxType","originalType","parentName"]),m=u(r),d=a,f=m["".concat(s,".").concat(d)]||m[d]||c[d]||i;return r?n.createElement(f,o(o({ref:t},p),{},{components:r})):n.createElement(f,o({ref:t},p))}));function d(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=r.length,o=new Array(i);o[0]=m;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l.mdxType="string"==typeof e?e:a,o[1]=l;for(var u=2;u<i;u++)o[u]=r[u];return n.createElement.apply(null,o)}return n.createElement.apply(null,r)}m.displayName="MDXCreateElement"},5162:(e,t,r)=>{r.d(t,{Z:()=>o});var n=r(7294),a=r(6010);const i="tabItem_Ymn6";function o(e){var t=e.children,r=e.hidden,o=e.className;return n.createElement("div",{role:"tabpanel",className:(0,a.Z)(i,o),hidden:r},t)}},4866:(e,t,r)=>{r.d(t,{Z:()=>N});var n=r(7462),a=r(7294),i=r(6010),o=r(2466),l=r(6550),s=r(1980),u=r(7392),p=r(12);function c(e){return function(e){return a.Children.map(e,(function(e){if((0,a.isValidElement)(e)&&"value"in e.props)return e;throw new Error("Docusaurus error: Bad <Tabs> child <"+("string"==typeof e.type?e.type:e.type.name)+'>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.')}))}(e).map((function(e){var t=e.props;return{value:t.value,label:t.label,attributes:t.attributes,default:t.default}}))}function m(e){var t=e.values,r=e.children;return(0,a.useMemo)((function(){var e=null!=t?t:c(r);return function(e){var t=(0,u.l)(e,(function(e,t){return e.value===t.value}));if(t.length>0)throw new Error('Docusaurus error: Duplicate values "'+t.map((function(e){return e.value})).join(", ")+'" found in <Tabs>. Every value needs to be unique.')}(e),e}),[t,r])}function d(e){var t=e.value;return e.tabValues.some((function(e){return e.value===t}))}function f(e){var t=e.queryString,r=void 0!==t&&t,n=e.groupId,i=(0,l.k6)(),o=function(e){var t=e.queryString,r=void 0!==t&&t,n=e.groupId;if("string"==typeof r)return r;if(!1===r)return null;if(!0===r&&!n)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return null!=n?n:null}({queryString:r,groupId:n});return[(0,s._X)(o),(0,a.useCallback)((function(e){if(o){var t=new URLSearchParams(i.location.search);t.set(o,e),i.replace(Object.assign({},i.location,{search:t.toString()}))}}),[o,i])]}function g(e){var t,r,n,i,o=e.defaultValue,l=e.queryString,s=void 0!==l&&l,u=e.groupId,c=m(e),g=(0,a.useState)((function(){return function(e){var t,r=e.defaultValue,n=e.tabValues;if(0===n.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(r){if(!d({value:r,tabValues:n}))throw new Error('Docusaurus error: The <Tabs> has a defaultValue "'+r+'" but none of its children has the corresponding value. Available values are: '+n.map((function(e){return e.value})).join(", ")+". If you intend to show no default tab, use defaultValue={null} instead.");return r}var a=null!=(t=n.find((function(e){return e.default})))?t:n[0];if(!a)throw new Error("Unexpected error: 0 tabValues");return a.value}({defaultValue:o,tabValues:c})})),v=g[0],h=g[1],y=f({queryString:s,groupId:u}),b=y[0],k=y[1],w=(t=function(e){return e?"docusaurus.tab."+e:null}({groupId:u}.groupId),r=(0,p.Nk)(t),n=r[0],i=r[1],[n,(0,a.useCallback)((function(e){t&&i.set(e)}),[t,i])]),N=w[0],x=w[1],T=function(){var e=null!=b?b:N;return d({value:e,tabValues:c})?e:null}();return(0,a.useLayoutEffect)((function(){T&&h(T)}),[T]),{selectedValue:v,selectValue:(0,a.useCallback)((function(e){if(!d({value:e,tabValues:c}))throw new Error("Can't select invalid tab value="+e);h(e),k(e),x(e)}),[k,x,c]),tabValues:c}}var v=r(2389);const h="tabList__CuJ",y="tabItem_LNqP";function b(e){var t=e.className,r=e.block,l=e.selectedValue,s=e.selectValue,u=e.tabValues,p=[],c=(0,o.o5)().blockElementScrollPositionUntilNextRender,m=function(e){var t=e.currentTarget,r=p.indexOf(t),n=u[r].value;n!==l&&(c(t),s(n))},d=function(e){var t,r=null;switch(e.key){case"Enter":m(e);break;case"ArrowRight":var n,a=p.indexOf(e.currentTarget)+1;r=null!=(n=p[a])?n:p[0];break;case"ArrowLeft":var i,o=p.indexOf(e.currentTarget)-1;r=null!=(i=p[o])?i:p[p.length-1]}null==(t=r)||t.focus()};return a.createElement("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,i.Z)("tabs",{"tabs--block":r},t)},u.map((function(e){var t=e.value,r=e.label,o=e.attributes;return a.createElement("li",(0,n.Z)({role:"tab",tabIndex:l===t?0:-1,"aria-selected":l===t,key:t,ref:function(e){return p.push(e)},onKeyDown:d,onClick:m},o,{className:(0,i.Z)("tabs__item",y,null==o?void 0:o.className,{"tabs__item--active":l===t})}),null!=r?r:t)})))}function k(e){var t=e.lazy,r=e.children,n=e.selectedValue;if(r=Array.isArray(r)?r:[r],t){var i=r.find((function(e){return e.props.value===n}));return i?(0,a.cloneElement)(i,{className:"margin-top--md"}):null}return a.createElement("div",{className:"margin-top--md"},r.map((function(e,t){return(0,a.cloneElement)(e,{key:t,hidden:e.props.value!==n})})))}function w(e){var t=g(e);return a.createElement("div",{className:(0,i.Z)("tabs-container",h)},a.createElement(b,(0,n.Z)({},e,t)),a.createElement(k,(0,n.Z)({},e,t)))}function N(e){var t=(0,v.Z)();return a.createElement(w,(0,n.Z)({key:String(t)},e))}},5909:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>m,contentTitle:()=>p,default:()=>g,frontMatter:()=>u,metadata:()=>c,toc:()=>d});var n=r(7462),a=r(3366),i=(r(7294),r(3905)),o=r(4866),l=r(5162),s=["components"],u={},p=void 0,c={unversionedId:"references/tramvai/test/playwright",id:"references/tramvai/test/playwright",title:"playwright",description:"Set of helpers for using playwright in the integration tests",source:"@site/tmp-docs/references/tramvai/test/playwright.md",sourceDirName:"references/tramvai/test",slug:"/references/tramvai/test/playwright",permalink:"/docs/references/tramvai/test/playwright",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/get-started/overview.md/tmp-docs/references/tramvai/test/playwright.md",tags:[],version:"current",frontMatter:{},sidebar:"sidebar",previous:{title:"mocks",permalink:"/docs/references/tramvai/test/mocks"},next:{title:"puppeteer",permalink:"/docs/references/tramvai/test/puppeteer"}},m={},d=[{value:"Installation",id:"installation",level:2},{value:"Usage",id:"usage",level:2},{value:"Configuration",id:"configuration",level:3},{value:"Testing",id:"testing",level:3}],f={toc:d};function g(e){var t=e.components,r=(0,a.Z)(e,s);return(0,i.kt)("wrapper",(0,n.Z)({},f,r,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"Set of helpers for using ",(0,i.kt)("a",{parentName:"p",href:"https://playwright.dev"},"playwright")," in the integration tests"),(0,i.kt)("blockquote",null,(0,i.kt)("p",{parentName:"blockquote"},(0,i.kt)("inlineCode",{parentName:"p"},"Playwright")," should be installed separately")),(0,i.kt)("h2",{id:"installation"},"Installation"),(0,i.kt)(o.Z,{groupId:"npm2yarn",mdxType:"Tabs"},(0,i.kt)(l.Z,{value:"npm",mdxType:"TabItem"},(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-bash"},"npm install --save-dev @tramvai/test-pw\n"))),(0,i.kt)(l.Z,{value:"yarn",label:"Yarn",mdxType:"TabItem"},(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-bash"},"yarn add --dev @tramvai/test-pw\n")))),(0,i.kt)("h2",{id:"usage"},"Usage"),(0,i.kt)("h3",{id:"configuration"},"Configuration"),(0,i.kt)("p",null,"Create file ",(0,i.kt)("inlineCode",{parentName:"p"},"playwright.config.ts")," with defaults from ",(0,i.kt)("inlineCode",{parentName:"p"},"@tramvai/test-pw")," package:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-ts",metastring:'title="playwright.config.ts"',title:'"playwright.config.ts"'},"import { createPlaywrightConfig } from '@tramvai/test-pw';\n\nexport default createPlaywrightConfig();\n")),(0,i.kt)("p",null,"You can always extend default config, here is ",(0,i.kt)("inlineCode",{parentName:"p"},"createPlaywrightConfig")," type definition:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-ts"},"// passed configuration object will be merged with defaults\ntype createPlaywrightConfig = (config: PlaywrightTestConfig) => PlaywrightTestConfig;\n")),(0,i.kt)("h3",{id:"testing"},"Testing"),(0,i.kt)("admonition",{type:"tip"},(0,i.kt)("p",{parentName:"admonition"},"Use case for this section and ",(0,i.kt)("inlineCode",{parentName:"p"},"startAppFixture")," - monorepo with many tramvai modules and example applications, where you need to test independent features."),(0,i.kt)("p",{parentName:"admonition"},"All usage of ",(0,i.kt)("inlineCode",{parentName:"p"},"startAppFixture")," in different workers will run development build, which might not be optimal for tests execution time, if you want to test the same app in different cases."),(0,i.kt)("p",{parentName:"admonition"},"For real applications, prefer to run application once as ",(0,i.kt)("a",{parentName:"p",href:"https://playwright.dev/docs/test-webserver"},"web server")," or manually and pass ",(0,i.kt)("inlineCode",{parentName:"p"},"baseUrl")," after.")),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"@tramvai/test-pw")," provide a useful fixture for application start (local server in development mode) and testing - ",(0,i.kt)("inlineCode",{parentName:"p"},"startAppFixture"),". This fixture use ",(0,i.kt)("inlineCode",{parentName:"p"},"startCli")," method from ",(0,i.kt)("a",{parentName:"p",href:"/docs/references/tramvai/test/integration"},"@tramvai/test-integration")," package."),(0,i.kt)("p",null,"First, you need to add and configure this fixture for application tests:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-ts",metastring:'title="__integration__/test-fixture.ts"',title:'"__integration__/test-fixture.ts"'},"import path from 'path';\nimport { test as base } from '@playwright/test';\nimport type { StartAppTypes } from '@tramvai/test-pw';\nimport { startAppFixture } from '@tramvai/test-pw';\n\ntype TestFixture = {};\n\ntype WorkerFixture = {\n  app: StartAppTypes.TestApp;\n  appTarget: StartAppTypes.AppTarget;\n  startOptions: StartAppTypes.StartOptions;\n};\n\nexport const test = base.extend<TestFixture, WorkerFixture>({\n  appTarget: [\n    // provide application name and directory\n    {\n      target: 'appName',\n      cwd: path.resolve(__dirname, '..'),\n    },\n    { scope: 'worker', auto: true, option: true },\n  ],\n  // any `startCli` parameters\n  startOptions: [{\n    env: {\n      SOME_MOCKED_API: 'xxx'\n    },\n  }, { scope: 'worker', auto: true, option: true }],\n\n  app: startAppFixture,\n});\n")),(0,i.kt)("p",null,"Then, use the ",(0,i.kt)("inlineCode",{parentName:"p"},"app")," object in integration tests:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-ts",metastring:'title="__integration__/appName.integration.ts"',title:'"__integration__/appName.integration.ts"'},"import { expect } from '@playwright/test';\nimport { test } from './test-fixture';\n\ntest.describe('examples/app', async () => {\n  test('Navigation is visible', async ({ app, page }) => {\n    await page.goto(app.serverUrl);\n\n    expect(page.getByRole('navigation')).toBeVisible();\n  });\n});\n")),(0,i.kt)("p",null,"You can find more info about ",(0,i.kt)("inlineCode",{parentName:"p"},"app")," object in our ",(0,i.kt)("a",{parentName:"p",href:"/docs/guides/testing#integration-tests"},"Testing Guide")))}g.isMDXComponent=!0}}]);