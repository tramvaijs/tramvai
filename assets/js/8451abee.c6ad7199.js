"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[4924],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>m});var r=n(7294);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function i(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var s=r.createContext({}),d=function(e){var t=r.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},p=function(e){var t=d(e.components);return r.createElement(s.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},c=r.forwardRef((function(e,t){var n=e.components,o=e.mdxType,a=e.originalType,s=e.parentName,p=i(e,["components","mdxType","originalType","parentName"]),c=d(n),m=o,f=c["".concat(s,".").concat(m)]||c[m]||u[m]||a;return n?r.createElement(f,l(l({ref:t},p),{},{components:n})):r.createElement(f,l({ref:t},p))}));function m(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var a=n.length,l=new Array(a);l[0]=c;var i={};for(var s in t)hasOwnProperty.call(t,s)&&(i[s]=t[s]);i.originalType=e,i.mdxType="string"==typeof e?e:o,l[1]=i;for(var d=2;d<a;d++)l[d]=n[d];return r.createElement.apply(null,l)}return r.createElement.apply(null,n)}c.displayName="MDXCreateElement"},6138:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>s,default:()=>m,frontMatter:()=>i,metadata:()=>d,toc:()=>u});var r=n(7462),o=n(3366),a=(n(7294),n(3905)),l=["components"],i={sidebar_position:3},s=void 0,d={unversionedId:"references/cli/start",id:"references/cli/start",title:"start",description:"Command to start development build in watch mode",source:"@site/tmp-docs/references/cli/start.md",sourceDirName:"references/cli",slug:"/references/cli/start",permalink:"/docs/references/cli/start",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/get-started/overview.md/tmp-docs/references/cli/start.md",tags:[],version:"current",sidebarPosition:3,frontMatter:{sidebar_position:3},sidebar:"sidebar",previous:{title:"config",permalink:"/docs/references/cli/config"},next:{title:"build",permalink:"/docs/references/cli/build"}},p={},u=[{value:"Options",id:"options",level:2},{value:"<code>-p</code>, <code>--port</code>",id:"-p---port",level:3},{value:"React hot refresh",id:"react-hot-refresh",level:2},{value:"Enable sourcemaps in dev mode",id:"enable-sourcemaps-in-dev-mode",level:2},{value:"Modern build and dev-mode",id:"modern-build-and-dev-mode",level:2},{value:"How to",id:"how-to",level:2},{value:"Speed up development build",id:"speed-up-development-build",level:3},{value:"Build only specific bundles",id:"build-only-specific-bundles",level:4}],c={toc:u};function m(e){var t=e.components,n=(0,o.Z)(e,l);return(0,a.kt)("wrapper",(0,r.Z)({},c,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("blockquote",null,(0,a.kt)("p",{parentName:"blockquote"},"Command to start development build in watch mode")),(0,a.kt)("h2",{id:"options"},"Options"),(0,a.kt)("h3",{id:"-p---port"},(0,a.kt)("inlineCode",{parentName:"h3"},"-p"),", ",(0,a.kt)("inlineCode",{parentName:"h3"},"--port")),(0,a.kt)("p",null,"Allows to specify port on which app server will listen requests"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-sh"},"tramvai start -p 8080 <app>\n")),(0,a.kt)("h2",{id:"react-hot-refresh"},"React hot refresh"),(0,a.kt)("admonition",{type:"info"},(0,a.kt)("p",{parentName:"admonition"},"The feature is enabled by default")),(0,a.kt)("p",null,"It is possible to refresh react components without page similar to the way in works in ",(0,a.kt)("a",{parentName:"p",href:"https://reactnative.dev/docs/fast-refresh"},"React Native"),"."),(0,a.kt)("p",null,"Besides fash page refreshes (hot-reload) in that mode state is preserved for hooks ",(0,a.kt)("inlineCode",{parentName:"p"},"useState")," and ",(0,a.kt)("inlineCode",{parentName:"p"},"useRef"),"."),(0,a.kt)("blockquote",null,(0,a.kt)("p",{parentName:"blockquote"},"You can force resetting state by adding comment ",(0,a.kt)("inlineCode",{parentName:"p"},"// @refresh reset")," to the file. It will reset state for the whole file.")),(0,a.kt)("p",null,"When encounter syntax and runtime errors, fast-refresh plugin will await for the error resolving and after fix will continue to work as usual."),(0,a.kt)("p",null,"Constraints:"),(0,a.kt)("ol",null,(0,a.kt)("li",{parentName:"ol"},"state for class components doesn't preserve"),(0,a.kt)("li",{parentName:"ol"},(0,a.kt)("inlineCode",{parentName:"li"},"useEffect"),", ",(0,a.kt)("inlineCode",{parentName:"li"},"useMemo"),", ",(0,a.kt)("inlineCode",{parentName:"li"},"useCallback")," refresh on every code change despite their dependency list, it includes empty dependency list as well, e.g. ",(0,a.kt)("inlineCode",{parentName:"li"},"useEffect(() => {}, [])")," will be executed on every refresh - this is undesirable behaviour but it teaches to write stable code which is resistant for the redundant renders")),(0,a.kt)("p",null,"To enable this mode, add to ",(0,a.kt)("inlineCode",{parentName:"p"},"tramvai.json"),":"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-json"},'"hotRefresh": {\n  "enabled": true\n}\n')),(0,a.kt)("p",null,"You can configure settings with ",(0,a.kt)("inlineCode",{parentName:"p"},"hotRefreshOptions")," option, see details ",(0,a.kt)("a",{parentName:"p",href:"https://github.com/pmmmwh/react-refresh-webpack-plugin#options"},"in the docs of react-refresh"),":"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-json"},'"hotRefresh": {\n  "enabled": true,\n  "options": {\n    "overlay": false // disable error overlay\n  }\n}\n')),(0,a.kt)("h2",{id:"enable-sourcemaps-in-dev-mode"},"Enable sourcemaps in dev mode"),(0,a.kt)("p",null,"In ",(0,a.kt)("inlineCode",{parentName:"p"},"tramvai.json")),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-json"},'"sourceMap": {\n  "development": true\n}\n')),(0,a.kt)("p",null,"It is equivalent to ",(0,a.kt)("inlineCode",{parentName:"p"},"devtool: 'source-map'")," in webpack config with ",(0,a.kt)("inlineCode",{parentName:"p"},"source-map-loader"),"."),(0,a.kt)("h2",{id:"modern-build-and-dev-mode"},"Modern build and dev-mode"),(0,a.kt)("p",null,"In dev-mode may work only single build mode: either ",(0,a.kt)("inlineCode",{parentName:"p"},"modern")," or ",(0,a.kt)("inlineCode",{parentName:"p"},"legacy"),". By default ",(0,a.kt)("inlineCode",{parentName:"p"},"modern")," is used. If you want to use legacy build in dev mode, add next lines to the ",(0,a.kt)("inlineCode",{parentName:"p"},"tramvai.json"),":"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-json"},'"modern": false\n')),(0,a.kt)("h2",{id:"how-to"},"How to"),(0,a.kt)("h3",{id:"speed-up-development-build"},"Speed up development build"),(0,a.kt)("h4",{id:"build-only-specific-bundles"},"Build only specific bundles"),(0,a.kt)("p",null,"App may contain of many bundles and the more there bundle, the more code get bundled to the app, the more long in building and rebuilding the app during development."),(0,a.kt)("p",null,"In order to speed up that process when running ",(0,a.kt)("inlineCode",{parentName:"p"},"@tramvai/cli")," it is possible to specify bundles required for the development and cli will build only that bundles."),(0,a.kt)("blockquote",null,(0,a.kt)("p",{parentName:"blockquote"},"Bundles should be placed in directory ",(0,a.kt)("inlineCode",{parentName:"p"},"bundles")," and should be imported from the index app file.")),(0,a.kt)("blockquote",null,(0,a.kt)("p",{parentName:"blockquote"},"When trying to request bundle that was disabled, server will fail with status 500, as it is unexpected condition for the server that bundle is missing")),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-sh"},"tramvai start myapp --onlyBundles=account\n# if you need several bundles\ntramvai start myapp --onlyBundle=account,trading\n")))}m.isMDXComponent=!0}}]);