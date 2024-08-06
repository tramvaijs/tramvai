"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[6921],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>h});var a=n(7294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function d(e,t){if(null==e)return{};var n,a,i=function(e,t){if(null==e)return{};var n,a,i={},r=Object.keys(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var s=a.createContext({}),l=function(e){var t=a.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},p=function(e){var t=l(e.components);return a.createElement(s.Provider,{value:t},e.children)},c={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},u=a.forwardRef((function(e,t){var n=e.components,i=e.mdxType,r=e.originalType,s=e.parentName,p=d(e,["components","mdxType","originalType","parentName"]),u=l(n),h=i,m=u["".concat(s,".").concat(h)]||u[h]||c[h]||r;return n?a.createElement(m,o(o({ref:t},p),{},{components:n})):a.createElement(m,o({ref:t},p))}));function h(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var r=n.length,o=new Array(r);o[0]=u;var d={};for(var s in t)hasOwnProperty.call(t,s)&&(d[s]=t[s]);d.originalType=e,d.mdxType="string"==typeof e?e:i,o[1]=d;for(var l=2;l<r;l++)o[l]=n[l];return a.createElement.apply(null,o)}return a.createElement.apply(null,n)}u.displayName="MDXCreateElement"},7893:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>s,default:()=>h,frontMatter:()=>d,metadata:()=>l,toc:()=>c});var a=n(7462),i=n(3366),r=(n(7294),n(3905)),o=["components"],d={id:"module-federation",title:"Module Federation (shared dependencies)"},s=void 0,l={unversionedId:"features/child-app/module-federation",id:"features/child-app/module-federation",title:"Module Federation (shared dependencies)",description:"Explanation",source:"@site/tmp-docs/03-features/015-child-app/014-module-federation.md",sourceDirName:"03-features/015-child-app",slug:"/features/child-app/module-federation",permalink:"/docs/features/child-app/module-federation",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/tmp-docs/03-features/015-child-app/014-module-federation.md",tags:[],version:"current",sidebarPosition:14,frontMatter:{id:"module-federation",title:"Module Federation (shared dependencies)"},sidebar:"sidebar",previous:{title:"How Child Apps work",permalink:"/docs/features/child-app/workflow"},next:{title:"Contracts",permalink:"/docs/features/child-app/contracts"}},p={},c=[{value:"Explanation",id:"explanation",level:2},{value:"FAQ about shared dependencies",id:"faq-about-shared-dependencies",level:3},{value:"Usage",id:"usage",level:2},{value:"Add dependency to shared list",id:"add-dependency-to-shared-list",level:3},{value:"How to manage dependencies?",id:"how-to-manage-dependencies",level:3}],u={toc:c};function h(e){var t=e.components,n=(0,i.Z)(e,o);return(0,r.kt)("wrapper",(0,a.Z)({},u,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("h2",{id:"explanation"},"Explanation"),(0,r.kt)("p",null,"Child-apps utilizes ",(0,r.kt)("a",{parentName:"p",href:"https://webpack.js.org/concepts/module-federation/"},"Module Federation")," feature of webpack."),(0,r.kt)("p",null,"That allows child-apps:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},"share dependencies between child-apps and root-app"),(0,r.kt)("li",{parentName:"ul"},"fallbacks to loading dependencies on request if implementation for dependency was not provided before or version of the dependency not satisfies request")),(0,r.kt)("p",null,"The list of default shared dependencies is very short as it can increase bundle size in cases when child-apps are not used."),(0,r.kt)("p",null,"The following dependencies are shared by default:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},"react core packages (react, react-dom, react/jsx-runtime)"),(0,r.kt)("li",{parentName:"ul"},"@tramvai/react"),(0,r.kt)("li",{parentName:"ul"},"@tinkoff/dippy"),(0,r.kt)("li",{parentName:"ul"},"@tramvai/core")),(0,r.kt)("p",null,"To add additional dependency follow ",(0,r.kt)("a",{parentName:"p",href:"#add-dependency-to-shared-list"},"instructions")),(0,r.kt)("h3",{id:"faq-about-shared-dependencies"},"FAQ about shared dependencies"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("strong",{parentName:"li"},"How shared dependencies look like?"),". It mostly the implementation details but some info below might be useful for understanding:",(0,r.kt)("ul",{parentName:"li"},(0,r.kt)("li",{parentName:"ul"},"if shared dependency is provided in root-app the dependency will built in the initial chunk of root-app and dependency will be available without any additional network requests (these dependencies are marked as ",(0,r.kt)("inlineCode",{parentName:"li"},"eager")," in moduleFederation config)"),(0,r.kt)("li",{parentName:"ul"},"if shared dependency is missing in the root-app then additional network request will be executed to some of child-app static files to load dependency code (the highest available version of dependency from all of child-apps will be loaded) i.e. additional js file with the name of shared dependency will be loaded on child-app usage."))),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("strong",{parentName:"li"},"How does shared dependencies affects root-app build?"),". Using shared dependency slightly increases the generated bundle size. So it is preferred to make the list of shared dependencies as small as possible."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("strong",{parentName:"li"},"How versions of shared dependencies are resolved in runtime?"),". Module federation will prefer to use the highest available version for the dependency but only if it satisfies the semver constraints of the all consumers. So it is preferred to use higher versions of the dependencies in the root-app and do not upgrade dependency versions in the child-apps without special need."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("strong",{parentName:"li"},"How version requirements are resolved during build?"),". Module federation need to know what version of shared dependencies are expected in the consumer. To infer expected version it uses info from closest package.json of the code (deps, devDeps, peerDeps) and the actual resolved version is used as a fallback. So to improve possibility of sharing the dependencies prefer to not to update versions in package.json without real need."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("strong",{parentName:"li"},"Dependency is added to list of shared but is not used by the app code"),". Such dependency will not be provided and will not be available for consumption by other apps in that case."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("strong",{parentName:"li"},"How css is shared?"),". Currently css are fully separated between root-app and child-app and child-app build generates only single css file for the whole child-app"),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("strong",{parentName:"li"},"If two modules are using same shared dependency and root-app doesn't provide this dependency will the code for dep be loaded twice?"),". It depends. On the client-side module federation will try to make only single network request, but with SSR it becomes a little more complicated and it is hard to resolve everything properly on server-side so sometimes it may lead to two network requests for different versions of the same dependency."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("strong",{parentName:"li"},"If version in child-app and root-app are not semver compatible"),". Then child-app will load it's own version in that case as root-app cannot provide compatible version"),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("strong",{parentName:"li"},"Can I make sure the shared dependency is initialized only once across consumers?"),". Yes, you can pass an object with ",(0,r.kt)("inlineCode",{parentName:"li"},"singleton")," property instead of bare string in the tramvai.json config for shared dependency."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("strong",{parentName:"li"},"Should I add only high level wrapper of the dependencies or I need to provide the list of all dependencies that I want to share?"),". Better try different setups and see the output bundle size as it depends. The main rule is to provide all of modules that might be imported by app code and that use the same low-level libraries. E.g. to share react-query integration add ",(0,r.kt)("inlineCode",{parentName:"li"},"@tramvai/module-react-query")," and ",(0,r.kt)("inlineCode",{parentName:"li"},"@tramvai/react-query")," to the shared dependencies"),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("strong",{parentName:"li"},"When building child-app I see two chunks related to the same package"),". It happens due to some of caveats how module federation works. But anyway most of the time only single chunk will be used for the package, so just ignore the fact that in generated files you see two chunks."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("strong",{parentName:"li"},"I have several versions of the shared dependency in app's dependencies tree"),". In that case used different versions will be added to shared scope as different entries. It is not an error but the issue may lead to higher bundle sizes and therefore @tramvai/cli will show the warning if such situation revealed during build.")),(0,r.kt)("h2",{id:"usage"},"Usage"),(0,r.kt)("h3",{id:"add-dependency-to-shared-list"},"Add dependency to shared list"),(0,r.kt)("admonition",{type:"tip"},(0,r.kt)("p",{parentName:"admonition"},"To get most of the sharing dependencies add dependency both for root-apps that uses child-apps with the dependency and child-apps that uses the dependency")),(0,r.kt)("p",null,"In tramvai.json add new ",(0,r.kt)("inlineCode",{parentName:"p"},"shared")," field"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "projects": {\n    "root-app": {\n      "name": "root-app",\n      "root": "root-app",\n      "type": "application",\n      "hotRefresh": {\n        "enabled": true\n      },\n      "shared": {\n        "deps": [\n          "@tramvai/react-query",\n          "@tramvai/module-react-query",\n          { "name": "@tramvai/state", "singleton": true }\n        ]\n      }\n    },\n    "child-app": {\n      "name": "child-app",\n      "root": "child-app",\n      "type": "child-app",\n      "shared": {\n        "deps": [\n          "@tramvai/react-query",\n          "@tramvai/module-react-query",\n          { "name": "@tramvai/state", "singleton": true }\n        ]\n      }\n    }\n  }\n}\n')),(0,r.kt)("p",null,"In order to choose what dependencies should be shared:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},"use ",(0,r.kt)("inlineCode",{parentName:"li"},"tramvai analyze")," command to explore the output bundle and how different options affects it"),(0,r.kt)("li",{parentName:"ul"},"try different dependencies and see what is loading on the page when child-app is used"),(0,r.kt)("li",{parentName:"ul"},"validate how adding shared dependency affects root-app bundle size through ",(0,r.kt)("inlineCode",{parentName:"li"},"tramvai analyze"))),(0,r.kt)("h3",{id:"how-to-manage-dependencies"},"How to manage dependencies?"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},"in child-app prefer to use flexible restrictions for dependencies in package.json i.e. use ",(0,r.kt)("inlineCode",{parentName:"li"},"^"),", ",(0,r.kt)("inlineCode",{parentName:"li"},"~"),", ",(0,r.kt)("inlineCode",{parentName:"li"},">=")," prefixes instead of strict versions (for tramvai dependencies the restrictions will be converted to flexible anyway by default, it's controlled by options ",(0,r.kt)("inlineCode",{parentName:"li"},"shared.flexibleTramvaiVersions"),"). It will increase chances to share dependencies with root-apps and minimize size of loaded code in browsers"),(0,r.kt)("li",{parentName:"ul"},"in child-app prefer to not to upgrade dependencies as long as possible to make possible to load less code in browser by reusing shared dependencies from root-apps. As root-app will eventually have higher versions of dependencies such shared dependencies will be reused by child-apps"),(0,r.kt)("li",{parentName:"ul"},"when you need to upgrade dependencies both in root-app and child-app usually it is better to upgrade first the every root-app then the child apps to minimize the size of loaded code to clients browsers")))}h.isMDXComponent=!0}}]);