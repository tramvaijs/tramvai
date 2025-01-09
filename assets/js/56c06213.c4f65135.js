"use strict";(globalThis.webpackChunk=globalThis.webpackChunk||[]).push([[370],{3905:(e,t,n)=>{n.d(t,{Zo:()=>u,kt:()=>b});var r=n(7294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function l(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?l(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):l(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},l=Object.keys(e);for(r=0;r<l.length;r++)n=l[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(r=0;r<l.length;r++)n=l[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var i=r.createContext({}),p=function(e){var t=r.useContext(i),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},u=function(e){var t=p(e.components);return r.createElement(i.Provider,{value:t},e.children)},c={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},d=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,l=e.originalType,i=e.parentName,u=s(e,["components","mdxType","originalType","parentName"]),d=p(n),b=a,h=d["".concat(i,".").concat(b)]||d[b]||c[b]||l;return n?r.createElement(h,o(o({ref:t},u),{},{components:n})):r.createElement(h,o({ref:t},u))}));function b(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var l=n.length,o=new Array(l);o[0]=d;var s={};for(var i in t)hasOwnProperty.call(t,i)&&(s[i]=t[i]);s.originalType=e,s.mdxType="string"==typeof e?e:a,o[1]=s;for(var p=2;p<l;p++)o[p]=n[p];return r.createElement.apply(null,o)}return r.createElement.apply(null,n)}d.displayName="MDXCreateElement"},2661:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>i,contentTitle:()=>o,default:()=>c,frontMatter:()=>l,metadata:()=>s,toc:()=>p});var r=n(7462),a=(n(7294),n(3905));const l={},o=void 0,s={unversionedId:"references/cli/analyze",id:"references/cli/analyze",title:"analyze",description:"Allow to analyze app output bundle",source:"@site/tmp-docs/references/cli/analyze.md",sourceDirName:"references/cli",slug:"/references/cli/analyze",permalink:"/docs/references/cli/analyze",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/tmp-docs/references/cli/analyze.md",tags:[],version:"current",frontMatter:{},sidebar:"sidebar",previous:{title:"build",permalink:"/docs/references/cli/build"},next:{title:"browserslist",permalink:"/docs/references/cli/browserslist"}},i={},p=[{value:"See what is got bundled",id:"see-what-is-got-bundled",level:2},{value:"Figure out why dependency got bundled",id:"figure-out-why-dependency-got-bundled",level:2},{value:"Research your bundle stats",id:"research-your-bundle-stats",level:2}],u={toc:p};function c({components:e,...t}){return(0,a.kt)("wrapper",(0,r.Z)({},u,t,{components:e,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"Allow to analyze app output bundle"),(0,a.kt)("h2",{id:"see-what-is-got-bundled"},"See what is got bundled"),(0,a.kt)("p",null,"The special webpack plugin ",(0,a.kt)("a",{parentName:"p",href:"https://github.com/webpack-contrib/webpack-bundle-analyzer"},"webpack-bundle-analyzer")," able to show every modules get bundled"),(0,a.kt)("p",null,"For running analyze"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-sh"},"npx tramvai analyze APP_ID\n")),(0,a.kt)("p",null,"After that app will be built in prod mode and a new tab in browser will be opened"),(0,a.kt)("h2",{id:"figure-out-why-dependency-got-bundled"},"Figure out why dependency got bundled"),(0,a.kt)("p",null,"With that can help utility ",(0,a.kt)("a",{parentName:"p",href:"https://github.com/d4rkr00t/whybundled"},"whybundled")," that parses the webpack ",(0,a.kt)("inlineCode",{parentName:"p"},"stats.json")," file and can show the reason why dependency has been added to bundle"),(0,a.kt)("p",null,"Run next command"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-sh"},"npx tramvai analyze APP_ID --plugin whybundled\n")),(0,a.kt)("p",null,"After that a special version of ",(0,a.kt)("inlineCode",{parentName:"p"},"stats.json")," can be found inside ",(0,a.kt)("inlineCode",{parentName:"p"},"outputClient")," directory. The exact path will be showed in your terminal"),(0,a.kt)("p",null,"Next, you can run ",(0,a.kt)("inlineCode",{parentName:"p"},"whybundled")," to resolve reasons:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-sh"},"npx whybundled ./dist/client/stats.json debug\n\n# what dependencies were bundled because of the `debug` package\nnpx whybundled ./dist/client/stats.json --by debug\n")),(0,a.kt)("p",null,"See more options ",(0,a.kt)("a",{parentName:"p",href:"https://github.com/d4rkr00t/whybundled"},"in the whybundled docs")),(0,a.kt)("h2",{id:"research-your-bundle-stats"},"Research your bundle stats"),(0,a.kt)("p",null,"One of the options is to use ",(0,a.kt)("inlineCode",{parentName:"p"},"statoscope")," plugin to analyze your bundle."),(0,a.kt)("p",null,"Statoscope is a toolkit for analyzing (with a UI-based report) and validate stats of your bundle."),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-sh"},"# generates result json file\nnpx tramvai analyze APP_ID --plugin statoscope\n")),(0,a.kt)("p",null,"When the command is finished, pass the result file to ",(0,a.kt)("a",{parentName:"p",href:"https://statoscope.tech/"},"https://statoscope.tech/")," tool."))}c.isMDXComponent=!0}}]);