"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[4156],{3905:function(e,t,a){a.d(t,{Zo:function(){return c},kt:function(){return m}});var n=a(7294);function r(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function i(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function l(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?i(Object(a),!0).forEach((function(t){r(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function o(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},i=Object.keys(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var s=n.createContext({}),p=function(e){var t=n.useContext(s),a=t;return e&&(a="function"==typeof e?e(t):l(l({},t),e)),a},c=function(e){var t=p(e.components);return n.createElement(s.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},d=n.forwardRef((function(e,t){var a=e.components,r=e.mdxType,i=e.originalType,s=e.parentName,c=o(e,["components","mdxType","originalType","parentName"]),d=p(a),m=r,f=d["".concat(s,".").concat(m)]||d[m]||u[m]||i;return a?n.createElement(f,l(l({ref:t},c),{},{components:a})):n.createElement(f,l({ref:t},c))}));function m(e,t){var a=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=a.length,l=new Array(i);l[0]=d;var o={};for(var s in t)hasOwnProperty.call(t,s)&&(o[s]=t[s]);o.originalType=e,o.mdxType="string"==typeof e?e:r,l[1]=o;for(var p=2;p<i;p++)l[p]=a[p];return n.createElement.apply(null,l)}return n.createElement.apply(null,a)}d.displayName="MDXCreateElement"},9605:function(e,t,a){a.r(t),a.d(t,{assets:function(){return s},contentTitle:function(){return l},default:function(){return u},frontMatter:function(){return i},metadata:function(){return o},toc:function(){return p}});var n=a(7462),r=(a(7294),a(3905));const i={id:"ssg",title:"Static-Site Generation"},l=void 0,o={unversionedId:"features/rendering/ssg",id:"features/rendering/ssg",title:"Static-Site Generation",description:"tramvai can generate pages of your application at build time to static HTML files, this feature is usually called Static Site Generation (SSG)",source:"@site/tmp-docs/03-features/010-rendering/04-ssg.md",sourceDirName:"03-features/010-rendering",slug:"/features/rendering/ssg",permalink:"/docs/features/rendering/ssg",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/tmp-docs/03-features/010-rendering/04-ssg.md",tags:[],version:"current",sidebarPosition:4,frontMatter:{id:"ssg",title:"Static-Site Generation"},sidebar:"sidebar",previous:{title:"Hydration",permalink:"/docs/features/rendering/hydration"},next:{title:"Client-Side Rendering",permalink:"/docs/features/rendering/csr"}},s={},p=[{value:"Explanation",id:"explanation",level:2},{value:"Usage",id:"usage",level:2},{value:"Development",id:"development",level:3},{value:"Production build",id:"production-build",level:3},{value:"Preview pages",id:"preview-pages",level:3},{value:"Static Assets",id:"static-assets",level:3},{value:"Select pages to build",id:"select-pages-to-build",level:3},{value:"Custom page request headers",id:"custom-page-request-headers",level:3},{value:"Limitations",id:"limitations",level:2}],c={toc:p};function u(e){let{components:t,...a}=e;return(0,r.kt)("wrapper",(0,n.Z)({},c,a,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"tramvai")," can generate pages of your application at build time to static HTML files, this feature is usually called ",(0,r.kt)("a",{parentName:"p",href:"https://www.patterns.dev/posts/static-rendering/"},"Static Site Generation (SSG)")),(0,r.kt)("h2",{id:"explanation"},"Explanation"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"tramvai static <appName>")," command run production build of the application, then starts application server, and make requests to all application routes. All responses are saved to ",(0,r.kt)("inlineCode",{parentName:"p"},".html")," files inside ",(0,r.kt)("inlineCode",{parentName:"p"},"dist/static")," directory."),(0,r.kt)("p",null,"This feature is suitable for applications where all pages are independent of dynamic server-side data. You can serve generated HTML files without ",(0,r.kt)("inlineCode",{parentName:"p"},"tramvai")," server by CDN or any static server."),(0,r.kt)("h2",{id:"usage"},"Usage"),(0,r.kt)("h3",{id:"development"},"Development"),(0,r.kt)("ol",null,(0,r.kt)("li",{parentName:"ol"},(0,r.kt)("p",{parentName:"li"},"Run development build as usual:"),(0,r.kt)("pre",{parentName:"li"},(0,r.kt)("code",{parentName:"pre",className:"language-bash"},"tramvai start <appName>\n"))),(0,r.kt)("li",{parentName:"ol"},(0,r.kt)("p",{parentName:"li"},"Open server with exported pages at http://localhost:3000/"))),(0,r.kt)("h3",{id:"production-build"},"Production build"),(0,r.kt)("ol",null,(0,r.kt)("li",{parentName:"ol"},(0,r.kt)("p",{parentName:"li"},"Run SSG command:"),(0,r.kt)("pre",{parentName:"li"},(0,r.kt)("code",{parentName:"pre",className:"language-bash"},"tramvai static <appName>\n"))),(0,r.kt)("li",{parentName:"ol"},(0,r.kt)("p",{parentName:"li"},"Deploy HTML pages to your server and static assets to your CDN"))),(0,r.kt)("h3",{id:"preview-pages"},"Preview pages"),(0,r.kt)("ol",null,(0,r.kt)("li",{parentName:"ol"},(0,r.kt)("p",{parentName:"li"},"Run SSG command with ",(0,r.kt)("inlineCode",{parentName:"p"},"--serve")," flag:"),(0,r.kt)("pre",{parentName:"li"},(0,r.kt)("code",{parentName:"pre",className:"language-bash"},"tramvai static <appName> --serve\n"))),(0,r.kt)("li",{parentName:"ol"},(0,r.kt)("p",{parentName:"li"},"Open server with exported pages at http://localhost:3000/"))),(0,r.kt)("h3",{id:"static-assets"},"Static Assets"),(0,r.kt)("p",null,"All static resources (js, css files) will be loaded according to the url specified in ",(0,r.kt)("inlineCode",{parentName:"p"},"ASSETS_PREFIX")," env variable."),(0,r.kt)("p",null,"If you build HTML pages with static prefix, for example ",(0,r.kt)("inlineCode",{parentName:"p"},"ASSETS_PREFIX=https://your.cdn.com/"),", this variable injecting in HTML in build time, and you can't change ",(0,r.kt)("inlineCode",{parentName:"p"},"ASSETS_PREFIX")," in deploy time."),(0,r.kt)("h3",{id:"select-pages-to-build"},"Select pages to build"),(0,r.kt)("p",null,"You can specify the comma separated paths list for static HTML generation with ",(0,r.kt)("inlineCode",{parentName:"p"},"--onlyPages")," flag:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-bash"},"tramvai static <appName> --onlyPages=/about,/blog\n")),(0,r.kt)("h3",{id:"custom-page-request-headers"},"Custom page request headers"),(0,r.kt)("p",null,"You can specify HTTP headers for pages requests with ",(0,r.kt)("inlineCode",{parentName:"p"},"--headers")," flag, for example if you need generate different HTML for devices with mobile User-Agent:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-bash"},'tramvai static <appName> --header "User-Agent: ..."\n')),(0,r.kt)("p",null,"This can be combined with ",(0,r.kt)("inlineCode",{parentName:"p"},"--folder")," flag, which allows to generate different HTML files in subfolder and prevent conflicts:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-bash"},'tramvai static <appName> --header "User-Agent: ..." --folder "mobile"\n')),(0,r.kt)("p",null,"HTML pages will be generated in ",(0,r.kt)("inlineCode",{parentName:"p"},"dist/static/mobile")," folder."),(0,r.kt)("h2",{id:"limitations"},"Limitations"),(0,r.kt)("p",null,"Dynamic pages (routes like ",(0,r.kt)("inlineCode",{parentName:"p"},"/foo/bar/:id"),") is not supported, ",(0,r.kt)("inlineCode",{parentName:"p"},"tramvai static")," command only show warnings for this pages. For now you can use only ",(0,r.kt)("inlineCode",{parentName:"p"},"query")," parameters for this case."),(0,r.kt)("p",null,"Server-side ",(0,r.kt)("a",{parentName:"p",href:"/docs/features/app-lifecycle"},"Application Lifecycle")," and ",(0,r.kt)("a",{parentName:"p",href:"/docs/features/routing/flow#server-navigation"},"Navigation Flow")," will be executed only once at build time. It means than some data will be non-existed, empty or outdated, for example ",(0,r.kt)("inlineCode",{parentName:"p"},"User-Agent")," will not be parsed."))}u.isMDXComponent=!0}}]);