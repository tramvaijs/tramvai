"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[6738],{3905:function(e,t,n){n.d(t,{Zo:function(){return p},kt:function(){return m}});var r=n(7294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var o=r.createContext({}),u=function(e){var t=r.useContext(o),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},p=function(e){var t=u(e.components);return r.createElement(o.Provider,{value:t},e.children)},c={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},d=r.forwardRef((function(e,t){var n=e.components,i=e.mdxType,a=e.originalType,o=e.parentName,p=s(e,["components","mdxType","originalType","parentName"]),d=u(n),m=i,f=d["".concat(o,".").concat(m)]||d[m]||c[m]||a;return n?r.createElement(f,l(l({ref:t},p),{},{components:n})):r.createElement(f,l({ref:t},p))}));function m(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var a=n.length,l=new Array(a);l[0]=d;var s={};for(var o in t)hasOwnProperty.call(t,o)&&(s[o]=t[o]);s.originalType=e,s.mdxType="string"==typeof e?e:i,l[1]=s;for(var u=2;u<a;u++)l[u]=n[u];return r.createElement.apply(null,l)}return r.createElement.apply(null,n)}d.displayName="MDXCreateElement"},7510:function(e,t,n){n.r(t),n.d(t,{assets:function(){return o},contentTitle:function(){return l},default:function(){return c},frontMatter:function(){return a},metadata:function(){return s},toc:function(){return u}});var r=n(7462),i=(n(7294),n(3905));const a={},l=void 0,s={unversionedId:"references/cli/experiments",id:"references/cli/experiments",title:"experiments",description:"With experimental settings you can try some of the new features and options that are not stable for now, but capable to improve usage of cli in some way.",source:"@site/tmp-docs/references/cli/experiments.md",sourceDirName:"references/cli",slug:"/references/cli/experiments",permalink:"/docs/references/cli/experiments",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/tmp-docs/references/cli/experiments.md",tags:[],version:"current",frontMatter:{},sidebar:"sidebar",previous:{title:"browserslist",permalink:"/docs/references/cli/browserslist"},next:{title:"serverInline",permalink:"/docs/references/cli/serverInline"}},o={},u=[{value:"CLI settings",id:"cli-settings",level:2},{value:"serverRunner",id:"serverrunner",level:3},{value:"Defaults",id:"defaults",level:4},{value:"Webpack settings",id:"webpack-settings",level:2},{value:"Defaults",id:"defaults-1",level:3},{value:"minicss",id:"minicss",level:2},{value:"Defaults",id:"defaults-2",level:3},{value:"transpilation",id:"transpilation",level:2},{value:"swc",id:"swc",level:3},{value:"Defaults",id:"defaults-3",level:3},{value:"minifier",id:"minifier",level:2},{value:"Defaults",id:"defaults-4",level:3},{value:"Auto generation declareAction&#39;s <code>name</code> attribute",id:"auto-generation-declareactions-name-attribute",level:2}],p={toc:u};function c(e){let{components:t,...n}=e;return(0,i.kt)("wrapper",(0,r.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"With experimental settings you can try some of the new features and options that are not stable for now, but capable to improve usage of cli in some way."),(0,i.kt)("p",null,"Experimental flags are provided in ",(0,i.kt)("inlineCode",{parentName:"p"},"tramvai.json")," and should be passed separately for ",(0,i.kt)("inlineCode",{parentName:"p"},"server")," and ",(0,i.kt)("inlineCode",{parentName:"p"},"build")," configurations."),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"tramvai.json"),":"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "$schema": "./node_modules/@tramvai/cli/schema.json",\n  "projects": {\n    "app": {\n      "name": "app",\n      "root": "src",\n      "type": "application",\n      "experiments": {\n        "minicss": {\n          "useImportModule": true\n        },\n        "webpack": {\n          "cacheUnaffected": true\n        },\n        "transpilation": {\n          "loader": {\n            "development": "swc",\n            "production": "babel"\n          }\n        }\n      }\n    }\n  }\n}\n')),(0,i.kt)("h2",{id:"cli-settings"},"CLI settings"),(0,i.kt)("h3",{id:"serverrunner"},"serverRunner"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},'serverRunner="process"|"thread"'),' - use different ways to run the server app in development mode. "thread" most of the time is faster, but might lead to some bugs, especially when running cli though nodejs api')),(0,i.kt)("h4",{id:"defaults"},"Defaults"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},'serverRunner="thread"'),' - if you get any problems, can switch to "process", it is not experimental and can be safely used')),(0,i.kt)("h2",{id:"webpack-settings"},"Webpack settings"),(0,i.kt)("p",null,"Webpack by itself has ",(0,i.kt)("a",{parentName:"p",href:"https://webpack.js.org/configuration/experiments/#experimentsoutputmodule"},"a list of experimental flags")," which might be passed directly to webpack through ",(0,i.kt)("inlineCode",{parentName:"p"},"experiments.webpack"),"."),(0,i.kt)("h3",{id:"defaults-1"},"Defaults"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"cacheUnaffected=true")," - should improve build performance in development mode")),(0,i.kt)("h2",{id:"minicss"},"minicss"),(0,i.kt)("p",null,"Flags are specified through ",(0,i.kt)("inlineCode",{parentName:"p"},"experiments.minicss")," and allows to enable experimental settings for ",(0,i.kt)("a",{parentName:"p",href:"https://github.com/webpack-contrib/mini-css-extract-plugin"},(0,i.kt)("inlineCode",{parentName:"a"},"mini-css-extract-plugin"))),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"useImportModule")," - enables a special way to compile css modules that should improve build time and decrease memory usage. More details ",(0,i.kt)("a",{parentName:"li",href:"https://github.com/webpack-contrib/mini-css-extract-plugin#experimentalUseImportModule"},"in the official docs"))),(0,i.kt)("h3",{id:"defaults-2"},"Defaults"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"useImportModule=true")," - enabled by default as this improves build time and provides better css related error descriptions")),(0,i.kt)("h2",{id:"transpilation"},"transpilation"),(0,i.kt)("p",null,"Settings for the js-ts transpilation process"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},'loader="babel"|"swc"')," - use specific transpiler")),(0,i.kt)("h3",{id:"swc"},"swc"),(0,i.kt)("p",null,"To use ",(0,i.kt)("inlineCode",{parentName:"p"},'loader="swc"')," you need to install special integration package:"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"npx tramvai add --dev @tramvai/swc-integration")),(0,i.kt)("h3",{id:"defaults-3"},"Defaults"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},'loader="babel"')," - babel in not experimental setup and can be safely used")),(0,i.kt)("h2",{id:"minifier"},"minifier"),(0,i.kt)("p",null,"Settings for the minification process"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},'minifier="terser"|"swc"')," - use specific ",(0,i.kt)("a",{parentName:"li",href:"https://webpack.js.org/plugins/terser-webpack-plugin/#swc"},"minifier")," for terser webpack plugin.")),(0,i.kt)("h3",{id:"defaults-4"},"Defaults"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},'minifier="terser"')," - terser is default minifier for terser plugin")),(0,i.kt)("h2",{id:"auto-generation-declareactions-name-attribute"},"Auto generation declareAction's ",(0,i.kt)("inlineCode",{parentName:"h2"},"name")," attribute"),(0,i.kt)("p",null,"As you know ",(0,i.kt)("inlineCode",{parentName:"p"},"name")," attribute should be unique across your application. You can auto generate them by opting-in this feature"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},'"enableFillDeclareActionNamePlugin": true')," - to turn auto generating on. Right now it works only when ",(0,i.kt)("inlineCode",{parentName:"li"},'loader="babel"'))))}c.isMDXComponent=!0}}]);