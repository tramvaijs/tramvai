"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[3442],{3905:(e,r,t)=>{t.d(r,{Zo:()=>c,kt:()=>u});var n=t(7294);function a(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function i(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);r&&(n=n.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,n)}return t}function o(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?i(Object(t),!0).forEach((function(r){a(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):i(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}function s(e,r){if(null==e)return{};var t,n,a=function(e,r){if(null==e)return{};var t,n,a={},i=Object.keys(e);for(n=0;n<i.length;n++)t=i[n],r.indexOf(t)>=0||(a[t]=e[t]);return a}(e,r);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)t=i[n],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var p=n.createContext({}),l=function(e){var r=n.useContext(p),t=r;return e&&(t="function"==typeof e?e(r):o(o({},r),e)),t},c=function(e){var r=l(e.components);return n.createElement(p.Provider,{value:r},e.children)},d={inlineCode:"code",wrapper:function(e){var r=e.children;return n.createElement(n.Fragment,{},r)}},m=n.forwardRef((function(e,r){var t=e.components,a=e.mdxType,i=e.originalType,p=e.parentName,c=s(e,["components","mdxType","originalType","parentName"]),m=l(t),u=a,f=m["".concat(p,".").concat(u)]||m[u]||d[u]||i;return t?n.createElement(f,o(o({ref:r},c),{},{components:t})):n.createElement(f,o({ref:r},c))}));function u(e,r){var t=arguments,a=r&&r.mdxType;if("string"==typeof e||a){var i=t.length,o=new Array(i);o[0]=m;var s={};for(var p in r)hasOwnProperty.call(r,p)&&(s[p]=r[p]);s.originalType=e,s.mdxType="string"==typeof e?e:a,o[1]=s;for(var l=2;l<i;l++)o[l]=t[l];return n.createElement.apply(null,o)}return n.createElement.apply(null,t)}m.displayName="MDXCreateElement"},554:(e,r,t)=>{t.r(r),t.d(r,{assets:()=>c,contentTitle:()=>p,default:()=>u,frontMatter:()=>s,metadata:()=>l,toc:()=>d});var n=t(7462),a=t(3366),i=(t(7294),t(3905)),o=["components"],s={id:"streaming",title:"Streaming Rendering"},p=void 0,l={unversionedId:"features/rendering/streaming",id:"features/rendering/streaming",title:"Streaming Rendering",description:"Full Streaming Rendering is partially supported by tramvai framework.",source:"@site/tmp-docs/03-features/010-rendering/06-streaming.md",sourceDirName:"03-features/010-rendering",slug:"/features/rendering/streaming",permalink:"/docs/features/rendering/streaming",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/get-started/overview.md/tmp-docs/03-features/010-rendering/06-streaming.md",tags:[],version:"current",sidebarPosition:6,frontMatter:{id:"streaming",title:"Streaming Rendering"},sidebar:"sidebar",previous:{title:"Client-Side Rendering",permalink:"/docs/features/rendering/csr"},next:{title:"Caching",permalink:"/docs/features/rendering/caching"}},c={},d=[{value:"How to use <code>renderToPipeableStream</code>",id:"how-to-use-rendertopipeablestream",level:2}],m={toc:d};function u(e){var r=e.components,t=(0,a.Z)(e,o);return(0,i.kt)("wrapper",(0,n.Z)({},m,t,{components:r,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"Full ",(0,i.kt)("a",{parentName:"p",href:"https://www.patterns.dev/posts/streaming-ssr"},"Streaming Rendering")," is ",(0,i.kt)("strong",{parentName:"p"},"partially supported")," by ",(0,i.kt)("inlineCode",{parentName:"p"},"tramvai")," framework."),(0,i.kt)("p",null,"Streaming can significantly improve TTFB metric, but have some disadvantages:"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},"Require completely different framework architecture"),(0,i.kt)("li",{parentName:"ul"},"Performance overhead for Streams (10-20% slower rendering time)"),(0,i.kt)("li",{parentName:"ul"},"After first byte is sended, impossible to make server redirect or change response headers")),(0,i.kt)("p",null,"For better new ",(0,i.kt)("a",{parentName:"p",href:"https://beta.reactjs.org/reference/react-dom/server/renderToString#when-a-component-suspends-the-html-always-contains-a-fallback"},"React 18 Suspense SSR features")," support, you can switch from ",(0,i.kt)("a",{parentName:"p",href:"https://beta.reactjs.org/reference/react-dom/server/renderToString"},"renderToString")," to ",(0,i.kt)("a",{parentName:"p",href:"https://beta.reactjs.org/reference/react-dom/server/renderToPipeableStream"},"renderToPipeableStream")," API, with token ",(0,i.kt)("inlineCode",{parentName:"p"},"REACT_SERVER_RENDER_MODE"),"."),(0,i.kt)("p",null,"With ",(0,i.kt)("inlineCode",{parentName:"p"},"renderToPipeableStream")," ",(0,i.kt)("inlineCode",{parentName:"p"},"tramvai")," still waiting ",(0,i.kt)("inlineCode",{parentName:"p"},"commandLineRunner")," and page Actions before send HTML to client, the main difference is ",(0,i.kt)("inlineCode",{parentName:"p"},"Suspense")," support: first chunk of HTML will contain application shell (usual rendering result with fallbacks for suspended components), and next chunks will have code to resolve suspended components."),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/docs/features/data-fetching/streaming-data"},"Deferred Actions")," is based on this feature."),(0,i.kt)("h2",{id:"how-to-use-rendertopipeablestream"},"How to use ",(0,i.kt)("inlineCode",{parentName:"h2"},"renderToPipeableStream")),(0,i.kt)("admonition",{type:"caution"},(0,i.kt)("p",{parentName:"admonition"},"Experimental feature")),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-ts"},"import { REACT_SERVER_RENDER_MODE } from '@tramvai/tokens-render';\n\nconst provider = provide({\n  provide: REACT_SERVER_RENDER_MODE,\n  useValue: 'streaming',\n});\n")))}u.isMDXComponent=!0}}]);