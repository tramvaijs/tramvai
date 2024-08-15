"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[8673],{3905:(e,t,n)=>{n.d(t,{Zo:()=>d,kt:()=>m});var a=n(7294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},i=Object.keys(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var s=a.createContext({}),u=function(e){var t=a.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},d=function(e){var t=u(e.components);return a.createElement(s.Provider,{value:t},e.children)},p={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},c=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,i=e.originalType,s=e.parentName,d=l(e,["components","mdxType","originalType","parentName"]),c=u(n),m=r,h=c["".concat(s,".").concat(m)]||c[m]||p[m]||i;return n?a.createElement(h,o(o({ref:t},d),{},{components:n})):a.createElement(h,o({ref:t},d))}));function m(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=n.length,o=new Array(i);o[0]=c;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l.mdxType="string"==typeof e?e:r,o[1]=l;for(var u=2;u<i;u++)o[u]=n[u];return a.createElement.apply(null,o)}return a.createElement.apply(null,n)}c.displayName="MDXCreateElement"},5162:(e,t,n)=>{n.d(t,{Z:()=>o});var a=n(7294),r=n(6010);const i="tabItem_Ymn6";function o(e){var t=e.children,n=e.hidden,o=e.className;return a.createElement("div",{role:"tabpanel",className:(0,r.Z)(i,o),hidden:n},t)}},4866:(e,t,n)=>{n.d(t,{Z:()=>w});var a=n(7462),r=n(7294),i=n(6010),o=n(2466),l=n(6550),s=n(1980),u=n(7392),d=n(12);function p(e){return function(e){return r.Children.map(e,(function(e){if((0,r.isValidElement)(e)&&"value"in e.props)return e;throw new Error("Docusaurus error: Bad <Tabs> child <"+("string"==typeof e.type?e.type:e.type.name)+'>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.')}))}(e).map((function(e){var t=e.props;return{value:t.value,label:t.label,attributes:t.attributes,default:t.default}}))}function c(e){var t=e.values,n=e.children;return(0,r.useMemo)((function(){var e=null!=t?t:p(n);return function(e){var t=(0,u.l)(e,(function(e,t){return e.value===t.value}));if(t.length>0)throw new Error('Docusaurus error: Duplicate values "'+t.map((function(e){return e.value})).join(", ")+'" found in <Tabs>. Every value needs to be unique.')}(e),e}),[t,n])}function m(e){var t=e.value;return e.tabValues.some((function(e){return e.value===t}))}function h(e){var t=e.queryString,n=void 0!==t&&t,a=e.groupId,i=(0,l.k6)(),o=function(e){var t=e.queryString,n=void 0!==t&&t,a=e.groupId;if("string"==typeof n)return n;if(!1===n)return null;if(!0===n&&!a)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return null!=a?a:null}({queryString:n,groupId:a});return[(0,s._X)(o),(0,r.useCallback)((function(e){if(o){var t=new URLSearchParams(i.location.search);t.set(o,e),i.replace(Object.assign({},i.location,{search:t.toString()}))}}),[o,i])]}function f(e){var t,n,a,i,o=e.defaultValue,l=e.queryString,s=void 0!==l&&l,u=e.groupId,p=c(e),f=(0,r.useState)((function(){return function(e){var t,n=e.defaultValue,a=e.tabValues;if(0===a.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(n){if(!m({value:n,tabValues:a}))throw new Error('Docusaurus error: The <Tabs> has a defaultValue "'+n+'" but none of its children has the corresponding value. Available values are: '+a.map((function(e){return e.value})).join(", ")+". If you intend to show no default tab, use defaultValue={null} instead.");return n}var r=null!=(t=a.find((function(e){return e.default})))?t:a[0];if(!r)throw new Error("Unexpected error: 0 tabValues");return r.value}({defaultValue:o,tabValues:p})})),v=f[0],k=f[1],b=h({queryString:s,groupId:u}),y=b[0],g=b[1],N=(t=function(e){return e?"docusaurus.tab."+e:null}({groupId:u}.groupId),n=(0,d.Nk)(t),a=n[0],i=n[1],[a,(0,r.useCallback)((function(e){t&&i.set(e)}),[t,i])]),w=N[0],C=N[1],x=function(){var e=null!=y?y:w;return m({value:e,tabValues:p})?e:null}();return(0,r.useLayoutEffect)((function(){x&&k(x)}),[x]),{selectedValue:v,selectValue:(0,r.useCallback)((function(e){if(!m({value:e,tabValues:p}))throw new Error("Can't select invalid tab value="+e);k(e),g(e),C(e)}),[g,C,p]),tabValues:p}}var v=n(2389);const k="tabList__CuJ",b="tabItem_LNqP";function y(e){var t=e.className,n=e.block,l=e.selectedValue,s=e.selectValue,u=e.tabValues,d=[],p=(0,o.o5)().blockElementScrollPositionUntilNextRender,c=function(e){var t=e.currentTarget,n=d.indexOf(t),a=u[n].value;a!==l&&(p(t),s(a))},m=function(e){var t,n=null;switch(e.key){case"Enter":c(e);break;case"ArrowRight":var a,r=d.indexOf(e.currentTarget)+1;n=null!=(a=d[r])?a:d[0];break;case"ArrowLeft":var i,o=d.indexOf(e.currentTarget)-1;n=null!=(i=d[o])?i:d[d.length-1]}null==(t=n)||t.focus()};return r.createElement("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,i.Z)("tabs",{"tabs--block":n},t)},u.map((function(e){var t=e.value,n=e.label,o=e.attributes;return r.createElement("li",(0,a.Z)({role:"tab",tabIndex:l===t?0:-1,"aria-selected":l===t,key:t,ref:function(e){return d.push(e)},onKeyDown:m,onClick:c},o,{className:(0,i.Z)("tabs__item",b,null==o?void 0:o.className,{"tabs__item--active":l===t})}),null!=n?n:t)})))}function g(e){var t=e.lazy,n=e.children,a=e.selectedValue;if(n=Array.isArray(n)?n:[n],t){var i=n.find((function(e){return e.props.value===a}));return i?(0,r.cloneElement)(i,{className:"margin-top--md"}):null}return r.createElement("div",{className:"margin-top--md"},n.map((function(e,t){return(0,r.cloneElement)(e,{key:t,hidden:e.props.value!==a})})))}function N(e){var t=f(e);return r.createElement("div",{className:(0,i.Z)("tabs-container",k)},r.createElement(y,(0,a.Z)({},e,t)),r.createElement(g,(0,a.Z)({},e,t)))}function w(e){var t=(0,v.Z)();return r.createElement(N,(0,a.Z)({key:String(t)},e))}},4652:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>c,contentTitle:()=>d,default:()=>f,frontMatter:()=>u,metadata:()=>p,toc:()=>m});var a=n(7462),r=n(3366),i=(n(7294),n(3905)),o=n(4866),l=n(5162),s=["components"],u={id:"known-issues",title:"Known Issues"},d=void 0,p={unversionedId:"features/child-app/known-issues",id:"features/child-app/known-issues",title:"Known Issues",description:"This Suspense boundary received an update before it finished hydrating",source:"@site/tmp-docs/03-features/015-child-app/020-known-issues.md",sourceDirName:"03-features/015-child-app",slug:"/features/child-app/known-issues",permalink:"/docs/features/child-app/known-issues",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/tmp-docs/03-features/015-child-app/020-known-issues.md",tags:[],version:"current",sidebarPosition:20,frontMatter:{id:"known-issues",title:"Known Issues"},sidebar:"sidebar",previous:{title:"Add Child App without CLI",permalink:"/docs/features/child-app/add-child-app-without-cli"},next:{title:"Papi (API Routes)",permalink:"/docs/features/papi"}},c={},m=[{value:"This Suspense boundary received an update before it finished hydrating",id:"this-suspense-boundary-received-an-update-before-it-finished-hydrating",level:3},{value:"Shared dependency are still loaded although the root-app shares it",id:"shared-dependency-are-still-loaded-although-the-root-app-shares-it",level:3},{value:"Possible problems with shared dependency",id:"possible-problems-with-shared-dependency",level:3},{value:"react-query: No QueryClient set, use QueryClientProvider to set one",id:"react-query-no-queryclient-set-use-queryclientprovider-to-set-one",level:4},{value:"Shared module is not available for eager consumption",id:"shared-module-is-not-available-for-eager-consumption",level:3},{value:"Reason",id:"reason",level:4},{value:"Solution",id:"solution",level:4},{value:"No required version specified and unable to automatically determine one",id:"no-required-version-specified-and-unable-to-automatically-determine-one",level:3},{value:"Reason",id:"reason-1",level:4},{value:"Solution",id:"solution-1",level:4}],h={toc:m};function f(e){var t=e.components,n=(0,r.Z)(e,s);return(0,i.kt)("wrapper",(0,a.Z)({},h,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("h3",{id:"this-suspense-boundary-received-an-update-before-it-finished-hydrating"},"This Suspense boundary received an update before it finished hydrating"),(0,i.kt)("p",null,"When ",(0,i.kt)("inlineCode",{parentName:"p"},"React")," >= ",(0,i.kt)("inlineCode",{parentName:"p"},"18")," version is used, child-app will be wrapped in ",(0,i.kt)("inlineCode",{parentName:"p"},"Suspense")," boundary for ",(0,i.kt)("a",{parentName:"p",href:"https://github.com/reactwg/react-18/discussions/130"},"Selective Hydration"),". This optimization can significantly decrease Total Blocking Time metric of the page."),(0,i.kt)("p",null,"There is one drawback of this optimization - if you will try rerender child-app during selective hydration, ",(0,i.kt)("inlineCode",{parentName:"p"},"React")," will switch to deopt mode and made full client-rendering of the child-app component. Potential ways to fix this problem ",(0,i.kt)("a",{parentName:"p",href:"https://github.com/facebook/react/issues/24476#issuecomment-1127800350"},"described here"),". ",(0,i.kt)("inlineCode",{parentName:"p"},"ChildApp")," component already wrapped in ",(0,i.kt)("inlineCode",{parentName:"p"},"React.memo"),"."),(0,i.kt)("p",null,"Few advices to avoid this problem:"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},"Memoize object, passed to child-app ",(0,i.kt)("inlineCode",{parentName:"li"},"props")," property"),(0,i.kt)("li",{parentName:"ul"},"Prevent pass to child-app properties, which can be changed during hydration, for example at client-side in page actions")),(0,i.kt)("h3",{id:"shared-dependency-are-still-loaded-although-the-root-app-shares-it"},"Shared dependency are still loaded although the root-app shares it"),(0,i.kt)("p",null,"Refer to the ",(0,i.kt)("a",{parentName:"p",href:"#faq-about-shared-dependencies"},"FAQ")," about the details. In summary:"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},"it is more reliable to provide shared dependency from the root-app than relying on sharing between several child-apps"),(0,i.kt)("li",{parentName:"ul"},"make sure all versions of the shared dependencies are semver compatible")),(0,i.kt)("h3",{id:"possible-problems-with-shared-dependency"},"Possible problems with shared dependency"),(0,i.kt)("h4",{id:"react-query-no-queryclient-set-use-queryclientprovider-to-set-one"},"react-query: No QueryClient set, use QueryClientProvider to set one"),(0,i.kt)("p",null,"The issue may happen if there are different instances of ",(0,i.kt)("inlineCode",{parentName:"p"},"@tramvai/module-react-query")," and ",(0,i.kt)("inlineCode",{parentName:"p"},"@tramvai/react-query")," and therefore internal code inside ",(0,i.kt)("inlineCode",{parentName:"p"},"@tramvai/react-query")," resolves React Context that differs from the QueryClient Provided inside ",(0,i.kt)("inlineCode",{parentName:"p"},"@tramvai/module-react-query")),(0,i.kt)("p",null,"To resolve the issue:"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},"when defining shared dependencies add both ",(0,i.kt)("inlineCode",{parentName:"li"},"@tramvai/module-react-query")," and ",(0,i.kt)("inlineCode",{parentName:"li"},"@tramvai/module-react-query")),(0,i.kt)("li",{parentName:"ul"},"make sure that both packages are used in the root-app (or none) as both instances should resolve to one place and if it isn't apply then for example ",(0,i.kt)("inlineCode",{parentName:"li"},"@tramvai/react-query")," might instantiate with different React Context"),(0,i.kt)("li",{parentName:"ul"},"another option would be to add underlying library ",(0,i.kt)("inlineCode",{parentName:"li"},"@tanstack/react-query")," to both child-app and root-app shared dependencies to make sure that required React Context is created only in single instance")),(0,i.kt)("h3",{id:"shared-module-is-not-available-for-eager-consumption"},"Shared module is not available for eager consumption"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"Uncaught Error: Shared module is not available for eager consumption")," - this error can occure when:"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},"Dependency is shared between Child App and Root App"),(0,i.kt)("li",{parentName:"ul"},"Dependency is ",(0,i.kt)("inlineCode",{parentName:"li"},"eager")," in Root App configuration (e.g. ",(0,i.kt)("inlineCode",{parentName:"li"},"@tramvai/core"),", ",(0,i.kt)("inlineCode",{parentName:"li"},"@tramvai/react")," and ",(0,i.kt)("inlineCode",{parentName:"li"},"@tinkoff/dippy"),")"),(0,i.kt)("li",{parentName:"ul"},"Dependency in Child App has ",(0,i.kt)("strong",{parentName:"li"},"higher")," version than same dependency in Root App"),(0,i.kt)("li",{parentName:"ul"},"Application running in ",(0,i.kt)("strong",{parentName:"li"},"production")," mode (after deployment or ",(0,i.kt)("inlineCode",{parentName:"li"},"tramvai start-prod")," command, unfortunately you can't catch this issue when use ",(0,i.kt)("inlineCode",{parentName:"li"},"tramvai start"),")"),(0,i.kt)("li",{parentName:"ul"},"You have a component loaded by dynamic import (e.g. with ",(0,i.kt)("inlineCode",{parentName:"li"},"lazy")," from ",(0,i.kt)("inlineCode",{parentName:"li"},"@tramvai/react"),") and this component uses some of this shared deps underhood")),(0,i.kt)("h4",{id:"reason"},"Reason"),(0,i.kt)("p",null,"More information why this problem exists you can find in ",(0,i.kt)("a",{parentName:"p",href:"https://webpack.js.org/concepts/module-federation/#uncaught-error-shared-module-is-not-available-for-eager-consumption"},"Module Federation documentation")),(0,i.kt)("h4",{id:"solution"},"Solution"),(0,i.kt)("p",null,"Simple and fast solution - is to always update Root Application ",(0,i.kt)("strong",{parentName:"p"},"before"),' Child Apps. If it is not possible, you need to create "async boundary" for application dependencies at the higher level - entry point is good enough for it.'),(0,i.kt)("ol",null,(0,i.kt)("li",{parentName:"ol"},"At first, create ",(0,i.kt)("inlineCode",{parentName:"li"},"bootstrap.ts")," file near ",(0,i.kt)("inlineCode",{parentName:"li"},"index.ts"),", and copy there all ",(0,i.kt)("inlineCode",{parentName:"li"},"index.ts")," content"),(0,i.kt)("li",{parentName:"ol"},"Then change ",(0,i.kt)("inlineCode",{parentName:"li"},"index.ts")," content to dynamic import of ",(0,i.kt)("inlineCode",{parentName:"li"},"bootstrap.ts")," with ",(0,i.kt)("inlineCode",{parentName:"li"},"webpackChunkName")," magic comment specified"),(0,i.kt)("li",{parentName:"ol"},"At least, add ",(0,i.kt)("inlineCode",{parentName:"li"},"bootstrap")," (use here ",(0,i.kt)("inlineCode",{parentName:"li"},"webpackChunkName")," value) chunk for critical chunks list - ",(0,i.kt)("inlineCode",{parentName:"li"},"shared.criticalChunks: ['bootstrap']")," option in `tramvai.json (it is important to load all main application assets in parallel)")),(0,i.kt)("p",null,"Full example (with simplified content):"),(0,i.kt)(o.Z,{mdxType:"Tabs"},(0,i.kt)(l.Z,{value:"index",label:"src/index.ts",default:!0,mdxType:"TabItem"},(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-tsx",metastring:'title="src/index.ts"',title:'"src/index.ts"'},"import(/* webpackChunkName: \"bootstrap\" */ './bootstrap');\n"))),(0,i.kt)(l.Z,{value:"bootstrap",label:"src/bootstrap.ts",default:!0,mdxType:"TabItem"},(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-tsx",metastring:'title="src/bootstrap.ts"',title:'"src/bootstrap.ts"'},"import { createApp } from '@tramvai/core';\nimport { CommonModule } from '@tramvai/module-common';\nimport { SpaRouterModule } from '@tramvai/module-router';\nimport { RenderModule } from '@tramvai/module-render';\nimport { SeoModule } from '@tramvai/module-seo';\nimport { ServerModule } from '@tramvai/module-server';\nimport { ErrorInterceptorModule } from '@tramvai/module-error-interceptor';\n\ncreateApp({\n  name: 'tincoin',\n  modules: [\n    CommonModule,\n    SpaRouterModule,\n    RenderModule,\n    SeoModule,\n    ServerModule,\n    ErrorInterceptorModule,\n  ],\n  providers: [],\n});\n"))),(0,i.kt)(l.Z,{value:"tramvai",label:"tramvai.json",default:!0,mdxType:"TabItem"},(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-json",metastring:'title="tramvai.json"',title:'"tramvai.json"'},'{\n  "$schema": "../../node_modules/@tramvai/cli/schema.json",\n  "projects": {\n    "root-app": {\n      "name": "tincoin",\n      "root": "src",\n      "type": "application",\n      "shared": {\n        "criticalChunks": ["bootstrap"]\n      }\n    },\n  }\n}\n')))),(0,i.kt)("h3",{id:"no-required-version-specified-and-unable-to-automatically-determine-one"},"No required version specified and unable to automatically determine one"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre"},'No required version specified and unable to automatically determine one. Unable to find required version for "@tinkoff/dippy" in description file (/root/app/nested/package/package.json). It need to be in dependencies, devDependencies or peerDependencies.\n')),(0,i.kt)("h4",{id:"reason-1"},"Reason"),(0,i.kt)("p",null,"Module Federation always resolve shared dependency version relative to the closest ",(0,i.kt)("inlineCode",{parentName:"p"},"package.json")," for current module."),(0,i.kt)("p",null,"This error can be caused if:"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},"one of shared dependencies, e.g. ",(0,i.kt)("inlineCode",{parentName:"li"},"@tramvai/core"),", imported in application module, e.g. ",(0,i.kt)("inlineCode",{parentName:"li"},"src/features/package/index.ts")),(0,i.kt)("li",{parentName:"ul"},"this module has own ",(0,i.kt)("inlineCode",{parentName:"li"},"package.json")," - ",(0,i.kt)("inlineCode",{parentName:"li"},"src/features/package/package.json")," for ",(0,i.kt)("a",{parentName:"li",href:"/docs/guides/universal#packagejson"},"code separation between browser and server")),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"package.json")," does not contain this dependency")),(0,i.kt)("p",null,"This is a valid warning and potentially can lead to unexpected behavior in runtime while dependency resolving."),(0,i.kt)("h4",{id:"solution-1"},"Solution"),(0,i.kt)("p",null,"One way to fix this issue is to specify required version in ",(0,i.kt)("inlineCode",{parentName:"p"},"package.json")," dependencies. It is recommended for separated npm packages."),(0,i.kt)("p",null,"But for other cases, it can be hard to manually support valid shared dependencies versions in all ",(0,i.kt)("inlineCode",{parentName:"p"},"package.json")," files."),(0,i.kt)("p",null,"Tramvai can resolve dependency version automatically with experimental parameter ",(0,i.kt)("inlineCode",{parentName:"p"},"experiments.autoResolveSharedRequiredVersions"),":"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-json",metastring:'title="tramvai.json"',title:'"tramvai.json"'},'{\n  "experiments": {\n    "autoResolveSharedRequiredVersions": true\n  }\n}\n')))}f.isMDXComponent=!0}}]);