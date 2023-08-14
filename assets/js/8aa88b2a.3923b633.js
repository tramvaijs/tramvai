"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[3224],{3905:(e,t,n)=>{n.d(t,{Zo:()=>d,kt:()=>u});var r=n(7294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function p(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?p(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):p(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},p=Object.keys(e);for(r=0;r<p.length;r++)n=p[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var p=Object.getOwnPropertySymbols(e);for(r=0;r<p.length;r++)n=p[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var l=r.createContext({}),c=function(e){var t=r.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},d=function(e){var t=c(e.components);return r.createElement(l.Provider,{value:t},e.children)},s={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},m=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,p=e.originalType,l=e.parentName,d=o(e,["components","mdxType","originalType","parentName"]),m=c(n),u=a,f=m["".concat(l,".").concat(u)]||m[u]||s[u]||p;return n?r.createElement(f,i(i({ref:t},d),{},{components:n})):r.createElement(f,i({ref:t},d))}));function u(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var p=n.length,i=new Array(p);i[0]=m;var o={};for(var l in t)hasOwnProperty.call(t,l)&&(o[l]=t[l]);o.originalType=e,o.mdxType="string"==typeof e?e:a,i[1]=o;for(var c=2;c<p;c++)i[c]=n[c];return r.createElement.apply(null,i)}return r.createElement.apply(null,n)}m.displayName="MDXCreateElement"},1531:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>d,contentTitle:()=>l,default:()=>u,frontMatter:()=>o,metadata:()=>c,toc:()=>s});var r=n(7462),a=n(3366),p=(n(7294),n(3905)),i=["components"],o={id:"add-child-app-without-cli",title:"Add Child App without CLI"},l=void 0,c={unversionedId:"features/child-app/add-child-app-without-cli",id:"features/child-app/add-child-app-without-cli",title:"Add Child App without CLI",description:"1. Create new repo",source:"@site/tmp-docs/03-features/015-child-app/017-add-child-app-without-cli.md",sourceDirName:"03-features/015-child-app",slug:"/features/child-app/add-child-app-without-cli",permalink:"/docs/features/child-app/add-child-app-without-cli",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/get-started/overview.md/tmp-docs/03-features/015-child-app/017-add-child-app-without-cli.md",tags:[],version:"current",sidebarPosition:17,frontMatter:{id:"add-child-app-without-cli",title:"Add Child App without CLI"},sidebar:"sidebar",previous:{title:"Module Federation (shared dependencies)",permalink:"/docs/features/child-app/module-federation"},next:{title:"Known Issues",permalink:"/docs/features/child-app/known-issues"}},d={},s=[],m={toc:s};function u(e){var t=e.components,n=(0,a.Z)(e,i);return(0,p.kt)("wrapper",(0,r.Z)({},m,n,{components:t,mdxType:"MDXLayout"}),(0,p.kt)("ol",null,(0,p.kt)("li",{parentName:"ol"},(0,p.kt)("p",{parentName:"li"},"Create new repo")),(0,p.kt)("li",{parentName:"ol"},(0,p.kt)("p",{parentName:"li"},"Init package-manager")),(0,p.kt)("li",{parentName:"ol"},(0,p.kt)("p",{parentName:"li"},"Add necessarily package for child app"),(0,p.kt)("pre",{parentName:"li"},(0,p.kt)("code",{parentName:"pre",className:"language-sh"},"  yarn add --dev @tramvai/cli\n  yarn add @tramvai/child-app-core\n"))),(0,p.kt)("li",{parentName:"ol"},(0,p.kt)("p",{parentName:"li"},"Create new file ",(0,p.kt)("inlineCode",{parentName:"p"},"tramvai.json")," in the root with following content"),(0,p.kt)("pre",{parentName:"li"},(0,p.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "$schema": "./node_modules/@tramvai/cli/schema.json",\n  "projects": {\n    "[name]": {\n      "name": "[name]",\n      "root": "src",\n      "type": "child-app"\n    }\n  }\n}\n'))),(0,p.kt)("li",{parentName:"ol"},(0,p.kt)("p",{parentName:"li"},"Add scripts to ",(0,p.kt)("inlineCode",{parentName:"p"},"package.json")," for run child in dev and prod mode:"),(0,p.kt)("pre",{parentName:"li"},(0,p.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "scripts": {\n    "start": "tramvai start [name]",\n    "build": "tramvai build [name]"\n  }\n}\n'))),(0,p.kt)("li",{parentName:"ol"},(0,p.kt)("p",{parentName:"li"},"Implement your React-component wrapper (for example in ",(0,p.kt)("inlineCode",{parentName:"p"},"./src/component.tsx"),")")),(0,p.kt)("li",{parentName:"ol"},(0,p.kt)("p",{parentName:"li"},"Add new file ",(0,p.kt)("inlineCode",{parentName:"p"},"./src/entry.ts")," for you app with following content:"),(0,p.kt)("pre",{parentName:"li"},(0,p.kt)("code",{parentName:"pre",className:"language-ts"},"import { createChildApp } from '@tramvai/child-app-core';\nimport { ChildAppComponent } from './component';\n\n// eslint-disable-next-line import/no-default-export\nexport default createChildApp({\n  name: '[name]',\n  modules: [],\n  render: ChildAppComponent,\n});\n")))))}u.isMDXComponent=!0}}]);