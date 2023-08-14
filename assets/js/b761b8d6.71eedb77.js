"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[5474],{3905:(e,n,t)=>{t.d(n,{Zo:()=>c,kt:()=>m});var r=t(7294);function a(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function i(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function o(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?i(Object(t),!0).forEach((function(n){a(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):i(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function l(e,n){if(null==e)return{};var t,r,a=function(e,n){if(null==e)return{};var t,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)t=i[r],n.indexOf(t)>=0||(a[t]=e[t]);return a}(e,n);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)t=i[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var s=r.createContext({}),p=function(e){var n=r.useContext(s),t=n;return e&&(t="function"==typeof e?e(n):o(o({},n),e)),t},c=function(e){var n=p(e.components);return r.createElement(s.Provider,{value:n},e.children)},u={inlineCode:"code",wrapper:function(e){var n=e.children;return r.createElement(r.Fragment,{},n)}},d=r.forwardRef((function(e,n){var t=e.components,a=e.mdxType,i=e.originalType,s=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),d=p(t),m=a,b=d["".concat(s,".").concat(m)]||d[m]||u[m]||i;return t?r.createElement(b,o(o({ref:n},c),{},{components:t})):r.createElement(b,o({ref:n},c))}));function m(e,n){var t=arguments,a=n&&n.mdxType;if("string"==typeof e||a){var i=t.length,o=new Array(i);o[0]=d;var l={};for(var s in n)hasOwnProperty.call(n,s)&&(l[s]=n[s]);l.originalType=e,l.mdxType="string"==typeof e?e:a,o[1]=l;for(var p=2;p<i;p++)o[p]=t[p];return r.createElement.apply(null,o)}return r.createElement.apply(null,t)}d.displayName="MDXCreateElement"},6210:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>c,contentTitle:()=>s,default:()=>m,frontMatter:()=>l,metadata:()=>p,toc:()=>u});var r=t(7462),a=t(3366),i=(t(7294),t(3905)),o=["components"],l={sidebar_position:4},s=void 0,p={unversionedId:"references/cli/build",id:"references/cli/build",title:"build",description:"Library build",source:"@site/tmp-docs/references/cli/build.md",sourceDirName:"references/cli",slug:"/references/cli/build",permalink:"/docs/references/cli/build",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/get-started/overview.md/tmp-docs/references/cli/build.md",tags:[],version:"current",sidebarPosition:4,frontMatter:{sidebar_position:4},sidebar:"sidebar",previous:{title:"start",permalink:"/docs/references/cli/start"},next:{title:"analyze",permalink:"/docs/references/cli/analyze"}},c={},u=[{value:"Library build",id:"library-build",level:2},{value:"Enable sourcemaps in production mode",id:"enable-sourcemaps-in-production-mode",level:2}],d={toc:u};function m(e){var n=e.components,t=(0,a.Z)(e,o);return(0,i.kt)("wrapper",(0,r.Z)({},d,t,{components:n,mdxType:"MDXLayout"}),(0,i.kt)("h2",{id:"library-build"},"Library build"),(0,i.kt)("p",null,"Command ",(0,i.kt)("inlineCode",{parentName:"p"},"tramvai build")," can build libraries to separate bundles for various environments:"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},"CommonJS modules + ES2019 code (for nodejs without ESM support) - it uses field ",(0,i.kt)("inlineCode",{parentName:"li"},"main")," in ",(0,i.kt)("inlineCode",{parentName:"li"},"package.json")),(0,i.kt)("li",{parentName:"ul"},"ES modules + ES2019 code (for nodejs with ESM support) - it uses filed ",(0,i.kt)("inlineCode",{parentName:"li"},"module")," in ",(0,i.kt)("inlineCode",{parentName:"li"},"package.json")),(0,i.kt)("li",{parentName:"ul"},"ES modules + ES2019 code (for browsers) - it uses field ",(0,i.kt)("inlineCode",{parentName:"li"},"browser")," in ",(0,i.kt)("inlineCode",{parentName:"li"},"package.json"))),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"@tramvai/cli")," use ",(0,i.kt)("a",{parentName:"p",href:"/docs/references/tools/build"},"@tramvai/build")," package under the hood for bundling packages."),(0,i.kt)("p",null,"To specify new library in ",(0,i.kt)("inlineCode",{parentName:"p"},"tramvai.json")," add new project with the type ",(0,i.kt)("inlineCode",{parentName:"p"},"package"),":"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "projects": {\n    "{{packageName}}": {\n      "name": "{{packageName}}",\n      "type": "package",\n      "root": "libs/{{packageName}}"\n    }\n  }\n}\n')),(0,i.kt)("p",null,"Library settings should be specified in the ",(0,i.kt)("inlineCode",{parentName:"p"},"package.json")," of the library itself:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "name": "{{packageName}}",\n  "version": "1.0.0",\n  "main": "dist/index.js", // main library entry point\n  "browser": "dist/browser.js", // optional field, library entry point for browsers bundle\n  "typings": "src/index.ts", // \n  "sideEffects": false,\n  "scripts": {\n    "start": "tramvai build {{packageName}} --watchMode", // watch mode to develop package\n    "build": "tramvai build {{packageName}} --forPublish --preserveModules" // single time build for the production\n  }\n}\n')),(0,i.kt)("p",null,"See the complete documentation about output targets, configuration and many reciepes in ",(0,i.kt)("a",{parentName:"p",href:"/docs/references/tools/build"},"@tramvai/build documentation"),"."),(0,i.kt)("h2",{id:"enable-sourcemaps-in-production-mode"},"Enable sourcemaps in production mode"),(0,i.kt)("p",null,"In ",(0,i.kt)("inlineCode",{parentName:"p"},"tramvai.json")),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-json"},'"sourceMap": {\n  "production": true\n}\n')),(0,i.kt)("p",null,"It is equivalent to ",(0,i.kt)("inlineCode",{parentName:"p"},"devtool: 'hidden-source-map'")," in webpack config."))}m.isMDXComponent=!0}}]);