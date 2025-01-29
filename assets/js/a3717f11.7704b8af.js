"use strict";(globalThis.webpackChunk=globalThis.webpackChunk||[]).push([[9432],{3905:(e,t,a)=>{a.d(t,{Zo:()=>d,kt:()=>u});var n=a(7294);function o(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function i(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function l(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?i(Object(a),!0).forEach((function(t){o(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function r(e,t){if(null==e)return{};var a,n,o=function(e,t){if(null==e)return{};var a,n,o={},i=Object.keys(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||(o[a]=e[a]);return o}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(o[a]=e[a])}return o}var s=n.createContext({}),p=function(e){var t=n.useContext(s),a=t;return e&&(a="function"==typeof e?e(t):l(l({},t),e)),a},d=function(e){var t=p(e.components);return n.createElement(s.Provider,{value:t},e.children)},c={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},m=n.forwardRef((function(e,t){var a=e.components,o=e.mdxType,i=e.originalType,s=e.parentName,d=r(e,["components","mdxType","originalType","parentName"]),m=p(a),u=o,k=m["".concat(s,".").concat(u)]||m[u]||c[u]||i;return a?n.createElement(k,l(l({ref:t},d),{},{components:a})):n.createElement(k,l({ref:t},d))}));function u(e,t){var a=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var i=a.length,l=new Array(i);l[0]=m;var r={};for(var s in t)hasOwnProperty.call(t,s)&&(r[s]=t[s]);r.originalType=e,r.mdxType="string"==typeof e?e:o,l[1]=r;for(var p=2;p<i;p++)l[p]=a[p];return n.createElement.apply(null,l)}return n.createElement.apply(null,a)}m.displayName="MDXCreateElement"},6305:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>s,contentTitle:()=>l,default:()=>c,frontMatter:()=>i,metadata:()=>r,toc:()=>p});var n=a(7462),o=(a(7294),a(3905));const i={title:"@tramvai/cli",sidebar_label:"base",sidebar_position:1},l=void 0,r={unversionedId:"references/cli/base",id:"references/cli/base",title:"@tramvai/cli",description:"CLI interface for resolving actual problems and tasks of frontend CI. Reduces complexity of setting up webpack, typescript, babel, postcss and other tools.",source:"@site/tmp-docs/references/cli/base.md",sourceDirName:"references/cli",slug:"/references/cli/base",permalink:"/docs/references/cli/base",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/tmp-docs/references/cli/base.md",tags:[],version:"current",sidebarPosition:1,frontMatter:{title:"@tramvai/cli",sidebar_label:"base",sidebar_position:1},sidebar:"sidebar",previous:{title:"storybook-addon",permalink:"/docs/references/tramvai/storybook-addon"},next:{title:"config",permalink:"/docs/references/cli/config"}},s={},p=[{value:"Installation",id:"installation",level:2},{value:"API",id:"api",level:2},{value:"Commands",id:"commands",level:3},{value:"Explanation",id:"explanation",level:2},{value:"Workspaces",id:"workspaces",level:3},{value:"Notifications settings",id:"notifications-settings",level:3},{value:"CSS class names generation settings",id:"css-class-names-generation-settings",level:3},{value:"CSS modules processing",id:"css-modules-processing",level:3},{value:"Polyfills for the standard NodeJS modules",id:"polyfills-for-the-standard-nodejs-modules",level:3},{value:"Checking TypeScript types",id:"checking-typescript-types",level:3},{value:"Deduplication of modules",id:"deduplication-of-modules",level:3},{value:"Debug an app",id:"debug-an-app",level:3},{value:"Webpack Logs",id:"webpack-logs",level:4},{value:"Source Maps",id:"source-maps",level:4},{value:"Development",id:"development",level:5},{value:"Production",id:"production",level:5},{value:"Configuration",id:"configuration",level:2},{value:"How to",id:"how-to",level:2},{value:"Code generation",id:"code-generation",level:3},{value:"Generate new project",id:"generate-new-project",level:3},{value:"How to run nodejs app in debug mode?",id:"how-to-run-nodejs-app-in-debug-mode",level:3},{value:"Get details for deprecated and warning logs",id:"get-details-for-deprecated-and-warning-logs",level:3},{value:"How to use browserstack for testing",id:"how-to-use-browserstack-for-testing",level:3},{value:"How to test app on mobile or other device in local network",id:"how-to-test-app-on-mobile-or-other-device-in-local-network",level:3},{value:"How to enable paths mapping",id:"how-to-enable-paths-mapping",level:3},{value:"How to pass Node.js options",id:"how-to-pass-nodejs-options",level:3},{value:"How to get CPU profile of @tramvai/cli work?",id:"how-to-get-cpu-profile-of-tramvaicli-work",level:3},{value:"How to enable production profiling for React",id:"how-to-enable-production-profiling-for-react",level:3}],d={toc:p};function c({components:e,...t}){return(0,o.kt)("wrapper",(0,n.Z)({},d,t,{components:e,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"CLI interface for resolving actual problems and tasks of frontend CI. Reduces complexity of setting up webpack, typescript, babel, postcss and other tools."),(0,o.kt)("p",null,(0,o.kt)("inlineCode",{parentName:"p"},"@tramvai/cli")," may build projects to production, run code in development mode with automatic rebuilds, project analyze and code generation"),(0,o.kt)("h2",{id:"installation"},"Installation"),(0,o.kt)("p",null,"Global installation on the developer machine. After that the new command ",(0,o.kt)("inlineCode",{parentName:"p"},"tramvai")," will be available in terminal."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-bash"},"npm i -g @tramvai/cli\n")),(0,o.kt)("p",null,"Local installation to the project"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-bash"},"npm i --save-dev @tramvai/cli\n")),(0,o.kt)("h2",{id:"api"},"API"),(0,o.kt)("h3",{id:"commands"},"Commands"),(0,o.kt)("p",null,"After any command you can pass ",(0,o.kt)("inlineCode",{parentName:"p"},"--help")," string, e.g. ",(0,o.kt)("inlineCode",{parentName:"p"},"tramvai --help")," or ",(0,o.kt)("inlineCode",{parentName:"p"},"tramvai start --help"),". After that you will see description of the command and its options."),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"tramvai new")," - generate new tramvai app with @tramvai/cli"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"tramvai start")," - run app in the development mode"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"tramvai start-prod")," - run app in development mode, but code will be build in the production mode"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"tramvai build")," - build an app for server and client"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"tramvai static")," - generate static HTML for application pages"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"tramvai analyze")," - analyze bundle size"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"tramvai generate")," - code generation for different components. E.g. new projects, react components, actions and etc."),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"tramvai update")," - update ",(0,o.kt)("inlineCode",{parentName:"li"},"@tramvai/cli")," and all of the ",(0,o.kt)("inlineCode",{parentName:"li"},"@tramvai")," and ",(0,o.kt)("inlineCode",{parentName:"li"},"@tramvai-tinkoff")," dependencies in the project. This command additionally executes dependency deduplication and code migrations"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"tramvai add")," - add ",(0,o.kt)("inlineCode",{parentName:"li"},"@tramvai")," or ",(0,o.kt)("inlineCode",{parentName:"li"},"@tramvai-tinkoff")," dependency to the app. This command additionally executes dependency deduplication and code migrations")),(0,o.kt)("h2",{id:"explanation"},"Explanation"),(0,o.kt)("h3",{id:"workspaces"},"Workspaces"),(0,o.kt)("p",null,"If you are using monorepo, you may not want to install all tramvai modules into your repository root. CLI can automatically define monorepo context and provides some special behaviour and options for ceratin commands:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"tramvai new")," will install all tramvai modules (except ",(0,o.kt)("inlineCode",{parentName:"li"},"@tramvai/cli"),") into provided app workspace if ",(0,o.kt)("inlineCode",{parentName:"li"},"monorepo")," template chosen"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"tramvai add")," supports ",(0,o.kt)("inlineCode",{parentName:"li"},"--app")," or ",(0,o.kt)("inlineCode",{parentName:"li"},"-a")," parameter. You can provide any app name from your ",(0,o.kt)("inlineCode",{parentName:"li"},"tramvai.json")," to install module into workspace"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"tramvai update")," will automatically update tramvai modules for all existing workspaces in your project")),(0,o.kt)("h3",{id:"notifications-settings"},"Notifications settings"),(0,o.kt)("p",null,"Inside ",(0,o.kt)("inlineCode",{parentName:"p"},"tramvai.json")," the settings for the notification can be specified at path ",(0,o.kt)("inlineCode",{parentName:"p"},"notifications"),". Parameters are passed to ",(0,o.kt)("a",{parentName:"p",href:"https://github.com/RoccoC/webpack-build-notifier#config-options"},"webpack-build-notifier"),". You can specify global configuration or a specific configuration either for client or server build."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "notifications": {\n    "suppressSuccess": "always",\n    "server": {\n      "suppressWarning": true\n    },\n    "client": {\n      "activateTerminalOnError": true\n    }\n  }\n}\n')),(0,o.kt)("h3",{id:"css-class-names-generation-settings"},"CSS class names generation settings"),(0,o.kt)("p",null,"Name generation is configured via the options ",(0,o.kt)("inlineCode",{parentName:"p"},"cssLocalIdentNameDev")," and ",(0,o.kt)("inlineCode",{parentName:"p"},"cssLocalIdentNameProd")," (common option ",(0,o.kt)("inlineCode",{parentName:"p"},"cssLocalIdentName")," might be used to specify settings for both prod and dev)."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "postcss": {\n    "cssLocalIdentName": "[hash:base64:5]" // default value (deprecated)\n  }\n}\n')),(0,o.kt)("p",null,"or"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "postcss": {\n    "cssLocalIdentName": {\n      "development": "[name]__[local]_[minicss]", // available values see in the docs to [css-loader](https://github.com/webpack-contrib/css-loader)\n      "production": "[minicss]" // additionally new tag `minicss` can be used for the generating minimal css names. Based on [article](https://dev.to/denisx/reduce-bundle-size-via-one-letter-css-classname-hash-strategy-10g6)\n    }\n  }\n}\n')),(0,o.kt)("h3",{id:"css-modules-processing"},"CSS modules processing"),(0,o.kt)("p",null,"By default, all ",(0,o.kt)("inlineCode",{parentName:"p"},"*.css")," imports will be processed as CSS Modules."),(0,o.kt)("p",null,"IF you want to disable Modules for some files, for example with global styles, you can do it by adding ",(0,o.kt)("inlineCode",{parentName:"p"},"cssModulePattern")," regexp to the config:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "postcss": {\n    // CSS Modules processing will be skipped for *.global.css files\n    "cssModulePattern": "^(?!.*global\\\\.css$).*$"\n  }\n}\n')),(0,o.kt)("h3",{id:"polyfills-for-the-standard-nodejs-modules"},"Polyfills for the standard NodeJS modules"),(0,o.kt)("p",null,"By default, ",(0,o.kt)("inlineCode",{parentName:"p"},"webpack")," starting with 5th version, do not add polyfills to browser bundle when using nodejs standard modules in the browser code, e.g. when using ",(0,o.kt)("em",{parentName:"p"},"crypto"),", ",(0,o.kt)("em",{parentName:"p"},"path"),", ",(0,o.kt)("em",{parentName:"p"},"process"),", ",(0,o.kt)("em",{parentName:"p"},"buffer"),", etc."),(0,o.kt)("p",null,(0,o.kt)("inlineCode",{parentName:"p"},"@tramvai/cli")," explicitly adds polyfills for ",(0,o.kt)("em",{parentName:"p"},"path")," and ",(0,o.kt)("em",{parentName:"p"},"process")," modules as these modules are often used and lightweighted."),(0,o.kt)("h3",{id:"checking-typescript-types"},"Checking TypeScript types"),(0,o.kt)("p",null,"Checking types is enabled by flag ",(0,o.kt)("inlineCode",{parentName:"p"},"checkAsyncTs"),"."),(0,o.kt)("p",null,"When running ",(0,o.kt)("inlineCode",{parentName:"p"},"tramvai start")," ts compilation and type checks will be executed."),(0,o.kt)("p",null,"Inside ",(0,o.kt)("inlineCode",{parentName:"p"},"tramvai.json")),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-json"},'"checkAsyncTs": {\n  "failOnBuild": true, // optional\n  "pluginOptions": {} // optional\n},\n')),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"failOnBuild")," adds type checks when running ",(0,o.kt)("inlineCode",{parentName:"p"},"tramvai build"),". This way build will fail in case of wrong types."),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"pluginOptions")," \u2013 ",(0,o.kt)("a",{parentName:"p",href:"https://github.com/TypeStrong/fork-ts-checker-webpack-plugin#options"},"list of the additional options")," for the plugin ",(0,o.kt)("inlineCode",{parentName:"p"},"fork-ts-checker-webpack-plugin")),(0,o.kt)("p",null,"If you want to override path to tsconfig through ",(0,o.kt)("strong",{parentName:"p"},"pluginOptions.tsconfig")," the option should be specified relative to the ",(0,o.kt)("inlineCode",{parentName:"p"},"@tramvai/cli")," folder itself e.g. ",(0,o.kt)("em",{parentName:"p"},"node_modules/@tramvai/cli"),". By default tsconfig is expected to be in the project root directory: ",(0,o.kt)("em",{parentName:"p"},"\\<rootDir",">","/tsconfig.json")),(0,o.kt)("h3",{id:"deduplication-of-modules"},"Deduplication of modules"),(0,o.kt)("p",null,"Option ",(0,o.kt)("inlineCode",{parentName:"p"},"dedupe")," controls the settings of plugin for the deduplication process. Available options are:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},'"equality"')," - uses strict version comparison. Dedupes modules in ",(0,o.kt)("inlineCode",{parentName:"li"},"node_modules")," with equal package version that are imported from different sources. E.g. imports for ",(0,o.kt)("inlineCode",{parentName:"li"},"node_modules/package/index.js")," and ",(0,o.kt)("inlineCode",{parentName:"li"},"node_modules/nested-package/node_modules/package/index.js")," are deduped into a single ",(0,o.kt)("inlineCode",{parentName:"li"},"node_modules/package/index.js")," import whilst without dedupe it will bundle two files as separate modules."),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},'"semver"')," - compares version of packages based on semver. It can dedupe all of the imports with the same major version and any of the minor and patch versions. E.g. next versions will be deduped: from ",(0,o.kt)("inlineCode",{parentName:"li"},"1.14.0")," and ",(0,o.kt)("inlineCode",{parentName:"li"},"1.16.2")," to ",(0,o.kt)("inlineCode",{parentName:"li"},"1.16.2"),", from ",(0,o.kt)("inlineCode",{parentName:"li"},"0.14.1")," and ",(0,o.kt)("inlineCode",{parentName:"li"},"0.16.5")," to ",(0,o.kt)("inlineCode",{parentName:"li"},"0.16.5"),", whilst versions ",(0,o.kt)("inlineCode",{parentName:"li"},"0.0.2")," and ",(0,o.kt)("inlineCode",{parentName:"li"},"0.0.5")," will be left without deduplication.")),(0,o.kt)("h3",{id:"debug-an-app"},"Debug an app"),(0,o.kt)("p",null,"While developing sometimes it is needed to debug nodejs app directly so see CPU, memory consumptions etc. To do it the options ",(0,o.kt)("inlineCode",{parentName:"p"},"--debug")," might be passed to commands ",(0,o.kt)("inlineCode",{parentName:"p"},"start")," and ",(0,o.kt)("inlineCode",{parentName:"p"},"start-prod")," which do next:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"enables source maps for build on client and server"),(0,o.kt)("li",{parentName:"ul"},"starts the server process with the flag ",(0,o.kt)("a",{parentName:"li",href:"https://nodejs.org/ru/docs/guides/debugging-getting-started/"},(0,o.kt)("inlineCode",{parentName:"a"},"--inspect")),".")),(0,o.kt)("p",null,"After that you can open debugger in the chrome devtools - ",(0,o.kt)("inlineCode",{parentName:"p"},"chrome://inspect")),(0,o.kt)("h4",{id:"webpack-logs"},"Webpack Logs"),(0,o.kt)("p",null,"It is possible to get verbose output almost on every cli command where it is using webpack."),(0,o.kt)("p",null,"To do this, you should pass ",(0,o.kt)("inlineCode",{parentName:"p"},"--verboseWebpack")," option to command. Check availability of option with help command."),(0,o.kt)("p",null,"It will pass ",(0,o.kt)("inlineCode",{parentName:"p"},"{ logging: 'verbose', loggingDebug: true }")," to webpack stats config.",(0,o.kt)("br",{parentName:"p"}),"\n","Also, it will turn on ",(0,o.kt)("a",{parentName:"p",href:"https://webpack.js.org/configuration/other-options/#infrastructurelogging"},"infrastructureLogging")," for webpack with options ",(0,o.kt)("inlineCode",{parentName:"p"},"{ level: 'verbose', debug: true }"),"."),(0,o.kt)("h4",{id:"source-maps"},"Source Maps"),(0,o.kt)("p",null,(0,o.kt)("inlineCode",{parentName:"p"},"webpack")," offers several kind of ",(0,o.kt)("a",{parentName:"p",href:"https://webpack.js.org/configuration/devtool/#qualities"},"sourcemap qualities"),". Some of the examples are:"),(0,o.kt)("ol",null,(0,o.kt)("li",{parentName:"ol"},"Source code - the code before transpilation and bundling. Snapshot of the source code, splitted by modules"),(0,o.kt)("li",{parentName:"ol"},"Transformed code - the code after transpilation by loaders (etc. babel-loader), splitted by modules"),(0,o.kt)("li",{parentName:"ol"},"Generated code - the code after transpilation and bundling, splitted by modules. Every import and exported are replaced by webpack wrapper code")),(0,o.kt)("p",null,"For development source maps for transformed or generated code is used as it is more performant and shows the exact code that is executed in the target environment. The main differences from the debugging without sourcemaps is that code has links to modules to original source files."),(0,o.kt)("p",null,(0,o.kt)("inlineCode",{parentName:"p"},"tramvai")," generates big single bundle with server code and that's why it is preferred to not include sourcemaps in the code itself and put it to the separate ",(0,o.kt)("inlineCode",{parentName:"p"},".js.map")," file."),(0,o.kt)("h5",{id:"development"},"Development"),(0,o.kt)("p",null,"By default in development mode for browser is used the fastest sourcemaps (",(0,o.kt)("inlineCode",{parentName:"p"},'devtool: "eval"')," in webpack config), while for server no sourcemaps is used."),(0,o.kt)("p",null,"Flag ",(0,o.kt)("inlineCode",{parentName:"p"},"--debug")," enables sourcemap generation for the client and server code."),(0,o.kt)("p",null,"Also, ",(0,o.kt)("inlineCode",{parentName:"p"},"tramvai.json")," option ",(0,o.kt)("a",{parentName:"p",href:"/docs/references/cli/start#enable-sourcemaps-in-dev-mode"},(0,o.kt)("inlineCode",{parentName:"a"},"sourceMap"))," enables sourcemap generation both for browser and server code."),(0,o.kt)("p",null,"Also, ",(0,o.kt)("inlineCode",{parentName:"p"},"tramvai.json")," option ",(0,o.kt)("a",{parentName:"p",href:"/docs/references/cli/start#enable-sourcemaps-in-dev-mode"},(0,o.kt)("inlineCode",{parentName:"a"},"webpack"))," allows set one of the following values for the ",(0,o.kt)("inlineCode",{parentName:"p"},"devtool")," option in webpack config: ",(0,o.kt)("inlineCode",{parentName:"p"},"eval-cheap-module-source-map"),", ",(0,o.kt)("inlineCode",{parentName:"p"},"eval-cheap-source-map"),", ",(0,o.kt)("inlineCode",{parentName:"p"},"eval-source-map")," - both for browser and server code."),(0,o.kt)("h5",{id:"production"},"Production"),(0,o.kt)("p",null,"By default, sourcemaps are disabled both for the client and server code in production mode."),(0,o.kt)("p",null,"Flag ",(0,o.kt)("inlineCode",{parentName:"p"},"--debug")," enables sourcemaps generation for the client and server code."),(0,o.kt)("p",null,"Also, ",(0,o.kt)("inlineCode",{parentName:"p"},"tramvai.json")," option ",(0,o.kt)("a",{parentName:"p",href:"/docs/references/cli/build#enable-sourcemaps-in-production-mode"},(0,o.kt)("inlineCode",{parentName:"a"},"sourceMap"))," enables sourcemap generation both for browser and server code."),(0,o.kt)("h2",{id:"configuration"},"Configuration"),(0,o.kt)("p",null,"Configuration is provided through json-file with the name ",(0,o.kt)("inlineCode",{parentName:"p"},"tramvai.json")," in the root of the single-application/monorepo"),(0,o.kt)("h2",{id:"how-to"},"How to"),(0,o.kt)("h3",{id:"code-generation"},"Code generation"),(0,o.kt)("p",null,"For make life easier for developers ",(0,o.kt)("inlineCode",{parentName:"p"},"@tramvai/cli")," has ability to automatically generate code with template. For running code generator use command ",(0,o.kt)("inlineCode",{parentName:"p"},"tramvai generate")," and pick up one of the options available to generate that entity:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"action"),(0,o.kt)("li",{parentName:"ul"},"bundle"),(0,o.kt)("li",{parentName:"ul"},"reducer"),(0,o.kt)("li",{parentName:"ul"},"page"),(0,o.kt)("li",{parentName:"ul"},"component"),(0,o.kt)("li",{parentName:"ul"},"module")),(0,o.kt)("p",null,"After that template files will be generated"),(0,o.kt)("h3",{id:"generate-new-project"},"Generate new project"),(0,o.kt)("p",null,"For the quick start of new project you can use command ",(0,o.kt)("inlineCode",{parentName:"p"},"tramvai new")," that will generate new base project with the tramvai and tramvai-cli"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"install tramvai-cli ",(0,o.kt)("a",{parentName:"li",href:"#installation"},"globally")),(0,o.kt)("li",{parentName:"ul"},"enter command ",(0,o.kt)("inlineCode",{parentName:"li"},"tramvai new NAME_YOUR_APP")," in the shell"),(0,o.kt)("li",{parentName:"ul"},"choose options based on your preferences: monorepo or multirepo, CI integration and testing framework")),(0,o.kt)("p",null,"After command execution and dependency installation new project will be ready to use"),(0,o.kt)("h3",{id:"how-to-run-nodejs-app-in-debug-mode"},"How to run nodejs app in debug mode?"),(0,o.kt)("p",null,"Add flag ",(0,o.kt)("inlineCode",{parentName:"p"},"--debug")," when running app"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-sh"},"tramvai start my-app --debug\n")),(0,o.kt)("p",null,"Then open chrome devTools, click on NodeJs logo in the upper left corner. New window with the nodejs devtools will be opened that allows to debug memory and cpu usage, debug code and take the performance profiles."),(0,o.kt)("h3",{id:"get-details-for-deprecated-and-warning-logs"},"Get details for deprecated and warning logs"),(0,o.kt)("p",null,"It might be useful to get the stacktraces of some of the warnings."),(0,o.kt)("p",null,"E.g., while running app if you see logs like this"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre"},"(node:2898) DeprecationWarning: ...\n(Use `node --trace-deprecation ...` to show where the warning was created)\n")),(0,o.kt)("p",null,"You may add flag ",(0,o.kt)("inlineCode",{parentName:"p"},"--trace")," in order to run nodejs server with the ",(0,o.kt)("a",{parentName:"p",href:"https://nodejs.org/dist/latest-v14.x/docs/api/cli.html#cli_trace_warnings"},"additional options"),"."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-sh"},"tramvai start my-app --trace\n")),(0,o.kt)("p",null,"After that these logs will be printed with their stacktraces"),(0,o.kt)("h3",{id:"how-to-use-browserstack-for-testing"},"How to use browserstack for testing"),(0,o.kt)("blockquote",null,(0,o.kt)("p",{parentName:"blockquote"},"To get access to browserstack just type command ",(0,o.kt)("inlineCode",{parentName:"p"},"/bs")," in slack")),(0,o.kt)("p",null,"Run app as usual with ",(0,o.kt)("inlineCode",{parentName:"p"},"tramvai start")," command and follow the ",(0,o.kt)("a",{parentName:"p",href:"https://www.browserstack.com/docs/live/local-testing"},"browsertack instruction for the local development"),". If everything were done right you will be able to get access to localhost inside browserstack and test your app through it."),(0,o.kt)("h3",{id:"how-to-test-app-on-mobile-or-other-device-in-local-network"},"How to test app on mobile or other device in local network"),(0,o.kt)("p",null,"Both devices one that running the app and one for testing must reside in the same network."),(0,o.kt)("p",null,"For setting access through local network follow next steps:"),(0,o.kt)("ol",null,(0,o.kt)("li",{parentName:"ol"},"figure out the ip of the machine that runs app"),(0,o.kt)("li",{parentName:"ol"},"run command ",(0,o.kt)("inlineCode",{parentName:"li"},"tramvai start")," with flag ",(0,o.kt)("inlineCode",{parentName:"li"},"--staticHost")," with value of the ip address that was resolved on previous step (e.g. ",(0,o.kt)("inlineCode",{parentName:"li"},"tramvai start tincoin --staticHost 192.168.1.3"),")"),(0,o.kt)("li",{parentName:"ol"},"from the testing device open the new page in the browser and use the ip address from the previous step as domain name")),(0,o.kt)("blockquote",null,(0,o.kt)("p",{parentName:"blockquote"},"When calling @tramvai/cli using npm you need to pass ",(0,o.kt)("inlineCode",{parentName:"p"},"--")," before any additional arguments, e.g. command should look similar to this ",(0,o.kt)("inlineCode",{parentName:"p"},"npm start -- --staticHost 192.168.1.3"))),(0,o.kt)("h3",{id:"how-to-enable-paths-mapping"},"How to enable paths mapping"),(0,o.kt)("p",null,"In case you want to use special imports instead of pure relative paths in your code."),(0,o.kt)("p",null,"More details and examples you can find in typescript documentation:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("a",{parentName:"li",href:"https://www.typescriptlang.org/docs/handbook/module-resolution.html#base-url"},"baseUrl")),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("a",{parentName:"li",href:"https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping"},"path mapping"))),(0,o.kt)("p",null,"@tramvai/cli will reuse options ",(0,o.kt)("inlineCode",{parentName:"p"},"baseUrl")," and ",(0,o.kt)("inlineCode",{parentName:"p"},"paths")," from the app's ",(0,o.kt)("inlineCode",{parentName:"p"},"tsconfig.json")," to provide path mapping functionality."),(0,o.kt)("h3",{id:"how-to-pass-nodejs-options"},"How to pass Node.js options"),(0,o.kt)("p",null,"You can use ",(0,o.kt)("inlineCode",{parentName:"p"},"NODE_OPTIONS")," env variable, e.g.:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-bash"},'NODE_OPTIONS="--max-semi-space-size=64" tramvai start-prod {appName}\n')),(0,o.kt)("h3",{id:"how-to-get-cpu-profile-of-tramvaicli-work"},"How to get CPU profile of @tramvai/cli work?"),(0,o.kt)("p",null,"Run application server or production build with env variable ",(0,o.kt)("inlineCode",{parentName:"p"},"TRAMVAI_CPU_PROFILE"),":"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-bash"},"TRAMVAI_CPU_PROFILE=1 tramvai build {appName}\n")),(0,o.kt)("p",null,"Then, file with ",(0,o.kt)("inlineCode",{parentName:"p"},"tramvai-cli.${Date.now()}.cpuprofile")," name will be generated in current working directory."),(0,o.kt)("p",null,"You can open this trace in Chrome DevTools - ",(0,o.kt)("inlineCode",{parentName:"p"},"chrome://inspect"),', "Open dedicated DevTools for Node", ',(0,o.kt)("inlineCode",{parentName:"p"},"Performance")," tab."),(0,o.kt)("h3",{id:"how-to-enable-production-profiling-for-react"},"How to enable production profiling for React"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-bash"},"TRAMVAI_REACT_PROFILE=1 tramvai build {appName}\n# or\nTRAMVAI_REACT_PROFILE=1 tramvai start-prod {appName}\n")),(0,o.kt)("p",null,"After that, you can use the React DevTools Profiler in the same way as you would in development."),(0,o.kt)("p",null,"WARNING: The size of the bundle will be larger, because mangling is disabled for such builds. Do not use this env variable for production environment."),(0,o.kt)("p",null,"Documentation:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("a",{parentName:"li",href:"https://legacy.reactjs.org/blog/2018/09/10/introducing-the-react-profiler.html"},"How to use React Profiler")),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("a",{parentName:"li",href:"https://github.com/reactwg/react-18/discussions/76"},"Introducing a new React profiler (React 18)")),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("a",{parentName:"li",href:"https://react-devtools-tutorial.vercel.app/"},"React DevTools tutorial"))))}c.isMDXComponent=!0}}]);