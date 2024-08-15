"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[1603],{3905:(e,r,t)=>{t.d(r,{Zo:()=>p,kt:()=>d});var n=t(7294);function o(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function i(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);r&&(n=n.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,n)}return t}function a(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?i(Object(t),!0).forEach((function(r){o(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):i(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}function s(e,r){if(null==e)return{};var t,n,o=function(e,r){if(null==e)return{};var t,n,o={},i=Object.keys(e);for(n=0;n<i.length;n++)t=i[n],r.indexOf(t)>=0||(o[t]=e[t]);return o}(e,r);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)t=i[n],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(o[t]=e[t])}return o}var c=n.createContext({}),l=function(e){var r=n.useContext(c),t=r;return e&&(t="function"==typeof e?e(r):a(a({},r),e)),t},p=function(e){var r=l(e.components);return n.createElement(c.Provider,{value:r},e.children)},u={inlineCode:"code",wrapper:function(e){var r=e.children;return n.createElement(n.Fragment,{},r)}},f=n.forwardRef((function(e,r){var t=e.components,o=e.mdxType,i=e.originalType,c=e.parentName,p=s(e,["components","mdxType","originalType","parentName"]),f=l(t),d=o,m=f["".concat(c,".").concat(d)]||f[d]||u[d]||i;return t?n.createElement(m,a(a({ref:r},p),{},{components:t})):n.createElement(m,a({ref:r},p))}));function d(e,r){var t=arguments,o=r&&r.mdxType;if("string"==typeof e||o){var i=t.length,a=new Array(i);a[0]=f;var s={};for(var c in r)hasOwnProperty.call(r,c)&&(s[c]=r[c]);s.originalType=e,s.mdxType="string"==typeof e?e:o,a[1]=s;for(var l=2;l<i;l++)a[l]=t[l];return n.createElement.apply(null,a)}return n.createElement.apply(null,t)}f.displayName="MDXCreateElement"},8775:(e,r,t)=>{t.r(r),t.d(r,{assets:()=>p,contentTitle:()=>c,default:()=>d,frontMatter:()=>s,metadata:()=>l,toc:()=>u});var n=t(7462),o=t(3366),i=(t(7294),t(3905)),a=["components"],s={},c=void 0,l={unversionedId:"references/libs/terminus",id:"references/libs/terminus",title:"terminus",description:"Fork of the library @godaddy/terminus.",source:"@site/tmp-docs/references/libs/terminus.md",sourceDirName:"references/libs",slug:"/references/libs/terminus",permalink:"/docs/references/libs/terminus",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/tmp-docs/references/libs/terminus.md",tags:[],version:"current",frontMatter:{},sidebar:"sidebar",previous:{title:"safe-strings",permalink:"/docs/references/libs/safe-strings"},next:{title:"tinkoff-layout",permalink:"/docs/references/libs/tinkoff-layout"}},p={},u=[{value:"Features",id:"features",level:2}],f={toc:u};function d(e){var r=e.components,t=(0,o.Z)(e,a);return(0,i.kt)("wrapper",(0,n.Z)({},f,t,{components:r,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"Fork of the library ",(0,i.kt)("a",{parentName:"p",href:"https://github.com/godaddy/terminus"},"@godaddy/terminus"),"."),(0,i.kt)("h2",{id:"features"},"Features"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"healthChecks")," handlers are creater for an ",(0,i.kt)("inlineCode",{parentName:"p"},"express")," app, in contrast to original library which redefines ",(0,i.kt)("inlineCode",{parentName:"p"},"request")," event handler of server object."),(0,i.kt)("p",null,"Original behaviour is more complicated in case of a need to add common logic for every request in the app, including ",(0,i.kt)("inlineCode",{parentName:"p"},"healthChecks")," itself. E.g. it was not possible to add http-header in single place to make it work for every request."))}d.isMDXComponent=!0}}]);