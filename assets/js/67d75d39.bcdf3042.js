"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[9693],{3905:(e,a,t)=>{t.d(a,{Zo:()=>s,kt:()=>m});var n=t(7294);function r(e,a,t){return a in e?Object.defineProperty(e,a,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[a]=t,e}function o(e,a){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);a&&(n=n.filter((function(a){return Object.getOwnPropertyDescriptor(e,a).enumerable}))),t.push.apply(t,n)}return t}function l(e){for(var a=1;a<arguments.length;a++){var t=null!=arguments[a]?arguments[a]:{};a%2?o(Object(t),!0).forEach((function(a){r(e,a,t[a])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):o(Object(t)).forEach((function(a){Object.defineProperty(e,a,Object.getOwnPropertyDescriptor(t,a))}))}return e}function i(e,a){if(null==e)return{};var t,n,r=function(e,a){if(null==e)return{};var t,n,r={},o=Object.keys(e);for(n=0;n<o.length;n++)t=o[n],a.indexOf(t)>=0||(r[t]=e[t]);return r}(e,a);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)t=o[n],a.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(r[t]=e[t])}return r}var p=n.createContext({}),d=function(e){var a=n.useContext(p),t=a;return e&&(t="function"==typeof e?e(a):l(l({},a),e)),t},s=function(e){var a=d(e.components);return n.createElement(p.Provider,{value:a},e.children)},c={inlineCode:"code",wrapper:function(e){var a=e.children;return n.createElement(n.Fragment,{},a)}},u=n.forwardRef((function(e,a){var t=e.components,r=e.mdxType,o=e.originalType,p=e.parentName,s=i(e,["components","mdxType","originalType","parentName"]),u=d(t),m=r,g=u["".concat(p,".").concat(m)]||u[m]||c[m]||o;return t?n.createElement(g,l(l({ref:a},s),{},{components:t})):n.createElement(g,l({ref:a},s))}));function m(e,a){var t=arguments,r=a&&a.mdxType;if("string"==typeof e||r){var o=t.length,l=new Array(o);l[0]=u;var i={};for(var p in a)hasOwnProperty.call(a,p)&&(i[p]=a[p]);i.originalType=e,i.mdxType="string"==typeof e?e:r,l[1]=i;for(var d=2;d<o;d++)l[d]=t[d];return n.createElement.apply(null,l)}return n.createElement.apply(null,t)}u.displayName="MDXCreateElement"},9524:(e,a,t)=>{t.r(a),t.d(a,{assets:()=>s,contentTitle:()=>p,default:()=>m,frontMatter:()=>i,metadata:()=>d,toc:()=>c});var n=t(7462),r=t(3366),o=(t(7294),t(3905)),l=["components"],i={id:"page-render-mode",title:"Page Render Mode"},p=void 0,d={unversionedId:"features/rendering/page-render-mode",id:"features/rendering/page-render-mode",title:"Page Render Mode",description:"Explanation",source:"@site/tmp-docs/03-features/010-rendering/02-page-render-mode.md",sourceDirName:"03-features/010-rendering",slug:"/features/rendering/page-render-mode",permalink:"/docs/features/rendering/page-render-mode",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/tmp-docs/03-features/010-rendering/02-page-render-mode.md",tags:[],version:"current",sidebarPosition:2,frontMatter:{id:"page-render-mode",title:"Page Render Mode"},sidebar:"sidebar",previous:{title:"Server-Side Rendering",permalink:"/docs/features/rendering/ssr"},next:{title:"Hydration",permalink:"/docs/features/rendering/hydration"}},s={},c=[{value:"Explanation",id:"explanation",level:2},{value:"SSR mode",id:"ssr-mode",level:3},{value:"Static mode",id:"static-mode",level:3},{value:"Client mode",id:"client-mode",level:3},{value:"Usage",id:"usage",level:2},{value:"Installation",id:"installation",level:3},{value:"Configuration",id:"configuration",level:3},{value:"Default mode",id:"default-mode",level:4},{value:"Page-level mode",id:"page-level-mode",level:4},{value:"Client mode fallback",id:"client-mode-fallback",level:3},{value:"Default fallback",id:"default-fallback",level:4},{value:"Page-level fallback",id:"page-level-fallback",level:4},{value:"Static mode options",id:"static-mode-options",level:3},{value:"How-to",id:"how-to",level:2},{value:"How to prevent Header and Footer Rendering",id:"how-to-prevent-header-and-footer-rendering",level:3},{value:"How to clear static page cache",id:"how-to-clear-static-page-cache",level:3},{value:"How to disable background requests for static pages",id:"how-to-disable-background-requests-for-static-pages",level:3},{value:"How to enable 5xx requests caching for static pages",id:"how-to-enable-5xx-requests-caching-for-static-pages",level:3},{value:"How ti change page render mode at runtime",id:"how-ti-change-page-render-mode-at-runtime",level:3},{value:"Troubleshooting",id:"troubleshooting",level:2},{value:"Fallback name conflicts",id:"fallback-name-conflicts",level:3}],u={toc:c};function m(e){var a=e.components,i=(0,r.Z)(e,l);return(0,o.kt)("wrapper",(0,n.Z)({},u,i,{components:a,mdxType:"MDXLayout"}),(0,o.kt)("h2",{id:"explanation"},"Explanation"),(0,o.kt)("p",null,"To be able to better handle high loads, ",(0,o.kt)("inlineCode",{parentName:"p"},"tramvai")," provides a few additional page render modes, which allow the server to do less work when generating HTML - ",(0,o.kt)("a",{parentName:"p",href:"#static-mode"},"static")," and ",(0,o.kt)("a",{parentName:"p",href:"#client-mode"},"client")," modes."),(0,o.kt)("h3",{id:"ssr-mode"},"SSR mode"),(0,o.kt)("p",null,"SSR mode - ",(0,o.kt)("inlineCode",{parentName:"p"},"ssr")," - provides default ",(0,o.kt)("inlineCode",{parentName:"p"},"tramvai")," behaviour, ",(0,o.kt)("a",{parentName:"p",href:"/docs/features/rendering/ssr"},"render full page on server-side"),"."),(0,o.kt)("h3",{id:"static-mode"},"Static mode"),(0,o.kt)("p",null,"Static mode - ",(0,o.kt)("inlineCode",{parentName:"p"},"static")," - in-memory cache for page HTML markup."),(0,o.kt)("p",null,"All requests for application pages will trigger background unpersonalized request for the same page, without query parameters and cookies, and result will be cached."),(0,o.kt)("p",null,"5xx responses will not be cached by default, but this behaviour are configurable."),(0,o.kt)("p",null,"Any responses from cache will have ",(0,o.kt)("inlineCode",{parentName:"p"},"X-Tramvai-Static-Page-From-Cache")," header."),(0,o.kt)("p",null,"Additional metric with name ",(0,o.kt)("inlineCode",{parentName:"p"},"static_pages_cache_hit")," will be added with cache hits counter."),(0,o.kt)("p",null,"Response from cache will be sent from ",(0,o.kt)("inlineCode",{parentName:"p"},"customer_start")," command line, and next lines execution will be aborted."),(0,o.kt)("p",null,"Cache will be segmented by page path and method, request hostname, device type and browser (modern or default group)."),(0,o.kt)("p",null,"All headers will be cached and sended with response, except ",(0,o.kt)("inlineCode",{parentName:"p"},"Set-Cookie")," - this header will be always fresh, from current response."),(0,o.kt)("p",null,(0,o.kt)("img",{alt:"Diagram",src:t(9245).Z,width:"901",height:"391"})),(0,o.kt)("h3",{id:"client-mode"},"Client mode"),(0,o.kt)("p",null,"Client mode - ",(0,o.kt)("inlineCode",{parentName:"p"},"client")," - render only fallback for page component, then render full page on browser, after hydration."),(0,o.kt)("p",null,"This mode can significally improve server rendering performance, but not recommended for pages with high SEO impact."),(0,o.kt)("p",null,"By default, ",(0,o.kt)("a",{parentName:"p",href:"/docs/features/layouts#header-and-footer"},"Header and Footer")," will be rendered as usual."),(0,o.kt)("h2",{id:"usage"},"Usage"),(0,o.kt)("h3",{id:"installation"},"Installation"),(0,o.kt)("p",null,"If you want to change between different rendering modes, you need to install ",(0,o.kt)("inlineCode",{parentName:"p"},"@tramvai/module-page-render-mode"),". By default, this module connection has no changes, because default rendering mode is ",(0,o.kt)("inlineCode",{parentName:"p"},"ssr"),". You can change this mode for all pages or for specific pages only."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-bash"},"npx tramvai add @tramvai/module-page-render-mode\n")),(0,o.kt)("p",null,"And connect in the project"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-tsx"},"import { createApp } from '@tramvai/core';\nimport { PageRenderModeModule } from '@tramvai/module-page-render-mode';\n\ncreateApp({\n  name: 'tincoin',\n  modules: [PageRenderModeModule],\n});\n")),(0,o.kt)("h3",{id:"configuration"},"Configuration"),(0,o.kt)("p",null,"Default rendering mode is ",(0,o.kt)("inlineCode",{parentName:"p"},"ssr")," for all pages."),(0,o.kt)("h4",{id:"default-mode"},"Default mode"),(0,o.kt)("p",null,"For changing global rendering mode use token ",(0,o.kt)("inlineCode",{parentName:"p"},"TRAMVAI_RENDER_MODE")," from ",(0,o.kt)("inlineCode",{parentName:"p"},"@tramvai/tokens-render"),":"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},"import { TRAMVAI_RENDER_MODE } from '@tramvai/tokens-render';\n\nconst provider = {\n  provide: TRAMVAI_RENDER_MODE,\n  useValue: 'client',\n};\n")),(0,o.kt)("h4",{id:"page-level-mode"},"Page-level mode"),(0,o.kt)("p",null,"For specific pages available two options:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("p",{parentName:"li"},"setting mode in page component static property:"),(0,o.kt)("pre",{parentName:"li"},(0,o.kt)("code",{parentName:"pre",className:"language-tsx"},"const PageComponent = () => <div>Page</div>;\n\nPageComponent.renderMode = 'client';\n\nexport default PageComponent;\n"))),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("p",{parentName:"li"},"setting mode in route config:"),(0,o.kt)("pre",{parentName:"li"},(0,o.kt)("code",{parentName:"pre",className:"language-ts"},"const routes = [\n  {\n    name: 'main',\n    path: '/',\n    config: {\n      pageComponent: '@/pages/index',\n      pageRenderMode: 'client',\n    },\n  },\n];\n")))),(0,o.kt)("h3",{id:"client-mode-fallback"},"Client mode fallback"),(0,o.kt)("p",null,"Standard behaviour for SPA applications - render some fallback with spinner or page skeleton before application was rendered. You can set default fallback for all pages with ",(0,o.kt)("inlineCode",{parentName:"p"},"client")," render mode, or only for specific pages."),(0,o.kt)("h4",{id:"default-fallback"},"Default fallback"),(0,o.kt)("p",null,"For setting default fallback, use token ",(0,o.kt)("inlineCode",{parentName:"p"},"PAGE_RENDER_DEFAULT_FALLBACK_COMPONENT"),":"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-tsx"},"import { PAGE_RENDER_DEFAULT_FALLBACK_COMPONENT } from '@tramvai/module-page-render-mode';\n\nconst DefaultFallback = () => <div>Loading...</div>;\n\nconst provider = {\n  provide: PAGE_RENDER_DEFAULT_FALLBACK_COMPONENT,\n  useValue: DefaultFallback,\n};\n")),(0,o.kt)("h4",{id:"page-level-fallback"},"Page-level fallback"),(0,o.kt)("p",null,"For specific pages available few options:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("p",{parentName:"li"},"add fallback to page component static property, use name ",(0,o.kt)("inlineCode",{parentName:"p"},"pageRenderFallbackDefault"),":"),(0,o.kt)("pre",{parentName:"li"},(0,o.kt)("code",{parentName:"pre",className:"language-tsx"},"import { PageComponent } from '@tramvai/react';\n\nconst Page: PageComponent = () => <div>Page</div>;\n\nconst PageFallback = () => <div>Loading...</div>;\n\nPage.components = {\n  pageRenderFallbackDefault: PageFallback,\n};\n\nexport default Page;\n"))),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("p",{parentName:"li"},"and you can add fallback in route config, use key ",(0,o.kt)("inlineCode",{parentName:"p"},"pageRenderFallbackComponent")," with any fallback name you provided in bundle or page component:"),(0,o.kt)("pre",{parentName:"li"},(0,o.kt)("code",{parentName:"pre",className:"language-ts"},"const routes = [\n  {\n    name: 'main',\n    path: '/',\n    config: {\n      pageComponent: '@/pages/index',\n      pageRenderFallbackComponent: '@/pages/fallback',\n    },\n  },\n];\n")))),(0,o.kt)("h3",{id:"static-mode-options"},"Static mode options"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"ttl")," parameter spicified page response cache time. Default - ",(0,o.kt)("inlineCode",{parentName:"li"},"60000")," ms."),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"maxSize")," parameter spicified maximum cached urls count (can be up to 4 pages per url for different segments). Default - ",(0,o.kt)("inlineCode",{parentName:"li"},"1000"),". For apps with heavy HTML and a lot of urls memory usage can be increased significantly.")),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},"const provider = {\n  provide: STATIC_PAGES_OPTIONS_TOKEN,\n  useValue: {\n    ttl: 60 * 1000,\n    maxSize: 1000,\n  },\n};\n")),(0,o.kt)("h2",{id:"how-to"},"How-to"),(0,o.kt)("h3",{id:"how-to-prevent-header-and-footer-rendering"},"How to prevent Header and Footer Rendering"),(0,o.kt)("p",null,"By default, Header and Footer will be rendered as usual, because this module provide Page component wrapper. If you want to make less work on server, use token ",(0,o.kt)("inlineCode",{parentName:"p"},"PAGE_RENDER_WRAPPER_TYPE")," with ",(0,o.kt)("inlineCode",{parentName:"p"},"layout")," or ",(0,o.kt)("inlineCode",{parentName:"p"},"content")," value, e.g.:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},"const providers = [\n  {\n    provide: PAGE_RENDER_WRAPPER_TYPE,\n    useValue: 'layout',\n  },\n];\n")),(0,o.kt)("p",null,"With ",(0,o.kt)("inlineCode",{parentName:"p"},"client")," rendering mode, all layout will be rendered in browser."),(0,o.kt)("p",null,(0,o.kt)("inlineCode",{parentName:"p"},"PAGE_RENDER_WRAPPER_TYPE")," value will be passed to ",(0,o.kt)("a",{parentName:"p",href:"/docs/references/modules/render#basic-layout"},"default layout"),", where the library ",(0,o.kt)("a",{parentName:"p",href:"/docs/references/libs/tinkoff-layout#wrappers"},"@tinkoff/layout-factory")," is used."),(0,o.kt)("h3",{id:"how-to-clear-static-page-cache"},"How to clear static page cache"),(0,o.kt)("p",null,"If you want to clear all cache, make POST request to special papi endpoint without body - ",(0,o.kt)("inlineCode",{parentName:"p"},"/{appName}/private/papi/revalidate/"),"."),(0,o.kt)("p",null,"For specific page, just add ",(0,o.kt)("inlineCode",{parentName:"p"},"path")," parameter to request body, e.g. for ",(0,o.kt)("inlineCode",{parentName:"p"},"/static/")," - ",(0,o.kt)("inlineCode",{parentName:"p"},"{ path: 'static' }"),"."),(0,o.kt)("h3",{id:"how-to-disable-background-requests-for-static-pages"},"How to disable background requests for static pages"),(0,o.kt)("p",null,"For example, you want to cache only requests without cookies, without extra requests into the application:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},"const provider = {\n  provide: STATIC_PAGES_BACKGROUND_FETCH_ENABLED,\n  useValue: () => false,\n};\n")),(0,o.kt)("h3",{id:"how-to-enable-5xx-requests-caching-for-static-pages"},"How to enable 5xx requests caching for static pages"),(0,o.kt)("p",null,"For example, if 5xx responses are expected behaviour:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},"const provider = {\n  provide: STATIC_PAGES_CACHE_5xx_RESPONSE,\n  useValue: () => true,\n};\n")),(0,o.kt)("h3",{id:"how-ti-change-page-render-mode-at-runtime"},"How ti change page render mode at runtime"),(0,o.kt)("p",null,"You can provide function to ",(0,o.kt)("inlineCode",{parentName:"p"},"TRAMVAI_RENDER_MODE")," token:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},"const provider = {\n  provide: TRAMVAI_RENDER_MODE,\n  useFactory: ({ cookieManager }) => {\n    return () => cookieManager.get('some-auth-cookie') ? 'client' : 'ssr';\n  },\n  deps: {\n    cookieManager: COOKIE_MANAGER_TOKEN,\n  },\n};\n")),(0,o.kt)("h2",{id:"troubleshooting"},"Troubleshooting"),(0,o.kt)("h3",{id:"fallback-name-conflicts"},"Fallback name conflicts"),(0,o.kt)("p",null,"You might get a potential conflict between existing components and render fallback component names - ",(0,o.kt)("inlineCode",{parentName:"p"},"pageRenderFallbackComponent")," and ",(0,o.kt)("inlineCode",{parentName:"p"},"pageRenderFallbackDefault"),". To avoid these issues, just change fallback name prefix using token ",(0,o.kt)("inlineCode",{parentName:"p"},"PAGE_RENDER_FALLBACK_COMPONENT_PREFIX"),":"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},"import { PAGE_RENDER_FALLBACK_COMPONENT_PREFIX } from '@tramvai/module-page-render-mode';\n\nconst provider = {\n  provide: PAGE_RENDER_FALLBACK_COMPONENT_PREFIX,\n  useValue: 'myOwnRenderFallback',\n};\n")))}m.isMDXComponent=!0},9245:(e,a,t)=>{t.d(a,{Z:()=>n});const n=t.p+"assets/images/static-mode.drawio-fad17c03dc6087c9914497e948b68444.svg"}}]);