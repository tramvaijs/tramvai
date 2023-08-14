"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[2933],{3905:(e,t,n)=>{n.d(t,{Zo:()=>c,kt:()=>m});var r=n(7294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var s=r.createContext({}),u=function(e){var t=r.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},c=function(e){var t=u(e.components);return r.createElement(s.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},p=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,o=e.originalType,s=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),p=u(n),m=a,f=p["".concat(s,".").concat(m)]||p[m]||d[m]||o;return n?r.createElement(f,i(i({ref:t},c),{},{components:n})):r.createElement(f,i({ref:t},c))}));function m(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=n.length,i=new Array(o);i[0]=p;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l.mdxType="string"==typeof e?e:a,i[1]=l;for(var u=2;u<o;u++)i[u]=n[u];return r.createElement.apply(null,i)}return r.createElement.apply(null,n)}p.displayName="MDXCreateElement"},5162:(e,t,n)=>{n.d(t,{Z:()=>i});var r=n(7294),a=n(6010);const o="tabItem_Ymn6";function i(e){var t=e.children,n=e.hidden,i=e.className;return r.createElement("div",{role:"tabpanel",className:(0,a.Z)(o,i),hidden:n},t)}},4866:(e,t,n)=>{n.d(t,{Z:()=>E});var r=n(7462),a=n(7294),o=n(6010),i=n(2466),l=n(6550),s=n(1980),u=n(7392),c=n(12);function d(e){return function(e){return a.Children.map(e,(function(e){if((0,a.isValidElement)(e)&&"value"in e.props)return e;throw new Error("Docusaurus error: Bad <Tabs> child <"+("string"==typeof e.type?e.type:e.type.name)+'>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.')}))}(e).map((function(e){var t=e.props;return{value:t.value,label:t.label,attributes:t.attributes,default:t.default}}))}function p(e){var t=e.values,n=e.children;return(0,a.useMemo)((function(){var e=null!=t?t:d(n);return function(e){var t=(0,u.l)(e,(function(e,t){return e.value===t.value}));if(t.length>0)throw new Error('Docusaurus error: Duplicate values "'+t.map((function(e){return e.value})).join(", ")+'" found in <Tabs>. Every value needs to be unique.')}(e),e}),[t,n])}function m(e){var t=e.value;return e.tabValues.some((function(e){return e.value===t}))}function f(e){var t=e.queryString,n=void 0!==t&&t,r=e.groupId,o=(0,l.k6)(),i=function(e){var t=e.queryString,n=void 0!==t&&t,r=e.groupId;if("string"==typeof n)return n;if(!1===n)return null;if(!0===n&&!r)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return null!=r?r:null}({queryString:n,groupId:r});return[(0,s._X)(i),(0,a.useCallback)((function(e){if(i){var t=new URLSearchParams(o.location.search);t.set(i,e),o.replace(Object.assign({},o.location,{search:t.toString()}))}}),[i,o])]}function h(e){var t,n,r,o,i=e.defaultValue,l=e.queryString,s=void 0!==l&&l,u=e.groupId,d=p(e),h=(0,a.useState)((function(){return function(e){var t,n=e.defaultValue,r=e.tabValues;if(0===r.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(n){if(!m({value:n,tabValues:r}))throw new Error('Docusaurus error: The <Tabs> has a defaultValue "'+n+'" but none of its children has the corresponding value. Available values are: '+r.map((function(e){return e.value})).join(", ")+". If you intend to show no default tab, use defaultValue={null} instead.");return n}var a=null!=(t=r.find((function(e){return e.default})))?t:r[0];if(!a)throw new Error("Unexpected error: 0 tabValues");return a.value}({defaultValue:i,tabValues:d})})),v=h[0],g=h[1],y=f({queryString:s,groupId:u}),k=y[0],R=y[1],S=(t=function(e){return e?"docusaurus.tab."+e:null}({groupId:u}.groupId),n=(0,c.Nk)(t),r=n[0],o=n[1],[r,(0,a.useCallback)((function(e){t&&o.set(e)}),[t,o])]),E=S[0],b=S[1],T=function(){var e=null!=k?k:E;return m({value:e,tabValues:d})?e:null}();return(0,a.useLayoutEffect)((function(){T&&g(T)}),[T]),{selectedValue:v,selectValue:(0,a.useCallback)((function(e){if(!m({value:e,tabValues:d}))throw new Error("Can't select invalid tab value="+e);g(e),R(e),b(e)}),[R,b,d]),tabValues:d}}var v=n(2389);const g="tabList__CuJ",y="tabItem_LNqP";function k(e){var t=e.className,n=e.block,l=e.selectedValue,s=e.selectValue,u=e.tabValues,c=[],d=(0,i.o5)().blockElementScrollPositionUntilNextRender,p=function(e){var t=e.currentTarget,n=c.indexOf(t),r=u[n].value;r!==l&&(d(t),s(r))},m=function(e){var t,n=null;switch(e.key){case"Enter":p(e);break;case"ArrowRight":var r,a=c.indexOf(e.currentTarget)+1;n=null!=(r=c[a])?r:c[0];break;case"ArrowLeft":var o,i=c.indexOf(e.currentTarget)-1;n=null!=(o=c[i])?o:c[c.length-1]}null==(t=n)||t.focus()};return a.createElement("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,o.Z)("tabs",{"tabs--block":n},t)},u.map((function(e){var t=e.value,n=e.label,i=e.attributes;return a.createElement("li",(0,r.Z)({role:"tab",tabIndex:l===t?0:-1,"aria-selected":l===t,key:t,ref:function(e){return c.push(e)},onKeyDown:m,onClick:p},i,{className:(0,o.Z)("tabs__item",y,null==i?void 0:i.className,{"tabs__item--active":l===t})}),null!=n?n:t)})))}function R(e){var t=e.lazy,n=e.children,r=e.selectedValue;if(n=Array.isArray(n)?n:[n],t){var o=n.find((function(e){return e.props.value===r}));return o?(0,a.cloneElement)(o,{className:"margin-top--md"}):null}return a.createElement("div",{className:"margin-top--md"},n.map((function(e,t){return(0,a.cloneElement)(e,{key:t,hidden:e.props.value!==r})})))}function S(e){var t=h(e);return a.createElement("div",{className:(0,o.Z)("tabs-container",g)},a.createElement(k,(0,r.Z)({},e,t)),a.createElement(R,(0,r.Z)({},e,t)))}function E(e){var t=(0,v.Z)();return a.createElement(S,(0,r.Z)({key:String(t)},e))}},6383:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>c,default:()=>h,frontMatter:()=>u,metadata:()=>d,toc:()=>m});var r=n(7462),a=n(3366),o=(n(7294),n(3905)),i=n(4866),l=n(5162),s=["components"],u={},c=void 0,d={unversionedId:"references/modules/render",id:"references/modules/render",title:"render",description:"Module for rendering React application on the server and in the browser",source:"@site/tmp-docs/references/modules/render.md",sourceDirName:"references/modules",slug:"/references/modules/render",permalink:"/docs/references/modules/render",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/get-started/overview.md/tmp-docs/references/modules/render.md",tags:[],version:"current",frontMatter:{},sidebar:"sidebar",previous:{title:"react-query",permalink:"/docs/references/modules/react-query"},next:{title:"request-limiter",permalink:"/docs/references/modules/request-limiter"}},p={},m=[{value:"Overview",id:"overview",level:2},{value:"Installation",id:"installation",level:2},{value:"Explanation",id:"explanation",level:2},{value:"React Strict Mode",id:"react-strict-mode",level:3},{value:"Application static assets",id:"application-static-assets",level:3},{value:"Automatic resource inlining",id:"automatic-resource-inlining",level:3},{value:"Concept",id:"concept",level:4},{value:"Solution",id:"solution",level:4},{value:"Connection and configuration",id:"connection-and-configuration",level:4},{value:"Peculiarities",id:"peculiarities",level:4},{value:"Automatic resource preloading",id:"automatic-resource-preloading",level:3},{value:"Layouts",id:"layouts",level:3},{value:"How to",id:"how-to",level:2},{value:"How to add assets loading to a page",id:"how-to-add-assets-loading-to-a-page",level:3},{value:"React 18 concurrent features",id:"react-18-concurrent-features",level:3},{value:"Testing",id:"testing",level:3},{value:"Testing render extensions via RENDER_SLOTS or RESOURCES_REGISTRY tokens",id:"testing-render-extensions-via-render_slots-or-resources_registry-tokens",level:4},{value:"Exported tokens",id:"exported-tokens",level:2}],f={toc:m};function h(e){var t=e.components,u=(0,a.Z)(e,s);return(0,o.kt)("wrapper",(0,r.Z)({},f,u,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"Module for rendering React application on the server and in the browser"),(0,o.kt)("h2",{id:"overview"},"Overview"),(0,o.kt)("p",null,(0,o.kt)("img",{alt:"init command",src:n(3121).Z,width:"1061",height:"441"})),(0,o.kt)("p",null,"Module contains the logic for generating HTML pages, starting from getting current page component, and finishing with the rendering result HTML using the ",(0,o.kt)("inlineCode",{parentName:"p"},"@tinkoff/htmlpagebuilder")," library."),(0,o.kt)("p",null,"This module includes code for creating top-level React component with all necessary providers composition, and page and layout components from the current route."),(0,o.kt)("h2",{id:"installation"},"Installation"),(0,o.kt)("p",null,"You need to install ",(0,o.kt)("inlineCode",{parentName:"p"},"@tramvai/module-render")),(0,o.kt)(i.Z,{groupId:"npm2yarn",mdxType:"Tabs"},(0,o.kt)(l.Z,{value:"npm",mdxType:"TabItem"},(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-bash"},"npm install @tramvai/module-render\n"))),(0,o.kt)(l.Z,{value:"yarn",label:"Yarn",mdxType:"TabItem"},(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-bash"},"yarn add @tramvai/module-render\n")))),(0,o.kt)("p",null,"And connect to the project"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-tsx"},"import { createApp } from '@tramvai/core';\nimport { RenderModule } from '@tramvai/module-render';\n\ncreateApp({\n  name: 'tincoin',\n  modules: [RenderModule],\n});\n")),(0,o.kt)("h2",{id:"explanation"},"Explanation"),(0,o.kt)("h3",{id:"react-strict-mode"},"React Strict Mode"),(0,o.kt)("p",null,"More information about Strict Mode can be found in the ",(0,o.kt)("a",{parentName:"p",href:"https://reactjs.org/docs/strict-mode.html"},"official documentation"),"."),(0,o.kt)("p",null,"To set the mode, you must pass the ",(0,o.kt)("inlineCode",{parentName:"p"},"useStrictMode")," parameter when initializing the ",(0,o.kt)("inlineCode",{parentName:"p"},"RenderModule"),"."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-typescript"},"RenderModule.forRoot({ useStrictMode: true });\n")),(0,o.kt)("h3",{id:"application-static-assets"},"Application static assets"),(0,o.kt)("p",null,"For static assets (JS, CSS, fonts, etc.) we create special resources registry module, which allow to provide in DI list of resources, and then render them to specifics slots in final HTML."),(0,o.kt)("p",null,"Example:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-typescript"},"createApp({\n  providers: [\n    {\n      provide: RENDER_SLOTS,\n      multi: true,\n      useValue: [\n        {\n          type: ResourceType.inlineScript, // inlineScript wrap payload in tag <script>\n          slot: ResourceSlot.HEAD_CORE_SCRIPTS, // define position where in HTML will be included resource\n          payload: 'alert(\"render\")',\n        },\n        {\n          type: ResourceType.asIs, // asIs just add payload as a string, without special processing\n          slot: ResourceSlot.BODY_TAIL,\n          payload: '<div>hello from render slots</div>',\n        },\n      ],\n    },\n  ],\n});\n")),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("strong",{parentName:"li"},"type")," - presets for different resources types"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("strong",{parentName:"li"},"slot")," - slot in HTML where resource will be included"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("strong",{parentName:"li"},"payload")," - information that will be rendered")),(0,o.kt)("p",null,(0,o.kt)("details",null,(0,o.kt)("summary",null,"Available slots"),(0,o.kt)("p",null,(0,o.kt)("pre",{parentName:"p"},(0,o.kt)("code",{parentName:"pre",className:"language-typescript"},"export const REACT_RENDER = 'react:render';\nexport const HEAD_PERFORMANCE = 'head:performance';\nexport const HEAD_META = 'head:meta';\nexport const HEAD_POLYFILLS = 'head:polyfills';\nexport const HEAD_CORE_STYLES = 'head:core-styles';\nexport const HEAD_CORE_SCRIPTS = 'head:core-scripts';\nexport const HEAD_DYNAMIC_SCRIPTS = 'head:dynamic-scripts';\nexport const HEAD_ANALYTICS = 'head:analytics';\nexport const HEAD_ICONS = 'head:icons';\nexport const BODY_START = 'body:start';\nexport const BODY_END = 'body:end';\nexport const BODY_TAIL_ANALYTICS = 'body:tail:analytics';\nexport const BODY_TAIL = 'body:tail';\n\n"))))),(0,o.kt)("p",null,(0,o.kt)("details",null,(0,o.kt)("summary",null,"Layout of slots in the HTML page"),(0,o.kt)("p",null,(0,o.kt)("pre",{parentName:"p"},(0,o.kt)("code",{parentName:"pre",className:"language-typescript"},"import type { StaticDescriptor, DynamicDescriptor } from '@tinkoff/htmlpagebuilder';\nimport { dynamicRender, staticRender } from '@tinkoff/htmlpagebuilder';\nimport { ResourceSlot } from '@tramvai/tokens-render';\nimport { formatAttributes } from './utils';\n\nconst {\n  REACT_RENDER,\n  HEAD_CORE_SCRIPTS,\n  HEAD_DYNAMIC_SCRIPTS,\n  HEAD_META,\n  HEAD_POLYFILLS,\n  HEAD_CORE_STYLES,\n  HEAD_PERFORMANCE,\n  HEAD_ANALYTICS,\n  BODY_START,\n  BODY_END,\n  HEAD_ICONS,\n  BODY_TAIL_ANALYTICS,\n  BODY_TAIL,\n} = ResourceSlot;\n\nexport const htmlPageSchemaFactory = ({\n  htmlAttrs,\n}): Array<StaticDescriptor | DynamicDescriptor> => {\n  return [\n    staticRender('<!DOCTYPE html>'),\n    staticRender(`<html ${formatAttributes(htmlAttrs, 'html')}>`),\n\n    staticRender('<head>'),\n    staticRender('<meta charset=\"UTF-8\">'),\n    dynamicRender(HEAD_META),\n    dynamicRender(HEAD_PERFORMANCE),\n    dynamicRender(HEAD_CORE_STYLES),\n    dynamicRender(HEAD_POLYFILLS),\n    dynamicRender(HEAD_DYNAMIC_SCRIPTS),\n    dynamicRender(HEAD_CORE_SCRIPTS),\n    dynamicRender(HEAD_ANALYTICS),\n    dynamicRender(HEAD_ICONS),\n    staticRender('</head>'),\n    staticRender(`<body ${formatAttributes(htmlAttrs, 'body')}>`),\n    dynamicRender(BODY_START),\n    // react app\n    dynamicRender(REACT_RENDER),\n    dynamicRender(BODY_END),\n    dynamicRender(BODY_TAIL_ANALYTICS),\n    dynamicRender(BODY_TAIL),\n    staticRender('</body>'),\n    staticRender('</html>'),\n  ];\n};\n\n"))))),(0,o.kt)("p",null,(0,o.kt)("a",{parentName:"p",href:"#How-to-add-assets-loading-to-a-page"},"How to add assets loading to a page")),(0,o.kt)("h3",{id:"automatic-resource-inlining"},"Automatic resource inlining"),(0,o.kt)("h4",{id:"concept"},"Concept"),(0,o.kt)("p",null,"A large number of resource files creates problems when loading the page, because the browser has to create a lot of connections to small files"),(0,o.kt)("h4",{id:"solution"},"Solution"),(0,o.kt)("p",null,"To optimize page loading, we've added the ability to include some resources directly in the incoming HTML from the server.\nTo avoid inlining everything at all, we've added the ability to set an upper limit for file size."),(0,o.kt)("h4",{id:"connection-and-configuration"},"Connection and configuration"),(0,o.kt)("p",null,"Since version ",(0,o.kt)("inlineCode",{parentName:"p"},"0.60.7")," inlining for styles is enabled by default, CSS files smaller than 40kb before gzip (+-10kb after gzip) are inlined.\nTo override these settings, add a provider specifying types of resources to be inlined (styles and/or scripts) and an upper limit for file size (in bytes, before gzip):"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-js"},"import { RESOURCE_INLINE_OPTIONS } from '@tramvai/tokens-render';\nimport { ResourceType } from '@tramvai/tokens-render';\nimport { provide } from '@tramvai/core';\n\nprovide({\n  provide: RESOURCE_INLINE_OPTIONS,\n  useValue: {\n    types: [ResourceType.script, ResourceType.style], // Turn on for a CSS and JS files\n    threshold: 1024, // 1kb unzipped\n  },\n}),\n")),(0,o.kt)("h4",{id:"peculiarities"},"Peculiarities"),(0,o.kt)("p",null,"All scripts and styles (depending on the settings) registered through the ",(0,o.kt)("inlineCode",{parentName:"p"},"ResourcesRegistry")," are inlined."),(0,o.kt)("p",null,"File uploading to the server occurs in lazy mode, asynchronously.\nThis means that there will be no inlining when the page first loads.\nIt also means that there is no extra waiting for resources to load on the server side.\nOnce the file is in the cache it will be inline.\nThe cache has a TTL of 30 minutes and there is no resetting of the cache."),(0,o.kt)("h3",{id:"automatic-resource-preloading"},"Automatic resource preloading"),(0,o.kt)("p",null,"To speed up data loading, we've added a preloading system for resources and asynchronous chunks, which works according to the following scenario:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"After rendering the application, we get information about all the CSS, JS bundles and asynchronous chunks used in the application"),(0,o.kt)("li",{parentName:"ul"},"Next we add all the CSS to the ",(0,o.kt)("strong",{parentName:"li"},"preload")," tag and add onload event on them. We need to load the blocking resources as quickly as possible."),(0,o.kt)("li",{parentName:"ul"},"When loading any CSS file, onload event will be fired (only once time) and add all ",(0,o.kt)("strong",{parentName:"li"},"preload")," tags to the necessary JS files")),(0,o.kt)("h3",{id:"layouts"},"Layouts"),(0,o.kt)("p",null,(0,o.kt)("a",{parentName:"p",href:"/docs/features/layouts"},"Actual documentation")),(0,o.kt)("h2",{id:"how-to"},"How to"),(0,o.kt)("h3",{id:"how-to-add-assets-loading-to-a-page"},"How to add assets loading to a page"),(0,o.kt)("p",null,"There are 2 main ways how you can add resources to your application"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"The ",(0,o.kt)("inlineCode",{parentName:"li"},"RENDER_SLOTS")," token, where you can pass a list of resources, such as HTML markup, inline scripts, script tag"),(0,o.kt)("li",{parentName:"ul"},"Token ",(0,o.kt)("inlineCode",{parentName:"li"},"RESOURCES_REGISTRY")," to get the resource manager, and register the desired resources manually")),(0,o.kt)("p",null,"Example:"),(0,o.kt)("p",null,(0,o.kt)("details",null,(0,o.kt)("summary",null,"Application example"),(0,o.kt)("p",null,(0,o.kt)("pre",{parentName:"p"},(0,o.kt)("code",{parentName:"pre",className:"language-typescript"},"import React from 'react';\nimport { createApp, createBundle, commandLineListTokens } from '@tramvai/core';\nimport {\n  RENDER_SLOTS,\n  RESOURCES_REGISTRY,\n  ResourceType,\n  ResourceSlot,\n} from '@tramvai/module-render';\nimport { modules } from '../common';\n\nfunction Page() {\n  return <div>Render</div>;\n}\n\nconst bundle = createBundle({\n  name: 'mainDefault',\n  components: {\n    pageDefault: Page,\n  },\n});\n\ncreateApp({\n  name: 'render-add-resources',\n  modules: [...modules],\n  providers: [\n    {\n      // If you want to add your own resources (scripts, styles, images) for loading,\n      // you can use the provider RENDER_SLOTS to add the necessary assets,\n      // all this will then be used in the RenderModule and inserted into HTML\n      provide: RENDER_SLOTS,\n      multi: true,\n      useValue: [\n        {\n          type: ResourceType.inlineScript, // inlineScript wrap payload in tag <script>\n          slot: ResourceSlot.HEAD_CORE_SCRIPTS, // define position where in HTML will be included resource\n          payload: 'alert(\"render\")',\n        },\n        {\n          type: ResourceType.asIs, // asIs just add payload as a string, without special processing\n          slot: ResourceSlot.BODY_TAIL,\n          payload: '<div>hello from render slots</div>',\n        },\n      ],\n    },\n    {\n      provide: commandLineListTokens.resolveUserDeps,\n      multi: true,\n      // You can also add resources separately via DI and the RESOURCES_REGISTRY token\n      useFactory: ({ resourcesRegistry }) => {\n        return function addMyScripts() {\n          resourcesRegistry.register({\n            type: ResourceType.script, // script will create new script tag with src equal to payload\n            slot: ResourceSlot.HEAD_ANALYTICS, // define position where in HTML will be included resource\n            payload: './some-script.js',\n          });\n        };\n      },\n      deps: {\n        resourcesRegistry: RESOURCES_REGISTRY,\n      },\n    },\n  ],\n  bundles: {\n    mainDefault: () => Promise.resolve({ default: bundle }),\n  },\n});\n\n"))))),(0,o.kt)("h3",{id:"react-18-concurrent-features"},"React 18 concurrent features"),(0,o.kt)("p",null,(0,o.kt)("inlineCode",{parentName:"p"},"tramvai")," will automatically detect React version, and use hydrateRoot API on the client for 18+ version."),(0,o.kt)("p",null,"Before switch to React 18, we recommended to activate ",(0,o.kt)("a",{parentName:"p",href:"https://reactjs.org/docs/strict-mode.html"},"Strict Mode")," in your application.\nIn Strict Mode which React warns about using the legacy API."),(0,o.kt)("p",null,"To connect, you must configure the ",(0,o.kt)("inlineCode",{parentName:"p"},"RenderModule"),":"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-js"},"modules: [\n  RenderModule.forRoot({ useStrictMode: true })\n]\n")),(0,o.kt)("h3",{id:"testing"},"Testing"),(0,o.kt)("h4",{id:"testing-render-extensions-via-render_slots-or-resources_registry-tokens"},"Testing render extensions via RENDER_SLOTS or RESOURCES_REGISTRY tokens"),(0,o.kt)("p",null,"If you have a module or providers that define ",(0,o.kt)("inlineCode",{parentName:"p"},"RENDER_SLOTS")," or use ",(0,o.kt)("inlineCode",{parentName:"p"},"RESOURCES_REGISTRY"),", it is convenient to use special utilities to test them separately"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},'import {\n  RENDER_SLOTS,\n  ResourceSlot,\n  RESOURCES_REGISTRY,\n  ResourceType,\n} from \'@tramvai/tokens-render\';\nimport { testPageResources } from \'@tramvai/module-render/tests\';\nimport { CustomModule } from \'./module\';\nimport { providers } from \'./providers\';\n\ndescribe(\'testPageResources\', () => {\n  it(\'modules\', async () => {\n    const { render } = testPageResources({\n      modules: [CustomModule],\n    });\n    const { head } = render();\n\n    expect(head).toMatchInlineSnapshot(`\n"\n<meta charset=\\\\"UTF-8\\\\">\n<script>console.log(\\\\"from module!\\\\")<\/script>\n"\n`);\n  });\n\n  it(\'providers\', async () => {\n    const { render, runLine } = testPageResources({\n      providers,\n    });\n\n    expect(render().body).toMatchInlineSnapshot(`\n"\n"\n  `);\n\n    await runLine(commandLineListTokens.resolvePageDeps);\n\n    expect(render().body).toMatchInlineSnapshot(`\n"\n<script defer=\\\\"defer\\\\" charset=\\\\"utf-8\\\\" crossorigin=\\\\"anonymous\\\\" src=\\\\"https://scripts.org/script.js\\\\"><\/script>\n<span>I\\`m body!!!</span>\n"\n  `);\n  });\n});\n')),(0,o.kt)("h2",{id:"exported-tokens"},"Exported tokens"),(0,o.kt)("p",null,(0,o.kt)("a",{parentName:"p",href:"/docs/references/tokens/render"},"link")))}h.isMDXComponent=!0},3121:(e,t,n)=>{n.d(t,{Z:()=>r});const r=n.p+"assets/images/render-module.drawio-135c5da3c2151639eead38825438ab61.svg"}}]);