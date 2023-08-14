"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[6951],{3905:(e,r,t)=>{t.d(r,{Zo:()=>c,kt:()=>p});var n=t(7294);function a(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function l(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);r&&(n=n.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,n)}return t}function u(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?l(Object(t),!0).forEach((function(r){a(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):l(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}function o(e,r){if(null==e)return{};var t,n,a=function(e,r){if(null==e)return{};var t,n,a={},l=Object.keys(e);for(n=0;n<l.length;n++)t=l[n],r.indexOf(t)>=0||(a[t]=e[t]);return a}(e,r);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(n=0;n<l.length;n++)t=l[n],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var i=n.createContext({}),s=function(e){var r=n.useContext(i),t=r;return e&&(t="function"==typeof e?e(r):u(u({},r),e)),t},c=function(e){var r=s(e.components);return n.createElement(i.Provider,{value:r},e.children)},d={inlineCode:"code",wrapper:function(e){var r=e.children;return n.createElement(n.Fragment,{},r)}},f=n.forwardRef((function(e,r){var t=e.components,a=e.mdxType,l=e.originalType,i=e.parentName,c=o(e,["components","mdxType","originalType","parentName"]),f=s(t),p=a,m=f["".concat(i,".").concat(p)]||f[p]||d[p]||l;return t?n.createElement(m,u(u({ref:r},c),{},{components:t})):n.createElement(m,u({ref:r},c))}));function p(e,r){var t=arguments,a=r&&r.mdxType;if("string"==typeof e||a){var l=t.length,u=new Array(l);u[0]=f;var o={};for(var i in r)hasOwnProperty.call(r,i)&&(o[i]=r[i]);o.originalType=e,o.mdxType="string"==typeof e?e:a,u[1]=o;for(var s=2;s<l;s++)u[s]=t[s];return n.createElement.apply(null,u)}return n.createElement.apply(null,t)}f.displayName="MDXCreateElement"},5162:(e,r,t)=>{t.d(r,{Z:()=>u});var n=t(7294),a=t(6010);const l="tabItem_Ymn6";function u(e){var r=e.children,t=e.hidden,u=e.className;return n.createElement("div",{role:"tabpanel",className:(0,a.Z)(l,u),hidden:t},r)}},4866:(e,r,t)=>{t.d(r,{Z:()=>E});var n=t(7462),a=t(7294),l=t(6010),u=t(2466),o=t(6550),i=t(1980),s=t(7392),c=t(12);function d(e){return function(e){return a.Children.map(e,(function(e){if((0,a.isValidElement)(e)&&"value"in e.props)return e;throw new Error("Docusaurus error: Bad <Tabs> child <"+("string"==typeof e.type?e.type:e.type.name)+'>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.')}))}(e).map((function(e){var r=e.props;return{value:r.value,label:r.label,attributes:r.attributes,default:r.default}}))}function f(e){var r=e.values,t=e.children;return(0,a.useMemo)((function(){var e=null!=r?r:d(t);return function(e){var r=(0,s.l)(e,(function(e,r){return e.value===r.value}));if(r.length>0)throw new Error('Docusaurus error: Duplicate values "'+r.map((function(e){return e.value})).join(", ")+'" found in <Tabs>. Every value needs to be unique.')}(e),e}),[r,t])}function p(e){var r=e.value;return e.tabValues.some((function(e){return e.value===r}))}function m(e){var r=e.queryString,t=void 0!==r&&r,n=e.groupId,l=(0,o.k6)(),u=function(e){var r=e.queryString,t=void 0!==r&&r,n=e.groupId;if("string"==typeof t)return t;if(!1===t)return null;if(!0===t&&!n)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return null!=n?n:null}({queryString:t,groupId:n});return[(0,i._X)(u),(0,a.useCallback)((function(e){if(u){var r=new URLSearchParams(l.location.search);r.set(u,e),l.replace(Object.assign({},l.location,{search:r.toString()}))}}),[u,l])]}function v(e){var r,t,n,l,u=e.defaultValue,o=e.queryString,i=void 0!==o&&o,s=e.groupId,d=f(e),v=(0,a.useState)((function(){return function(e){var r,t=e.defaultValue,n=e.tabValues;if(0===n.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(t){if(!p({value:t,tabValues:n}))throw new Error('Docusaurus error: The <Tabs> has a defaultValue "'+t+'" but none of its children has the corresponding value. Available values are: '+n.map((function(e){return e.value})).join(", ")+". If you intend to show no default tab, use defaultValue={null} instead.");return t}var a=null!=(r=n.find((function(e){return e.default})))?r:n[0];if(!a)throw new Error("Unexpected error: 0 tabValues");return a.value}({defaultValue:u,tabValues:d})})),b=v[0],y=v[1],h=m({queryString:i,groupId:s}),g=h[0],k=h[1],w=(r=function(e){return e?"docusaurus.tab."+e:null}({groupId:s}.groupId),t=(0,c.Nk)(r),n=t[0],l=t[1],[n,(0,a.useCallback)((function(e){r&&l.set(e)}),[r,l])]),E=w[0],O=w[1],T=function(){var e=null!=g?g:E;return p({value:e,tabValues:d})?e:null}();return(0,a.useLayoutEffect)((function(){T&&y(T)}),[T]),{selectedValue:b,selectValue:(0,a.useCallback)((function(e){if(!p({value:e,tabValues:d}))throw new Error("Can't select invalid tab value="+e);y(e),k(e),O(e)}),[k,O,d]),tabValues:d}}var b=t(2389);const y="tabList__CuJ",h="tabItem_LNqP";function g(e){var r=e.className,t=e.block,o=e.selectedValue,i=e.selectValue,s=e.tabValues,c=[],d=(0,u.o5)().blockElementScrollPositionUntilNextRender,f=function(e){var r=e.currentTarget,t=c.indexOf(r),n=s[t].value;n!==o&&(d(r),i(n))},p=function(e){var r,t=null;switch(e.key){case"Enter":f(e);break;case"ArrowRight":var n,a=c.indexOf(e.currentTarget)+1;t=null!=(n=c[a])?n:c[0];break;case"ArrowLeft":var l,u=c.indexOf(e.currentTarget)-1;t=null!=(l=c[u])?l:c[c.length-1]}null==(r=t)||r.focus()};return a.createElement("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,l.Z)("tabs",{"tabs--block":t},r)},s.map((function(e){var r=e.value,t=e.label,u=e.attributes;return a.createElement("li",(0,n.Z)({role:"tab",tabIndex:o===r?0:-1,"aria-selected":o===r,key:r,ref:function(e){return c.push(e)},onKeyDown:p,onClick:f},u,{className:(0,l.Z)("tabs__item",h,null==u?void 0:u.className,{"tabs__item--active":o===r})}),null!=t?t:r)})))}function k(e){var r=e.lazy,t=e.children,n=e.selectedValue;if(t=Array.isArray(t)?t:[t],r){var l=t.find((function(e){return e.props.value===n}));return l?(0,a.cloneElement)(l,{className:"margin-top--md"}):null}return a.createElement("div",{className:"margin-top--md"},t.map((function(e,r){return(0,a.cloneElement)(e,{key:r,hidden:e.props.value!==n})})))}function w(e){var r=v(e);return a.createElement("div",{className:(0,l.Z)("tabs-container",y)},a.createElement(g,(0,n.Z)({},e,r)),a.createElement(k,(0,n.Z)({},e,r)))}function E(e){var r=(0,b.Z)();return a.createElement(w,(0,n.Z)({key:String(r)},e))}},4162:(e,r,t)=>{t.r(r),t.d(r,{assets:()=>f,contentTitle:()=>c,default:()=>v,frontMatter:()=>s,metadata:()=>d,toc:()=>p});var n=t(7462),a=t(3366),l=(t(7294),t(3905)),u=t(4866),o=t(5162),i=["components"],s={},c=void 0,d={unversionedId:"references/libs/lazy-render",id:"references/libs/lazy-render",title:"lazy-render",description:"Link to complete Hydration documentation - https://tramvai.dev/docs/features/rendering/hydration#lazy-hydration",source:"@site/tmp-docs/references/libs/lazy-render.md",sourceDirName:"references/libs",slug:"/references/libs/lazy-render",permalink:"/docs/references/libs/lazy-render",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/get-started/overview.md/tmp-docs/references/libs/lazy-render.md",tags:[],version:"current",frontMatter:{},sidebar:"sidebar",previous:{title:"is-modern-lib",permalink:"/docs/references/libs/is-modern-lib"},next:{title:"logger",permalink:"/docs/references/libs/logger"}},f={},p=[{value:"Installation",id:"installation",level:2}],m={toc:p};function v(e){var r=e.components,t=(0,a.Z)(e,i);return(0,l.kt)("wrapper",(0,n.Z)({},m,t,{components:r,mdxType:"MDXLayout"}),(0,l.kt)("p",null,"Link to complete Hydration documentation - ",(0,l.kt)("a",{parentName:"p",href:"https://tramvai.dev/docs/features/rendering/hydration#lazy-hydration"},"https://tramvai.dev/docs/features/rendering/hydration#lazy-hydration")),(0,l.kt)("h2",{id:"installation"},"Installation"),(0,l.kt)(u.Z,{groupId:"npm2yarn",mdxType:"Tabs"},(0,l.kt)(o.Z,{value:"npm",mdxType:"TabItem"},(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-bash"},"npm install @tramvai/react-lazy-hydration-render\n"))),(0,l.kt)(o.Z,{value:"yarn",label:"Yarn",mdxType:"TabItem"},(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-bash"},"yarn add @tramvai/react-lazy-hydration-render\n")))))}v.isMDXComponent=!0}}]);