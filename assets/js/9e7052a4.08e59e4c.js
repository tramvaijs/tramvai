"use strict";(globalThis.webpackChunk=globalThis.webpackChunk||[]).push([[23],{3905:(e,r,n)=>{n.d(r,{Zo:()=>c,kt:()=>h});var t=n(7294);function i(e,r,n){return r in e?Object.defineProperty(e,r,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[r]=n,e}function o(e,r){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var t=Object.getOwnPropertySymbols(e);r&&(t=t.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),n.push.apply(n,t)}return n}function a(e){for(var r=1;r<arguments.length;r++){var n=null!=arguments[r]?arguments[r]:{};r%2?o(Object(n),!0).forEach((function(r){i(e,r,n[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(n,r))}))}return e}function l(e,r){if(null==e)return{};var n,t,i=function(e,r){if(null==e)return{};var n,t,i={},o=Object.keys(e);for(t=0;t<o.length;t++)n=o[t],r.indexOf(n)>=0||(i[n]=e[n]);return i}(e,r);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(t=0;t<o.length;t++)n=o[t],r.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var d=t.createContext({}),p=function(e){var r=t.useContext(d),n=r;return e&&(n="function"==typeof e?e(r):a(a({},r),e)),n},c=function(e){var r=p(e.components);return t.createElement(d.Provider,{value:r},e.children)},s={inlineCode:"code",wrapper:function(e){var r=e.children;return t.createElement(t.Fragment,{},r)}},u=t.forwardRef((function(e,r){var n=e.components,i=e.mdxType,o=e.originalType,d=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),u=p(n),h=i,f=u["".concat(d,".").concat(h)]||u[h]||s[h]||o;return n?t.createElement(f,a(a({ref:r},c),{},{components:n})):t.createElement(f,a({ref:r},c))}));function h(e,r){var n=arguments,i=r&&r.mdxType;if("string"==typeof e||i){var o=n.length,a=new Array(o);a[0]=u;var l={};for(var d in r)hasOwnProperty.call(r,d)&&(l[d]=r[d]);l.originalType=e,l.mdxType="string"==typeof e?e:i,a[1]=l;for(var p=2;p<o;p++)a[p]=n[p];return t.createElement.apply(null,a)}return t.createElement.apply(null,n)}u.displayName="MDXCreateElement"},7348:(e,r,n)=>{n.r(r),n.d(r,{assets:()=>d,contentTitle:()=>a,default:()=>s,frontMatter:()=>o,metadata:()=>l,toc:()=>p});var t=n(7462),i=(n(7294),n(3905));const o={id:"error-handling",title:"Error Handling"},a=void 0,l={unversionedId:"features/child-app/error-handling",id:"features/child-app/error-handling",title:"Error Handling",description:"Error while loading child-app configs",source:"@site/tmp-docs/03-features/015-child-app/012-error-handling.md",sourceDirName:"03-features/015-child-app",slug:"/features/child-app/error-handling",permalink:"/docs/features/child-app/error-handling",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/tmp-docs/03-features/015-child-app/012-error-handling.md",tags:[],version:"current",sidebarPosition:12,frontMatter:{id:"error-handling",title:"Error Handling"},sidebar:"sidebar",previous:{title:"React Query",permalink:"/docs/features/child-app/react-query"},next:{title:"How Child Apps work",permalink:"/docs/features/child-app/workflow"}},d={},p=[{value:"Error while loading child-app configs",id:"error-while-loading-child-app-configs",level:3},{value:"Child-app with specified name was not found",id:"child-app-with-specified-name-was-not-found",level:3},{value:"Failed to load child-app code",id:"failed-to-load-child-app-code",level:3},{value:"Error during child-app render",id:"error-during-child-app-render",level:3},{value:"Error in commandLine handler",id:"error-in-commandline-handler",level:3}],c={toc:p};function s({components:e,...r}){return(0,i.kt)("wrapper",(0,t.Z)({},c,r,{components:e,mdxType:"MDXLayout"}),(0,i.kt)("h3",{id:"error-while-loading-child-app-configs"},"Error while loading child-app configs"),(0,i.kt)("p",null,"Child-app configs might be loaded with providers for multi token ",(0,i.kt)("inlineCode",{parentName:"p"},"CHILD_APP_RESOLUTION_CONFIGS_TOKEN")," that are implemented in custom modules or in the app code."),(0,i.kt)("p",null,"Error that were raised in custom providers will be logged as errors under ",(0,i.kt)("inlineCode",{parentName:"p"},"child-app:resolution-config")," key. After that there errors will be ignored and won't affect other resolutions, but the configs that could be loaded with that provider will be lost."),(0,i.kt)("h3",{id:"child-app-with-specified-name-was-not-found"},"Child-app with specified name was not found"),(0,i.kt)("p",null,"There is 2 causes that may lead to missing child-app in config:"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},"configs defined through ",(0,i.kt)("inlineCode",{parentName:"li"},"CHILD_APP_RESOLUTION_CONFIGS_TOKEN")," was failed and therefore there is no info about used child-app"),(0,i.kt)("li",{parentName:"ul"},"wrong naming of child-app")),(0,i.kt)("p",null,"In any of that causes the error about missing child-app will be logged and the render for it will just return null."),(0,i.kt)("p",null,"If you are facing that problem first check the logs about errors for loading child-app configs than check that naming is right and such child-app exists in your configs."),(0,i.kt)("h3",{id:"failed-to-load-child-app-code"},"Failed to load child-app code"),(0,i.kt)("p",null,"Request to child-app code can fail by various causes."),(0,i.kt)("p",null,"If request has failed on server side the script tag with link to child-app client code will still be added to the html in order to try to load the child-app on client side. It will render fallback if provided or null on SSR (wrapped in Suspense for react@18) in that case and will try to resolve and render the child-app on the client."),(0,i.kt)("p",null,"If request has failed on client side it will render ",(0,i.kt)("a",{parentName:"p",href:"#fallback"},"fallback")," passing error or the default errorBoundary component."),(0,i.kt)("h3",{id:"error-during-child-app-render"},"Error during child-app render"),(0,i.kt)("p",null,"Errors that happens inside child-app's render function"),(0,i.kt)("p",null,"If render has failed on server side it will render fallback if provided or null otherwise. It may then proper rehydrated on client side."),(0,i.kt)("p",null,"If render has failed on client side it will render fallback with error if provided or default errorBoundary component."),(0,i.kt)("p",null,"Render errors that were occured on client side will be logged as errors under ",(0,i.kt)("inlineCode",{parentName:"p"},"child-app:render")," key and can be found in application logs by event ",(0,i.kt)("inlineCode",{parentName:"p"},"component-did-catch"),". If you need custom monitoring, you can provide ",(0,i.kt)("inlineCode",{parentName:"p"},"CHILD_APP_ERROR_BOUNDARY_TOKEN")," handler, e.g.:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-ts"},"import { CHILD_APP_ERROR_BOUNDARY_TOKEN } from '@tramvai/tokens-child-app';\n\nconst provider = provide({\n  provide: CHILD_APP_ERROR_BOUNDARY_TOKEN,\n  useFactory: () => {\n    const log = logger('child-app-error-boundary');\n\n    return function logErrorBoundary(error: Error, info: React.ErrorInfo, config: ChildAppRequestConfig) {\n      log.error({\n        event: 'component-did-catch',\n        error,\n        info,\n        childApp: config,\n      });\n    };\n  },\n  deps: {\n    logger: LOGGER_TOKEN,\n  },\n});\n")),(0,i.kt)("h3",{id:"error-in-commandline-handler"},"Error in commandLine handler"),(0,i.kt)("p",null,"Any errors inside child-app commandLine execution will be logged and won't affect the execution of the root-app."))}s.isMDXComponent=!0}}]);