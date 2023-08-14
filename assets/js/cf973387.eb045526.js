"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[9133],{3905:(e,t,r)=>{r.d(t,{Zo:()=>l,kt:()=>m});var n=r(7294);function o(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function a(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function i(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?a(Object(r),!0).forEach((function(t){o(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):a(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function u(e,t){if(null==e)return{};var r,n,o=function(e,t){if(null==e)return{};var r,n,o={},a=Object.keys(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||(o[r]=e[r]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(o[r]=e[r])}return o}var p=n.createContext({}),s=function(e){var t=n.useContext(p),r=t;return e&&(r="function"==typeof e?e(t):i(i({},t),e)),r},l=function(e){var t=s(e.components);return n.createElement(p.Provider,{value:t},e.children)},c={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},d=n.forwardRef((function(e,t){var r=e.components,o=e.mdxType,a=e.originalType,p=e.parentName,l=u(e,["components","mdxType","originalType","parentName"]),d=s(r),m=o,f=d["".concat(p,".").concat(m)]||d[m]||c[m]||a;return r?n.createElement(f,i(i({ref:t},l),{},{components:r})):n.createElement(f,i({ref:t},l))}));function m(e,t){var r=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var a=r.length,i=new Array(a);i[0]=d;var u={};for(var p in t)hasOwnProperty.call(t,p)&&(u[p]=t[p]);u.originalType=e,u.mdxType="string"==typeof e?e:o,i[1]=u;for(var s=2;s<a;s++)i[s]=r[s];return n.createElement.apply(null,i)}return n.createElement.apply(null,r)}d.displayName="MDXCreateElement"},7205:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>l,contentTitle:()=>p,default:()=>m,frontMatter:()=>u,metadata:()=>s,toc:()=>c});var n=r(7462),o=r(3366),a=(r(7294),r(3905)),i=["components"],u={id:"how-to",title:"How-to"},p=void 0,s={unversionedId:"features/routing/how-to",id:"features/routing/how-to",title:"How-to",description:"Setting when actions should be performed during SPA transitions",source:"@site/tmp-docs/03-features/07-routing/09-how-to.md",sourceDirName:"03-features/07-routing",slug:"/features/routing/how-to",permalink:"/docs/features/routing/how-to",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/get-started/overview.md/tmp-docs/03-features/07-routing/09-how-to.md",tags:[],version:"current",sidebarPosition:9,frontMatter:{id:"how-to",title:"How-to"},sidebar:"sidebar",previous:{title:"Route and Components",permalink:"/docs/features/routing/route-and-components"},next:{title:"Testing",permalink:"/docs/features/routing/testing"}},l={},c=[{value:"Setting when actions should be performed during SPA transitions",id:"setting-when-actions-should-be-performed-during-spa-transitions",level:3},{value:"Load route config from external api",id:"load-route-config-from-external-api",level:3},{value:"How to transform every route befor usage",id:"how-to-transform-every-route-befor-usage",level:3},{value:"App behind proxy",id:"app-behind-proxy",level:3}],d={toc:c};function m(e){var t=e.components,r=(0,o.Z)(e,i);return(0,a.kt)("wrapper",(0,n.Z)({},d,r,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("h3",{id:"setting-when-actions-should-be-performed-during-spa-transitions"},"Setting when actions should be performed during SPA transitions"),(0,a.kt)("p",null,"By default, SPA transitions execute actions after defining the next route and after the actual transition. It is possible to change this behavior and make the execution of actions before a transition itself. Note, that in this case a page will be displayed immediately with new data, but it can cause a noticeable visual lag if actions are taken long enough."),(0,a.kt)("p",null,"Configurable explicitly when using the routing module:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-ts"},"import { createApp } from '@tramvai/core';\nimport { SpaRouterModule } from '@tramvai/module-router';\n\ncreateApp({\n  modules: [\n    SpaRouterModule.forRoot([], {\n      spaActionsMode: 'before', // default is 'after'\n    }),\n  ],\n});\n")),(0,a.kt)("p",null,"or through token ",(0,a.kt)("inlineCode",{parentName:"p"},"ROUTER_SPA_ACTIONS_RUN_MODE_TOKEN"),":"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-ts"},"import { ROUTER_SPA_ACTIONS_RUN_MODE_TOKEN } from '@tramvai/module-router';\nimport { provide } from '@tramvai/core';\n\nconst providers = [\n  // ...,\n  provide({\n    provide: ROUTER_SPA_ACTIONS_RUN_MODE_TOKEN,\n    useValue: 'before',\n  }),\n];\n")),(0,a.kt)("h3",{id:"load-route-config-from-external-api"},"Load route config from external api"),(0,a.kt)("p",null,"Create ",(0,a.kt)("inlineCode",{parentName:"p"},"ROUTE_RESOLVE_TOKEN")," provider, where you need to fetch and return new route object (route will be registered in ",(0,a.kt)("inlineCode",{parentName:"p"},"beforeResolve")," transition hook):"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-ts"},"import { provide } from '@tramvai/core';\nimport { ROUTE_RESOLVE_TOKEN } from '@tramvai/module-router';\n\nconst provider = provide({\n  provide: ROUTE_RESOLVE_TOKEN,\n  // will be executed for every navigation, when corresponding route is not defined in application\n  useValue: async (navigation) => {\n    const route = await fetchRouteFromExternalApi(navigation);\n\n    if (route) {\n      return route;\n    }\n  },\n});\n")),(0,a.kt)("h3",{id:"how-to-transform-every-route-befor-usage"},"How to transform every route befor usage"),(0,a.kt)("p",null,"Create ",(0,a.kt)("inlineCode",{parentName:"p"},"ROUTE_TRANSFORM_TOKEN")," multi provider, where you can change route object directly:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-ts"},"import { provide } from '@tramvai/core';\nimport { ROUTE_TRANSFORM_TOKEN } from '@tramvai/module-router';\n\nconst provider = provide({\n  provide: ROUTE_TRANSFORM_TOKEN,\n  // in this example, paths for every routes will be modified\n  useValue: (route) => {\n    return {\n      ...route,\n      path: `/prefix${route.path}`,\n    };\n  },\n});\n")),(0,a.kt)("h3",{id:"app-behind-proxy"},"App behind proxy"),(0,a.kt)("p",null,"Router doesn't support proxy setup directly. But proxy still can be used with some limitations:"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"setup proxy server to pass requests to app with rewriting request and response paths. (E.g. for ",(0,a.kt)("a",{parentName:"li",href:"http://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_redirect"},"nginx"),")"),(0,a.kt)("li",{parentName:"ul"},"it wont work as expected on spa navigation on client, so only option in this case is use the ",(0,a.kt)("inlineCode",{parentName:"li"},"NoSpaRouter"))))}m.isMDXComponent=!0}}]);