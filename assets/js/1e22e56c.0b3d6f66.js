"use strict";(globalThis.webpackChunk=globalThis.webpackChunk||[]).push([[4097],{3905:(e,t,r)=>{r.d(t,{Zo:()=>s,kt:()=>m});var n=r(7294);function o(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function a(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function i(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?a(Object(r),!0).forEach((function(t){o(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):a(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function d(e,t){if(null==e)return{};var r,n,o=function(e,t){if(null==e)return{};var r,n,o={},a=Object.keys(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||(o[r]=e[r]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(o[r]=e[r])}return o}var u=n.createContext({}),p=function(e){var t=n.useContext(u),r=t;return e&&(r="function"==typeof e?e(t):i(i({},t),e)),r},s=function(e){var t=p(e.components);return n.createElement(u.Provider,{value:t},e.children)},l={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},c=n.forwardRef((function(e,t){var r=e.components,o=e.mdxType,a=e.originalType,u=e.parentName,s=d(e,["components","mdxType","originalType","parentName"]),c=p(r),m=o,f=c["".concat(u,".").concat(m)]||c[m]||l[m]||a;return r?n.createElement(f,i(i({ref:t},s),{},{components:r})):n.createElement(f,i({ref:t},s))}));function m(e,t){var r=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var a=r.length,i=new Array(a);i[0]=c;var d={};for(var u in t)hasOwnProperty.call(t,u)&&(d[u]=t[u]);d.originalType=e,d.mdxType="string"==typeof e?e:o,i[1]=d;for(var p=2;p<a;p++)i[p]=r[p];return n.createElement.apply(null,i)}return n.createElement.apply(null,r)}c.displayName="MDXCreateElement"},3706:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>u,contentTitle:()=>i,default:()=>l,frontMatter:()=>a,metadata:()=>d,toc:()=>p});var n=r(7462),o=(r(7294),r(3905));const a={id:"wildcard-routes",title:"Wildcard Routes"},i=void 0,d={unversionedId:"features/routing/wildcard-routes",id:"features/routing/wildcard-routes",title:"Wildcard Routes",description:"Wildcard routes (aka catch-all, splats routes) - this is a routes with dynamic segment which used if no exact matches were found for the current page.",source:"@site/tmp-docs/03-features/07-routing/06-wildcard-routes.md",sourceDirName:"03-features/07-routing",slug:"/features/routing/wildcard-routes",permalink:"/docs/features/routing/wildcard-routes",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/tmp-docs/03-features/07-routing/06-wildcard-routes.md",tags:[],version:"current",sidebarPosition:6,frontMatter:{id:"wildcard-routes",title:"Wildcard Routes"},sidebar:"sidebar",previous:{title:"Hooks and Guards",permalink:"/docs/features/routing/hooks-and-guards"},next:{title:"Redirects",permalink:"/docs/features/routing/redirects"}},u={},p=[{value:"Usage",id:"usage",level:2},{value:"Not Found Page",id:"not-found-page",level:3},{value:"How to render 404 page programmatically",id:"how-to-render-404-page-programmatically",level:4},{value:"Nested Wildcard Routes",id:"nested-wildcard-routes",level:3},{value:"File system Wildcard Routes",id:"file-system-wildcard-routes",level:3}],s={toc:p};function l({components:e,...t}){return(0,o.kt)("wrapper",(0,n.Z)({},s,t,{components:e,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"Wildcard routes (aka catch-all, splats routes) - this is a routes with dynamic segment which used if no exact matches were found for the current page."),(0,o.kt)("h2",{id:"usage"},"Usage"),(0,o.kt)("p",null,"The ",(0,o.kt)("inlineCode",{parentName:"p"},"path")," property of this route must end in an asterisk - ",(0,o.kt)("inlineCode",{parentName:"p"},"*"),", in example below the route will match any path, for which no other routes were found:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-tsx"},"import { SpaRouterModule } from '@tramvai/modules-router';\n\ncreateApp({\n  modules: [\n    SpaRouterModule.forRoot([\n      {\n        name: 'route-name',\n        path: '*',\n        config: {\n          pageComponent: '@/pages/page-name',\n        },\n      },\n    ]),\n  ],\n});\n")),(0,o.kt)("h3",{id:"not-found-page"},"Not Found Page"),(0,o.kt)("p",null,"Common use-case for wildcard routes - display ",(0,o.kt)("inlineCode",{parentName:"p"},"Not Found")," (or ",(0,o.kt)("inlineCode",{parentName:"p"},"404"),") page."),(0,o.kt)("p",null,"By default, if user will open non-existed application page, ",(0,o.kt)("inlineCode",{parentName:"p"},"tramvai")," will send ",(0,o.kt)("inlineCode",{parentName:"p"},"NotFoundError")," with ",(0,o.kt)("inlineCode",{parentName:"p"},"404")," HTTP status code and empty body to the client. But if appropriate wildcard route is configured, ",(0,o.kt)("inlineCode",{parentName:"p"},"tramvai")," will render this route with ",(0,o.kt)("inlineCode",{parentName:"p"},"200")," HTTP status code."),(0,o.kt)("p",null,"So, if you want to create custom ",(0,o.kt)("inlineCode",{parentName:"p"},"404")," page, you should configure wildcard route with ",(0,o.kt)("inlineCode",{parentName:"p"},"httpStatus")," option:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-tsx"},"import { SpaRouterModule } from '@tramvai/modules-router';\n\ncreateApp({\n  modules: [\n    SpaRouterModule.forRoot([\n      {\n        name: 'not-found',\n        path: '*',\n        config: {\n          pageComponent: '@/pages/not-found',\n          // highlight-next-line\n          httpStatus: 404,\n        },\n      },\n    ]),\n  ],\n});\n")),(0,o.kt)("h4",{id:"how-to-render-404-page-programmatically"},"How to render 404 page programmatically"),(0,o.kt)("p",null,"Wildcard routes have one important limitation - for now it is not possible to render this ",(0,o.kt)("inlineCode",{parentName:"p"},"404")," page programmatically, for example, in Action or Router Guard. If you need to render custom ",(0,o.kt)("inlineCode",{parentName:"p"},"404")," page in this cases, you can use ",(0,o.kt)("a",{parentName:"p",href:"/docs/features/error-boundaries"},"Error Boundaries"),"."),(0,o.kt)("p",null,"For example, you have some product page - ",(0,o.kt)("inlineCode",{parentName:"p"},"routes/products/[id]/index.tsx"),", and API endpoint for this page returns ",(0,o.kt)("inlineCode",{parentName:"p"},"404")," status code, if product with given id not found. In this case, you can create custom ",(0,o.kt)("inlineCode",{parentName:"p"},"404")," page and render it in page error boundary - ",(0,o.kt)("inlineCode",{parentName:"p"},"routes/products/[id]/_error.tsx"),":"),(0,o.kt)("p",null,"\u231b Create error boundary component, where 404 and any unexpected error will be handled:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-tsx",metastring:'title="routes/products/[id]/_error.tsx"',title:'"routes/products/[id]/_error.tsx"'},"import { isNotFoundError } from '@tinkoff/errors';\nimport type { ErrorBoundaryComponent } from '@tramvai/react';\n\nconst ProductErrorBoundary: ErrorBoundaryComponent = ({ url, error }) => {\n  // handle custom NotFoundError\n  if (isNotFoundError(error)) {\n    return <ProductNotFoundPage url={url} error={error} />;\n  }\n  // handle unexpected errors\n  return <ProductErrorPage url={url} error={error} />;\n};\n\nexport default ProductErrorBoundary;\n")),(0,o.kt)("p",null,"\u231b Force error boundary render in page Action:"),(0,o.kt)("admonition",{type:"warning"},(0,o.kt)("p",{parentName:"admonition"},(0,o.kt)("inlineCode",{parentName:"p"},"setPageErrorEvent")," - experimental API, and can be changed in future releases.")),(0,o.kt)("admonition",{type:"info"},(0,o.kt)("p",{parentName:"admonition"},"Not working in Child Apps!")),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-tsx",metastring:'title="routes/products/[id]/index.tsx"',title:'"routes/products/[id]/index.tsx"'},"import { NotFoundError } from '@tinkoff/errors';\nimport { declareAction } from '@tramvai/core';\nimport type { PageComponent } from '@tramvai/react';\nimport { PAGE_SERVICE_TOKEN, setPageErrorEvent } from '@tramvai/module-router';\n\nconst fetchProductAction = declareAction({\n  name: 'fetchProductAction',\n  async fn() {\n    const { id } = this.deps.pageService.getCurrentRoute().params;\n\n    try {\n      await fetchProduct(id);\n    } catch (e) {\n      // this error provide 404 status by default\n      const error = new NotFoundError();\n      this.dispatch(setPageErrorEvent(error));\n    }\n  },\n  deps: {\n    pageService: PAGE_SERVICE_TOKEN,\n  },\n});\n\nconst ProductPage: PageComponent = () => <h1>Product Page</h1>;\n\nProductPage.actions = [fetchProductAction];\n\nexport default ProductPage;\n")),(0,o.kt)("h3",{id:"nested-wildcard-routes"},"Nested Wildcard Routes"),(0,o.kt)("p",null,"You can have multiple wildcard routes for different subpaths:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-tsx"},"import { SpaRouterModule } from '@tramvai/modules-router';\n\ncreateApp({\n  modules: [\n    SpaRouterModule.forRoot([\n      {\n        name: 'comments-not-found',\n        path: '/comments/*',\n        config: {\n          pageComponent: '@/pages/comments-not-found',\n        },\n      },\n    ]),\n  ],\n});\n")),(0,o.kt)("h3",{id:"file-system-wildcard-routes"},"File system Wildcard Routes"),(0,o.kt)("p",null,"You can register a wildcard route using the file system. To do so you must create a file called ",(0,o.kt)("inlineCode",{parentName:"p"},"[...path].tsx")," in the desirable directory. Note, that nested paths are also supported. For example if you need wildcard for path ",(0,o.kt)("inlineCode",{parentName:"p"},"/profile/*"),", then create following folder structure:"),(0,o.kt)("admonition",{type:"tip"},(0,o.kt)("p",{parentName:"admonition"},"There is can be any name in the pattern, not only ",(0,o.kt)("inlineCode",{parentName:"p"},"...path"))),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre"},"src\n\u2514\u2500\u2500 routes\n    \u2514\u2500\u2500 profile\n        \u2514\u2500\u2500 index.tsx\n        \u2514\u2500\u2500 [...path].tsx\n")))}l.isMDXComponent=!0}}]);