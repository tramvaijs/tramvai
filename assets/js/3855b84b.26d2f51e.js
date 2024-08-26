"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[330],{3905:function(e,t,r){r.d(t,{Zo:function(){return l},kt:function(){return m}});var n=r(7294);function o(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function a(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function i(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?a(Object(r),!0).forEach((function(t){o(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):a(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function s(e,t){if(null==e)return{};var r,n,o=function(e,t){if(null==e)return{};var r,n,o={},a=Object.keys(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||(o[r]=e[r]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(o[r]=e[r])}return o}var c=n.createContext({}),u=function(e){var t=n.useContext(c),r=t;return e&&(r="function"==typeof e?e(t):i(i({},t),e)),r},l=function(e){var t=u(e.components);return n.createElement(c.Provider,{value:t},e.children)},p={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},d=n.forwardRef((function(e,t){var r=e.components,o=e.mdxType,a=e.originalType,c=e.parentName,l=s(e,["components","mdxType","originalType","parentName"]),d=u(r),m=o,f=d["".concat(c,".").concat(m)]||d[m]||p[m]||a;return r?n.createElement(f,i(i({ref:t},l),{},{components:r})):n.createElement(f,i({ref:t},l))}));function m(e,t){var r=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var a=r.length,i=new Array(a);i[0]=d;var s={};for(var c in t)hasOwnProperty.call(t,c)&&(s[c]=t[c]);s.originalType=e,s.mdxType="string"==typeof e?e:o,i[1]=s;for(var u=2;u<a;u++)i[u]=r[u];return n.createElement.apply(null,i)}return n.createElement.apply(null,r)}d.displayName="MDXCreateElement"},5357:function(e,t,r){r.r(t),r.d(t,{assets:function(){return c},contentTitle:function(){return i},default:function(){return p},frontMatter:function(){return a},metadata:function(){return s},toc:function(){return u}});var n=r(7462),o=(r(7294),r(3905));const a={title:"Other errors",sidebar_position:9},i=void 0,s={unversionedId:"mistakes/other-errors",id:"mistakes/other-errors",title:"Other errors",description:"Other errors that may happen during development or using of the tramvai app.",source:"@site/tmp-docs/mistakes/other-errors.md",sourceDirName:"mistakes",slug:"/mistakes/other-errors",permalink:"/docs/mistakes/other-errors",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/tmp-docs/mistakes/other-errors.md",tags:[],version:"current",sidebarPosition:9,frontMatter:{title:"Other errors",sidebar_position:9},sidebar:"sidebar",previous:{title:"contribute",permalink:"/docs/contribute/"},next:{title:"Duplicate dependencies",permalink:"/docs/mistakes/duplicate-dependencies"}},c={},u=[{value:"Mismatched dependencies version",id:"mismatched-dependencies-version",level:2},{value:"Solution",id:"solution",level:3}],l={toc:u};function p(e){let{components:t,...r}=e;return(0,o.kt)("wrapper",(0,n.Z)({},l,r,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"Other errors that may happen during development or using of the tramvai app."),(0,o.kt)("h2",{id:"mismatched-dependencies-version"},"Mismatched dependencies version"),(0,o.kt)("p",null,"Most of the tramvai dependencies must have the same version. ",(0,o.kt)("a",{parentName:"p",href:"/docs/concepts/versioning"},"Here")," you can read more details about versioning in tramvai."),(0,o.kt)("p",null,"If some of your dependencies have mismatched versions it may lead to myriads of different errors."),(0,o.kt)("p",null,"Here is non-exhaustive list of possible errors that comes from mismatched versions:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"Cannot use 'in' operator to search for 'token' in undefined"))),(0,o.kt)("h3",{id:"solution"},"Solution"),(0,o.kt)("p",null,"To prevent these errors from happening prefer to use ",(0,o.kt)("a",{parentName:"p",href:"/docs/how-to/tramvai-update"},"tramvai update/add")," commands over bare package-manager usage for installing/updating tramvai related packages."),(0,o.kt)("p",null,"If you've already faced these errors you can run command ",(0,o.kt)("a",{parentName:"p",href:"/docs/how-to/tramvai-update#checking-tramvai-versions-in-the-app"},"tramvai-check-versions")," to validate if you have mismatched dependencies. If you've got any errors then you have next options to do:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"if your current local changes led to error, consider reverting your changes related to dependencies and use ",(0,o.kt)("a",{parentName:"li",href:"/docs/how-to/tramvai-update"},"tramvai update/add")," commands to make changes."),(0,o.kt)("li",{parentName:"ul"},"resolve conflicts manually i.e. make changes that will lead to the same versions of tramvai related dependencies"),(0,o.kt)("li",{parentName:"ul"},"if suggestions from above didn't help please report the issue to tramvai-dev team")))}p.isMDXComponent=!0}}]);