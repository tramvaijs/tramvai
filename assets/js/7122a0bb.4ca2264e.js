"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[6824],{3905:function(e,t,a){a.d(t,{Zo:function(){return p},kt:function(){return d}});var o=a(7294);function r(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function n(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,o)}return a}function i(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?n(Object(a),!0).forEach((function(t){r(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):n(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function l(e,t){if(null==e)return{};var a,o,r=function(e,t){if(null==e)return{};var a,o,r={},n=Object.keys(e);for(o=0;o<n.length;o++)a=n[o],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);for(o=0;o<n.length;o++)a=n[o],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var s=o.createContext({}),m=function(e){var t=o.useContext(s),a=t;return e&&(a="function"==typeof e?e(t):i(i({},t),e)),a},p=function(e){var t=m(e.components);return o.createElement(s.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return o.createElement(o.Fragment,{},t)}},c=o.forwardRef((function(e,t){var a=e.components,r=e.mdxType,n=e.originalType,s=e.parentName,p=l(e,["components","mdxType","originalType","parentName"]),c=m(a),d=r,h=c["".concat(s,".").concat(d)]||c[d]||u[d]||n;return a?o.createElement(h,i(i({ref:t},p),{},{components:a})):o.createElement(h,i({ref:t},p))}));function d(e,t){var a=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var n=a.length,i=new Array(n);i[0]=c;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l.mdxType="string"==typeof e?e:r,i[1]=l;for(var m=2;m<n;m++)i[m]=a[m];return o.createElement.apply(null,i)}return o.createElement.apply(null,a)}c.displayName="MDXCreateElement"},8494:function(e,t,a){a.r(t),a.d(t,{assets:function(){return s},contentTitle:function(){return i},default:function(){return u},frontMatter:function(){return n},metadata:function(){return l},toc:function(){return m}});var o=a(7462),r=(a(7294),a(3905));const n={title:"Memory leak"},i=void 0,l={unversionedId:"mistakes/memory-leak",id:"mistakes/memory-leak",title:"Memory leak",description:"In case you are facing critical errors for the server like FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory than this is probably caused by memory leak in your app.",source:"@site/tmp-docs/mistakes/memory-leak.md",sourceDirName:"mistakes",slug:"/mistakes/memory-leak",permalink:"/docs/mistakes/memory-leak",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/tmp-docs/mistakes/memory-leak.md",tags:[],version:"current",frontMatter:{title:"Memory leak"},sidebar:"sidebar",previous:{title:"Duplicate dependencies",permalink:"/docs/mistakes/duplicate-dependencies"}},s={},m=[{value:"Local profiling",id:"local-profiling",level:2},{value:"Start the app",id:"start-the-app",level:3},{value:"Use the DevTools",id:"use-the-devtools",level:3},{value:"Test requests",id:"test-requests",level:3},{value:"What to look",id:"what-to-look",level:3},{value:"ChildContainer",id:"childcontainer",level:4},{value:"Summary",id:"summary",level:3},{value:"Example",id:"example",level:3}],p={toc:m};function u(e){let{components:t,...a}=e;return(0,r.kt)("wrapper",(0,o.Z)({},p,a,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"In case you are facing critical errors for the server like ",(0,r.kt)("inlineCode",{parentName:"p"},"FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory")," than this is probably caused by memory leak in your app."),(0,r.kt)("h2",{id:"local-profiling"},"Local profiling"),(0,r.kt)("p",null,"To find out root cause of the problem you need to analyze memory allocation on server over time."),(0,r.kt)("h3",{id:"start-the-app"},"Start the app"),(0,r.kt)("ol",null,(0,r.kt)("li",{parentName:"ol"},"You may use either ",(0,r.kt)("inlineCode",{parentName:"li"},"start")," or ",(0,r.kt)("inlineCode",{parentName:"li"},"start-prod")," command to profile your app, but keep in mind that ",(0,r.kt)("inlineCode",{parentName:"li"},"start")," runs app in dev-environment that leads to higher memory consumption and additional code that may distract you from analyzing core logic of the app. However ",(0,r.kt)("inlineCode",{parentName:"li"},"start")," is preferred when you need to make code changes and you do not need to get the exact values of memory usage as for the prod-environment."),(0,r.kt)("li",{parentName:"ol"},"Using ",(0,r.kt)("inlineCode",{parentName:"li"},"@tramvai/cli")," you can pass a special flag ",(0,r.kt)("a",{parentName:"li",href:"/docs/references/cli/base#debug-an-app"},(0,r.kt)("inlineCode",{parentName:"a"},"--debug"))," and pass it either to the ",(0,r.kt)("inlineCode",{parentName:"li"},"start")," or ",(0,r.kt)("inlineCode",{parentName:"li"},"start-prod")," command"),(0,r.kt)("li",{parentName:"ol"},"You may pass any additional environment variables when calling cli commands as usual. For example, you may pass flag ",(0,r.kt)("a",{parentName:"li",href:"/docs/references/modules/http-client#http-client#how-to-disable-http-request-caching"},(0,r.kt)("inlineCode",{parentName:"a"},"HTTP_CLIENT_CACHE_DISABLED"))," to disable http cache."),(0,r.kt)("li",{parentName:"ol"},"To pass additional flags to the running nodejs instance you may use env ",(0,r.kt)("inlineCode",{parentName:"li"},"NODE_OPTIONS"),". E.g., if you want to limit the heap memory for the running server pass ",(0,r.kt)("inlineCode",{parentName:"li"},'NODE_OPTIONS="--max-old-space-size=256"')),(0,r.kt)("li",{parentName:"ol"},"If you are profiling using ",(0,r.kt)("inlineCode",{parentName:"li"},"start-prod")," with different env values without code changes you can use start-prod command that will reuse previous builds, e.g. ",(0,r.kt)("inlineCode",{parentName:"li"},"tramvai start-prod -t none app --debug"))),(0,r.kt)("h3",{id:"use-the-devtools"},"Use the DevTools"),(0,r.kt)("p",null,"After starting the app in debug mode you can open Chrome DevTools to be ready to take some profiling."),(0,r.kt)("p",null,"You may read more about how to profile memory leaks with Chrome in next links:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"https://medium.com/@basakabhijoy/debugging-and-profiling-memory-leaks-in-nodejs-using-chrome-e8ece4560dba#:~:text=Fire%20up%20the%20chrome%20browser"},"https://medium.com/@basakabhijoy/debugging-and-profiling-memory-leaks-in-nodejs-using-chrome-e8ece4560dba#:~:text=Fire%20up%20the%20chrome%20browser")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"https://developer.chrome.com/docs/devtools/memory-problems/#summary"},"https://developer.chrome.com/docs/devtools/memory-problems/#summary"))),(0,r.kt)("h3",{id:"test-requests"},"Test requests"),(0,r.kt)("p",null,"Most of the time memory leaks are happens for every request, so you need to do some request."),(0,r.kt)("ol",null,(0,r.kt)("li",{parentName:"ol"},"Using browser go to the page that is handled by you app"),(0,r.kt)("li",{parentName:"ol"},"Use any additional tools to make a bunch of requests, e.g. ",(0,r.kt)("a",{parentName:"li",href:"https://github.com/mcollina/autocannon"},"autocannon"))),(0,r.kt)("h3",{id:"what-to-look"},"What to look"),(0,r.kt)("p",null,"After you've started the app and took memory snapshots or memory allocations look for the data that stays in memory when it shouldn't."),(0,r.kt)("h4",{id:"childcontainer"},"ChildContainer"),(0,r.kt)("p",null,"In context of the tramvai app look for the ",(0,r.kt)("inlineCode",{parentName:"p"},"ChildContainer")," first as it is created for every request and contains the whole Request DI instance that consumes a lot of memory. It should be collected by the GC after request end, but sometimes some code may prevent it from collecting."),(0,r.kt)("h3",{id:"summary"},"Summary"),(0,r.kt)("ol",null,(0,r.kt)("li",{parentName:"ol"},(0,r.kt)("a",{parentName:"li",href:"#start-the-app"},"Start the app")),(0,r.kt)("li",{parentName:"ol"},(0,r.kt)("a",{parentName:"li",href:"#use-the-devtools"},"Start the DevTools")),(0,r.kt)("li",{parentName:"ol"},"Check memory usage on start and take the initial memory snapshot"),(0,r.kt)("li",{parentName:"ol"},(0,r.kt)("a",{parentName:"li",href:"#test-requests"},"Make some test requests")),(0,r.kt)("li",{parentName:"ol"},"Take another memory snapshot"),(0,r.kt)("li",{parentName:"ol"},"Compare two snapshots and ",(0,r.kt)("a",{parentName:"li",href:"#what-to-look"},"look for the leaks or unusual memory consumption"))),(0,r.kt)("h3",{id:"example"},"Example"),(0,r.kt)("ol",null,(0,r.kt)("li",{parentName:"ol"},"Start app in prod-mode ",(0,r.kt)("inlineCode",{parentName:"li"},"yarn tramvai start-prod travelaviasearch --debug")),(0,r.kt)("li",{parentName:"ol"},"Start Chrome DevTools"),(0,r.kt)("li",{parentName:"ol"},"Take the memory snapshot"),(0,r.kt)("li",{parentName:"ol"},"Execute requests with ",(0,r.kt)("inlineCode",{parentName:"li"},"autocannon -c 20 -d 60 localhost:3000/travel/flights/")),(0,r.kt)("li",{parentName:"ol"},"Click the button ",(0,r.kt)("inlineCode",{parentName:"li"},"Collect garbage")),(0,r.kt)("li",{parentName:"ol"},"Take another memory snapshot"),(0,r.kt)("li",{parentName:"ol"},"Compare two snapshots"),(0,r.kt)("li",{parentName:"ol"},"If you want to test app with other envs stop the server and close the DevTools, then run it again with ",(0,r.kt)("inlineCode",{parentName:"li"},'HTTP_CLIENT_CACHE_DISABLED=true MOCKER_ENABLED=true NODE_OPTIONS="--max-old-space-size=256" yarn tramvai start-prod -t none travelaviasearch'))))}u.isMDXComponent=!0}}]);