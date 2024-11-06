"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[4161],{3905:function(e,r,t){t.d(r,{Zo:function(){return p},kt:function(){return u}});var n=t(7294);function o(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function i(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);r&&(n=n.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,n)}return t}function c(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?i(Object(t),!0).forEach((function(r){o(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):i(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}function a(e,r){if(null==e)return{};var t,n,o=function(e,r){if(null==e)return{};var t,n,o={},i=Object.keys(e);for(n=0;n<i.length;n++)t=i[n],r.indexOf(t)>=0||(o[t]=e[t]);return o}(e,r);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)t=i[n],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(o[t]=e[t])}return o}var s=n.createContext({}),l=function(e){var r=n.useContext(s),t=r;return e&&(t="function"==typeof e?e(r):c(c({},r),e)),t},p=function(e){var r=l(e.components);return n.createElement(s.Provider,{value:r},e.children)},f={inlineCode:"code",wrapper:function(e){var r=e.children;return n.createElement(n.Fragment,{},r)}},d=n.forwardRef((function(e,r){var t=e.components,o=e.mdxType,i=e.originalType,s=e.parentName,p=a(e,["components","mdxType","originalType","parentName"]),d=l(t),u=o,m=d["".concat(s,".").concat(u)]||d[u]||f[u]||i;return t?n.createElement(m,c(c({ref:r},p),{},{components:t})):n.createElement(m,c({ref:r},p))}));function u(e,r){var t=arguments,o=r&&r.mdxType;if("string"==typeof e||o){var i=t.length,c=new Array(i);c[0]=d;var a={};for(var s in r)hasOwnProperty.call(r,s)&&(a[s]=r[s]);a.originalType=e,a.mdxType="string"==typeof e?e:o,c[1]=a;for(var l=2;l<i;l++)c[l]=t[l];return n.createElement.apply(null,c)}return n.createElement.apply(null,t)}d.displayName="MDXCreateElement"},4068:function(e,r,t){t.r(r),t.d(r,{assets:function(){return s},contentTitle:function(){return c},default:function(){return f},frontMatter:function(){return i},metadata:function(){return a},toc:function(){return l}});var n=t(7462),o=(t(7294),t(3905));const i={},c=void 0,a={unversionedId:"references/tools/monorepo/fix-ts-references",id:"references/tools/monorepo/fix-ts-references",title:"fix-ts-references",description:"All of the dependencies for linked packages in monorepo should be specified in tsconfig.references file in order to let tsc to build packages and their dependencies in the right order within single compilation pass.",source:"@site/tmp-docs/references/tools/monorepo/fix-ts-references.md",sourceDirName:"references/tools/monorepo",slug:"/references/tools/monorepo/fix-ts-references",permalink:"/docs/references/tools/monorepo/fix-ts-references",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/tmp-docs/references/tools/monorepo/fix-ts-references.md",tags:[],version:"current",frontMatter:{},sidebar:"sidebar",previous:{title:"depscheck",permalink:"/docs/references/tools/monorepo/depscheck"},next:{title:"pkgs-collector-dir",permalink:"/docs/references/tools/monorepo/pkgs-collector-dir"}},s={},l=[{value:"Install",id:"install",level:2},{value:"Usage",id:"usage",level:2}],p={toc:l};function f(e){let{components:r,...t}=e;return(0,o.kt)("wrapper",(0,n.Z)({},p,t,{components:r,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"All of the dependencies for linked packages in monorepo should be specified in ",(0,o.kt)("inlineCode",{parentName:"p"},"tsconfig.references")," file in order to let ",(0,o.kt)("inlineCode",{parentName:"p"},"tsc")," to build packages and their dependencies in the right order within single compilation pass."),(0,o.kt)("h2",{id:"install"},"Install"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre"},"yarn add fix-ts-references\n")),(0,o.kt)("h2",{id:"usage"},"Usage"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre"},"npx fix-ts-references --fix\n")),(0,o.kt)("p",null,"Script will do next:"),(0,o.kt)("p",null,"With flag ",(0,o.kt)("inlineCode",{parentName:"p"},"--fix"),":"),(0,o.kt)("ol",null,(0,o.kt)("li",{parentName:"ol"},"Remove references from references list for package if dependency has been removed from ",(0,o.kt)("inlineCode",{parentName:"li"},"package.json")),(0,o.kt)("li",{parentName:"ol"},"Add new references to references list for package if dependency has been added to ",(0,o.kt)("inlineCode",{parentName:"li"},"package.json")),(0,o.kt)("li",{parentName:"ol"},"Setting ",(0,o.kt)("inlineCode",{parentName:"li"},"tsconfig.compilerOptions.rootDir=./src")," if it is not set"),(0,o.kt)("li",{parentName:"ol"},"Remove reference from project reference solution if package has been removed from repository"),(0,o.kt)("li",{parentName:"ol"},"Add reference to project reference solution if package has been added to the repository")),(0,o.kt)("p",null,"Without flag ",(0,o.kt)("inlineCode",{parentName:"p"},"--fix")," will just show list of errors"))}f.isMDXComponent=!0}}]);