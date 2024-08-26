"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[379],{3905:function(e,n,t){t.d(n,{Zo:function(){return c},kt:function(){return d}});var i=t(7294);function o(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function a(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);n&&(i=i.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,i)}return t}function r(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?a(Object(t),!0).forEach((function(n){o(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):a(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function l(e,n){if(null==e)return{};var t,i,o=function(e,n){if(null==e)return{};var t,i,o={},a=Object.keys(e);for(i=0;i<a.length;i++)t=a[i],n.indexOf(t)>=0||(o[t]=e[t]);return o}(e,n);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(i=0;i<a.length;i++)t=a[i],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(o[t]=e[t])}return o}var s=i.createContext({}),u=function(e){var n=i.useContext(s),t=n;return e&&(t="function"==typeof e?e(n):r(r({},n),e)),t},c=function(e){var n=u(e.components);return i.createElement(s.Provider,{value:n},e.children)},p={inlineCode:"code",wrapper:function(e){var n=e.children;return i.createElement(i.Fragment,{},n)}},m=i.forwardRef((function(e,n){var t=e.components,o=e.mdxType,a=e.originalType,s=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),m=u(t),d=o,h=m["".concat(s,".").concat(d)]||m[d]||p[d]||a;return t?i.createElement(h,r(r({ref:n},c),{},{components:t})):i.createElement(h,r({ref:n},c))}));function d(e,n){var t=arguments,o=n&&n.mdxType;if("string"==typeof e||o){var a=t.length,r=new Array(a);r[0]=m;var l={};for(var s in n)hasOwnProperty.call(n,s)&&(l[s]=n[s]);l.originalType=e,l.mdxType="string"==typeof e?e:o,r[1]=l;for(var u=2;u<a;u++)r[u]=t[u];return i.createElement.apply(null,r)}return i.createElement.apply(null,t)}m.displayName="MDXCreateElement"},7832:function(e,n,t){t.r(n),t.d(n,{assets:function(){return s},contentTitle:function(){return r},default:function(){return p},frontMatter:function(){return a},metadata:function(){return l},toc:function(){return u}});var i=t(7462),o=(t(7294),t(3905));const a={id:"bundle-optimization",title:"Bundle optimization"},r=void 0,l={unversionedId:"guides/bundle-optimization",id:"guides/bundle-optimization",title:"Bundle optimization",description:"@tramvai/cli use webpack for building an application, and configures most of the well-known optimizations for production builds - code minification and obfuscation, CSS and image optimization, code splitting, hashes for efficient static caching - and allows you to customize some optimization stages.",source:"@site/tmp-docs/guides/bundle-optimization.md",sourceDirName:"guides",slug:"/guides/bundle-optimization",permalink:"/docs/guides/bundle-optimization",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/tmp-docs/guides/bundle-optimization.md",tags:[],version:"current",frontMatter:{id:"bundle-optimization",title:"Bundle optimization"},sidebar:"sidebar",previous:{title:"Automatic migrations",permalink:"/docs/features/migration"},next:{title:"CPU profiling",permalink:"/docs/guides/cpu-profiling"}},s={},u=[{value:"Code Splitting",id:"code-splitting",level:2},{value:"Granular Chunks",id:"granular-chunks",level:3},{value:"Common Chunk",id:"common-chunk",level:3},{value:"Disabling SplitChunksPlugin",id:"disabling-splitchunksplugin",level:3}],c={toc:u};function p(e){let{components:n,...t}=e;return(0,o.kt)("wrapper",(0,i.Z)({},c,t,{components:n,mdxType:"MDXLayout"}),(0,o.kt)("p",null,(0,o.kt)("a",{parentName:"p",href:"/docs/references/cli/base"},"@tramvai/cli")," use ",(0,o.kt)("inlineCode",{parentName:"p"},"webpack")," for building an application, and configures most of the well-known optimizations for production builds - code minification and obfuscation, CSS and image optimization, code splitting, hashes for efficient static caching - and allows you to customize some optimization stages."),(0,o.kt)("h2",{id:"code-splitting"},"Code Splitting"),(0,o.kt)("p",null,"Providing the client with the minimum required JavaScript code is one of the most important things in optimizing web applications. Separating entry points when building bundles and dynamically importing modules and using these bans based on routing / custom actions are the main mechanisms for splitting code. When assembling many bundles and dynamic chunks, the problem of code duplication between them arises, which allows you to solve ",(0,o.kt)("a",{parentName:"p",href:"https://webpack.js.org/plugins/split-chunks-plugin/"},"SplitChunksPlugin")),(0,o.kt)("p",null,"Tramvai applications have a number of features - a single entry point (",(0,o.kt)("inlineCode",{parentName:"p"},"platform.js")," at the exit), dynamic import at the level of each ",(0,o.kt)("a",{parentName:"p",href:"/docs/concepts/bundle"},"bundle"),", a separate assembly of the vendor chunk. For an application that has several tramvai bundles for different pages, each page will load at least the ",(0,o.kt)("inlineCode",{parentName:"p"},"platform.js")," chunk with the common framework and modules code, and the ",(0,o.kt)("inlineCode",{parentName:"p"},"{bundleName} .js")," chunk with the unique code for the page. Duplicates can be in chunks created under tramvai bundles (for example, ui-kit components), and it is desirable to move this code into common chunks."),(0,o.kt)("p",null,"The CLI offers three strategies for splitting code - one common chunk, many granular shared chunks, and disabling the SplitChunksPlugin."),(0,o.kt)("h3",{id:"granular-chunks"},"Granular Chunks"),(0,o.kt)("admonition",{type:"tip"},(0,o.kt)("p",{parentName:"admonition"},"Recommended default configuration")),(0,o.kt)("p",null,(0,o.kt)("a",{parentName:"p",href:"https://web.dev/granular-chunking-nextjs/"},"A detailed description of using the strategy in Next.js and Gatsby.js")),(0,o.kt)("p",null,"The strategy is enabled through the ",(0,o.kt)("inlineCode",{parentName:"p"},"granularChunks")," parameter, allows you to move the common code into many small chunks, for efficient caching of the common code, and loading only the necessary code on each page. The balance is achieved due to the fact that the common code between at least two (default settings) chunks is placed in a separate chunk with a unique name, and there will be such chunks from one for all the others, to one for every two chunks."),(0,o.kt)("p",null,"Disadvantages of this strategy: significantly more js scripts can be loaded on one page, up to several dozen, which does not significantly affect performance when using HTTP / 2; and less efficient gzip / brotli archiving, which is not so noticeable compared to the reduction in the amount of source code."),(0,o.kt)("p",null,"The ",(0,o.kt)("inlineCode",{parentName:"p"},"granularChunksSplitNumber")," parameter allows you to override the default number of shared chunks (",(0,o.kt)("inlineCode",{parentName:"p"},"2"),"), if for some reason you need to reduce the number of resulting chunks:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "projects": {\n    "{appName}": {\n      "splitChunks": {\n        "mode": "granularChunks",\n        "granularChunksSplitNumber": 3\n      }\n    }\n  }\n}\n')),(0,o.kt)("h3",{id:"common-chunk"},"Common Chunk"),(0,o.kt)("admonition",{type:"tip"},(0,o.kt)("p",{parentName:"admonition"},"Configuration good for applications with only one or few pages")),(0,o.kt)("p",null,"The strategy is included in the CLI by default, all common code from bundles and dynamic chunks is moved to common-chunk.js. The ",(0,o.kt)("inlineCode",{parentName:"p"},"commonChunkSplitNumber")," parameter allows you to specify the minimum number of chunks this code should use in order to move it to common."),(0,o.kt)("p",null,"For applications with a lot of bundles, ",(0,o.kt)("inlineCode",{parentName:"p"},"common-chunk.js")," can include a huge amount of code that is not needed on every single page, and it is worth either increasing the ",(0,o.kt)("inlineCode",{parentName:"p"},"commonChunkSplitNumber")," or using the Granular Chunks strategy. Example configuration to increase the minimum number of chunks using shared code:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "projects": {\n    "{appName}": {\n      "splitChunks": {\n        "commonChunkSplitNumber": 5\n      }\n    }\n  }\n}\n')),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"How to choose a suitable number of ",(0,o.kt)("inlineCode",{parentName:"strong"},"commonChunkSplitNumber"),"?")," Alternatively, the number can be calculated using the formulas ",(0,o.kt)("inlineCode",{parentName:"p"},"commonChunkSplitNumber = bundles / 3")," or ",(0,o.kt)("inlineCode",{parentName:"p"},"commonChunkSplitNumber = bundles / 2"),", where bundles is the number of tramvai bundles that are connected to a specific application, but most likely each application will be better viewed separately."),(0,o.kt)("h3",{id:"disabling-splitchunksplugin"},"Disabling SplitChunksPlugin"),(0,o.kt)("admonition",{type:"tip"},(0,o.kt)("p",{parentName:"admonition"},"Not recommended configuration")),(0,o.kt)("p",null,"For applications that have only one tramvai bundle for all pages, or separate the bundle for the desktop and mobile versions, in most cases, code separation is not required, and it is worth setting the option ",(0,o.kt)("inlineCode",{parentName:"p"},'"commonChunk": false'),":"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "projects": {\n    "{appName}": {\n      "splitChunks": {\n        "mode": false\n      }\n    }\n  }\n}\n')),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"Why not leave the common chunk if it doesn't interfere?")," The problem is in third-party libraries that can use dynamic ",(0,o.kt)("inlineCode",{parentName:"p"},"import")," under the hood, while the application may not use this code, but it may end up in the common chunk, which will be loaded on every page."),(0,o.kt)("p",null,"Also, if your application is serving multiple pages and separating the code at the page component level via ",(0,o.kt)("a",{parentName:"p",href:"/docs/how-to/how-create-async-component"},"@tramvai/react lazy"),", it makes sense to consider other strategies, since duplicates will appear in dynamic chunks of pages."))}p.isMDXComponent=!0}}]);