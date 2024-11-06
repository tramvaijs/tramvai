"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[4795],{3905:function(e,t,n){n.d(t,{Zo:function(){return c},kt:function(){return d}});var r=n(7294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var l=r.createContext({}),p=function(e){var t=r.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},c=function(e){var t=p(e.components);return r.createElement(l.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},m=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,i=e.originalType,l=e.parentName,c=s(e,["components","mdxType","originalType","parentName"]),m=p(n),d=a,f=m["".concat(l,".").concat(d)]||m[d]||u[d]||i;return n?r.createElement(f,o(o({ref:t},c),{},{components:n})):r.createElement(f,o({ref:t},c))}));function d(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=n.length,o=new Array(i);o[0]=m;var s={};for(var l in t)hasOwnProperty.call(t,l)&&(s[l]=t[l]);s.originalType=e,s.mdxType="string"==typeof e?e:a,o[1]=s;for(var p=2;p<i;p++)o[p]=n[p];return r.createElement.apply(null,o)}return r.createElement.apply(null,n)}m.displayName="MDXCreateElement"},1463:function(e,t,n){n.r(t),n.d(t,{assets:function(){return l},contentTitle:function(){return o},default:function(){return u},frontMatter:function(){return i},metadata:function(){return s},toc:function(){return p}});var r=n(7462),a=(n(7294),n(3905));const i={},o=void 0,s={unversionedId:"references/tramvai/test/integration-jest",id:"references/tramvai/test/integration-jest",title:"integration-jest",description:"Jest preset for integration-testing",source:"@site/tmp-docs/references/tramvai/test/integration-jest.md",sourceDirName:"references/tramvai/test",slug:"/references/tramvai/test/integration-jest",permalink:"/docs/references/tramvai/test/integration-jest",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/tmp-docs/references/tramvai/test/integration-jest.md",tags:[],version:"current",frontMatter:{},sidebar:"sidebar",previous:{title:"child-app",permalink:"/docs/references/tramvai/test/child-app"},next:{title:"integration",permalink:"/docs/references/tramvai/test/integration"}},l={},p=[{value:"Installation",id:"installation",level:2},{value:"How To",id:"how-to",level:2},{value:"Debug and development of integration tests in Jest",id:"debug-and-development-of-integration-tests-in-jest",level:3},{value:"Environment for Jest",id:"environment-for-jest",level:3}],c={toc:p};function u(e){let{components:t,...n}=e;return(0,a.kt)("wrapper",(0,r.Z)({},c,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"Jest preset for integration-testing"),(0,a.kt)("blockquote",null,(0,a.kt)("p",{parentName:"blockquote"},(0,a.kt)("inlineCode",{parentName:"p"},"@tramvai/cli")," and ",(0,a.kt)("inlineCode",{parentName:"p"},"puppeteer")," should be installed separately")),(0,a.kt)("h2",{id:"installation"},"Installation"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-bash"},"npm i --save-dev @tramvai/test-integration-jest\n")),(0,a.kt)("h2",{id:"how-to"},"How To"),(0,a.kt)("h3",{id:"debug-and-development-of-integration-tests-in-jest"},"Debug and development of integration tests in Jest"),(0,a.kt)("p",null,"Using this jest preset you can run integration tests in watch mode. In this case, application itself will be launched only once and will work in background."),(0,a.kt)("ol",null,(0,a.kt)("li",{parentName:"ol"},(0,a.kt)("p",{parentName:"li"},"Add preset ",(0,a.kt)("inlineCode",{parentName:"p"},"@tramvai/test-integration-jest")," to ",(0,a.kt)("inlineCode",{parentName:"p"},"jest.integration.config.js"),":"),(0,a.kt)("pre",{parentName:"li"},(0,a.kt)("code",{parentName:"pre",className:"language-js"},"module.exports = {\n  preset: '@tramvai/test-integration-jest',\n};\n"))),(0,a.kt)("li",{parentName:"ol"},(0,a.kt)("p",{parentName:"li"},"Add new script for running tests in watch mode to ",(0,a.kt)("inlineCode",{parentName:"p"},"package.json"),":"),(0,a.kt)("pre",{parentName:"li"},(0,a.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "scripts": {\n    "test:integration": "jest -w=3 --config ./jest.integration.config.js",\n    "test:integration:watch": "jest --runInBand --watch --config ./jest.integration.config.js"\n  }\n}\n'))),(0,a.kt)("li",{parentName:"ol"},(0,a.kt)("p",{parentName:"li"},"Run some test with ",(0,a.kt)("inlineCode",{parentName:"p"},"yarn test:integration:watch <path_to_test>"),". In this case you are able to go to local url ",(0,a.kt)("inlineCode",{parentName:"p"},"http://localhost:3000")," and see application at work."))),(0,a.kt)("h3",{id:"environment-for-jest"},"Environment for Jest"),(0,a.kt)("p",null,"Minimal set of dependencies for running ",(0,a.kt)("inlineCode",{parentName:"p"},"jest"),":"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-bash"},"npm i --save-dev jest @types/jest jest-circus\n")))}u.isMDXComponent=!0}}]);