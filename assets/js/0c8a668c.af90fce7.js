"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[7687],{3905:(e,t,n)=>{n.d(t,{Zo:()=>c,kt:()=>u});var i=n(7294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function a(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,i,r=function(e,t){if(null==e)return{};var n,i,r={},o=Object.keys(e);for(i=0;i<o.length;i++)n=o[i],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(i=0;i<o.length;i++)n=o[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var l=i.createContext({}),p=function(e){var t=i.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):a(a({},t),e)),n},c=function(e){var t=p(e.components);return i.createElement(l.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return i.createElement(i.Fragment,{},t)}},m=i.forwardRef((function(e,t){var n=e.components,r=e.mdxType,o=e.originalType,l=e.parentName,c=s(e,["components","mdxType","originalType","parentName"]),m=p(n),u=r,f=m["".concat(l,".").concat(u)]||m[u]||d[u]||o;return n?i.createElement(f,a(a({ref:t},c),{},{components:n})):i.createElement(f,a({ref:t},c))}));function u(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var o=n.length,a=new Array(o);a[0]=m;var s={};for(var l in t)hasOwnProperty.call(t,l)&&(s[l]=t[l]);s.originalType=e,s.mdxType="string"==typeof e?e:r,a[1]=s;for(var p=2;p<o;p++)a[p]=n[p];return i.createElement.apply(null,a)}return i.createElement.apply(null,n)}m.displayName="MDXCreateElement"},1711:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>c,contentTitle:()=>l,default:()=>u,frontMatter:()=>s,metadata:()=>p,toc:()=>d});var i=n(7462),r=n(3366),o=(n(7294),n(3905)),a=["components"],s={},l=void 0,p={unversionedId:"references/modules/child-app/__integration__/cross-version-tests",id:"references/modules/child-app/__integration__/cross-version-tests",title:"cross-version-tests",description:"Cross version testing is used to catch compatibility issues between different versions of tramvai modules when building an app that uses child apps (tramvai specific microfrontends).",source:"@site/tmp-docs/references/modules/child-app/__integration__/cross-version-tests.md",sourceDirName:"references/modules/child-app/__integration__",slug:"/references/modules/child-app/__integration__/cross-version-tests",permalink:"/docs/references/modules/child-app/__integration__/cross-version-tests",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/get-started/overview.md/tmp-docs/references/modules/child-app/__integration__/cross-version-tests.md",tags:[],version:"current",frontMatter:{},sidebar:"sidebar",previous:{title:"cache-warmup",permalink:"/docs/references/modules/cache-warmup"},next:{title:"child-app",permalink:"/docs/references/modules/child-app"}},c={},d=[{value:"Explanation",id:"explanation",level:2},{value:"How does it work?",id:"how-does-it-work",level:3},{value:"How to",id:"how-to",level:2},{value:"Add new specific version for testing",id:"add-new-specific-version-for-testing",level:3},{value:"Execute cross version tests locally",id:"execute-cross-version-tests-locally",level:3},{value:"Run different versions locally",id:"run-different-versions-locally",level:3}],m={toc:d};function u(e){var t=e.components,n=(0,r.Z)(e,a);return(0,o.kt)("wrapper",(0,i.Z)({},m,n,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"Cross version testing is used to catch compatibility issues between different versions of tramvai modules when building an app that uses child apps (tramvai specific microfrontends)."),(0,o.kt)("h2",{id:"explanation"},"Explanation"),(0,o.kt)("h3",{id:"how-does-it-work"},"How does it work?"),(0,o.kt)("p",null,"For every specific version separate directory is created that will contain specific version of tramvai dependencies. Thanks to tramvai cli options ",(0,o.kt)("inlineCode",{parentName:"p"},"resolveSymlinks=false")," any symlinked files will be resolved, but the dependencies that these files will require will be resolved based to initial directory i.e. cli will load specific versions of tramvai dependencies instead of latest versions resolved from repository itself."),(0,o.kt)("p",null,"By creating different apps and by specifying proper cli execution we may run different versions of tramvai rootApp and childApps and then test that they are compatible."),(0,o.kt)("h2",{id:"how-to"},"How to"),(0,o.kt)("h3",{id:"add-new-specific-version-for-testing"},"Add new specific version for testing"),(0,o.kt)("ol",null,(0,o.kt)("li",{parentName:"ol"},"Create new directory with version specifier in ",(0,o.kt)("inlineCode",{parentName:"li"},"cross-version-tests")),(0,o.kt)("li",{parentName:"ol"},"Create new package.json file and add every tramvai dependency that is used in test but with custom version (the dependencies list should match dependencies list in ",(0,o.kt)("inlineCode",{parentName:"li"},"examples/child-app/package.json"),")"),(0,o.kt)("li",{parentName:"ol"},"Install dependencies"),(0,o.kt)("li",{parentName:"ol"},"Create symlinks in new directory that will point to child-app example. Use command ",(0,o.kt)("inlineCode",{parentName:"li"},"ln -s ../../../../../../examples/child-app/${entry}/ ./${entry}")," in new directory for next entries:",(0,o.kt)("ul",{parentName:"li"},(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"child-apps")),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"mocks")),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"root-app")),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"shared")))),(0,o.kt)("li",{parentName:"ol"},"Additionally copy next files to new directory from ",(0,o.kt)("inlineCode",{parentName:"li"},"examples/child-app"),": ",(0,o.kt)("inlineCode",{parentName:"li"},"tramvai.json"),", ",(0,o.kt)("inlineCode",{parentName:"li"},"env.development.js")," with appropriate modifications if required by specific version"),(0,o.kt)("li",{parentName:"ol"},"Copy the files ",(0,o.kt)("inlineCode",{parentName:"li"},"./latest/cli.ts"),", ",(0,o.kt)("inlineCode",{parentName:"li"},"./latest/tsconfig.json")," to new directory and make modification to it if required by specific versions"),(0,o.kt)("li",{parentName:"ol"},"Add new version to test cases inside ",(0,o.kt)("inlineCode",{parentName:"li"},"child-app.test.ts")),(0,o.kt)("li",{parentName:"ol"},"Add installation for new deps in ci")),(0,o.kt)("h3",{id:"execute-cross-version-tests-locally"},"Execute cross version tests locally"),(0,o.kt)("p",null,"By default only repository versions of apps is checked when running integration tests."),(0,o.kt)("p",null,"To run cross version tests:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"install dependencies in every dir inside ",(0,o.kt)("inlineCode",{parentName:"li"},"cross-version-tests")," expect for ",(0,o.kt)("inlineCode",{parentName:"li"},"latest")," dir"),(0,o.kt)("li",{parentName:"ul"},"run integrations tests with env ",(0,o.kt)("inlineCode",{parentName:"li"},"CHILD_APP_TEST_CROSS_VERSION"))),(0,o.kt)("h3",{id:"run-different-versions-locally"},"Run different versions locally"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"to run app that uses latest repository versions of deps:",(0,o.kt)("ul",{parentName:"li"},(0,o.kt)("li",{parentName:"ul"},"go to ",(0,o.kt)("inlineCode",{parentName:"li"},"examples/child-app")),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"yarn start:root")," to run root-app"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"yarn start:children")," to run child apps"))),(0,o.kt)("li",{parentName:"ul"},"to run specific version of deps:",(0,o.kt)("ul",{parentName:"li"},(0,o.kt)("li",{parentName:"ul"},"go to ",(0,o.kt)("inlineCode",{parentName:"li"},"./cross-versions-tests/${version}")),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"yarn start:root")," to run root-app"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"yarn start:children")," to run child apps")))),(0,o.kt)("p",null,"By combining different directories from which commands is executed you can check how work different versions of root-app and child-apps"))}u.isMDXComponent=!0}}]);