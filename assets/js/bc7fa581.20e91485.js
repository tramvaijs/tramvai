"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[1739],{3905:(e,t,r)=>{r.d(t,{Zo:()=>s,kt:()=>b});var n=r(7294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function o(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function i(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?o(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function l(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},o=Object.keys(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var c=n.createContext({}),p=function(e){var t=n.useContext(c),r=t;return e&&(r="function"==typeof e?e(t):i(i({},t),e)),r},s=function(e){var t=p(e.components);return n.createElement(c.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},f=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,o=e.originalType,c=e.parentName,s=l(e,["components","mdxType","originalType","parentName"]),f=p(r),b=a,m=f["".concat(c,".").concat(b)]||f[b]||u[b]||o;return r?n.createElement(m,i(i({ref:t},s),{},{components:r})):n.createElement(m,i({ref:t},s))}));function b(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=r.length,i=new Array(o);i[0]=f;var l={};for(var c in t)hasOwnProperty.call(t,c)&&(l[c]=t[c]);l.originalType=e,l.mdxType="string"==typeof e?e:a,i[1]=l;for(var p=2;p<o;p++)i[p]=r[p];return n.createElement.apply(null,i)}return n.createElement.apply(null,r)}f.displayName="MDXCreateElement"},5498:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>s,contentTitle:()=>c,default:()=>b,frontMatter:()=>l,metadata:()=>p,toc:()=>u});var n=r(7462),a=r(3366),o=(r(7294),r(3905)),i=["components"],l={},c=void 0,p={unversionedId:"references/tools/public-packages",id:"references/tools/public-packages",title:"public-packages",description:"Explanation",source:"@site/tmp-docs/references/tools/public-packages.md",sourceDirName:"references/tools",slug:"/references/tools/public-packages",permalink:"/docs/references/tools/public-packages",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/tmp-docs/references/tools/public-packages.md",tags:[],version:"current",frontMatter:{},sidebar:"sidebar",previous:{title:"nx-plugin",permalink:"/docs/references/tools/nx-plugin"},next:{title:"contribute",permalink:"/docs/contribute/"}},s={},u=[{value:"Explanation",id:"explanation",level:2}],f={toc:u};function b(e){var t=e.components,r=(0,a.Z)(e,i);return(0,o.kt)("wrapper",(0,n.Z)({},f,r,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("h2",{id:"explanation"},"Explanation"),(0,o.kt)("p",null,"This package contains a list of libraries that are available for open source publication and utilities for preparing these libraries for open source."),(0,o.kt)("p",null,"List of utilities:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("p",{parentName:"li"},"`tools/public-packages/update-public-packages-versions.js'"),(0,o.kt)("p",{parentName:"li"},"  it is expected that the ",(0,o.kt)("inlineCode",{parentName:"p"},"packages-versions.json")," file with the latest current versions of packages will be available in the public code, and the script will be able to replace ",(0,o.kt)("inlineCode",{parentName:"p"},"0.0.0-stub")," versions with the real ones, before publishing packages to ",(0,o.kt)("inlineCode",{parentName:"p"},"npm"),"."))))}b.isMDXComponent=!0}}]);