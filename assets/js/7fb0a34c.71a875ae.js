"use strict";(globalThis.webpackChunk=globalThis.webpackChunk||[]).push([[419],{3905:(e,t,a)=>{a.d(t,{Zo:()=>c,kt:()=>m});var r=a(7294);function n(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function o(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,r)}return a}function l(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?o(Object(a),!0).forEach((function(t){n(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):o(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function u(e,t){if(null==e)return{};var a,r,n=function(e,t){if(null==e)return{};var a,r,n={},o=Object.keys(e);for(r=0;r<o.length;r++)a=o[r],t.indexOf(a)>=0||(n[a]=e[a]);return n}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)a=o[r],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(n[a]=e[a])}return n}var i=r.createContext({}),s=function(e){var t=r.useContext(i),a=t;return e&&(a="function"==typeof e?e(t):l(l({},t),e)),a},c=function(e){var t=s(e.components);return r.createElement(i.Provider,{value:t},e.children)},p={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},d=r.forwardRef((function(e,t){var a=e.components,n=e.mdxType,o=e.originalType,i=e.parentName,c=u(e,["components","mdxType","originalType","parentName"]),d=s(a),m=n,v=d["".concat(i,".").concat(m)]||d[m]||p[m]||o;return a?r.createElement(v,l(l({ref:t},c),{},{components:a})):r.createElement(v,l({ref:t},c))}));function m(e,t){var a=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var o=a.length,l=new Array(o);l[0]=d;var u={};for(var i in t)hasOwnProperty.call(t,i)&&(u[i]=t[i]);u.originalType=e,u.mdxType="string"==typeof e?e:n,l[1]=u;for(var s=2;s<o;s++)l[s]=a[s];return r.createElement.apply(null,l)}return r.createElement.apply(null,a)}d.displayName="MDXCreateElement"},5162:(e,t,a)=>{a.d(t,{Z:()=>l});var r=a(7294),n=a(6010);const o="tabItem_Ymn6";function l({children:e,hidden:t,className:a}){return r.createElement("div",{role:"tabpanel",className:(0,n.Z)(o,a),hidden:t},e)}},4866:(e,t,a)=>{a.d(t,{Z:()=>T});var r=a(7462),n=a(7294),o=a(6010),l=a(2466),u=a(6550),i=a(1980),s=a(7392),c=a(12);function p(e){return function(e){return n.Children.map(e,(e=>{if((0,n.isValidElement)(e)&&"value"in e.props)return e;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof e.type?e.type:e.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)}))}(e).map((({props:{value:e,label:t,attributes:a,default:r}})=>({value:e,label:t,attributes:a,default:r})))}function d(e){const{values:t,children:a}=e;return(0,n.useMemo)((()=>{const e=t??p(a);return function(e){const t=(0,s.l)(e,((e,t)=>e.value===t.value));if(t.length>0)throw new Error(`Docusaurus error: Duplicate values "${t.map((e=>e.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`)}(e),e}),[t,a])}function m({value:e,tabValues:t}){return t.some((t=>t.value===e))}function v({queryString:e=!1,groupId:t}){const a=(0,u.k6)(),r=function({queryString:e=!1,groupId:t}){if("string"==typeof e)return e;if(!1===e)return null;if(!0===e&&!t)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return t??null}({queryString:e,groupId:t});return[(0,i._X)(r),(0,n.useCallback)((e=>{if(!r)return;const t=new URLSearchParams(a.location.search);t.set(r,e),a.replace({...a.location,search:t.toString()})}),[r,a])]}function f(e){const{defaultValue:t,queryString:a=!1,groupId:r}=e,o=d(e),[l,u]=(0,n.useState)((()=>function({defaultValue:e,tabValues:t}){if(0===t.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(e){if(!m({value:e,tabValues:t}))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${e}" but none of its children has the corresponding value. Available values are: ${t.map((e=>e.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);return e}const a=t.find((e=>e.default))??t[0];if(!a)throw new Error("Unexpected error: 0 tabValues");return a.value}({defaultValue:t,tabValues:o}))),[i,s]=v({queryString:a,groupId:r}),[p,f]=function({groupId:e}){const t=function(e){return e?`docusaurus.tab.${e}`:null}(e),[a,r]=(0,c.Nk)(t);return[a,(0,n.useCallback)((e=>{t&&r.set(e)}),[t,r])]}({groupId:r}),h=(()=>{const e=i??p;return m({value:e,tabValues:o})?e:null})();(0,n.useLayoutEffect)((()=>{h&&u(h)}),[h]);return{selectedValue:l,selectValue:(0,n.useCallback)((e=>{if(!m({value:e,tabValues:o}))throw new Error(`Can't select invalid tab value=${e}`);u(e),s(e),f(e)}),[s,f,o]),tabValues:o}}var h=a(2389);const b="tabList__CuJ",g="tabItem_LNqP";function y({className:e,block:t,selectedValue:a,selectValue:u,tabValues:i}){const s=[],{blockElementScrollPositionUntilNextRender:c}=(0,l.o5)(),p=e=>{const t=e.currentTarget,r=s.indexOf(t),n=i[r].value;n!==a&&(c(t),u(n))},d=e=>{let t=null;switch(e.key){case"Enter":p(e);break;case"ArrowRight":{const a=s.indexOf(e.currentTarget)+1;t=s[a]??s[0];break}case"ArrowLeft":{const a=s.indexOf(e.currentTarget)-1;t=s[a]??s[s.length-1];break}}t?.focus()};return n.createElement("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,o.Z)("tabs",{"tabs--block":t},e)},i.map((({value:e,label:t,attributes:l})=>n.createElement("li",(0,r.Z)({role:"tab",tabIndex:a===e?0:-1,"aria-selected":a===e,key:e,ref:e=>s.push(e),onKeyDown:d,onClick:p},l,{className:(0,o.Z)("tabs__item",g,l?.className,{"tabs__item--active":a===e})}),t??e))))}function k({lazy:e,children:t,selectedValue:a}){if(t=Array.isArray(t)?t:[t],e){const e=t.find((e=>e.props.value===a));return e?(0,n.cloneElement)(e,{className:"margin-top--md"}):null}return n.createElement("div",{className:"margin-top--md"},t.map(((e,t)=>(0,n.cloneElement)(e,{key:t,hidden:e.props.value!==a}))))}function O(e){const t=f(e);return n.createElement("div",{className:(0,o.Z)("tabs-container",b)},n.createElement(y,(0,r.Z)({},e,t)),n.createElement(k,(0,r.Z)({},e,t)))}function T(e){const t=(0,h.Z)();return n.createElement(O,(0,r.Z)({key:String(t)},e))}},5702:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>c,contentTitle:()=>i,default:()=>m,frontMatter:()=>u,metadata:()=>s,toc:()=>p});var r=a(7462),n=(a(7294),a(3905)),o=a(4866),l=a(5162);const u={},i=void 0,s={unversionedId:"references/modules/autoscroll",id:"references/modules/autoscroll",title:"autoscroll",description:"React component that implements autoscroll to page start or to the anchor on page on SPA-navigations",source:"@site/tmp-docs/references/modules/autoscroll.md",sourceDirName:"references/modules",slug:"/references/modules/autoscroll",permalink:"/docs/references/modules/autoscroll",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/tmp-docs/references/modules/autoscroll.md",tags:[],version:"current",frontMatter:{},sidebar:"sidebar",previous:{title:"webpack-dedupe-plugin",permalink:"/docs/references/libs/webpack-dedupe-plugin"},next:{title:"cache-warmup",permalink:"/docs/references/modules/cache-warmup"}},c={},p=[{value:"Installation",id:"installation",level:2},{value:"Explanation",id:"explanation",level:2},{value:"Behavior",id:"behavior",level:3},{value:"How to",id:"how-to",level:2},{value:"Disable autoscroll for page",id:"disable-autoscroll-for-page",level:3},{value:"Scroll behavior change",id:"scroll-behavior-change",level:3},{value:"Global",id:"global",level:4},{value:"Local",id:"local",level:4},{value:"ScrollTo top change",id:"scrollto-top-change",level:3},{value:"Global",id:"global-1",level:4}],d={toc:p};function m({components:e,...t}){return(0,n.kt)("wrapper",(0,r.Z)({},d,t,{components:e,mdxType:"MDXLayout"}),(0,n.kt)("p",null,"React component that implements autoscroll to page start or to the anchor on page on SPA-navigations"),(0,n.kt)("p",null,"The behaviour is similar to the ",(0,n.kt)("a",{parentName:"p",href:"https://reacttraining.com/react-router/web/guides/scroll-restoration/scroll-to-tops"},"react-router")),(0,n.kt)("h2",{id:"installation"},"Installation"),(0,n.kt)("p",null,"First install ",(0,n.kt)("inlineCode",{parentName:"p"},"@tramvai/module-autoscroll"),":"),(0,n.kt)(o.Z,{groupId:"npm2yarn",mdxType:"Tabs"},(0,n.kt)(l.Z,{value:"npm",mdxType:"TabItem"},(0,n.kt)("pre",null,(0,n.kt)("code",{parentName:"pre",className:"language-bash"},"yarn add @tramvai/module-autoscroll\n"))),(0,n.kt)(l.Z,{value:"yarn",label:"Yarn",mdxType:"TabItem"},(0,n.kt)("pre",null,(0,n.kt)("code",{parentName:"pre",className:"language-bash"},"yarn add @tramvai/module-autoscroll\n")))),(0,n.kt)("p",null,"And add ",(0,n.kt)("inlineCode",{parentName:"p"},"AutoscrollModule")," to the modules list:"),(0,n.kt)("pre",null,(0,n.kt)("code",{parentName:"pre",className:"language-tsx"},"import { createApp } from '@tramvai/core';\nimport { AutoscrollModule } from '@tramvai/module-autoscroll';\n\ncreateApp({\n  name: 'tincoin',\n  modules: [AutoscrollModule],\n});\n")),(0,n.kt)("h2",{id:"explanation"},"Explanation"),(0,n.kt)("h3",{id:"behavior"},"Behavior"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"behavior: smooth")," is not supported by every browser (e.g. doesn't work in Safari). In this case you can use polyfill ",(0,n.kt)("inlineCode",{parentName:"p"},"smoothscroll-polyfill")," that you should add to your app."),(0,n.kt)("h2",{id:"how-to"},"How to"),(0,n.kt)("h3",{id:"disable-autoscroll-for-page"},"Disable autoscroll for page"),(0,n.kt)("p",null,"If you need to disable autoscroll on the specific pages you can specify parameter ",(0,n.kt)("inlineCode",{parentName:"p"},"navigateState.disableAutoscroll = true")," to the ",(0,n.kt)("inlineCode",{parentName:"p"},"navigate")," call:"),(0,n.kt)("pre",null,(0,n.kt)("code",{parentName:"pre",className:"language-tsx"},"import { useNavigate } from '@tramvai/module-router';\n\nfunction Component() {\n  const navigateToWithoutScroll = useNavigate({\n    url: '/url/',\n    navigateState: { disableAutoscroll: true },\n  });\n\n  return <Button onClick={navigateToWithoutScroll} />;\n}\n")),(0,n.kt)("h3",{id:"scroll-behavior-change"},"Scroll behavior change"),(0,n.kt)("h4",{id:"global"},"Global"),(0,n.kt)("pre",null,(0,n.kt)("code",{parentName:"pre",className:"language-tsx"},"import { AUTOSCROLL_BEHAVIOR_MODE_TOKEN } from '@tramvai/module-autoscroll';\nimport { provide } from '@tramvai/core';\n\nconst providers = [\n  // ...,\n  provide({\n    provide: AUTOSCROLL_BEHAVIOR_MODE_TOKEN,\n    useValue: 'auto', // default is 'smooth'\n  }),\n];\n")),(0,n.kt)("h4",{id:"local"},"Local"),(0,n.kt)("pre",null,(0,n.kt)("code",{parentName:"pre",className:"language-tsx"},"import { useNavigate } from '@tramvai/module-router';\n\nfunction Component() {\n  const navigateToWithAutoBehavior = useNavigate({\n    url: '/url/',\n    navigateState: { autoscrollBehavior: 'auto' },\n  });\n\n  return <Button onClick={navigateToWithAutoBehavior} />;\n}\n")),(0,n.kt)("h3",{id:"scrollto-top-change"},"ScrollTo top change"),(0,n.kt)("h4",{id:"global-1"},"Global"),(0,n.kt)("pre",null,(0,n.kt)("code",{parentName:"pre",className:"language-tsx"},"import { AUTOSCROLL_SCROLL_TOP_TOKEN } from '@tramvai/module-autoscroll';\nimport { provide } from '@tramvai/core';\n\nconst providers = [\n  // ...,\n  provide({\n    provide: AUTOSCROLL_SCROLL_TOP_TOKEN,\n    useValue: -1, // default is 0\n  }),\n];\n")))}m.isMDXComponent=!0}}]);