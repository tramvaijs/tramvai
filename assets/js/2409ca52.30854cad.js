"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[9325],{3905:function(e,t,n){n.d(t,{Zo:function(){return d},kt:function(){return m}});var o=n(7294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,o)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,o,r=function(e,t){if(null==e)return{};var n,o,r={},a=Object.keys(e);for(o=0;o<a.length;o++)n=a[o],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(o=0;o<a.length;o++)n=a[o],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var l=o.createContext({}),p=function(e){var t=o.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},d=function(e){var t=p(e.components);return o.createElement(l.Provider,{value:t},e.children)},c={inlineCode:"code",wrapper:function(e){var t=e.children;return o.createElement(o.Fragment,{},t)}},u=o.forwardRef((function(e,t){var n=e.components,r=e.mdxType,a=e.originalType,l=e.parentName,d=s(e,["components","mdxType","originalType","parentName"]),u=p(n),m=r,k=u["".concat(l,".").concat(m)]||u[m]||c[m]||a;return n?o.createElement(k,i(i({ref:t},d),{},{components:n})):o.createElement(k,i({ref:t},d))}));function m(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var a=n.length,i=new Array(a);i[0]=u;var s={};for(var l in t)hasOwnProperty.call(t,l)&&(s[l]=t[l]);s.originalType=e,s.mdxType="string"==typeof e?e:r,i[1]=s;for(var p=2;p<a;p++)i[p]=n[p];return o.createElement.apply(null,i)}return o.createElement.apply(null,n)}u.displayName="MDXCreateElement"},1934:function(e,t,n){n.r(t),n.d(t,{assets:function(){return l},contentTitle:function(){return i},default:function(){return c},frontMatter:function(){return a},metadata:function(){return s},toc:function(){return p}});var o=n(7462),r=(n(7294),n(3905));const a={id:"storybook",title:"Storybook integration"},i=void 0,s={unversionedId:"guides/storybook",id:"guides/storybook",title:"Storybook integration",description:"Introduction",source:"@site/tmp-docs/guides/storybook.md",sourceDirName:"guides",slug:"/guides/storybook",permalink:"/docs/guides/storybook",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/tmp-docs/guides/storybook.md",tags:[],version:"current",frontMatter:{id:"storybook",title:"Storybook integration"},sidebar:"sidebar",previous:{title:"Server optimization",permalink:"/docs/guides/server-optimization"},next:{title:"Strong typing",permalink:"/docs/guides/strong-typing"}},l={},p=[{value:"Introduction",id:"introduction",level:2},{value:"Adding Storybook",id:"adding-storybook",level:2},{value:"@tramvai/storybook-addon installation",id:"tramvaistorybook-addon-installation",level:2},{value:"Page story creation",id:"page-story-creation",level:2}],d={toc:p};function c(e){let{components:t,...a}=e;return(0,r.kt)("wrapper",(0,o.Z)({},d,a,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("h2",{id:"introduction"},"Introduction"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"tramvai")," provides addon with deep Storybook integration - ",(0,r.kt)("a",{parentName:"p",href:"/docs/references/tramvai/storybook-addon"},"@tramvai/storybook-addon"),".\nThis integration includes build configuration as close as possible to the real ",(0,r.kt)("inlineCode",{parentName:"p"},"tramvai")," behaviour and supports for all ",(0,r.kt)("inlineCode",{parentName:"p"},"tramvai")," specific React providers."),(0,r.kt)("admonition",{type:"note"},(0,r.kt)("p",{parentName:"admonition"},"This guide is based on an application generated through ",(0,r.kt)("inlineCode",{parentName:"p"},"tramvai new {{appName}}"),", the integration in each case may be slightly different.")),(0,r.kt)("h2",{id:"adding-storybook"},"Adding Storybook"),(0,r.kt)("admonition",{type:"info"},(0,r.kt)("p",{parentName:"admonition"},"Storybook has many dependencies that may conflict with the ",(0,r.kt)("inlineCode",{parentName:"p"},"@tramvai/cli")," dependencies, ",(0,r.kt)("strong",{parentName:"p"},"so we strongly recommend to install Storybook at the different folder in your repositiry"),".")),(0,r.kt)("p",null,"\u231b Create a new directory for Storybook:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-bash"},"mkdir storybook && cd storybook\n")),(0,r.kt)("p",null,"\u231b Initialize Storybook inside this directory (with ",(0,r.kt)("inlineCode",{parentName:"p"},"webpack5")," builder):"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-bash"},"npx sb init --type webpack_react --builder webpack5\n")),(0,r.kt)("p",null,"\u231b Install ",(0,r.kt)("inlineCode",{parentName:"p"},"postcss")," inside this directory (required package):"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-bash"},"npm install --save-dev postcss\n")),(0,r.kt)("h2",{id:"tramvaistorybook-addon-installation"},"@tramvai/storybook-addon installation"),(0,r.kt)("admonition",{type:"info"},(0,r.kt)("p",{parentName:"admonition"},"The components in the application and the Storybook must have the same React context.\nFor this reason, we must ",(0,r.kt)("strong",{parentName:"p"},"not have")," ",(0,r.kt)("inlineCode",{parentName:"p"},"tramvai")," dependencies duplicates.\nTo prevent problems with duplicates, ",(0,r.kt)("inlineCode",{parentName:"p"},"@tramvai/storybook-addon")," should be installed in the root of the project, not in the ",(0,r.kt)("inlineCode",{parentName:"p"},"storybook")," folder.\nWhen running, Storybook will still find the addon because of the module resolution algorithm in NodeJS.")),(0,r.kt)("p",null,"\u231b Back to the root folder:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-bash"},"cd ../\n")),(0,r.kt)("p",null,"\u231b Install ",(0,r.kt)("inlineCode",{parentName:"p"},"@tramvai/storybook-addon"),":"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-bash"},"npx tramvai add --dev @tramvai/storybook-addon\n")),(0,r.kt)("p",null,"\u231b connect addon in the configuration file:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-js",metastring:'title="storybook/.storybook/main.js"',title:'"storybook/.storybook/main.js"'},'  "stories": [\n    "../stories/**/*.stories.mdx",\n    "../stories/**/*.stories.@(js|jsx|ts|tsx)"\n  ],\n  "addons": [\n    "@storybook/addon-links",\n    "@storybook/addon-essentials",\n    "@storybook/addon-interactions",\n    // highlight-next-line\n    "@tramvai/storybook-addon"\n  ],\n  "framework": "@storybook/react",\n  "core": {\n    "builder": "@storybook/builder-webpack5"\n  }\n}\n')),(0,r.kt)("h2",{id:"page-story-creation"},"Page story creation"),(0,r.kt)("p",null,"\u231b Create story for main page:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-tsx",metastring:'title="storybook/stories/pages/main.stories.tsx"',title:'"storybook/stories/pages/main.stories.tsx"'},"import type { TramvaiStoriesParameters } from '@tramvai/storybook-addon';\nimport Main from '../../../src/routes/index';\n\nconst parameters: TramvaiStoriesParameters = {};\n\nexport default {\n  title: 'Pages/Main',\n  component: Main,\n  parameters,\n};\n\nexport const MainPage = () => <Main />;\n")),(0,r.kt)("p",null,"\u231b Run Storybook:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-bash"},"cd storybook && npm run storybook\n")),(0,r.kt)("p",null,"And you can see a Main page story at ",(0,r.kt)("inlineCode",{parentName:"p"},"http://localhost:6006/?path=/story/pages-main--main-page"),":"),(0,r.kt)("p",null,(0,r.kt)("img",{alt:"Main page story",src:n(3026).Z,width:"1756",height:"1292"})),(0,r.kt)("p",null,"You can find more examples in ",(0,r.kt)("a",{parentName:"p",href:"/docs/references/tramvai/storybook-addon#how-to"},"@tramvai/storybook-addon documentation"),"."))}c.isMDXComponent=!0},3026:function(e,t,n){t.Z=n.p+"assets/images/storybook-1-58560ecb5b9af4990181735cfea274d9.png"}}]);