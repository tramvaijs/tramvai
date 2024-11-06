"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[3620],{3905:function(e,n,t){t.d(n,{Zo:function(){return u},kt:function(){return m}});var r=t(7294);function o(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function i(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function c(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?i(Object(t),!0).forEach((function(n){o(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):i(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function a(e,n){if(null==e)return{};var t,r,o=function(e,n){if(null==e)return{};var t,r,o={},i=Object.keys(e);for(r=0;r<i.length;r++)t=i[r],n.indexOf(t)>=0||(o[t]=e[t]);return o}(e,n);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)t=i[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(o[t]=e[t])}return o}var s=r.createContext({}),p=function(e){var n=r.useContext(s),t=n;return e&&(t="function"==typeof e?e(n):c(c({},n),e)),t},u=function(e){var n=p(e.components);return r.createElement(s.Provider,{value:n},e.children)},l={inlineCode:"code",wrapper:function(e){var n=e.children;return r.createElement(r.Fragment,{},n)}},f=r.forwardRef((function(e,n){var t=e.components,o=e.mdxType,i=e.originalType,s=e.parentName,u=a(e,["components","mdxType","originalType","parentName"]),f=p(t),m=o,d=f["".concat(s,".").concat(m)]||f[m]||l[m]||i;return t?r.createElement(d,c(c({ref:n},u),{},{components:t})):r.createElement(d,c({ref:n},u))}));function m(e,n){var t=arguments,o=n&&n.mdxType;if("string"==typeof e||o){var i=t.length,c=new Array(i);c[0]=f;var a={};for(var s in n)hasOwnProperty.call(n,s)&&(a[s]=n[s]);a.originalType=e,a.mdxType="string"==typeof e?e:o,c[1]=a;for(var p=2;p<i;p++)c[p]=t[p];return r.createElement.apply(null,c)}return r.createElement.apply(null,t)}f.displayName="MDXCreateElement"},7611:function(e,n,t){t.r(n),t.d(n,{assets:function(){return s},contentTitle:function(){return c},default:function(){return l},frontMatter:function(){return i},metadata:function(){return a},toc:function(){return p}});var r=t(7462),o=(t(7294),t(3905));const i={},c=void 0,a={unversionedId:"references/tokens/cookie",id:"references/tokens/cookie",title:"cookie",description:"@inline src/index.ts",source:"@site/tmp-docs/references/tokens/cookie.md",sourceDirName:"references/tokens",slug:"/references/tokens/cookie",permalink:"/docs/references/tokens/cookie",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/tmp-docs/references/tokens/cookie.md",tags:[],version:"current",frontMatter:{},sidebar:"sidebar",previous:{title:"common",permalink:"/docs/references/tokens/common"},next:{title:"core",permalink:"/docs/references/tokens/core"}},s={},p=[],u={toc:p};function l(e){let{components:n,...t}=e;return(0,o.kt)("wrapper",(0,r.Z)({},u,t,{components:n,mdxType:"MDXLayout"}),(0,o.kt)("p",null,(0,o.kt)("pre",{parentName:"p"},(0,o.kt)("code",{parentName:"pre",className:"language-typescript"},"import { createToken } from '@tinkoff/dippy';\n\nexport interface CookieOptions {\n  expires?: number | Date | string;\n  domain?: string;\n  path?: string;\n  secure?: boolean;\n  httpOnly?: boolean;\n  sameSite?: boolean | 'lax' | 'strict' | 'none';\n  noSubdomains?: boolean;\n}\n\nexport interface CookieSetOptions extends CookieOptions {\n  name: string;\n  value: string;\n}\n\nexport interface CookieManager {\n  get(name: string): string | undefined;\n  all(): Record<string, string>;\n  set({ name, value, ...options }: CookieSetOptions): void;\n  remove(name: string, options?: CookieOptions): void;\n}\n\nexport const COOKIE_MANAGER_TOKEN = createToken<CookieManager>('cookieManager');\n\n"))))}l.isMDXComponent=!0}}]);