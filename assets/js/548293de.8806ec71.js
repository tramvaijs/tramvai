"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[5354],{3905:function(e,t,a){a.d(t,{Zo:function(){return s},kt:function(){return c}});var n=a(7294);function o(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function i(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function r(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?i(Object(a),!0).forEach((function(t){o(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function l(e,t){if(null==e)return{};var a,n,o=function(e,t){if(null==e)return{};var a,n,o={},i=Object.keys(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||(o[a]=e[a]);return o}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(o[a]=e[a])}return o}var m=n.createContext({}),p=function(e){var t=n.useContext(m),a=t;return e&&(a="function"==typeof e?e(t):r(r({},t),e)),a},s=function(e){var t=p(e.components);return n.createElement(m.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},d=n.forwardRef((function(e,t){var a=e.components,o=e.mdxType,i=e.originalType,m=e.parentName,s=l(e,["components","mdxType","originalType","parentName"]),d=p(a),c=o,k=d["".concat(m,".").concat(c)]||d[c]||u[c]||i;return a?n.createElement(k,r(r({ref:t},s),{},{components:a})):n.createElement(k,r({ref:t},s))}));function c(e,t){var a=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var i=a.length,r=new Array(i);r[0]=d;var l={};for(var m in t)hasOwnProperty.call(t,m)&&(l[m]=t[m]);l.originalType=e,l.mdxType="string"==typeof e?e:o,r[1]=l;for(var p=2;p<i;p++)r[p]=a[p];return n.createElement.apply(null,r)}return n.createElement.apply(null,a)}d.displayName="MDXCreateElement"},8480:function(e,t,a){a.r(t),a.d(t,{assets:function(){return m},contentTitle:function(){return r},default:function(){return u},frontMatter:function(){return i},metadata:function(){return l},toc:function(){return p}});var n=a(7462),o=(a(7294),a(3905));const i={id:"seo",title:"SEO and Meta"},r=void 0,l={unversionedId:"features/seo",id:"features/seo",title:"SEO and Meta",description:"Explanation",source:"@site/tmp-docs/03-features/013-seo.md",sourceDirName:"03-features",slug:"/features/seo",permalink:"/docs/features/seo",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/tmp-docs/03-features/013-seo.md",tags:[],version:"current",sidebarPosition:13,frontMatter:{id:"seo",title:"SEO and Meta"},sidebar:"sidebar",previous:{title:"Images and Fonts",permalink:"/docs/features/assets"},next:{title:"Logging",permalink:"/docs/features/monitoring/logging"}},m={},p=[{value:"Explanation",id:"explanation",level:2},{value:"Meta tags",id:"meta-tags",level:3},{value:"Data sources",id:"data-sources",level:3},{value:"Meta priority",id:"meta-priority",level:3},{value:"Usage",id:"usage",level:2},{value:"Installation",id:"installation",level:3},{value:"Default meta",id:"default-meta",level:3},{value:"Route meta",id:"route-meta",level:3},{value:"Custom data source",id:"custom-data-source",level:3},{value:"Dynamic meta",id:"dynamic-meta",level:3},{value:"JSON-LD",id:"json-ld",level:3},{value:"How-to",id:"how-to",level:2},{value:"How to set a custom meta tag?",id:"how-to-set-a-custom-meta-tag",level:3},{value:"How-to remove meta tag?",id:"how-to-remove-meta-tag",level:3},{value:"How to update meta by user interaction?",id:"how-to-update-meta-by-user-interaction",level:3},{value:"References",id:"references",level:2},{value:"Meta tags list",id:"meta-tags-list",level:3},{value:"Custom meta tags",id:"custom-meta-tags",level:3},{value:"Testing",id:"testing",level:2},{value:"Testing work with META_UPDATER_TOKEN and META_DEFAULT_TOKEN",id:"testing-work-with-meta_updater_token-and-meta_default_token",level:3},{value:"Known issues",id:"known-issues",level:2},{value:"Googlebot crawls and tries to index all links within your HTML",id:"googlebot-crawls-and-tries-to-index-all-links-within-your-html",level:3}],s={toc:p};function u(e){let{components:t,...a}=e;return(0,o.kt)("wrapper",(0,n.Z)({},s,a,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("h2",{id:"explanation"},"Explanation"),(0,o.kt)("p",null,"A separate module responsible for meta tags generation - ",(0,o.kt)("inlineCode",{parentName:"p"},"SeoModule")," from ",(0,o.kt)("inlineCode",{parentName:"p"},"@tramvai/module-seo")," package."),(0,o.kt)("p",null,(0,o.kt)("a",{parentName:"p",href:"#data-sources"},"Data for meta tags")," can be defined globally, for the all application pages, or only for a specific routes."),(0,o.kt)("p",null,"All meta have a ",(0,o.kt)("a",{parentName:"p",href:"#meta-priority"},"priority")," and the data with highest priority will be used."),(0,o.kt)("h3",{id:"meta-tags"},"Meta tags"),(0,o.kt)("p",null,"Meta tags in ",(0,o.kt)("inlineCode",{parentName:"p"},"tramvai")," application represented as a ",(0,o.kt)("inlineCode",{parentName:"p"},"key: value")," object, where key is a name of the meta tag from ",(0,o.kt)("a",{parentName:"p",href:"#meta-tags-list"},"predefined list")),(0,o.kt)("h3",{id:"data-sources"},"Data sources"),(0,o.kt)("p",null,"Meta tags will be generated per every page request, and based on different data sources:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("a",{parentName:"li",href:"#default-meta"},"Default meta pack"),", static and will be used for all pages"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("a",{parentName:"li",href:"#route-meta"},"Meta from route configuration"),", static and will be used for specific route"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("a",{parentName:"li",href:"#custom-data-source"},"Custom data source"),", when you need to get data from different places (services, stores, etc.)"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("a",{parentName:"li",href:"#dynamic-meta"},"Dynamic meta"),", can be changed in ",(0,o.kt)("a",{parentName:"li",href:"/docs/features/data-fetching/action"},"Actions")," or ",(0,o.kt)("a",{parentName:"li",href:"/docs/features/app-lifecycle"},"CommandLineRunner steps")),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("a",{parentName:"li",href:"#jsonld"},"JSON-LD"),", sets up only for server requests")),(0,o.kt)("h3",{id:"meta-priority"},"Meta priority"),(0,o.kt)("p",null,"There is a three predefined priority levels, and you can always use custom:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"0")," - used for ",(0,o.kt)("a",{parentName:"li",href:"#default-meta"},"default meta"),", available in constant ",(0,o.kt)("inlineCode",{parentName:"li"},"META_PRIORITY_DEFAULT")),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"10")," - used for ",(0,o.kt)("a",{parentName:"li",href:"#route-meta"},"meta from route config"),", available in constant ",(0,o.kt)("inlineCode",{parentName:"li"},"META_PRIORITY_ROUTE")),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"20")," - highest priority, intended for custom usage in application, usually for ",(0,o.kt)("a",{parentName:"li",href:"#dynamic-meta"},"dynamic meta"),", available in constant ",(0,o.kt)("inlineCode",{parentName:"li"},"META_PRIORITY_APP"))),(0,o.kt)("h2",{id:"usage"},"Usage"),(0,o.kt)("h3",{id:"installation"},"Installation"),(0,o.kt)("p",null,"Be sure that you have installed and connected ",(0,o.kt)("inlineCode",{parentName:"p"},"SeoModule")," (already included in new projects):"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-bash"},"npx tramvai add @tramvai/module-seo\n")),(0,o.kt)("p",null,"And connect in the project"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-tsx"},"import { createApp } from '@tramvai/core';\nimport { SeoModule } from '@tramvai/module-seo';\n\ncreateApp({\n  name: 'tincoin',\n  modules: [SeoModule],\n});\n")),(0,o.kt)("h3",{id:"default-meta"},"Default meta"),(0,o.kt)("p",null,"You can set default meta pack by using the method ",(0,o.kt)("inlineCode",{parentName:"p"},"SeoModule.forRoot")," with ",(0,o.kt)("inlineCode",{parentName:"p"},"metaDefault")," option:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-tsx"},"import { createApp } from '@tramvai/core';\nimport { SeoModule } from '@tramvai/module-seo';\n\ncreateApp({\n  name: 'tincoin',\n  modules: [\n    SeoModule.forRoot({\n      metaDefault: {\n        title: 'Tramvai application',\n      },\n    }),\n  ],\n});\n")),(0,o.kt)("p",null,"Another way is to provide ",(0,o.kt)("inlineCode",{parentName:"p"},"META_DEFAULT_TOKEN")," token directly:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-tsx"},"import { createApp, provide } from '@tramvai/core';\nimport { SeoModule, META_DEFAULT_TOKEN } from '@tramvai/module-seo';\n\ncreateApp({\n  name: 'tincoin',\n  modules: [SeoModule],\n  providers: [\n    provide({\n      provide: META_DEFAULT_TOKEN,\n      useValue: {\n        title: 'Tramvai application',\n      },\n    }),\n  ],\n});\n")),(0,o.kt)("h3",{id:"route-meta"},"Route meta"),(0,o.kt)("p",null,"Simplest way to set meta for specific route is to use static ",(0,o.kt)("inlineCode",{parentName:"p"},"seo")," property of the ",(0,o.kt)("a",{parentName:"p",href:"/docs/features/pages"},"page component"),":"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-tsx"},"import type { PageComponent } from '@tramvai/react';\n\nconst CommentsPage: PageComponent = () => <h1>Comments Page</h1>;\n\nCommentsPage.seo = {\n  metaTags: {\n    title: 'Comments Page Title',\n  },\n};\n\nexport default CommentsPage;\n")),(0,o.kt)("p",null,"Another way, for ",(0,o.kt)("a",{parentName:"p",href:"/docs/features/pages#define-routes-manually"},"manually created routes")," is to update route ",(0,o.kt)("inlineCode",{parentName:"p"},"config.seo")," property:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},"const route = {\n  name: 'comments',\n  path: '/comments/',\n  config: {\n    pageComponent: '@/pages/comments',\n    seo: {\n      metaTags: {\n        title: 'Comments Page Title',\n      },\n    },\n  },\n};\n")),(0,o.kt)("h3",{id:"custom-data-source"},"Custom data source"),(0,o.kt)("p",null,"You can set additional data source by using the method ",(0,o.kt)("inlineCode",{parentName:"p"},"SeoModule.forRoot")," with ",(0,o.kt)("inlineCode",{parentName:"p"},"metaUpdaters")," option."),(0,o.kt)("p",null,"Each source is a function that takes a meta and allows you to extend the meta through a ",(0,o.kt)("inlineCode",{parentName:"p"},"updateMeta")," call. The priority is a positive number, for each specific meta key the value with the highest priority will be used, the value with priority ",(0,o.kt)("inlineCode",{parentName:"p"},"0")," denotes the default value."),(0,o.kt)("p",null,"This meta update will be executed for every request for application pages. Possible use-case - read information for meta from some services or stores (this information need to be already fetched, meta updaters are syncronyous)."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-tsx"},"import { createApp } from '@tramvai/core';\nimport { SeoModule, META_PRIORITY_ROUTE } from '@tramvai/module-seo';\n\ncreateApp({\n  name: 'tincoin',\n  modules: [\n    SeoModule.forRoot({\n      metaUpdaters: [\n        (meta) => {\n          meta.updateMeta(META_PRIORITY_ROUTE, {\n            ogTitle: 'Tramvai application',\n          });\n        },\n      ],\n    }),\n  ],\n});\n")),(0,o.kt)("p",null,"Another way is to provide ",(0,o.kt)("inlineCode",{parentName:"p"},"META_UPDATER_TOKEN")," token directly:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-tsx"},"import { createApp, provide } from '@tramvai/core';\nimport { SeoModule, META_UPDATER_TOKEN, META_PRIORITY_ROUTE } from '@tramvai/module-seo';\n\ncreateApp({\n  name: 'tincoin',\n  modules: [SeoModule],\n  providers: [\n    provide({\n      provide: META_UPDATER_TOKEN,\n      useValue: (meta) => {\n        meta.updateMeta(META_PRIORITY_ROUTE, {\n          ogTitle: 'Tramvai application',\n        });\n      },\n    }),\n  ],\n});\n")),(0,o.kt)("h3",{id:"dynamic-meta"},"Dynamic meta"),(0,o.kt)("p",null,"For example, your meta depends on API response. ",(0,o.kt)("a",{parentName:"p",href:"/docs/features/data-fetching/action"},"Actions")," is a good place to both save response to store and update meta tags by using ",(0,o.kt)("inlineCode",{parentName:"p"},"META_WALK_TOKEN")," token:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-tsx"},"import { declareAction } from '@tramvai/core';\nimport { META_WALK_TOKEN, META_PRIORITY_APP } from '@tramvai/module-seo';\n\ndeclareAction({\n  name: 'action',\n  fn() {\n    this.deps.meta.updateMeta(META_PRIORITY_APP, {\n      title: 'WoW, such dynamic!',\n    });\n  },\n  deps: {\n    meta: META_WALK_TOKEN,\n  },\n  conditions: {\n    dynamic: true,\n  },\n});\n")),(0,o.kt)("h3",{id:"json-ld"},"JSON-LD"),(0,o.kt)("p",null,"It's possible to set up ",(0,o.kt)("inlineCode",{parentName:"p"},"JSON-LD")," for your routes. You can learn more about this technology ",(0,o.kt)("a",{parentName:"p",href:"https://json-ld.org/learn.html"},"here"),".",(0,o.kt)("br",{parentName:"p"}),"\n","There are two ways to set it up:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"use static ",(0,o.kt)("inlineCode",{parentName:"li"},"seo")," property of the ",(0,o.kt)("a",{parentName:"li",href:"/docs/features/pages"},"page component"))),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-tsx"},"import type { PageComponent } from '@tramvai/react';\n\nconst CommentsPage: PageComponent = () => <h1>Comments Page</h1>;\n\nCommentsPage.seo = {\n  meta: {\n    structuredData: {\n      jsonLd: {\n        '@context': 'http://schema.org/',\n        '@type': 'Comments',\n      },\n    },\n  },\n};\n\nexport default CommentsPage;\n")),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"use route configuration with ",(0,o.kt)("a",{parentName:"li",href:"/docs/features/pages#define-routes-manually"},"manually created routes"))),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-tsx"},"const route = {\n  name: 'comments',\n  path: '/comments/',\n  config: {\n    pageComponent: '@/pages/comments',\n    seo: {\n      meta: {\n        structuredData: {\n          jsonLd: {\n            '@context': 'http://schema.org/',\n            '@type': 'Comments',\n          },\n        },\n      },\n    },\n  },\n};\n")),(0,o.kt)("p",null,"Remember, that ",(0,o.kt)("inlineCode",{parentName:"p"},"JSON-LD")," only generates for server requests, so it won't change on SPA transitions."),(0,o.kt)("h2",{id:"how-to"},"How-to"),(0,o.kt)("h3",{id:"how-to-set-a-custom-meta-tag"},"How to set a custom meta tag?"),(0,o.kt)("p",null,(0,o.kt)("a",{parentName:"p",href:"#custom-meta-tags"},"Custom meta tag description"),", usage example:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-tsx"},"import { createApp, provide } from '@tramvai/core';\nimport { SeoModule, META_UPDATER_TOKEN, META_PRIORITY_ROUTE } from '@tramvai/module-seo';\n\ncreateApp({\n  name: 'tincoin',\n  modules: [SeoModule],\n  providers: [\n    provide({\n      provide: META_UPDATER_TOKEN,\n      useValue: (meta) => {\n        meta.updateMeta(META_PRIORITY_ROUTE, {\n          metaCustom: {\n            tag: 'meta',\n            attributes: {\n              name: 'metaCustomNameAttribute',\n              content: 'metaCustomContent',\n            },\n          },\n        });\n      },\n    }),\n  ],\n});\n")),(0,o.kt)("p",null,"And result will be - ",(0,o.kt)("inlineCode",{parentName:"p"},'<meta name="metaCustomNameAttribute" content="metaCustomContent" data-meta-dynamic="true">')),(0,o.kt)("h3",{id:"how-to-remove-meta-tag"},"How-to remove meta tag?"),(0,o.kt)("p",null,"Just return ",(0,o.kt)("inlineCode",{parentName:"p"},"null")," as value for highest priority:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-tsx"},"import { createApp, provide } from '@tramvai/core';\nimport { SeoModule, META_UPDATER_TOKEN, META_PRIORITY_ROUTE } from '@tramvai/module-seo';\n\ncreateApp({\n  name: 'tincoin',\n  modules: [SeoModule],\n  providers: [\n    provide({\n      provide: META_UPDATER_TOKEN,\n      useValue: (meta) => {\n        meta.updateMeta(30, {\n          keywords: null,\n        });\n      },\n    }),\n  ],\n});\n")),(0,o.kt)("h3",{id:"how-to-update-meta-by-user-interaction"},"How to update meta by user interaction?"),(0,o.kt)("p",null,(0,o.kt)("inlineCode",{parentName:"p"},"META_WALK_TOKEN")," will work only for initial page request and SPA-navigations, this limitation is needed to avoid unexpected behavior due to racing."),(0,o.kt)("p",null,"If you need to update meta on click or any other user event, use ",(0,o.kt)("inlineCode",{parentName:"p"},"APPLY_META_TOKEN")," token."),(0,o.kt)("admonition",{type:"info"},(0,o.kt)("p",{parentName:"admonition"},"Do not use ",(0,o.kt)("inlineCode",{parentName:"p"},"APPLY_META_TOKEN")," in page actions or before and after SPA-navigations!")),(0,o.kt)("p",null,"Example:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-tsx"},"import { declareAction } from '@tramvai/core';\nimport { APPLY_META_TOKEN } from '@tramvai/module-seo';\n\ndeclareAction({\n  name: 'action',\n  fn() {\n    this.deps.applyMeta({\n      title: 'It is last search request data',\n    });\n  },\n  deps: {\n    applyMeta: APPLY_META_TOKEN,\n  },\n  conditions: {\n    onlyBrowser: true,\n  },\n});\n")),(0,o.kt)("h2",{id:"references"},"References"),(0,o.kt)("h3",{id:"meta-tags-list"},"Meta tags list"),(0,o.kt)("p",null,"Predefined list for easy adding meta tags:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"title")," - ",(0,o.kt)("inlineCode",{parentName:"li"},"<title>")," tag"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"description")," - ",(0,o.kt)("inlineCode",{parentName:"li"},'<meta name="description">')," tag"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"keywords")," - ",(0,o.kt)("inlineCode",{parentName:"li"},'<meta name="keywords">')," tag"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"canonical")," - ",(0,o.kt)("inlineCode",{parentName:"li"},'<link rel="canonical">')," tag"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"viewport")," - ",(0,o.kt)("inlineCode",{parentName:"li"},'<meta name="viewport">')," tag"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"ogTitle")," - ",(0,o.kt)("inlineCode",{parentName:"li"},'<meta property="og:title">')," tag"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"ogDescription")," - ",(0,o.kt)("inlineCode",{parentName:"li"},'<meta property="og:description">')," tag"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"ogSiteName")," - ",(0,o.kt)("inlineCode",{parentName:"li"},'<meta property="og:site_name">')," tag"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"ogUrl")," - ",(0,o.kt)("inlineCode",{parentName:"li"},'<meta property="og:url">')," tag"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"ogType")," - ",(0,o.kt)("inlineCode",{parentName:"li"},'<meta property="og:type">')," tag"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"ogImage")," - ",(0,o.kt)("inlineCode",{parentName:"li"},'<meta property="og:image">')," tag"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"ogImageSecure")," - ",(0,o.kt)("inlineCode",{parentName:"li"},'<meta property="og:image:secure_url">')," tag"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"ogImageType")," - ",(0,o.kt)("inlineCode",{parentName:"li"},'<meta property="og:image:type">')," tag"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"ogImageAlt")," - ",(0,o.kt)("inlineCode",{parentName:"li"},'<meta property="og:image:alt">')," tag"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"ogImageWidth")," - ",(0,o.kt)("inlineCode",{parentName:"li"},'<meta property="og:image:width">')," tag"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"ogImageHeight")," - ",(0,o.kt)("inlineCode",{parentName:"li"},'<meta property="og:image:height">')," tag"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"ogLocale")," - ",(0,o.kt)("inlineCode",{parentName:"li"},'<meta property="og:locale">')," tag"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"twitterTitle")," - ",(0,o.kt)("inlineCode",{parentName:"li"},'<meta name="twitter:title">')," tag"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"twitterDescription")," - ",(0,o.kt)("inlineCode",{parentName:"li"},'<meta name="twitter:description">')," tag"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"twitterCard")," - ",(0,o.kt)("inlineCode",{parentName:"li"},'<meta name="twitter:card">')," tag"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"twitterSite")," - ",(0,o.kt)("inlineCode",{parentName:"li"},'<meta name="twitter:site">')," tag"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"twitterCreator")," - ",(0,o.kt)("inlineCode",{parentName:"li"},'<meta name="twitter:creator">')," tag"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"twitterImage")," - ",(0,o.kt)("inlineCode",{parentName:"li"},'<meta name="twitter:image">')," tag"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"twitterImageAlt")," - ",(0,o.kt)("inlineCode",{parentName:"li"},'<meta name="twitter:image:alt">')," tag"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"robots")," - function with parameters ",(0,o.kt)("inlineCode",{parentName:"li"},"(type: 'all' | 'noindex' | 'nofollow' | 'none')")," which returns ",(0,o.kt)("inlineCode",{parentName:"li"},'<meta name="robots" content="none">'),", ",(0,o.kt)("inlineCode",{parentName:"li"},'<meta name="robots" content="noindex, nofollow">')," or ",(0,o.kt)("inlineCode",{parentName:"li"},'<meta name="robots" content="noarchive">')," tag")),(0,o.kt)("h3",{id:"custom-meta-tags"},"Custom meta tags"),(0,o.kt)("p",null,"If you need to add meta tag which is not in the ",(0,o.kt)("a",{parentName:"p",href:"#meta-tags-list"},"predefined list"),", you need to provide object with specific description:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},"type CustomTag = {\n  tag: string;\n  attributes?: {\n    [key: string]: any;\n  };\n  innerHtml?: string;\n};\n")),(0,o.kt)("h2",{id:"testing"},"Testing"),(0,o.kt)("h3",{id:"testing-work-with-meta_updater_token-and-meta_default_token"},"Testing work with META_UPDATER_TOKEN and META_DEFAULT_TOKEN"),(0,o.kt)("p",null,"If you have a module or providers that define ",(0,o.kt)("inlineCode",{parentName:"p"},"META_UPDATER_TOKEN")," or ",(0,o.kt)("inlineCode",{parentName:"p"},"META_DEFAULT_TOKEN")," then it is convenient to use special utilities to test them separately:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},"import { Module, provide } from '@tramvai/core';\nimport { testMetaUpdater } from '@tramvai/module-seo/tests';\nimport { META_PRIORITY_APP, META_DEFAULT_TOKEN, META_UPDATER_TOKEN } from '@tramvai/module-seo';\n\ndescribe('testMetaUpdater', () => {\n  it('modules', async () => {\n    const metaUpdater = jest.fn<\n      ReturnType<typeof META_UPDATER_TOKEN>,\n      Parameters<typeof META_UPDATER_TOKEN>\n    >((walker) => {\n      walker.updateMeta(META_PRIORITY_APP, {\n        title: 'test title',\n      });\n    });\n    @Module({\n      providers: [\n        provide({\n          provide: META_UPDATER_TOKEN,\n          multi: true,\n          useValue: metaUpdater,\n        }),\n      ],\n    })\n    class CustomModule {}\n    const { renderMeta } = testMetaUpdater({\n      modules: [CustomModule],\n    });\n\n    const { render, metaWalk } = renderMeta();\n\n    expect(metaWalk.get('title').value).toBe('test title');\n    expect(render).toMatch('<title data-meta-dynamic=\"true\">test title</title>');\n  });\n\n  it('providers', async () => {\n    const { renderMeta } = testMetaUpdater({\n      providers: [\n        provide({\n          provide: META_DEFAULT_TOKEN,\n          useValue: {\n            title: 'default title',\n          },\n        }),\n      ],\n    });\n\n    const { render } = renderMeta();\n\n    expect(render).toMatch('<title data-meta-dynamic=\"true\">default title</title>');\n  });\n});\n")),(0,o.kt)("h2",{id:"known-issues"},"Known issues"),(0,o.kt)("h3",{id:"googlebot-crawls-and-tries-to-index-all-links-within-your-html"},"Googlebot crawls and tries to index all links within your HTML"),(0,o.kt)("p",null,"Googlebot will parse everything inside your HTML document, including inline scripts, and even JSON located within those scripts. If Googlebot encounters a link, it might extract and attempt to access these URLs to index them."),(0,o.kt)("p",null,"When you are developing a Tramvai application, the most common case where this could happen is with the initial state. This initial state is passed from your server to the client inside an inline script with the ",(0,o.kt)("inlineCode",{parentName:"p"},"__TRAMVAI_STATE__")," id. Such initial states can also contain links. More information about state, you can read in ",(0,o.kt)("a",{parentName:"p",href:"/docs/features/state-management"},"State Management"),"."),(0,o.kt)("p",null,"Unfortunately, there is no straightforward solution at this moment."),(0,o.kt)("p",null,"Links:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("a",{parentName:"li",href:"https://stackoverflow.com/q/47210596"},"https://stackoverflow.com/q/47210596")," - stackoverflow discussion"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("a",{parentName:"li",href:"https://support.google.com/webmasters/thread/217029647/json-data-in-next-js-app?hl=en"},"https://support.google.com/webmasters/thread/217029647/json-data-in-next-js-app?hl=en")," - question in google support")))}u.isMDXComponent=!0}}]);