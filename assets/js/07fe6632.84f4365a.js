"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[147],{3905:(e,t,n)=>{n.d(t,{Zo:()=>d,kt:()=>c});var a=n(7294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,a,i=function(e,t){if(null==e)return{};var n,a,i={},r=Object.keys(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var p=a.createContext({}),s=function(e){var t=a.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},d=function(e){var t=s(e.components);return a.createElement(p.Provider,{value:t},e.children)},m={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},u=a.forwardRef((function(e,t){var n=e.components,i=e.mdxType,r=e.originalType,p=e.parentName,d=o(e,["components","mdxType","originalType","parentName"]),u=s(n),c=i,k=u["".concat(p,".").concat(c)]||u[c]||m[c]||r;return n?a.createElement(k,l(l({ref:t},d),{},{components:n})):a.createElement(k,l({ref:t},d))}));function c(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var r=n.length,l=new Array(r);l[0]=u;var o={};for(var p in t)hasOwnProperty.call(t,p)&&(o[p]=t[p]);o.originalType=e,o.mdxType="string"==typeof e?e:i,l[1]=o;for(var s=2;s<r;s++)l[s]=n[s];return a.createElement.apply(null,l)}return a.createElement.apply(null,n)}u.displayName="MDXCreateElement"},352:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>d,contentTitle:()=>p,default:()=>c,frontMatter:()=>o,metadata:()=>s,toc:()=>m});var a=n(7462),i=n(3366),r=(n(7294),n(3905)),l=["components"],o={id:"tramvai-library",title:"Creating a tramvai library"},p=void 0,s={unversionedId:"guides/tramvai-library",id:"guides/tramvai-library",title:"Creating a tramvai library",description:"Adding a new library or module to the tramvai repository is detailed in the Contribute section",source:"@site/tmp-docs/guides/tramvai-library.md",sourceDirName:"guides",slug:"/guides/tramvai-library",permalink:"/docs/guides/tramvai-library",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/get-started/overview.md/tmp-docs/guides/tramvai-library.md",tags:[],version:"current",frontMatter:{id:"tramvai-library",title:"Creating a tramvai library"},sidebar:"sidebar",previous:{title:"Testing",permalink:"/docs/guides/testing"},next:{title:"Separating code for server and client",permalink:"/docs/guides/universal"}},d={},m=[{value:"Prerequisites",id:"prerequisites",level:3},{value:"Package name",id:"package-name",level:3},{value:"Versioning",id:"versioning",level:3},{value:"Dependencies",id:"dependencies",level:3},{value:"Framework",id:"framework",level:4},{value:"Singleton",id:"singleton",level:4},{value:"Popular",id:"popular",level:4},{value:"Specific",id:"specific",level:4},{value:"Development",id:"development",level:4},{value:"Exclusion",id:"exclusion",level:4},{value:"Build",id:"build",level:3},{value:"Tree-shaking",id:"tree-shaking",level:4},{value:"Modern ES code",id:"modern-es-code",level:4},{value:"@tramvai/build",id:"tramvaibuild",level:4}],u={toc:m};function c(e){var t=e.components,n=(0,i.Z)(e,l);return(0,r.kt)("wrapper",(0,a.Z)({},u,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"Adding a new library or module to the ",(0,r.kt)("inlineCode",{parentName:"p"},"tramvai")," repository is detailed in the ",(0,r.kt)("a",{parentName:"p",href:"/docs/contribute/"},"Contribute section")),(0,r.kt)("p",null,"This guide contains a set of tips for developing individual ",(0,r.kt)("inlineCode",{parentName:"p"},"tramvai")," packages in application repositories,\nalso, many teams maintain separate monoreps with common packages for a number of applications, divided into different repositories."),(0,r.kt)("h3",{id:"prerequisites"},"Prerequisites"),(0,r.kt)("p",null,"Let's consider all important cases using the example of creating a new ",(0,r.kt)("inlineCode",{parentName:"p"},"tramvai")," module.\nLet's say the module will provide a new HTTP client to work with the Github ",(0,r.kt)("inlineCode",{parentName:"p"},"API"),"."),(0,r.kt)("h3",{id:"package-name"},"Package name"),(0,r.kt)("p",null,"It is highly discouraged to use the ",(0,r.kt)("inlineCode",{parentName:"p"},"@tramvai")," and ",(0,r.kt)("inlineCode",{parentName:"p"},"@tramvai-tinkoff")," scopes outside the ",(0,r.kt)("inlineCode",{parentName:"p"},"tramvai")," repository.\nIf our application is called ",(0,r.kt)("inlineCode",{parentName:"p"},"tincoin"),", you can, for example, select one of these scopes:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"@tincoin")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"@tramvai-tincoin")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"@tincoin-core"))),(0,r.kt)("p",null,"For modules, the prefix is \u200b\u200busually ",(0,r.kt)("inlineCode",{parentName:"p"},"module-"),", for example: ",(0,r.kt)("inlineCode",{parentName:"p"},"@tramvai-tincoin/module-github-api-client")),(0,r.kt)("h3",{id:"versioning"},"Versioning"),(0,r.kt)("p",null,"The choice of a versioning strategy is entirely yours.\nWe definitely recommend following ",(0,r.kt)("inlineCode",{parentName:"p"},"semver"),", and we can recommend using ",(0,r.kt)("a",{parentName:"p",href:"/docs/concepts/versioning"},"unified versioning")," if:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},"you support monorep with core libraries"),(0,r.kt)("li",{parentName:"ul"},"these libraries can be linked"),(0,r.kt)("li",{parentName:"ul"},"and these packages are used in applications all together (or most of them)")),(0,r.kt)("h3",{id:"dependencies"},"Dependencies"),(0,r.kt)("p",null,"Dealing with library dependencies is not an easy task, and there is no ideal solution, but there are a number of tips to make it easier to manage dependencies.\nThe best place to start is by dividing dependencies into different types:"),(0,r.kt)("h4",{id:"framework"},"Framework"),(0,r.kt)("p",null,"Examples of such dependencies are ",(0,r.kt)("inlineCode",{parentName:"p"},"react")," and ",(0,r.kt)("inlineCode",{parentName:"p"},"react-dom"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"@tramvai/*")," and ",(0,r.kt)("inlineCode",{parentName:"p"},"@tramvai-tinkoff/*"),".\nIf we write ",(0,r.kt)("inlineCode",{parentName:"p"},"babel")," or ",(0,r.kt)("inlineCode",{parentName:"p"},"eslint")," plugin, it can be ",(0,r.kt)("inlineCode",{parentName:"p"},"@babel/core")," and ",(0,r.kt)("inlineCode",{parentName:"p"},"eslint"),"."),(0,r.kt)("p",null,"Typically, an end user, such as a ",(0,r.kt)("inlineCode",{parentName:"p"},"tramvai")," application, is required to install a dependency framework,\nwithout them it simply won't work."),(0,r.kt)("p",null,"Therefore, our library should set them to ",(0,r.kt)("inlineCode",{parentName:"p"},"peerDependencies"),", with the most free versions, for example, if the package is tied to the basic functionality of ",(0,r.kt)("inlineCode",{parentName:"p"},"tramvai"),", and uses React hooks:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "peerDependencies": {\n    "@tramvai/core": "*",\n    "react": ">=16.8",\n    "react-dom": ">=16.8"\n  }\n}\n')),(0,r.kt)("h4",{id:"singleton"},"Singleton"),(0,r.kt)("p",null,"A number of dependencies must be strictly one in the application.\nAny duplicates are a minus. increase the weight of the application bundle, but libraries such as ",(0,r.kt)("inlineCode",{parentName:"p"},"react")," or ",(0,r.kt)("inlineCode",{parentName:"p"},"@tinkoff/logger")," require a single copy in our application."),(0,r.kt)("p",null,"For them, the rule applies as with the framework, you need to install them in ",(0,r.kt)("inlineCode",{parentName:"p"},"peerDependencies"),", with the most free versions:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "peerDependencies": {\n    "@tinkoff/logger": "*"\n  }\n}\n')),(0,r.kt)("h4",{id:"popular"},"Popular"),(0,r.kt)("p",null,"Many packages are popular enough that chances are they are already being used in the final application.\nAn example of such dependencies is - ",(0,r.kt)("inlineCode",{parentName:"p"},"date-fns"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"lru-cache"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"@tinkoff/dippy")),(0,r.kt)("p",null,"For them, the rule applies as with the framework, you need to install them in ",(0,r.kt)("inlineCode",{parentName:"p"},"peerDependencies"),", with the most free versions:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "peerDependencies": {\n    "@tinkoff/dippy": "*",\n    "date-fns": ">=2",\n    "lru-cache": "*"\n  }\n}\n')),(0,r.kt)("h4",{id:"specific"},"Specific"),(0,r.kt)("p",null,"Let's say our new tramvai module delivers unique functionality to the application that requires a third-party library (or even another package in your monorepo)"),(0,r.kt)("p",null,"If we are developing a service to work with the Github API, it might be the ",(0,r.kt)("inlineCode",{parentName:"p"},"@octokit/rest")," package."),(0,r.kt)("p",null,"In this case, you need to put the library in ",(0,r.kt)("inlineCode",{parentName:"p"},"dependencies"),", and you can leave the standard range using ",(0,r.kt)("inlineCode",{parentName:"p"},"^"),":"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "dependencies": {\n    "@octokit/rest": "^18.0.0"\n  }\n}\n')),(0,r.kt)("h4",{id:"development"},"Development"),(0,r.kt)("p",null,"A dependency may be involved in building your package - for example, ",(0,r.kt)("inlineCode",{parentName:"p"},"rollup")," or ",(0,r.kt)("inlineCode",{parentName:"p"},"@tramvai/build"),".\nThe dependency is required to run library tests.\nThe dependency contains the taipings required for the build."),(0,r.kt)("p",null,"In all these cases, even if either is already in ",(0,r.kt)("inlineCode",{parentName:"p"},"peerDependencies"),", it is worth adding a more specific version to ",(0,r.kt)("inlineCode",{parentName:"p"},"devDependencies"),", for example:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "devDependencies": {\n    "@tramvai/build": "^2.5.0",\n    "@types/react": "^17.0.0",\n    "react": "^17.0.0"\n  }\n}\n')),(0,r.kt)("h4",{id:"exclusion"},"Exclusion"),(0,r.kt)("p",null,"Of course, there are exceptional cases."),(0,r.kt)("p",null,"For example, tramvai provides many test utilities where all the main ",(0,r.kt)("inlineCode",{parentName:"p"},"@tramvai")," dependencies were in ",(0,r.kt)("inlineCode",{parentName:"p"},"peerDependencies"),".\nAs soon as these utilities began to be used not in repositories with applications, but in monoreps with core packages, the problem of missing dependencies appeared, and we moved almost everything from ",(0,r.kt)("inlineCode",{parentName:"p"},"peerDependencies")," to ",(0,r.kt)("inlineCode",{parentName:"p"},"dependencies")),(0,r.kt)("p",null,"Proceed according to the situation and always think about the usability of your product :)"),(0,r.kt)("h3",{id:"build"},"Build"),(0,r.kt)("p",null,"It is assumed that the final assembly of packages in the context of the application will be done by ",(0,r.kt)("inlineCode",{parentName:"p"},"@tramvai/cli"),".\nTherefore, to publish packages written in ",(0,r.kt)("inlineCode",{parentName:"p"},"TypeScript"),", it suffices to use",(0,r.kt)("inlineCode",{parentName:"p"}," tsc"),", and publish many compiled ",(0,r.kt)("inlineCode",{parentName:"p"},".js")," and",(0,r.kt)("inlineCode",{parentName:"p"}," .d.ts")," files."),(0,r.kt)("p",null,"But building packages into bundles before publishing, for example via ",(0,r.kt)("inlineCode",{parentName:"p"},"rollup")," or",(0,r.kt)("inlineCode",{parentName:"p"}," @tramvai/build"),", gives a number of possibilities:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},"preliminary tree-shaking will cut off all unnecessary, this will have a positive effect on the assembly of the application"),(0,r.kt)("li",{parentName:"ul"},"you can make several bundles for different environments, in CJS or ES modules formats"),(0,r.kt)("li",{parentName:"ul"},"you can make a separate bundle for the browser build, separate for the server one - top for libraries with SSR support")),(0,r.kt)("p",null,"Detailed documentation on using ",(0,r.kt)("inlineCode",{parentName:"p"},"@tramvai/build")," is available in ",(0,r.kt)("a",{parentName:"p",href:"/docs/references/tools/build"},"documentation")),(0,r.kt)("h4",{id:"tree-shaking"},"Tree-shaking"),(0,r.kt)("p",null,"Some of useful articles about tree-shaking:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"https://webpack.js.org/guides/tree-shaking/"},"Webpack guide")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"https://blog.theodo.com/2021/04/library-tree-shaking/"},'"How To Make Tree Shakeable Libraries" article'))),(0,r.kt)("p",null,"Summarizing all the optimizations needed to create tree-shakable libraries:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("p",{parentName:"li"},"Prevent ",(0,r.kt)("inlineCode",{parentName:"p"},"TypeScript")," ",(0,r.kt)("strong",{parentName:"p"},"decorators")," usage"),(0,r.kt)("p",{parentName:"li"},"Explanation: ",(0,r.kt)("inlineCode",{parentName:"p"},"Terser")," can't remove unused exports in transpiled code with decorators, both ",(0,r.kt)("inlineCode",{parentName:"p"},"Babel")," or ",(0,r.kt)("inlineCode",{parentName:"p"},"tsc")," add utility functions, potentially with side-effects for ",(0,r.kt)("inlineCode",{parentName:"p"},"Terser"))),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("p",{parentName:"li"},"Prevent ",(0,r.kt)("strong",{parentName:"p"},"static properties")," usage for ",(0,r.kt)("inlineCode",{parentName:"p"},"React")," functional components"),(0,r.kt)("p",{parentName:"li"},"Explanation: ",(0,r.kt)("inlineCode",{parentName:"p"},"Terser")," can't remove unused components in transpiled code when more than one static properties are used")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("p",{parentName:"li"},"Use ",(0,r.kt)("strong",{parentName:"p"},"ES modules")," for server and browser build, ",(0,r.kt)("strong",{parentName:"p"},"CJS")," only for backward compatibility")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("p",{parentName:"li"},"Split the library logic into ",(0,r.kt)("strong",{parentName:"p"},"small modules"))),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("p",{parentName:"li"},(0,r.kt)("strong",{parentName:"p"},"Preserve file structure")," of this modules during the bundling"),(0,r.kt)("p",{parentName:"li"},"Explanation: ",(0,r.kt)("inlineCode",{parentName:"p"},"Webpack")," can remove unused code from modules graph, and we don't have to worry about removing this code with ",(0,r.kt)("inlineCode",{parentName:"p"},"Terser"))),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("p",{parentName:"li"},"Add ",(0,r.kt)("inlineCode",{parentName:"p"},'"sideEffects": false')," field to ",(0,r.kt)("inlineCode",{parentName:"p"},"package.json")," (or specify an array of files that cannot be cut - ",(0,r.kt)("inlineCode",{parentName:"p"},'"sideEffects": ["some-global.css"]'),")")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("p",{parentName:"li"},"Always ",(0,r.kt)("strong",{parentName:"p"},"test tree-shaking")," of your packages on the default webpack production build, add the magic comment ",(0,r.kt)("inlineCode",{parentName:"p"},"/* @__PURE__ */")," if necessary"),(0,r.kt)("p",{parentName:"li"},"Explanation: ",(0,r.kt)("inlineCode",{parentName:"p"},"/* @__PURE__ */")," helps ",(0,r.kt)("inlineCode",{parentName:"p"},"Terser")," to understand that the called function has no side effects"))),(0,r.kt)("h4",{id:"modern-es-code"},"Modern ES code"),(0,r.kt)("p",null,"Reference articles:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"https://web.dev/codelab-serve-modern-code/"},'"Serve modern code to modern browsers"')),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"https://dev.to/garylchew/bringing-modern-javascript-to-libraries-432c"},'"Bringing Modern JavaScript to Libraries"'))),(0,r.kt)("p",null,"Transpiling the source code into ",(0,r.kt)("strong",{parentName:"p"},"ES2019")," for the browser build will help deliver significantly less code to the client.\nFor backward compatibility with older browsers, you need to transpile ",(0,r.kt)("inlineCode",{parentName:"p"},"node_modules")," with modern code via ",(0,r.kt)("inlineCode",{parentName:"p"},"Babel"),", when building your application to production.\n",(0,r.kt)("inlineCode",{parentName:"p"},"@tramvai/cli")," will do this transpilation automatically for ",(0,r.kt)("inlineCode",{parentName:"p"},"tramvai")," applications."),(0,r.kt)("h4",{id:"tramvaibuild"},"@tramvai/build"),(0,r.kt)("p",null,"The ",(0,r.kt)("inlineCode",{parentName:"p"},"@tramvai/build")," tool out of the box gives you some of this optimizations:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("strong",{parentName:"li"},"CJS")," and ",(0,r.kt)("strong",{parentName:"li"},"ES modules")," builds"),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("strong",{parentName:"li"},"Modern JS code")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("strong",{parentName:"li"},"File structure preservation")),(0,r.kt)("li",{parentName:"ul"},"Support for separate ",(0,r.kt)("strong",{parentName:"li"},"browser build"))),(0,r.kt)("p",null,"So, this tool is recommended by ",(0,r.kt)("inlineCode",{parentName:"p"},"tramvai")," team for building any packages used by any SSR applications."),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://tramvai.dev/docs/references/tools/build/#get-started"},"Get started with @tramvai/build")))}c.isMDXComponent=!0}}]);