"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[5231],{3905:function(e,n,t){t.d(n,{Zo:function(){return p},kt:function(){return m}});var r=t(7294);function a(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function s(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function i(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?s(Object(t),!0).forEach((function(n){a(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):s(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function o(e,n){if(null==e)return{};var t,r,a=function(e,n){if(null==e)return{};var t,r,a={},s=Object.keys(e);for(r=0;r<s.length;r++)t=s[r],n.indexOf(t)>=0||(a[t]=e[t]);return a}(e,n);if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(e);for(r=0;r<s.length;r++)t=s[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var l=r.createContext({}),c=function(e){var n=r.useContext(l),t=n;return e&&(t="function"==typeof e?e(n):i(i({},n),e)),t},p=function(e){var n=c(e.components);return r.createElement(l.Provider,{value:n},e.children)},u={inlineCode:"code",wrapper:function(e){var n=e.children;return r.createElement(r.Fragment,{},n)}},d=r.forwardRef((function(e,n){var t=e.components,a=e.mdxType,s=e.originalType,l=e.parentName,p=o(e,["components","mdxType","originalType","parentName"]),d=c(t),m=a,f=d["".concat(l,".").concat(m)]||d[m]||u[m]||s;return t?r.createElement(f,i(i({ref:n},p),{},{components:t})):r.createElement(f,i({ref:n},p))}));function m(e,n){var t=arguments,a=n&&n.mdxType;if("string"==typeof e||a){var s=t.length,i=new Array(s);i[0]=d;var o={};for(var l in n)hasOwnProperty.call(n,l)&&(o[l]=n[l]);o.originalType=e,o.mdxType="string"==typeof e?e:a,i[1]=o;for(var c=2;c<s;c++)i[c]=t[c];return r.createElement.apply(null,i)}return r.createElement.apply(null,t)}d.displayName="MDXCreateElement"},2346:function(e,n,t){t.r(n),t.d(n,{assets:function(){return l},contentTitle:function(){return i},default:function(){return u},frontMatter:function(){return s},metadata:function(){return o},toc:function(){return c}});var r=t(7462),a=(t(7294),t(3905));const s={},i=void 0,o={unversionedId:"references/libs/minicss",id:"references/libs/minicss",title:"minicss",description:"css-loader plugin which generates short css class names. Details in the article",source:"@site/tmp-docs/references/libs/minicss.md",sourceDirName:"references/libs",slug:"/references/libs/minicss",permalink:"/docs/references/libs/minicss",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/tmp-docs/references/libs/minicss.md",tags:[],version:"current",frontMatter:{},sidebar:"sidebar",previous:{title:"meta-tags-generate",permalink:"/docs/references/libs/meta-tags-generate"},next:{title:"mocker",permalink:"/docs/references/libs/mocker"}},l={},c=[{value:"Installation",id:"installation",level:2},{value:"Setup",id:"setup",level:2},{value:"How does it work",id:"how-does-it-work",level:2}],p={toc:c};function u(e){let{components:n,...t}=e;return(0,a.kt)("wrapper",(0,r.Z)({},p,t,{components:n,mdxType:"MDXLayout"}),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"css-loader")," plugin which generates short css class names. Details in the ",(0,a.kt)("a",{parentName:"p",href:"https://dev.to/denisx/reduce-bundle-size-via-one-letter-css-classname-hash-strategy-10g6"},"article")),(0,a.kt)("h2",{id:"installation"},"Installation"),(0,a.kt)("p",null,"Install using yarn"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-bash"},"yarn add --dev @tinkoff/minicss-class-generator\n")),(0,a.kt)("p",null,"or npm"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-bash"},"npm i --save-dev @tinkoff/minicss-class-generator\n")),(0,a.kt)("h2",{id:"setup"},"Setup"),(0,a.kt)("p",null,"Define options ",(0,a.kt)("inlineCode",{parentName:"p"},"localIdentName")," \u0438 ",(0,a.kt)("inlineCode",{parentName:"p"},"getLocalIdent")," for ",(0,a.kt)("inlineCode",{parentName:"p"},"css-loader")," config inside your webpack config:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-js"},"({\n  loader: 'css-loader',\n  options: {\n    modules: {\n      getLocalIdent: createGenerator(),\n      localIdentName: '[minicss]',\n    },\n  },\n});\n")),(0,a.kt)("p",null,"For ",(0,a.kt)("inlineCode",{parentName:"p"},"localIdentName")," it is possible to pass any template which is accepted by css-loader. E.g. if you want to add the origin filename and the className pass ",(0,a.kt)("inlineCode",{parentName:"p"},"[name]__[local]_[minicss]")," as ",(0,a.kt)("inlineCode",{parentName:"p"},"localIdentName")),(0,a.kt)("h2",{id:"how-does-it-work"},"How does it work"),(0,a.kt)("p",null,"Plugin generate unique key for a className using formula ",(0,a.kt)("inlineCode",{parentName:"p"},"${order}${contentHash}")," where ",(0,a.kt)("inlineCode",{parentName:"p"},"contentHash")," is a hash of the source file content and ",(0,a.kt)("inlineCode",{parentName:"p"},"order")," - ordered key of class definition inside source file. Using ",(0,a.kt)("inlineCode",{parentName:"p"},"contentHash")," from source allows to generate less unique string and allows to reuse the same ",(0,a.kt)("inlineCode",{parentName:"p"},"contentHash")," for every className that leads for better data compression with gzip/brotli. Using ",(0,a.kt)("inlineCode",{parentName:"p"},"order")," helps sustain uniqueness for every className in single source file."),(0,a.kt)("p",null,"Examples:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre"},"[hash:base64:5]\nfile: Button.css\n .2hlLi\n .32BZU\n")),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre"},"[minicss]\nfile: Button.css\n .abhUzy\n .bbhUzy\n")))}u.isMDXComponent=!0}}]);