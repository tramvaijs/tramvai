"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[2758],{3905:function(e,t,n){n.d(t,{Zo:function(){return d},kt:function(){return m}});var r=n(7294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var s=r.createContext({}),p=function(e){var t=r.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},d=function(e){var t=p(e.components);return r.createElement(s.Provider,{value:t},e.children)},c={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},u=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,i=e.originalType,s=e.parentName,d=o(e,["components","mdxType","originalType","parentName"]),u=p(n),m=a,f=u["".concat(s,".").concat(m)]||u[m]||c[m]||i;return n?r.createElement(f,l(l({ref:t},d),{},{components:n})):r.createElement(f,l({ref:t},d))}));function m(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=n.length,l=new Array(i);l[0]=u;var o={};for(var s in t)hasOwnProperty.call(t,s)&&(o[s]=t[s]);o.originalType=e,o.mdxType="string"==typeof e?e:a,l[1]=o;for(var p=2;p<i;p++)l[p]=n[p];return r.createElement.apply(null,l)}return r.createElement.apply(null,n)}u.displayName="MDXCreateElement"},1489:function(e,t,n){n.r(t),n.d(t,{assets:function(){return s},contentTitle:function(){return l},default:function(){return c},frontMatter:function(){return i},metadata:function(){return o},toc:function(){return p}});var r=n(7462),a=(n(7294),n(3905));const i={id:"csr",title:"Client-Side Rendering"},l=void 0,o={unversionedId:"features/rendering/csr",id:"features/rendering/csr",title:"Client-Side Rendering",description:"Full Client-Side Rendering (CSR) is not supported by tramvai framework.",source:"@site/tmp-docs/03-features/010-rendering/05-csr.md",sourceDirName:"03-features/010-rendering",slug:"/features/rendering/csr",permalink:"/docs/features/rendering/csr",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/tmp-docs/03-features/010-rendering/05-csr.md",tags:[],version:"current",sidebarPosition:5,frontMatter:{id:"csr",title:"Client-Side Rendering"},sidebar:"sidebar",previous:{title:"Static-Site Generation",permalink:"/docs/features/rendering/ssg"},next:{title:"Streaming Rendering",permalink:"/docs/features/rendering/streaming"}},s={},p=[{value:"CSR fallback",id:"csr-fallback",level:2},{value:"Environment variables",id:"environment-variables",level:3},{value:"Testing",id:"testing",level:3},{value:"Known errors",id:"known-errors",level:3},{value:"Infinite reload",id:"infinite-reload",level:4}],d={toc:p};function c(e){let{components:t,...n}=e;return(0,a.kt)("wrapper",(0,r.Z)({},d,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"Full ",(0,a.kt)("a",{parentName:"p",href:"https://www.patterns.dev/posts/client-side-rendering/"},"Client-Side Rendering (CSR)")," is ",(0,a.kt)("strong",{parentName:"p"},"not supported")," by ",(0,a.kt)("inlineCode",{parentName:"p"},"tramvai")," framework."),(0,a.kt)("p",null,"For high load applications with static or closed by authorization pages, there is some good options to use, for example ",(0,a.kt)("a",{parentName:"p",href:"/docs/features/rendering/page-render-mode#client-mode"},"client rendering mode")," - limited ability to render page content only in browser, which can improve page rendering speed in 3-4 times."),(0,a.kt)("p",null,"In this mode, all requests to application server will be handled as usual, but instead of real pages content rendering, we can render only light-weight fallback (spinner, skeleton, etc.) on server. After page loading in browser, full page will be rendered. It is very useful to reduce the load on the application server."),(0,a.kt)("p",null,"Another way it ",(0,a.kt)("a",{parentName:"p",href:"/docs/features/rendering/ssg"},"Static Site Generation"),", you always can generate empty pages with skeletons, and made all data requests client-side."),(0,a.kt)("p",null,"For ultimate application resilience under heavy loads, we can use a perfect pattern - ",(0,a.kt)("a",{parentName:"p",href:"#csr-fallback"},"client-side rendering fallback"),"."),(0,a.kt)("h2",{id:"csr-fallback"},"CSR fallback"),(0,a.kt)("p",null,"Inspired by this article - ",(0,a.kt)("a",{parentName:"p",href:"https://arkwright.github.io/scaling-react-server-side-rendering.html#client-side-rendering-fallback"},"Scaling React Server-Side Rendering"),"."),(0,a.kt)("p",null,"We can use ",(0,a.kt)("a",{parentName:"p",href:"/docs/features/rendering/ssg"},"SSG")," for generation only one fallback page and distribute it from the CDN. Then, balancer can switch all application traffic for this fallback HTML, for example if application send ",(0,a.kt)("inlineCode",{parentName:"p"},"429")," response code (default ",(0,a.kt)("a",{parentName:"p",href:"/docs/references/modules/request-limiter"},"tramvai request-limiter")," behaviour). This can completely free up the application server."),(0,a.kt)("admonition",{type:"caution"},(0,a.kt)("p",{parentName:"admonition"},"When caching a fallback, your users potentially can have a outdated content.\nAlso, you will have the same meta tags for all application pages, it can affect SEO."),(0,a.kt)("p",{parentName:"admonition"},"Some important features will not work:"),(0,a.kt)("ul",{parentName:"admonition"},(0,a.kt)("li",{parentName:"ul"},"User-Agent parsing - User-Agent or Client-Hints parsed only at server side, so you will need to implement it on client side if you need it"),(0,a.kt)("li",{parentName:"ul"},"Media detection - always will came wrong from server (with SSR only first load will be without real data), so will be useless for optimizations"),(0,a.kt)("li",{parentName:"ul"},"On page initialization, router flow will be different - ",(0,a.kt)("inlineCode",{parentName:"li"},"beforeResolve")," hook will be triggered at ",(0,a.kt)("inlineCode",{parentName:"li"},"customerStart")," line"),(0,a.kt)("li",{parentName:"ul"},"On ",(0,a.kt)("a",{parentName:"li",href:"/docs/features/routing/redirects"},"redirects")," while page initialization, global actions and ",(0,a.kt)("inlineCode",{parentName:"li"},"resolveUserDeps")," with ",(0,a.kt)("inlineCode",{parentName:"li"},"resolvePageDeps")," lines will be triggered twice, one for current route and one for redirect route"))),(0,a.kt)("p",null,"For one client-side rendering fallback, which will work on every application route, we need a few things:"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"Fallback component with some preloader or skeleton (",(0,a.kt)("inlineCode",{parentName:"li"},"PAGE_RENDER_DEFAULT_FALLBACK_COMPONENT"),")"),(0,a.kt)("li",{parentName:"ul"},"Special route for this page (for example, ",(0,a.kt)("inlineCode",{parentName:"li"},"/__csr_fallback__/"),")"),(0,a.kt)("li",{parentName:"ul"},"Build application (server and client code) as usual"),(0,a.kt)("li",{parentName:"ul"},"Generate static HTML page for ",(0,a.kt)("inlineCode",{parentName:"li"},"/__csr_fallback__/")," route")),(0,a.kt)("p",null,"All of this are included when using ",(0,a.kt)("inlineCode",{parentName:"p"},"tramvai static")," command with ",(0,a.kt)("inlineCode",{parentName:"p"},"TRAMVAI_FORCE_CLIENT_SIDE_RENDERING=true")," env variable, when ",(0,a.kt)("inlineCode",{parentName:"p"},"@tramvai/module-page-render-mode")," are ",(0,a.kt)("a",{parentName:"p",href:"/docs/features/rendering/page-render-mode#installation"},"connected in the application"),". You need only one step for HTML fallback generation:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-bash"},"TRAMVAI_FORCE_CLIENT_SIDE_RENDERING=true tramvai static {{ appName }}\n")),(0,a.kt)("admonition",{type:"tip"},(0,a.kt)("p",{parentName:"admonition"},"How ",(0,a.kt)("inlineCode",{parentName:"p"},"tramvai static")," works?"),(0,a.kt)("p",{parentName:"admonition"},"This command basically runs the compiled ",(0,a.kt)("inlineCode",{parentName:"p"},"server.js")," and makes a HTTP request to the specified URLs, every response will be saved as an HTML file.")),(0,a.kt)("p",null,"After this steps, you can find a file ",(0,a.kt)("inlineCode",{parentName:"p"},"dist/static/__csr_fallback__/index.html"),".\nYou can deploy this file with other assets to S3 file storage and serve this file from CDN or balancer, and it will be working as usual SPA."),(0,a.kt)("h3",{id:"environment-variables"},"Environment variables"),(0,a.kt)("p",null,"In ",(0,a.kt)("inlineCode",{parentName:"p"},"tramvai")," application we can separate a two types of env variables:"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"build-time env"),(0,a.kt)("li",{parentName:"ul"},"deployment env")),(0,a.kt)("p",null,"When using the command ",(0,a.kt)("inlineCode",{parentName:"p"},"TRAMVAI_FORCE_CLIENT_SIDE_RENDERING=true tramvai static {{ appName }}"),", you need to pass both build-time and deployment env for CI job when you run ",(0,a.kt)("inlineCode",{parentName:"p"},"tramvai static"),", because the real application server will be launched for this command, and real requests for API's will be sended."),(0,a.kt)("p",null,"Env variable ",(0,a.kt)("inlineCode",{parentName:"p"},"TRAMVAI_FORCE_CLIENT_SIDE_RENDERING")," will be available in ",(0,a.kt)("inlineCode",{parentName:"p"},"ENV_MANAGER_TOKEN"),", you can use it for some custom logic about CSR."),(0,a.kt)("h3",{id:"testing"},"Testing"),(0,a.kt)("p",null,"For fallback development, you can use start command with CSR flag - ",(0,a.kt)("inlineCode",{parentName:"p"},"TRAMVAI_FORCE_CLIENT_SIDE_RENDERING=true tramvai start {{ appName }}")," - and open special route ",(0,a.kt)("inlineCode",{parentName:"p"},"http://localhost:3000/__csr_fallback__/")," in browser."),(0,a.kt)("p",null,"For testing fallback close to production, you can use ",(0,a.kt)("inlineCode",{parentName:"p"},"http-server")," library, and this scripts:"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"TRAMVAI_FORCE_CLIENT_SIDE_RENDERING=true ASSETS_PREFIX=http://localhost:4444/ tramvai static {{ appName }}")," for build and fallback generation"),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"npx http-server dist/static/__csr_fallback__ --proxy http://localhost:8080\\\\? --cors")," for serving fallback HTML at 8080 port"),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"npx http-server dist/client -p 4444 --cors")," for serving assets at 4444 port")),(0,a.kt)("h3",{id:"known-errors"},"Known errors"),(0,a.kt)("h4",{id:"infinite-reload"},"Infinite reload"),(0,a.kt)("p",null,"It is expected error, when you try to open fallback page directly or open non-existent route, and it will be reloaded infinitely."),(0,a.kt)("p",null,"When you open a fallback page, it will try to navigate to the current url, and if current url is not registered in app router, not found default logic will be triggered, which will force ",(0,a.kt)("strong",{parentName:"p"},"hard reload")," under the hood. It is useful when another applications is served from the same domain, you have some shared menu with relative links, and you can't navigate to them with SPA-transition."),(0,a.kt)("p",null,"You can add ",(0,a.kt)("a",{parentName:"p",href:"/docs/features/routing/wildcard-routes#not-found-page"},"Not Found")," route for application, and it will be rendered instead of infinite reload. But you will be unable to navigate to other applications through relative links."))}c.isMDXComponent=!0}}]);