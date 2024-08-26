"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[9242],{3905:function(e,t,n){n.d(t,{Zo:function(){return k},kt:function(){return d}});var a=n(7294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function i(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},o=Object.keys(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var s=a.createContext({}),p=function(e){var t=a.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},k=function(e){var t=p(e.components);return a.createElement(s.Provider,{value:t},e.children)},m={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},u=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,o=e.originalType,s=e.parentName,k=i(e,["components","mdxType","originalType","parentName"]),u=p(n),d=r,c=u["".concat(s,".").concat(d)]||u[d]||m[d]||o;return n?a.createElement(c,l(l({ref:t},k),{},{components:n})):a.createElement(c,l({ref:t},k))}));function d(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var o=n.length,l=new Array(o);l[0]=u;var i={};for(var s in t)hasOwnProperty.call(t,s)&&(i[s]=t[s]);i.originalType=e,i.mdxType="string"==typeof e?e:r,l[1]=i;for(var p=2;p<o;p++)l[p]=n[p];return a.createElement.apply(null,l)}return a.createElement.apply(null,n)}u.displayName="MDXCreateElement"},8305:function(e,t,n){n.r(t),n.d(t,{assets:function(){return s},contentTitle:function(){return l},default:function(){return m},frontMatter:function(){return o},metadata:function(){return i},toc:function(){return p}});var a=n(7462),r=(n(7294),n(3905));const o={},l=void 0,i={unversionedId:"references/libs/cookies",id:"references/libs/cookies",title:"cookies",description:"Tiny cookies library for the browser",source:"@site/tmp-docs/references/libs/cookies.md",sourceDirName:"references/libs",slug:"/references/libs/cookies",permalink:"/docs/references/libs/cookies",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/tmp-docs/references/libs/cookies.md",tags:[],version:"current",frontMatter:{},sidebar:"sidebar",previous:{title:"browserslist-config",permalink:"/docs/references/libs/browserslist-config"},next:{title:"dippy",permalink:"/docs/references/libs/dippy"}},s={},p=[{value:"Features",id:"features",level:2},{value:"Installation",id:"installation",level:2},{value:"Usage",id:"usage",level:2},{value:"API",id:"api",level:2},{value:"Options",id:"options",level:3},{value:"Examples",id:"examples",level:2}],k={toc:p};function m(e){let{components:t,...n}=e;return(0,r.kt)("wrapper",(0,a.Z)({},k,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"Tiny cookies library for the browser"),(0,r.kt)("p",null,"Fork of ",(0,r.kt)("a",{parentName:"p",href:"https://github.com/voltace/browser-cookies"},"browser-cookies")),(0,r.kt)("h2",{id:"features"},"Features"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},"Clean and easy to use API"),(0,r.kt)("li",{parentName:"ul"},"Small footprint"),(0,r.kt)("li",{parentName:"ul"},"No dependencies"),(0,r.kt)("li",{parentName:"ul"},"RFC6265 compliant"),(0,r.kt)("li",{parentName:"ul"},"Cross browser support")),(0,r.kt)("h2",{id:"installation"},"Installation"),(0,r.kt)("p",null,"Using ",(0,r.kt)("strong",{parentName:"p"},"npm")),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-bash"},"npm install @tinkoff/browser-cookies\n")),(0,r.kt)("p",null,"Using ",(0,r.kt)("strong",{parentName:"p"},"yarn")),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-bash"},"npm install @tinkoff/browser-cookies\n")),(0,r.kt)("h2",{id:"usage"},"Usage"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"import { Cookies } from '@tinkoff/browser-cookies';\n\nconst cookies = new Cookies({ sameSite: 'lax' });\n\ncookies.set('firstName', 'Lisa');\ncookies.set('firstName', 'Lisa', { expires: 365 }); // Expires after 1 year\ncookies.set('firstName', 'Lisa', { secure: true, domain: 'www.example.org' });\n\ncookies.get('firstName'); // Returns cookie value (or null)\n\ncookies.erase('firstName'); // Removes cookie\n")),(0,r.kt)("h2",{id:"api"},"API"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"Cookies")," API:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},"method ",(0,r.kt)("a",{parentName:"li",href:"#constructor"},"constructor(",(0,r.kt)("inlineCode",{parentName:"a"},"defaults"),")")),(0,r.kt)("li",{parentName:"ul"},"method ",(0,r.kt)("a",{parentName:"li",href:"#set"},"set(",(0,r.kt)("inlineCode",{parentName:"a"},"name"),", ",(0,r.kt)("inlineCode",{parentName:"a"},"value")," ","[",", ",(0,r.kt)("inlineCode",{parentName:"a"},"options"),"]",")")),(0,r.kt)("li",{parentName:"ul"},"method ",(0,r.kt)("a",{parentName:"li",href:"#get"},"get(",(0,r.kt)("inlineCode",{parentName:"a"},"name"),")")),(0,r.kt)("li",{parentName:"ul"},"method ",(0,r.kt)("a",{parentName:"li",href:"#erase"},"erase(",(0,r.kt)("inlineCode",{parentName:"a"},"name"),", ","[",", ",(0,r.kt)("inlineCode",{parentName:"a"},"options"),"]",")")),(0,r.kt)("li",{parentName:"ul"},"method ",(0,r.kt)("a",{parentName:"li",href:"#all"},"all()"))),(0,r.kt)("hr",null),(0,r.kt)("a",{name:"set"}),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"#set"},"Cookies.set(",(0,r.kt)("inlineCode",{parentName:"a"},"name"),", ",(0,r.kt)("inlineCode",{parentName:"a"},"value")," ","[",", ",(0,r.kt)("inlineCode",{parentName:"a"},"options"),"]",")")),(0,r.kt)("br",null),"Method to save a cookie.",(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:null},"argument"),(0,r.kt)("th",{parentName:"tr",align:null},"type"),(0,r.kt)("th",{parentName:"tr",align:null},"description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("strong",{parentName:"td"},(0,r.kt)("inlineCode",{parentName:"strong"},"name"))),(0,r.kt)("td",{parentName:"tr",align:null},"string"),(0,r.kt)("td",{parentName:"tr",align:null},"The name of the cookie to save.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("strong",{parentName:"td"},(0,r.kt)("inlineCode",{parentName:"strong"},"value"))),(0,r.kt)("td",{parentName:"tr",align:null},"string"),(0,r.kt)("td",{parentName:"tr",align:null},"The value to save, ","[percent encoding][ref-percent-encoding]"," will automatically be applied. Note that only strings are allowed as value, the ",(0,r.kt)("a",{parentName:"td",href:"#examples"},"examples")," section shows how to save JSON data.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("strong",{parentName:"td"},(0,r.kt)("inlineCode",{parentName:"strong"},"options"))),(0,r.kt)("td",{parentName:"tr",align:null},"object"),(0,r.kt)("td",{parentName:"tr",align:null},"May contain any of the properties specified in ",(0,r.kt)("a",{parentName:"td",href:"#options"},"options")," below. If an option is not specified, the value configured in ",(0,r.kt)("a",{parentName:"td",href:"#constructor"},"Cookies.constructor")," will be used.")))),(0,r.kt)("hr",null),(0,r.kt)("a",{name:"get"}),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"#get"},"Cookies.get(",(0,r.kt)("inlineCode",{parentName:"a"},"name"),")")),(0,r.kt)("br",null),"Method that returns a cookie value, or **null** if the cookie is not found. [Percent encoded][ref-percent-encoding] values will automatically be decoded.",(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:null},"argument"),(0,r.kt)("th",{parentName:"tr",align:null},"type"),(0,r.kt)("th",{parentName:"tr",align:null},"description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("strong",{parentName:"td"},(0,r.kt)("inlineCode",{parentName:"strong"},"name"))),(0,r.kt)("td",{parentName:"tr",align:null},"string"),(0,r.kt)("td",{parentName:"tr",align:null},"The name of the cookie to retrieve.")))),(0,r.kt)("hr",null),(0,r.kt)("a",{name:"erase"}),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"#erase"},"Cookies.erase(",(0,r.kt)("inlineCode",{parentName:"a"},"name")," ","[",", ",(0,r.kt)("inlineCode",{parentName:"a"},"options")," ","]",")")),(0,r.kt)("br",null),"Method to remove a cookie.",(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:null},"argument"),(0,r.kt)("th",{parentName:"tr",align:null},"type"),(0,r.kt)("th",{parentName:"tr",align:null},"description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("strong",{parentName:"td"},(0,r.kt)("inlineCode",{parentName:"strong"},"name"))),(0,r.kt)("td",{parentName:"tr",align:null},"string"),(0,r.kt)("td",{parentName:"tr",align:null},"The name of the cookie to remove.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("strong",{parentName:"td"},(0,r.kt)("inlineCode",{parentName:"strong"},"options"))),(0,r.kt)("td",{parentName:"tr",align:null},"object"),(0,r.kt)("td",{parentName:"tr",align:null},"May contain the ",(0,r.kt)("inlineCode",{parentName:"td"},"domain")," and ",(0,r.kt)("inlineCode",{parentName:"td"},"path")," properties specified in ",(0,r.kt)("a",{parentName:"td",href:"#options"},"options")," below. If an option is not specified, the value configured in ",(0,r.kt)("a",{parentName:"td",href:"#constructor"},"Cookies.constructor")," will be used.")))),(0,r.kt)("hr",null),(0,r.kt)("a",{name:"all"}),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"#all"},"Cookies.all()")),(0,r.kt)("br",null),"Method to get all cookies. Returns an object containing all cookie values with the cookie names used as keys. Percent encoded names and values will automatically be decoded.",(0,r.kt)("hr",null),(0,r.kt)("a",{name:"constructor"}),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"#constructor"},"Cookies.constructor(",(0,r.kt)("inlineCode",{parentName:"a"},"defaults"),")")),(0,r.kt)("br",null),"`defaults` argument may be used to change the default value of each option specified in [options](#options) below.",(0,r.kt)("h3",{id:"options"},"Options"),(0,r.kt)("p",null,"The options shown in the table below may be set to instance of ",(0,r.kt)("a",{parentName:"p",href:"#constructor"},"Cookies.constructor")," or passed as function argument to ",(0,r.kt)("a",{parentName:"p",href:"#set"},"Cookies.set()")," and ",(0,r.kt)("a",{parentName:"p",href:"#erase"},"Cookies.erase()"),". Also check out the ",(0,r.kt)("a",{parentName:"p",href:"#examples"},"Examples")," further below."),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:null},"Name"),(0,r.kt)("th",{parentName:"tr",align:null},"Type"),(0,r.kt)("th",{parentName:"tr",align:null},"Default"),(0,r.kt)("th",{parentName:"tr",align:null},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"expires")),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"Number"),", ",(0,r.kt)("inlineCode",{parentName:"td"},"Date"),", ",(0,r.kt)("inlineCode",{parentName:"td"},"String")),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"0")),(0,r.kt)("td",{parentName:"tr",align:null},"Configure when the cookie expires by using one of the following types as value:",(0,r.kt)("ul",null,(0,r.kt)("li",null,"A ",(0,r.kt)("inlineCode",{parentName:"td"},"Number")," of days until the cookie expires. If set to ",(0,r.kt)("inlineCode",{parentName:"td"},"0")," the cookie will expire at the end of the session."),(0,r.kt)("li",null,"A ",(0,r.kt)("inlineCode",{parentName:"td"},"Date")," object such as ",(0,r.kt)("inlineCode",{parentName:"td"},"new Date(2018, 3, 27)"),"."),(0,r.kt)("li",null,"A ",(0,r.kt)("inlineCode",{parentName:"td"},"String")," in a format recognized by ","[Date.parse()][ref-date-parse]",".")))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"domain")),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"String")),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},'""')),(0,r.kt)("td",{parentName:"tr",align:null},"The ","[domain][ref-cookie-domain]"," from where the cookie is readable.",(0,r.kt)("ul",null,(0,r.kt)("li",null,"If set to ",(0,r.kt)("inlineCode",{parentName:"td"},'""')," the current domain will be used.")))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"path")),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"String")),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},'"/"')),(0,r.kt)("td",{parentName:"tr",align:null},"The path from where the cookie is readable.",(0,r.kt)("ul",null,(0,r.kt)("li",null,"The default value of ",(0,r.kt)("inlineCode",{parentName:"td"},'"/"')," allows the cookie to be readable from all paths."),(0,r.kt)("li",null,"If set to ",(0,r.kt)("inlineCode",{parentName:"td"},'""')," the cookie will only be readable from the current browser path."),(0,r.kt)("li",null,"Note that cookies don't support relative paths such as ",(0,r.kt)("inlineCode",{parentName:"td"},'"../../some/path"')," so paths must be absolute like ",(0,r.kt)("inlineCode",{parentName:"td"},'"/some/path"'),".")))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"secure")),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"Boolean")),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"false")),(0,r.kt)("td",{parentName:"tr",align:null},"If true the cookie will only be transmitted over secure protocols like https.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"httponly")),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"Boolean")),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"false")),(0,r.kt)("td",{parentName:"tr",align:null},"If true the cookie may only be read by the web server.",(0,r.kt)("ul",null,(0,r.kt)("li",null," This option may be set to ","[prevent malicious scripts from accessing cookies][ref-httponly]",", not all browsers support this feature yet.")))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"samesite")),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"String")),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},'""')),(0,r.kt)("td",{parentName:"tr",align:null},"The ",(0,r.kt)("inlineCode",{parentName:"td"},"samesite")," argument may be used to ","[prevent cookies from being sent along with cross-site requests][ref-samesite]",".",(0,r.kt)("ul",null,(0,r.kt)("li",null,"If set to ",(0,r.kt)("inlineCode",{parentName:"td"},'""')," the SameSite feature will not be used."),(0,r.kt)("li",null,"If set to ",(0,r.kt)("inlineCode",{parentName:"td"},'"Strict"'),' the cookie will only be sent along with "same-site" requests.'),(0,r.kt)("li",null,"If set to ",(0,r.kt)("inlineCode",{parentName:"td"},'"Lax"'),' the cookie will be sent with "same-site" requests and with "cross-site" top-level navigations.')),"This is an experimental feature as only ","[a few browsers support SameSite][ref-samesite-caniuse]"," and ","[the standard][ref-samesite-spec]"," has not been finalized yet. Don't use this feature in production environments.")))),(0,r.kt)("h2",{id:"examples"},"Examples"),(0,r.kt)("p",null,"Count the number of a visits to a page:  "),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"import { Cookies } from '@tinkoff/browser-cookies';\n\nconst cookies = new Cookies();\n\n// Get cookie value\nconst visits = cookies.get('count') || 0;\nconsole.log(\"You've been here \" + parseInt(visits) + \" times before!\");\n\n// Increment the counter and set (or update) the cookie\ncookies.set('count', parseInt(visits) + 1, {expires: 365});\n")),(0,r.kt)("p",null,"JSON may be saved by converting the JSON object into a string:  "),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"import { Cookies } from '@tinkoff/browser-cookies';\n\nconst cookies = new Cookies();\n\n// Store JSON data\nconst user = { firstName: 'Sofia', lastName: 'Due\xf1as' };\ncookies.set('user', JSON.stringify(user))\n\n// Retrieve JSON data\nconst userString = cookies.get('user');\nalert('Hi ' + JSON.parse(userString).firstName);\n")),(0,r.kt)("p",null,"The default cookie options may be changed:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"import { Cookies } from '@tinkoff/browser-cookies';\n\n// Apply defaults\nconst cookies = new Cookies({\n  secure: true,\n  expires: 7,\n});\n\n// 'secure' option enabled and cookie expires in 7 days\ncookies.set('FirstName', 'John')\n\n// 'secure' option enabled and cookie expires in 30 days\ncookies.set('LastName', 'Smith', { expires: 30 })\n")),(0,r.kt)("p",null,"The ",(0,r.kt)("inlineCode",{parentName:"p"},"cookies.all")," method can be used for more advanced functionality, for example to erase all cookies except one:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-javascript"},"import { Cookies } from '@tinkoff/browser-cookies';\n\nconst cookies = new Cookies();\n\nconst cookieToKeep = 'FirstName'; // Name of the cookie to keep\n\n// Get all cookies as an object\nconst allCookies = cookies.all();\n\n// Iterate over all cookie names\nfor (let cookieName in allCookies) {\n  // Erase the cookie (except if it's the cookie that needs to be kept)\n  if (allCookies.hasOwnProperty(cookieName) && cookieName != cookieToKeep) {\n      cookies.erase(cookieName);\n  }\n}\n")))}m.isMDXComponent=!0}}]);