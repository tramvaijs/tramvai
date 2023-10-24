"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[6885],{3905:(e,n,t)=>{t.d(n,{Zo:()=>c,kt:()=>m});var r=t(7294);function a(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function l(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function i(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?l(Object(t),!0).forEach((function(n){a(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):l(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function o(e,n){if(null==e)return{};var t,r,a=function(e,n){if(null==e)return{};var t,r,a={},l=Object.keys(e);for(r=0;r<l.length;r++)t=l[r],n.indexOf(t)>=0||(a[t]=e[t]);return a}(e,n);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(r=0;r<l.length;r++)t=l[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var s=r.createContext({}),p=function(e){var n=r.useContext(s),t=n;return e&&(t="function"==typeof e?e(n):i(i({},n),e)),t},c=function(e){var n=p(e.components);return r.createElement(s.Provider,{value:n},e.children)},u={inlineCode:"code",wrapper:function(e){var n=e.children;return r.createElement(r.Fragment,{},n)}},d=r.forwardRef((function(e,n){var t=e.components,a=e.mdxType,l=e.originalType,s=e.parentName,c=o(e,["components","mdxType","originalType","parentName"]),d=p(t),m=a,f=d["".concat(s,".").concat(m)]||d[m]||u[m]||l;return t?r.createElement(f,i(i({ref:n},c),{},{components:t})):r.createElement(f,i({ref:n},c))}));function m(e,n){var t=arguments,a=n&&n.mdxType;if("string"==typeof e||a){var l=t.length,i=new Array(l);i[0]=d;var o={};for(var s in n)hasOwnProperty.call(n,s)&&(o[s]=n[s]);o.originalType=e,o.mdxType="string"==typeof e?e:a,i[1]=o;for(var p=2;p<l;p++)i[p]=t[p];return r.createElement.apply(null,i)}return r.createElement.apply(null,t)}d.displayName="MDXCreateElement"},1724:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>c,contentTitle:()=>s,default:()=>m,frontMatter:()=>o,metadata:()=>p,toc:()=>u});var r=t(7462),a=t(3366),l=(t(7294),t(3905)),i=["components"],o={},s=void 0,p={unversionedId:"references/libs/eslint-plugin-tramvai",id:"references/libs/eslint-plugin-tramvai",title:"eslint-plugin-tramvai",description:"Set of eslint rules specific to tramvai apps. Should be used primarily as an extension to @tinkoff/eslint-config",source:"@site/tmp-docs/references/libs/eslint-plugin-tramvai.md",sourceDirName:"references/libs",slug:"/references/libs/eslint-plugin-tramvai",permalink:"/docs/references/libs/eslint-plugin-tramvai",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/get-started/overview.md/tmp-docs/references/libs/eslint-plugin-tramvai.md",tags:[],version:"current",frontMatter:{},sidebar:"sidebar",previous:{title:"errors",permalink:"/docs/references/libs/errors"},next:{title:"hooks",permalink:"/docs/references/libs/hooks"}},c={},u=[{value:"Installation",id:"installation",level:2},{value:"Rules",id:"rules",level:2},{value:"bundle-chunk-name",id:"bundle-chunk-name",level:3},{value:"no-lambda-fn-in-actions",id:"no-lambda-fn-in-actions",level:3}],d={toc:u};function m(e){var n=e.components,t=(0,a.Z)(e,i);return(0,l.kt)("wrapper",(0,r.Z)({},d,t,{components:n,mdxType:"MDXLayout"}),(0,l.kt)("p",null,"Set of ",(0,l.kt)("inlineCode",{parentName:"p"},"eslint")," rules specific to ",(0,l.kt)("inlineCode",{parentName:"p"},"tramvai")," apps. Should be used primarily as an extension to ",(0,l.kt)("inlineCode",{parentName:"p"},"@tinkoff/eslint-config")),(0,l.kt)("h2",{id:"installation"},"Installation"),(0,l.kt)("p",null,"Install necessary packages first"),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-bash"},"npm i --save-dev @tinkoff/eslint-config @tinkoff/eslint-config-react @tinkoff/eslint-plugin-tramvai\n")),(0,l.kt)("p",null,"Add recommended settings to ",(0,l.kt)("inlineCode",{parentName:"p"},".eslintrc"),":"),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-bash"},'{\n  "extends": [\n    "@tinkoff/eslint-config/app",\n    "@tinkoff/eslint-config-react",\n    "plugin:@tinkoff/tramvai/recommended"\n  ]\n}\n')),(0,l.kt)("p",null,"Or add plugin manually:"),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-bash"},'{\n  "extends": [\n    "@tinkoff/eslint-config/app",\n    "@tinkoff/eslint-config-react"\n  ],\n  "plugins": [\n    "@tinkoff/tramvai"\n  ],\n  "rules": {\n    "@tinkoff/tramvai/bundle-chunk-name": "warn"\n  }\n}\n')),(0,l.kt)("h2",{id:"rules"},"Rules"),(0,l.kt)("h3",{id:"bundle-chunk-name"},"bundle-chunk-name"),(0,l.kt)("p",null,"In a tramvai app, in order to work properly with the bundle system it is necessary to put a ",(0,l.kt)("a",{parentName:"p",href:"https://tramvai.dev/docs/modules/render#%D0%BE%D1%81%D0%BE%D0%B1%D0%B5%D0%BD%D0%BD%D0%BE%D1%81%D1%82%D0%B8"},"special comment for dynamic imports"),". This rule checks that dynamic imports of bundles are marked with a proper control comment ",(0,l.kt)("inlineCode",{parentName:"p"},"webpackChunkName: [name]"),"."),(0,l.kt)("p",null,"The rule also provides autofix in order to add add/fix control comment automatically."),(0,l.kt)("p",null,"Example of the wrong code:"),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-typescript"},"createApp({\n  bundles: {\n    'tramvai/bundle-1': () => import('./bundles/bundle1'),\n    'tramvai/bundle-2': () => import(/* webpackChunkName: \"randomValue\" */ './bundles/bundle2'),\n  },\n});\n")),(0,l.kt)("p",null,"Example of the right code after autofix for the code above:"),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-typescript"},"createApp({\n  bundles: {\n    'tramvai/bundle-1': () => import(/* webpackChunkName: \"bundle-1\" */ './bundles/bundle1'),\n    'tramvai/bundle-2': () => import(/* webpackChunkName: \"bundle-2\" */ './bundles/bundle2'),\n  },\n});\n")),(0,l.kt)("p",null,"Options:"),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("inlineCode",{parentName:"li"},"propertyNames"),": defines array of object properties which will be analyzed. By default it equals to ",(0,l.kt)("inlineCode",{parentName:"li"},'["bundles"]'),".")),(0,l.kt)("h3",{id:"no-lambda-fn-in-actions"},"no-lambda-fn-in-actions"),(0,l.kt)("p",null,"In order to save context of executable actions, action function itself should be a declered by function declaration."),(0,l.kt)("p",null,"The rule bans arrow function in ",(0,l.kt)("inlineCode",{parentName:"p"},"fn")," prop of ",(0,l.kt)("inlineCode",{parentName:"p"},"declareAction")," argument and provides autofix."),(0,l.kt)("p",null,"Example of the wrong code:"),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-ts"},"export const yourAction = declareAction({\n  name: 'yourAction',\n  fn: () => {\n    /// your code\n  }\n})\n")),(0,l.kt)("p",null,"Example of the right code after autofix for the code above:"),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-ts"},"export const yourAction = declareAction({\n  name: 'yourAction',\n  fn () {\n    /// your code\n  }\n})\n")))}m.isMDXComponent=!0}}]);