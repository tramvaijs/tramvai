"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[4133],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>m});var r=n(7294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function s(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function a(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var l=r.createContext({}),c=function(e){var t=r.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):s(s({},t),e)),n},p=function(e){var t=c(e.components);return r.createElement(l.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},d=r.forwardRef((function(e,t){var n=e.components,i=e.mdxType,o=e.originalType,l=e.parentName,p=a(e,["components","mdxType","originalType","parentName"]),d=c(n),m=i,f=d["".concat(l,".").concat(m)]||d[m]||u[m]||o;return n?r.createElement(f,s(s({ref:t},p),{},{components:n})):r.createElement(f,s({ref:t},p))}));function m(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var o=n.length,s=new Array(o);s[0]=d;var a={};for(var l in t)hasOwnProperty.call(t,l)&&(a[l]=t[l]);a.originalType=e,a.mdxType="string"==typeof e?e:i,s[1]=a;for(var c=2;c<o;c++)s[c]=n[c];return r.createElement.apply(null,s)}return r.createElement.apply(null,n)}d.displayName="MDXCreateElement"},7782:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>l,default:()=>m,frontMatter:()=>a,metadata:()=>c,toc:()=>u});var r=n(7462),i=n(3366),o=(n(7294),n(3905)),s=["components"],a={},l=void 0,c={unversionedId:"references/cli/serverInline",id:"references/cli/serverInline",title:"serverInline",description:"Sometimes there is a need to construct js-code on server to then put it to the initial html render. The issue raises if EcmaScript version used on server for generating client code is not supported by client browser (this usually happens because we use es2015+ while writing code but of the clients still use outdated browsers that support only es5). Even more, if server code is get transpiled on server it still transpiles to a specific nodejs version that is not suitable for browsers.",source:"@site/tmp-docs/references/cli/serverInline.md",sourceDirName:"references/cli",slug:"/references/cli/serverInline",permalink:"/docs/references/cli/serverInline",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/get-started/overview.md/tmp-docs/references/cli/serverInline.md",tags:[],version:"current",frontMatter:{},sidebar:"sidebar",previous:{title:"experiments",permalink:"/docs/references/cli/experiments"},next:{title:"browser-timings",permalink:"/docs/references/libs/browser-timings"}},p={},u=[{value:"Solution",id:"solution",level:2},{value:"Example",id:"example",level:3}],d={toc:u};function m(e){var t=e.components,n=(0,i.Z)(e,s);return(0,o.kt)("wrapper",(0,r.Z)({},d,n,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"Sometimes there is a need to construct js-code on server to then put it to the initial html render. The issue raises if EcmaScript version used on server for generating client code is not supported by client browser (this usually happens because we use es2015+ while writing code but of the clients still use outdated browsers that support only es5). Even more, if server code is get transpiled on server it still transpiles to a specific nodejs version that is not suitable for browsers."),(0,o.kt)("h2",{id:"solution"},"Solution"),(0,o.kt)("p",null,"For clients transpilation is already happens using wepback and babel that targets specific browsers. That way we can reuse that transpilation for client code in order to build specific code on the server which is intended to use on client-side."),(0,o.kt)("p",null,"Rules for transpiling specific code for clients on the server:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"code for insertion must be placed in separate file"),(0,o.kt)("li",{parentName:"ul"},"inside that file no imports should be used as it requires webpack runtime which won't know about server modules on the client"),(0,o.kt)("li",{parentName:"ul"},"code itself should be defined as exported function and these functions can use only passed arguments. Using external variables is not possible"),(0,o.kt)("li",{parentName:"ul"},"the name of the file should end on ",(0,o.kt)("inlineCode",{parentName:"li"},".inline(.es)?.[tj]s"),". It works as a marker to transpile this file with a client config"),(0,o.kt)("li",{parentName:"ul"},"instead on inline code put to the insertion place the string with call of the exported function with passing arguments to it. Thanks to the fact that conversion function to string returns the body of the function itself it should work on the client")),(0,o.kt)("h3",{id:"example"},"Example"),(0,o.kt)("ol",null,(0,o.kt)("li",{parentName:"ol"},(0,o.kt)("p",{parentName:"li"},"Create new file ",(0,o.kt)("inlineCode",{parentName:"p"},"test.inline.ts")," with the inline code"),(0,o.kt)("pre",{parentName:"li"},(0,o.kt)("code",{parentName:"pre",className:"language-ts"},"export const test = (arg: string) => {\n  class Test {\n    log() {\n      console.log({\n        arg,\n        a: 1,\n      });\n    }\n  }\n\n  const t = new Test();\n\n  t.log();\n};\n"))),(0,o.kt)("li",{parentName:"ol"},(0,o.kt)("p",{parentName:"li"},"Import the exported function and put it to the initial html"),(0,o.kt)("pre",{parentName:"li"},(0,o.kt)("code",{parentName:"pre",className:"language-ts"},"import { Module } from '@tramvai/core';\nimport { RENDER_SLOTS, ResourceType, ResourceSlot } from '@tramvai/module-render';\nimport { test } from './test.inline';\n\n@Module({\n  providers: [\n    {\n      provide: RENDER_SLOTS,\n      multi: true,\n      useFactory: () => {\n        const arg = 'Hello';\n\n        return {\n          slot: ResourceSlot.HEAD_SCRIPTS,\n          type: ResourceType.inlineScript,\n          // Please, note that we are using function like we are adding new iife function, but instead of adding the body of function manually we are using import from the module\n          // And when passing string as arguments we should additionally wrap it with quotes\n          payload: `(${test})('${arg}')`,\n        };\n      },\n    },\n  ],\n})\nexport class CustomModule {}\n"))),(0,o.kt)("li",{parentName:"ol"},(0,o.kt)("p",{parentName:"li"},"After building the project and requesting the page, the browser should get the code looking like that instead of source code"),(0,o.kt)("pre",{parentName:"li"},(0,o.kt)("code",{parentName:"pre",className:"language-html"},"<script>\n  (function test(arg) {\n    var Test = /*#__PURE__*/ (function () {\n      function Test() {}\n\n      var _proto = Test.prototype;\n\n      _proto.log = function log() {\n        console.log({\n          arg: arg,\n          a: 1,\n        });\n      };\n\n      return Test;\n    })();\n\n    var t = new Test();\n    t.log();\n  })('Hello');\n<\/script>\n")))))}m.isMDXComponent=!0}}]);