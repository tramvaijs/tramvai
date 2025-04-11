"use strict";(globalThis.webpackChunk=globalThis.webpackChunk||[]).push([[4924],{3905:(e,t,n)=>{n.d(t,{Zo:()=>c,kt:()=>u});var a=n(7294);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,a,o=function(e,t){if(null==e)return{};var n,a,o={},r=Object.keys(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var p=a.createContext({}),s=function(e){var t=a.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},c=function(e){var t=s(e.components);return a.createElement(p.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},m=a.forwardRef((function(e,t){var n=e.components,o=e.mdxType,r=e.originalType,p=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),m=s(n),u=o,h=m["".concat(p,".").concat(u)]||m[u]||d[u]||r;return n?a.createElement(h,i(i({ref:t},c),{},{components:n})):a.createElement(h,i({ref:t},c))}));function u(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var r=n.length,i=new Array(r);i[0]=m;var l={};for(var p in t)hasOwnProperty.call(t,p)&&(l[p]=t[p]);l.originalType=e,l.mdxType="string"==typeof e?e:o,i[1]=l;for(var s=2;s<r;s++)i[s]=n[s];return a.createElement.apply(null,i)}return a.createElement.apply(null,n)}m.displayName="MDXCreateElement"},6138:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>i,default:()=>d,frontMatter:()=>r,metadata:()=>l,toc:()=>s});var a=n(7462),o=(n(7294),n(3905));const r={sidebar_position:3},i=void 0,l={unversionedId:"references/cli/start",id:"references/cli/start",title:"start",description:"Command to start development build in watch mode",source:"@site/tmp-docs/references/cli/start.md",sourceDirName:"references/cli",slug:"/references/cli/start",permalink:"/docs/references/cli/start",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/tmp-docs/references/cli/start.md",tags:[],version:"current",sidebarPosition:3,frontMatter:{sidebar_position:3},sidebar:"sidebar",previous:{title:"config",permalink:"/docs/references/cli/config"},next:{title:"build",permalink:"/docs/references/cli/build"}},p={},s=[{value:"Options",id:"options",level:2},{value:"<code>-p</code>, <code>--port</code>",id:"-p---port",level:3},{value:"React hot refresh",id:"react-hot-refresh",level:2},{value:"Enable sourcemaps in dev mode",id:"enable-sourcemaps-in-dev-mode",level:2},{value:"How to",id:"how-to",level:2},{value:"Speed up development build",id:"speed-up-development-build",level:3},{value:"Build only specific bundles",id:"build-only-specific-bundles",level:4},{value:"Starting the development server with the HTTPS protocol",id:"starting-the-development-server-with-the-https-protocol",level:3}],c={toc:s};function d({components:e,...t}){return(0,o.kt)("wrapper",(0,a.Z)({},c,t,{components:e,mdxType:"MDXLayout"}),(0,o.kt)("blockquote",null,(0,o.kt)("p",{parentName:"blockquote"},"Command to start development build in watch mode")),(0,o.kt)("h2",{id:"options"},"Options"),(0,o.kt)("h3",{id:"-p---port"},(0,o.kt)("inlineCode",{parentName:"h3"},"-p"),", ",(0,o.kt)("inlineCode",{parentName:"h3"},"--port")),(0,o.kt)("p",null,"Allows to specify port on which app server will listen requests"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-sh"},"tramvai start -p 8080 <app>\n")),(0,o.kt)("h2",{id:"react-hot-refresh"},"React hot refresh"),(0,o.kt)("admonition",{type:"info"},(0,o.kt)("p",{parentName:"admonition"},"The feature is enabled by default")),(0,o.kt)("p",null,"It is possible to refresh react components without page similar to the way in works in ",(0,o.kt)("a",{parentName:"p",href:"https://reactnative.dev/docs/fast-refresh"},"React Native"),"."),(0,o.kt)("p",null,"Besides fash page refreshes (hot-reload) in that mode state is preserved for hooks ",(0,o.kt)("inlineCode",{parentName:"p"},"useState")," and ",(0,o.kt)("inlineCode",{parentName:"p"},"useRef"),"."),(0,o.kt)("blockquote",null,(0,o.kt)("p",{parentName:"blockquote"},"You can force resetting state by adding comment ",(0,o.kt)("inlineCode",{parentName:"p"},"// @refresh reset")," to the file. It will reset state for the whole file.")),(0,o.kt)("p",null,"When encounter syntax and runtime errors, fast-refresh plugin will await for the error resolving and after fix will continue to work as usual."),(0,o.kt)("p",null,"Constraints:"),(0,o.kt)("ol",null,(0,o.kt)("li",{parentName:"ol"},"state for class components doesn't preserve"),(0,o.kt)("li",{parentName:"ol"},(0,o.kt)("inlineCode",{parentName:"li"},"useEffect"),", ",(0,o.kt)("inlineCode",{parentName:"li"},"useMemo"),", ",(0,o.kt)("inlineCode",{parentName:"li"},"useCallback")," refresh on every code change despite their dependency list, it includes empty dependency list as well, e.g. ",(0,o.kt)("inlineCode",{parentName:"li"},"useEffect(() => {}, [])")," will be executed on every refresh - this is undesirable behaviour but it teaches to write stable code which is resistant for the redundant renders")),(0,o.kt)("p",null,"To enable this mode, add to ",(0,o.kt)("inlineCode",{parentName:"p"},"tramvai.json"),":"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-json"},'"hotRefresh": {\n  "enabled": true\n}\n')),(0,o.kt)("p",null,"You can configure settings with ",(0,o.kt)("inlineCode",{parentName:"p"},"hotRefreshOptions")," option, see details ",(0,o.kt)("a",{parentName:"p",href:"https://github.com/pmmmwh/react-refresh-webpack-plugin#options"},"in the docs of react-refresh"),":"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-json"},'"hotRefresh": {\n  "enabled": true,\n  "options": {\n    "overlay": false // disable error overlay\n  }\n}\n')),(0,o.kt)("h2",{id:"enable-sourcemaps-in-dev-mode"},"Enable sourcemaps in dev mode"),(0,o.kt)("p",null,"In ",(0,o.kt)("inlineCode",{parentName:"p"},"tramvai.json")),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-json"},'"sourceMap": {\n  "development": true\n}\n')),(0,o.kt)("p",null,"It is equivalent to ",(0,o.kt)("inlineCode",{parentName:"p"},"devtool: 'source-map'")," in webpack config with ",(0,o.kt)("inlineCode",{parentName:"p"},"source-map-loader"),"."),(0,o.kt)("p",null,"In addition, it is possible to set one of the following values for the ",(0,o.kt)("inlineCode",{parentName:"p"},"devtool")," option in webpack config: ",(0,o.kt)("inlineCode",{parentName:"p"},"eval-cheap-module-source-map"),", ",(0,o.kt)("inlineCode",{parentName:"p"},"eval-cheap-source-map"),", ",(0,o.kt)("inlineCode",{parentName:"p"},"eval-source-map"),". For example, to set the option value to ",(0,o.kt)("inlineCode",{parentName:"p"},"eval-cheap-module-source-map"),", add next lines to the ",(0,o.kt)("inlineCode",{parentName:"p"},"tramvai.json"),":"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-json"},'"webpack": {\n  "devtool": "eval-cheap-module-source-map"\n}\n')),(0,o.kt)("h2",{id:"how-to"},"How to"),(0,o.kt)("h3",{id:"speed-up-development-build"},"Speed up development build"),(0,o.kt)("h4",{id:"build-only-specific-bundles"},"Build only specific bundles"),(0,o.kt)("p",null,"App may contain of many bundles and the more there bundle, the more code get bundled to the app, the more long in building and rebuilding the app during development."),(0,o.kt)("p",null,"In order to speed up that process when running ",(0,o.kt)("inlineCode",{parentName:"p"},"@tramvai/cli")," it is possible to specify bundles required for the development and cli will build only that bundles."),(0,o.kt)("blockquote",null,(0,o.kt)("p",{parentName:"blockquote"},"Bundles should be placed in directory ",(0,o.kt)("inlineCode",{parentName:"p"},"bundles")," and should be imported from the index app file.")),(0,o.kt)("blockquote",null,(0,o.kt)("p",{parentName:"blockquote"},"When trying to request bundle that was disabled, server will fail with status 500, as it is unexpected condition for the server that bundle is missing")),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-sh"},"tramvai start myapp --onlyBundles=account\n# if you need several bundles\ntramvai start myapp --onlyBundle=account,trading\n")),(0,o.kt)("h3",{id:"starting-the-development-server-with-the-https-protocol"},"Starting the development server with the HTTPS protocol"),(0,o.kt)("p",null,"In certain situations, you may want to run your application in a secure https environment. This can help address various issues, such as:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"Debugging ",(0,o.kt)("a",{parentName:"li",href:"https://developer.mozilla.org/en-US/docs/Web/Security/Mixed_content"},"Mixed content")),(0,o.kt)("li",{parentName:"ul"},"Working with ",(0,o.kt)("a",{parentName:"li",href:"https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API"},"Service Worker")," and ",(0,o.kt)("a",{parentName:"li",href:"https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps"},"PWA")),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("a",{parentName:"li",href:"https://en.wikipedia.org/wiki/Secure_cookie"},"Secure cookie")),(0,o.kt)("li",{parentName:"ul"},"And more. For a full list, please refer to the MDN documentation on ",(0,o.kt)("a",{parentName:"li",href:"https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts/features_restricted_to_secure_contexts"},"Features restricted to secure contexts"))),(0,o.kt)("admonition",{title:"Prerequisite:",type:"warning"},(0,o.kt)("p",{parentName:"admonition"},"Before executing the ",(0,o.kt)("inlineCode",{parentName:"p"},"tramvai start myapp --https")," command, please ensure that you have installed the ",(0,o.kt)("inlineCode",{parentName:"p"},"mkcert")," utility package. ",(0,o.kt)("a",{parentName:"p",href:"https://github.com/FiloSottile/mkcert"},"mkcert")," is a simple tool used for generating development certificates that are trusted locally. It requires no configuration. Refer to the ",(0,o.kt)("a",{parentName:"p",href:"https://github.com/FiloSottile/mkcert?tab=readme-ov-file#installation"},"installation")," section for detailed instructions.")),(0,o.kt)("p",null,"To start the Tramvai application in an ",(0,o.kt)("inlineCode",{parentName:"p"},"https")," environment, you can utilize the ",(0,o.kt)("inlineCode",{parentName:"p"},"--https")," flag. For the first time, when running this command, it may prompt for your computer password in order to generate the certificates correctly."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-sh"},"tramvai start myapp --https\n")),(0,o.kt)("p",null,(0,o.kt)("inlineCode",{parentName:"p"},"mkcert")," will generate three files - ",(0,o.kt)("inlineCode",{parentName:"p"},"rootCA.pem"),", ",(0,o.kt)("inlineCode",{parentName:"p"},"[key].pem"),", ",(0,o.kt)("inlineCode",{parentName:"p"},"[cert].pem"),":"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"[cert].pem")," - is your server's public certificate that will be shared with the client during the SSL handshake."),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"[key].pem")," - is your server's private key, used to establish a secure connection with the client through encryption and should be kept secure and private."),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"rootCA.pem")," - is used to install a local CA on your system and trust certificates signed by it.")),(0,o.kt)("p",null,"The first two files will be located in the ",(0,o.kt)("inlineCode",{parentName:"p"},"/certificates")," folder within your root project directory, and if you have a ",(0,o.kt)("inlineCode",{parentName:"p"},".gitignore")," file, this folder will automatically be added to it. ",(0,o.kt)("inlineCode",{parentName:"p"},"rootCA.pem")," certificate can be located in different places depending on your OS. To know exactly where is it located, you can run ",(0,o.kt)("inlineCode",{parentName:"p"},"mkcert -CAROOT")," command."),(0,o.kt)("p",null,"To start the Tramvai application in an ",(0,o.kt)("inlineCode",{parentName:"p"},"https")," environment and serve it on a custom local domain, you can use the ",(0,o.kt)("inlineCode",{parentName:"p"},"--host")," flag. Before running the command below, make sure you have updated your system ",(0,o.kt)("inlineCode",{parentName:"p"},"/etc/hosts")," file with the necessary changes. For example, if you want your application to be accessible from the domain ",(0,o.kt)("inlineCode",{parentName:"p"},"localhost.domain.com"),", add the following line to your ",(0,o.kt)("inlineCode",{parentName:"p"},"/etc/hosts")," file: ",(0,o.kt)("inlineCode",{parentName:"p"},"127.0.0.1 localhost.domain.com"),". Once you have made the appropriate changes, execute the command below to start the application:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-sh"},"tramvai start myapp --https --host localhost.domain.com\n")),(0,o.kt)("admonition",{title:"Known issue:",type:"warning"},(0,o.kt)("p",{parentName:"admonition"},(0,o.kt)("a",{parentName:"p",href:"https://github.com/FiloSottile/mkcert?tab=readme-ov-file#using-the-root-with-nodejs"},"NodeJS does not use ",(0,o.kt)("inlineCode",{parentName:"a"},"rootCA")," ceriticate by default"),". That is why NodeJS will not trust your ",(0,o.kt)("inlineCode",{parentName:"p"},"[cert].pem")," and ",(0,o.kt)("inlineCode",{parentName:"p"},"[key].pem"),". To avoid problems with that use ",(0,o.kt)("inlineCode",{parentName:"p"},"NODE_EXTRA_CA_CERTS")," environment variable - ",(0,o.kt)("inlineCode",{parentName:"p"},'NODE_EXTRA_CA_CERTS="$(mkcert -CAROOT)/rootCA.pem" tramvai start myapp --https'))),(0,o.kt)("admonition",{type:"tip"},(0,o.kt)("p",{parentName:"admonition"},"If you are using the ",(0,o.kt)("inlineCode",{parentName:"p"},"https")," environment to debug your PWA application on an iOS simulator or iPhone, it is important to manually install the ",(0,o.kt)("inlineCode",{parentName:"p"},"rootCA.pem")," file. To locate this file, use the ",(0,o.kt)("inlineCode",{parentName:"p"},"mkcert -CAROOT")," command in your terminal. Generated certificates inside your project directory will not have any effect on the iOS simulator or iPhone if you attempt to install them directly. For more detailed information, please check the official mkcert documentation - ",(0,o.kt)("a",{parentName:"p",href:"https://github.com/FiloSottile/mkcert?tab=readme-ov-file#mobile-devices"},"mobile devices"))),(0,o.kt)("p",null,"To start the Tramvai application in an ",(0,o.kt)("inlineCode",{parentName:"p"},"https")," environment and use your own custom certificate, you can use the ",(0,o.kt)("inlineCode",{parentName:"p"},"--httpsKey")," and ",(0,o.kt)("inlineCode",{parentName:"p"},"--httpsCert")," flags. In this case, the application will not generate any certificates and will use the files you provide. It can be useful in case if you already have generated certificates trusted by your machine, for example certificates that were generated using ",(0,o.kt)("inlineCode",{parentName:"p"},"openssl")," tool. Example:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-sh"},"tramvai start myapp --https --host localhost.domain.com --httpsKey ./path-to-certificates-folder/localhost-key.pem --httpsCert ./path-to-certificates-folder/localhost.pem\n")))}d.isMDXComponent=!0}}]);