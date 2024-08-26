"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[5910],{3905:function(e,t,r){r.d(t,{Zo:function(){return c},kt:function(){return m}});var n=r(7294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function l(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function o(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?l(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):l(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function u(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},l=Object.keys(e);for(n=0;n<l.length;n++)r=l[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(n=0;n<l.length;n++)r=l[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var s=n.createContext({}),i=function(e){var t=n.useContext(s),r=t;return e&&(r="function"==typeof e?e(t):o(o({},t),e)),r},c=function(e){var t=i(e.components);return n.createElement(s.Provider,{value:t},e.children)},p={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},d=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,l=e.originalType,s=e.parentName,c=u(e,["components","mdxType","originalType","parentName"]),d=i(r),m=a,f=d["".concat(s,".").concat(m)]||d[m]||p[m]||l;return r?n.createElement(f,o(o({ref:t},c),{},{components:r})):n.createElement(f,o({ref:t},c))}));function m(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var l=r.length,o=new Array(l);o[0]=d;var u={};for(var s in t)hasOwnProperty.call(t,s)&&(u[s]=t[s]);u.originalType=e,u.mdxType="string"==typeof e?e:a,o[1]=u;for(var i=2;i<l;i++)o[i]=r[i];return n.createElement.apply(null,o)}return n.createElement.apply(null,r)}d.displayName="MDXCreateElement"},5162:function(e,t,r){r.d(t,{Z:function(){return o}});var n=r(7294),a=r(6010),l="tabItem_Ymn6";function o(e){let{children:t,hidden:r,className:o}=e;return n.createElement("div",{role:"tabpanel",className:(0,a.Z)(l,o),hidden:r},t)}},4866:function(e,t,r){r.d(t,{Z:function(){return N}});var n=r(7462),a=r(7294),l=r(6010),o=r(2466),u=r(6550),s=r(1980),i=r(7392),c=r(12);function p(e){return function(e){return a.Children.map(e,(e=>{if((0,a.isValidElement)(e)&&"value"in e.props)return e;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof e.type?e.type:e.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)}))}(e).map((e=>{let{props:{value:t,label:r,attributes:n,default:a}}=e;return{value:t,label:r,attributes:n,default:a}}))}function d(e){const{values:t,children:r}=e;return(0,a.useMemo)((()=>{const e=t??p(r);return function(e){const t=(0,i.l)(e,((e,t)=>e.value===t.value));if(t.length>0)throw new Error(`Docusaurus error: Duplicate values "${t.map((e=>e.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`)}(e),e}),[t,r])}function m(e){let{value:t,tabValues:r}=e;return r.some((e=>e.value===t))}function f(e){let{queryString:t=!1,groupId:r}=e;const n=(0,u.k6)(),l=function(e){let{queryString:t=!1,groupId:r}=e;if("string"==typeof t)return t;if(!1===t)return null;if(!0===t&&!r)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return r??null}({queryString:t,groupId:r});return[(0,s._X)(l),(0,a.useCallback)((e=>{if(!l)return;const t=new URLSearchParams(n.location.search);t.set(l,e),n.replace({...n.location,search:t.toString()})}),[l,n])]}function h(e){const{defaultValue:t,queryString:r=!1,groupId:n}=e,l=d(e),[o,u]=(0,a.useState)((()=>function(e){let{defaultValue:t,tabValues:r}=e;if(0===r.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(t){if(!m({value:t,tabValues:r}))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${t}" but none of its children has the corresponding value. Available values are: ${r.map((e=>e.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);return t}const n=r.find((e=>e.default))??r[0];if(!n)throw new Error("Unexpected error: 0 tabValues");return n.value}({defaultValue:t,tabValues:l}))),[s,i]=f({queryString:r,groupId:n}),[p,h]=function(e){let{groupId:t}=e;const r=function(e){return e?`docusaurus.tab.${e}`:null}(t),[n,l]=(0,c.Nk)(r);return[n,(0,a.useCallback)((e=>{r&&l.set(e)}),[r,l])]}({groupId:n}),b=(()=>{const e=s??p;return m({value:e,tabValues:l})?e:null})();(0,a.useLayoutEffect)((()=>{b&&u(b)}),[b]);return{selectedValue:o,selectValue:(0,a.useCallback)((e=>{if(!m({value:e,tabValues:l}))throw new Error(`Can't select invalid tab value=${e}`);u(e),i(e),h(e)}),[i,h,l]),tabValues:l}}var b=r(2389),g="tabList__CuJ",v="tabItem_LNqP";function y(e){let{className:t,block:r,selectedValue:u,selectValue:s,tabValues:i}=e;const c=[],{blockElementScrollPositionUntilNextRender:p}=(0,o.o5)(),d=e=>{const t=e.currentTarget,r=c.indexOf(t),n=i[r].value;n!==u&&(p(t),s(n))},m=e=>{var t;let r=null;switch(e.key){case"Enter":d(e);break;case"ArrowRight":{const t=c.indexOf(e.currentTarget)+1;r=c[t]??c[0];break}case"ArrowLeft":{const t=c.indexOf(e.currentTarget)-1;r=c[t]??c[c.length-1];break}}null==(t=r)||t.focus()};return a.createElement("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,l.Z)("tabs",{"tabs--block":r},t)},i.map((e=>{let{value:t,label:r,attributes:o}=e;return a.createElement("li",(0,n.Z)({role:"tab",tabIndex:u===t?0:-1,"aria-selected":u===t,key:t,ref:e=>c.push(e),onKeyDown:m,onClick:d},o,{className:(0,l.Z)("tabs__item",v,null==o?void 0:o.className,{"tabs__item--active":u===t})}),r??t)})))}function k(e){let{lazy:t,children:r,selectedValue:n}=e;if(r=Array.isArray(r)?r:[r],t){const e=r.find((e=>e.props.value===n));return e?(0,a.cloneElement)(e,{className:"margin-top--md"}):null}return a.createElement("div",{className:"margin-top--md"},r.map(((e,t)=>(0,a.cloneElement)(e,{key:t,hidden:e.props.value!==n}))))}function w(e){const t=h(e);return a.createElement("div",{className:(0,l.Z)("tabs-container",g)},a.createElement(y,(0,n.Z)({},e,t)),a.createElement(k,(0,n.Z)({},e,t)))}function N(e){const t=(0,b.Z)();return a.createElement(w,(0,n.Z)({key:String(t)},e))}},5245:function(e,t,r){r.r(t),r.d(t,{assets:function(){return c},contentTitle:function(){return s},default:function(){return m},frontMatter:function(){return u},metadata:function(){return i},toc:function(){return p}});var n=r(7462),a=(r(7294),r(3905)),l=r(4866),o=r(5162);const u={},s=void 0,i={unversionedId:"references/modules/deps-graph",id:"references/modules/deps-graph",title:"deps-graph",description:"Works only in development mode and shows dependency graph for the server build",source:"@site/tmp-docs/references/modules/deps-graph.md",sourceDirName:"references/modules",slug:"/references/modules/deps-graph",permalink:"/docs/references/modules/deps-graph",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/tmp-docs/references/modules/deps-graph.md",tags:[],version:"current",frontMatter:{},sidebar:"sidebar",previous:{title:"cookie",permalink:"/docs/references/modules/cookie"},next:{title:"dns-cache",permalink:"/docs/references/modules/dns-cache"}},c={},p=[{value:"Installation",id:"installation",level:2},{value:"Explanation",id:"explanation",level:2},{value:"Usage",id:"usage",level:3},{value:"Graph legend",id:"graph-legend",level:3}],d={toc:p};function m(e){let{components:t,...r}=e;return(0,a.kt)("wrapper",(0,n.Z)({},d,r,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("blockquote",null,(0,a.kt)("p",{parentName:"blockquote"},"Works only in development mode and shows dependency graph for the server build")),(0,a.kt)("p",null,"Module to show token dependency graph."),(0,a.kt)("h2",{id:"installation"},"Installation"),(0,a.kt)("p",null,"First install ",(0,a.kt)("inlineCode",{parentName:"p"},"@tramvai/module-deps-graph"),":"),(0,a.kt)(l.Z,{groupId:"npm2yarn",mdxType:"Tabs"},(0,a.kt)(o.Z,{value:"npm",mdxType:"TabItem"},(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-bash"},"npm i @tramvai/module-deps-graph\n"))),(0,a.kt)(o.Z,{value:"yarn",label:"Yarn",mdxType:"TabItem"},(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-bash"},"yarn i @tramvai/module-deps-graph\n# couldn't auto-convert command\n")))),(0,a.kt)("p",null,"Add module to the ",(0,a.kt)("inlineCode",{parentName:"p"},"modules")," list"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-tsx"},"import { createApp } from '@tramvai/core';\nimport { DepsGraphModule } from '@tramvai/module-deps-graph';\n\ncreateApp({\n  modules: [DepsGraphModule],\n});\n")),(0,a.kt)("h2",{id:"explanation"},"Explanation"),(0,a.kt)("h3",{id:"usage"},"Usage"),(0,a.kt)("p",null,"Module adds papi-route ",(0,a.kt)("inlineCode",{parentName:"p"},"/deps-graph")," that will display dependency graph with the functionality to search by token or module name."),(0,a.kt)("blockquote",null,(0,a.kt)("p",{parentName:"blockquote"},"Actual relative path to the papi-route will be ",(0,a.kt)("inlineCode",{parentName:"p"},"/:appName/papi/deps-graph")," where ",(0,a.kt)("inlineCode",{parentName:"p"},"appName")," - name of the app passed to the ",(0,a.kt)("inlineCode",{parentName:"p"},"createApp"))),(0,a.kt)("h3",{id:"graph-legend"},"Graph legend"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"Blue - usual provider"),(0,a.kt)("li",{parentName:"ul"},"Yellow - multi-provider"),(0,a.kt)("li",{parentName:"ul"},"Red - provider satisfying to search expression")),(0,a.kt)("p",null,(0,a.kt)("img",{parentName:"p",src:"http://s.csssr.ru/UAHCBP6MS/localhost_3000_pfphome_papi_deps-graph_search%3Dboxy%26lines%3Dgenerate_page%252Cinit_-_Google_Chrome_2021-04-13_14.55.05.png",alt:"img.png"})))}m.isMDXComponent=!0}}]);