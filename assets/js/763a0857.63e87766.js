"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[3615],{3905:function(e,t,r){r.d(t,{Zo:function(){return p},kt:function(){return m}});var n=r(7294);function o(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function a(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function i(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?a(Object(r),!0).forEach((function(t){o(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):a(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function s(e,t){if(null==e)return{};var r,n,o=function(e,t){if(null==e)return{};var r,n,o={},a=Object.keys(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||(o[r]=e[r]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(o[r]=e[r])}return o}var c=n.createContext({}),l=function(e){var t=n.useContext(c),r=t;return e&&(r="function"==typeof e?e(t):i(i({},t),e)),r},p=function(e){var t=l(e.components);return n.createElement(c.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},u=n.forwardRef((function(e,t){var r=e.components,o=e.mdxType,a=e.originalType,c=e.parentName,p=s(e,["components","mdxType","originalType","parentName"]),u=l(r),m=o,f=u["".concat(c,".").concat(m)]||u[m]||d[m]||a;return r?n.createElement(f,i(i({ref:t},p),{},{components:r})):n.createElement(f,i({ref:t},p))}));function m(e,t){var r=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var a=r.length,i=new Array(a);i[0]=u;var s={};for(var c in t)hasOwnProperty.call(t,c)&&(s[c]=t[c]);s.originalType=e,s.mdxType="string"==typeof e?e:o,i[1]=s;for(var l=2;l<a;l++)i[l]=r[l];return n.createElement.apply(null,i)}return n.createElement.apply(null,r)}u.displayName="MDXCreateElement"},1757:function(e,t,r){r.r(t),r.d(t,{assets:function(){return c},contentTitle:function(){return i},default:function(){return d},frontMatter:function(){return a},metadata:function(){return s},toc:function(){return l}});var n=r(7462),o=(r(7294),r(3905));const a={},i=void 0,s={unversionedId:"references/tools/check-versions",id:"references/tools/check-versions",title:"check-versions",description:"Various conflicts and compatibility errors may rise when using mismatched versions of the tramvai dependencies. That's way this tool exists.",source:"@site/tmp-docs/references/tools/check-versions.md",sourceDirName:"references/tools",slug:"/references/tools/check-versions",permalink:"/docs/references/tools/check-versions",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/tmp-docs/references/tools/check-versions.md",tags:[],version:"current",frontMatter:{},sidebar:"sidebar",previous:{title:"build",permalink:"/docs/references/tools/build"},next:{title:"migrate",permalink:"/docs/references/tools/migrate"}},c={},l=[{value:"Prerelease versions",id:"prerelease-versions",level:2},{value:"Patterns for the related dependencies",id:"patterns-for-the-related-dependencies",level:2}],p={toc:l};function d(e){let{components:t,...r}=e;return(0,o.kt)("wrapper",(0,n.Z)({},p,r,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"Various conflicts and compatibility errors may rise when using ",(0,o.kt)("em",{parentName:"p"},"mismatched")," versions of the tramvai dependencies. That's way this tool exists."),(0,o.kt)("p",null,"The tool checks that all of the tramvai dependencies are consistent in ",(0,o.kt)("inlineCode",{parentName:"p"},"package.json")," for the app. That includes checks for mismatched versions between different dependencies and checks for mismatched versions in ",(0,o.kt)("inlineCode",{parentName:"p"},"package.json")," and real versions that are resolved in dependency tree."),(0,o.kt)("p",null,"Example of the wrong dependencies:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-json"},'"dependencies": {\n  "@tramvai/core": "0.5.0", // the most fresh version. The error will be thrown with the suggestion to update other dependencies\n  "@tramvai/module-common": "0.4.2",\n  "@tramvai/module-router": "0.4.2",\n  "@tramvai/state": "0.4.2",\n}\n')),(0,o.kt)("h2",{id:"prerelease-versions"},"Prerelease versions"),(0,o.kt)("p",null,"Prerelease versions often used for the testing. The tool will recognize prerelease versions for the tramvai dependencies and won't count this as mismatched in case all of the prerelease versions are higher than other stable versions."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-json"},'"dependencies": {\n    "@tramvai/core": "0.5.0-rc.2", // release candidate version. The version is higher than other dependencies, so no error will be generated\n    "@tramvai/module-common": "0.4.2",\n    "@tramvai/module-router": "0.4.2",\n    "@tramvai/state": "0.4.2",\n}\n')),(0,o.kt)("h2",{id:"patterns-for-the-related-dependencies"},"Patterns for the related dependencies"),(0,o.kt)("p",null,"Packages with the name that matches the following patterns are considered related and for these packages the ",(0,o.kt)("inlineCode",{parentName:"p"},"@tramvai/tools-check-versions")," will execute checks"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"/^@tramvai\\/core$/")),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"/^@tramvai\\/module-/")),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"/^@tramvai-tinkoff\\/module-/")),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"/^@tramvai\\/tokens-/"))))}d.isMDXComponent=!0}}]);