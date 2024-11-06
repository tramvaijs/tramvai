"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[249],{3905:function(e,r,t){t.d(r,{Zo:function(){return s},kt:function(){return m}});var n=t(7294);function a(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function o(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);r&&(n=n.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,n)}return t}function c(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?o(Object(t),!0).forEach((function(r){a(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):o(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}function p(e,r){if(null==e)return{};var t,n,a=function(e,r){if(null==e)return{};var t,n,a={},o=Object.keys(e);for(n=0;n<o.length;n++)t=o[n],r.indexOf(t)>=0||(a[t]=e[t]);return a}(e,r);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)t=o[n],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var i=n.createContext({}),l=function(e){var r=n.useContext(i),t=r;return e&&(t="function"==typeof e?e(r):c(c({},r),e)),t},s=function(e){var r=l(e.components);return n.createElement(i.Provider,{value:r},e.children)},u={inlineCode:"code",wrapper:function(e){var r=e.children;return n.createElement(n.Fragment,{},r)}},f=n.forwardRef((function(e,r){var t=e.components,a=e.mdxType,o=e.originalType,i=e.parentName,s=p(e,["components","mdxType","originalType","parentName"]),f=l(t),m=a,g=f["".concat(i,".").concat(m)]||f[m]||u[m]||o;return t?n.createElement(g,c(c({ref:r},s),{},{components:t})):n.createElement(g,c({ref:r},s))}));function m(e,r){var t=arguments,a=r&&r.mdxType;if("string"==typeof e||a){var o=t.length,c=new Array(o);c[0]=f;var p={};for(var i in r)hasOwnProperty.call(r,i)&&(p[i]=r[i]);p.originalType=e,p.mdxType="string"==typeof e?e:a,c[1]=p;for(var l=2;l<o;l++)c[l]=t[l];return n.createElement.apply(null,c)}return n.createElement.apply(null,t)}f.displayName="MDXCreateElement"},2565:function(e,r,t){t.r(r),t.d(r,{assets:function(){return i},contentTitle:function(){return c},default:function(){return u},frontMatter:function(){return o},metadata:function(){return p},toc:function(){return l}});var n=t(7462),a=(t(7294),t(3905));const o={},c=void 0,p={unversionedId:"references/libs/package-manager-wrapper",id:"references/libs/package-manager-wrapper",title:"package-manager-wrapper",description:"A wrapper for javascript package manager.",source:"@site/tmp-docs/references/libs/package-manager-wrapper.md",sourceDirName:"references/libs",slug:"/references/libs/package-manager-wrapper",permalink:"/docs/references/libs/package-manager-wrapper",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/tmp-docs/references/libs/package-manager-wrapper.md",tags:[],version:"current",frontMatter:{},sidebar:"sidebar",previous:{title:"monkeypatch",permalink:"/docs/references/libs/monkeypatch"},next:{title:"prettier",permalink:"/docs/references/libs/prettier"}},i={},l=[{value:"How To",id:"how-to",level:2},{value:"Get project package manager",id:"get-project-package-manager",level:3}],s={toc:l};function u(e){let{components:r,...t}=e;return(0,a.kt)("wrapper",(0,n.Z)({},s,t,{components:r,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"A wrapper for javascript package manager."),(0,a.kt)("h2",{id:"how-to"},"How To"),(0,a.kt)("h3",{id:"get-project-package-manager"},"Get project package manager"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-ts"},"import { resolvePackageManager } from '@tinkoff/package-manager-wrapper';\n\nconst packageManager = resolvePackageManager({ rootDir: process.cwd() });\n\npackageManager.install();\n")))}u.isMDXComponent=!0}}]);