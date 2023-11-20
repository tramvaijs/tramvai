"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[9284],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>d});var i=n(7294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function r(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,i,a=function(e,t){if(null==e)return{};var n,i,a={},o=Object.keys(e);for(i=0;i<o.length;i++)n=o[i],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(i=0;i<o.length;i++)n=o[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var l=i.createContext({}),u=function(e){var t=i.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):r(r({},t),e)),n},p=function(e){var t=u(e.components);return i.createElement(l.Provider,{value:t},e.children)},m={inlineCode:"code",wrapper:function(e){var t=e.children;return i.createElement(i.Fragment,{},t)}},c=i.forwardRef((function(e,t){var n=e.components,a=e.mdxType,o=e.originalType,l=e.parentName,p=s(e,["components","mdxType","originalType","parentName"]),c=u(n),d=a,f=c["".concat(l,".").concat(d)]||c[d]||m[d]||o;return n?i.createElement(f,r(r({ref:t},p),{},{components:n})):i.createElement(f,r({ref:t},p))}));function d(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=n.length,r=new Array(o);r[0]=c;var s={};for(var l in t)hasOwnProperty.call(t,l)&&(s[l]=t[l]);s.originalType=e,s.mdxType="string"==typeof e?e:a,r[1]=s;for(var u=2;u<o;u++)r[u]=n[u];return i.createElement.apply(null,r)}return i.createElement.apply(null,n)}c.displayName="MDXCreateElement"},39:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>l,default:()=>d,frontMatter:()=>s,metadata:()=>u,toc:()=>m});var i=n(7462),a=n(3366),o=(n(7294),n(3905)),r=["components"],s={id:"view-transitions",title:"View Transitions"},l=void 0,u={unversionedId:"features/routing/view-transitions",id:"features/routing/view-transitions",title:"View Transitions",description:"Overview",source:"@site/tmp-docs/03-features/07-routing/11-view-transitions.md",sourceDirName:"03-features/07-routing",slug:"/features/routing/view-transitions",permalink:"/docs/features/routing/view-transitions",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/get-started/overview.md/tmp-docs/03-features/07-routing/11-view-transitions.md",tags:[],version:"current",sidebarPosition:11,frontMatter:{id:"view-transitions",title:"View Transitions"},sidebar:"sidebar",previous:{title:"Testing",permalink:"/docs/features/routing/testing"},next:{title:"State Management",permalink:"/docs/features/state-management"}},p={},m=[{value:"Overview",id:"overview",level:2},{value:"Usage",id:"usage",level:2},{value:"Elements transition",id:"elements-transition",level:3},{value:"useViewTransition",id:"useviewtransition",level:3},{value:"Exclude elements from transition",id:"exclude-elements-from-transition",level:3},{value:"Custom animations",id:"custom-animations",level:3},{value:"Prefers reduced motion",id:"prefers-reduced-motion",level:3},{value:"Browser support",id:"browser-support",level:3},{value:"Explanation",id:"explanation",level:2}],c={toc:m};function d(e){var t=e.components,s=(0,a.Z)(e,r);return(0,o.kt)("wrapper",(0,i.Z)({},c,s,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("h2",{id:"overview"},"Overview"),(0,o.kt)("p",null,"View Transitions is a brand-new API which allows to animate SPA-navigations. You can read more about it ",(0,o.kt)("a",{parentName:"p",href:"https://developer.chrome.com/docs/web-platform/view-transitions"},"here"),"."),(0,o.kt)("p",null,"In a nutshell, it works like this:"),(0,o.kt)("ol",null,(0,o.kt)("li",{parentName:"ol"},"First, when you are calling ",(0,o.kt)("inlineCode",{parentName:"li"},"document.startViewTransition")," and updating DOM inside it, browser takes a snapshot of the current DOM state."),(0,o.kt)("li",{parentName:"ol"},"Then, after updating DOM, browser starts an animated transition between two states, and creates next pseudo-elements tree:",(0,o.kt)("pre",{parentName:"li"},(0,o.kt)("code",{parentName:"pre",className:"language-text"},"::view-transition\n\u2514\u2500 ::view-transition-group(root)\n   \u2514\u2500 ::view-transition-image-pair(root)\n      \u251c\u2500 ::view-transition-old(root)\n      \u2514\u2500 ::view-transition-new(root)\n"))),(0,o.kt)("li",{parentName:"ol"},"The old view animates from opacity: 1 to opacity: 0, while the new view animates from opacity: 0 to opacity: 1, creating a cross-fade.")),(0,o.kt)("p",null,"All the animations are performed using CSS animations, so they can be customized with CSS."),(0,o.kt)("admonition",{type:"info"},(0,o.kt)("p",{parentName:"admonition"},"Only SPA navigations supported at the moment. Support for MPA navigations coming soon.")),(0,o.kt)("h2",{id:"usage"},"Usage"),(0,o.kt)("p",null,"Usage of the View Transition API is completely safe and do not require much step to set up. First, enable it in Tramvai config:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "experiments": {\n    "viewTransitions": true\n  }\n}\n')),(0,o.kt)("p",null,"It will enable a special router provider for React and removes the default one from your bundle."),(0,o.kt)("p",null,"Second, you should pass property named ",(0,o.kt)("inlineCode",{parentName:"p"},"viewTransion")," to your navigation. It can be either prop of a ",(0,o.kt)("inlineCode",{parentName:"p"},"Link")," component or a navigation parameter:"),(0,o.kt)("admonition",{type:"tip"},(0,o.kt)("p",{parentName:"admonition"},"Using the view transitions assumes, that all actions should be executed before navigation, so consider to set ",(0,o.kt)("inlineCode",{parentName:"p"},"ROUTER_SPA_ACTIONS_RUN_MODE_TOKEN: 'before'"),"."),(0,o.kt)("p",{parentName:"admonition"},"Otherwise, if you have a route, that depends on some action and renders conditionally \u2013 view transitions to this route may not work, because view transition will end before the route is ready to display relevant UI, To recap: browser compares two DOM states: before view transition and after, so it's expect to see final UI at the end of view transition.")),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-tsx"},"import { Link } from '@tramvai/module-router';\nimport { useNavigate } from '@tinkoff/router';\n\nconst Component: React.FC = () => {\n  const navigate = useNavigate({ url: '/home', viewTransition: true });\n\n  return (\n    <section>\n      <button type=\"button\" onClick={navigate}>\n        Take me home\n      </button>\n\n      <Link url=\"/country-roads\" viewTransition>\n        Country Roads\n      </Link>\n    </section>\n  );\n};\n")),(0,o.kt)("p",null,"This is enabling default animation between routes (smooth cross-fade), that can be suitable for some cases. But if you want to customize your transitions, you should add some CSS styles."),(0,o.kt)("h3",{id:"elements-transition"},"Elements transition"),(0,o.kt)("p",null,"Actually the default transition isn't just a cross-fade, the browser also transitions:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"Position and transform (via a transform);"),(0,o.kt)("li",{parentName:"ul"},"Width;"),(0,o.kt)("li",{parentName:"ul"},"Height;")),(0,o.kt)("p",null,"So, if you want to apply such behavior to elements on different pages, just add ",(0,o.kt)("inlineCode",{parentName:"p"},"view-transition-name")," to them with the same value:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-tsx"},'import { useNavigate } from \'@tinkoff/router\';\n\n// route 1\nconst Component: React.FC = () => {\n  const navigate = useNavigate({ url: \'/target\', viewTransition: true });\n\n  return (\n    <section>\n      <button type="button" onClick={navigate}>\n        Show me the meaning\n      </button>\n\n      <img\n        alt="Preview of the image"\n        src="https://tinkoff.cdn.ru/image.png"\n        style={{ viewTransitionName: \'image-expand\' }}\n      />\n    </section>\n  );\n};\n\n// route 2\nconst TargetComponent: React.FC = () => {\n  return (\n    <img\n      alt="Detailed image"\n      src="https://tinkoff.cdn.ru/detailed-image.png"\n      style={{ viewTransitionName: \'image-expand\' }}\n    />\n  );\n};\n')),(0,o.kt)("h3",{id:"useviewtransition"},"useViewTransition"),(0,o.kt)("p",null,"Also, you can use special hook which will tell you when a transition is in progress, and you can use that to apply classes or styles:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-tsx"},"import { useNavigate, useViewTransition } from '@tinkoff/router';\n\n// route 1\nconst Component: React.FC = (props) => {\n  const isTransitioning = useViewTransition(`/item/${props.id}`);\n\n  return (\n    <section style={isTransitioning ? { viewTransitionName: 'card-expand' } : undefined}>\n      Preview of an element in the list\n    </section>\n  );\n};\n")),(0,o.kt)("h3",{id:"exclude-elements-from-transition"},"Exclude elements from transition"),(0,o.kt)("p",null,"If some of your content does not a part of animated transition, or you want to transition multiple elements, you can assign a different ",(0,o.kt)("inlineCode",{parentName:"p"},"view-transition-name")," to the element."),(0,o.kt)("p",null,"The value of ",(0,o.kt)("inlineCode",{parentName:"p"},"view-transition-name")," can be whatever you want (except for ",(0,o.kt)("inlineCode",{parentName:"p"},"none"),", which means there's no transition name)."),(0,o.kt)("h3",{id:"custom-animations"},"Custom animations"),(0,o.kt)("p",null,"You can customize your animations in any way, for example ",(0,o.kt)("inlineCode",{parentName:"p"},"slide")," animations will look like this:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-css"},"@keyframes slide-from-right {\n  from {\n    transform: translateX(30px);\n  }\n}\n\n@keyframes slide-to-left {\n  to {\n    transform: translateX(-30px);\n  }\n}\n\n::view-transition-old(root) {\n  animation: 300ms cubic-bezier(0.4, 0, 0.2, 1) both slide-to-left;\n}\n\n::view-transition-new(root) {\n  animation: 300ms cubic-bezier(0.4, 0, 0.2, 1) both slide-from-right;\n}\n")),(0,o.kt)("p",null,"We recommend to see at this ",(0,o.kt)("a",{parentName:"p",href:"https://developer.chrome.com/docs/web-platform/view-transitions"},"article")," by Google, containing a lot of nice examples."),(0,o.kt)("h3",{id:"prefers-reduced-motion"},"Prefers reduced motion"),(0,o.kt)("p",null,"Tramvai includes CSS to ",(0,o.kt)("a",{parentName:"p",href:"https://developer.mozilla.org/ru/docs/Web/CSS/@media/prefers-reduced-motion"},"preserve")," user settings about animations behavior."),(0,o.kt)("p",null,"So, if a user select to prefer reduced motions, view transitions will not be working."),(0,o.kt)("h3",{id:"browser-support"},"Browser support"),(0,o.kt)("p",null,"Supported browsers are:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"Chromium-based >= 111.0"),(0,o.kt)("li",{parentName:"ul"},"Opera >=97.0")),(0,o.kt)("p",null,"But it is safe to use it anywhere, no polyfill required."),(0,o.kt)("h2",{id:"explanation"},"Explanation"),(0,o.kt)("p",null,"Here you can see a diagram explains how does the react provider work: ",(0,o.kt)("img",{alt:"Diagram",src:n(2065).Z,width:"1051",height:"1051"})))}d.isMDXComponent=!0},2065:(e,t,n)=>{n.d(t,{Z:()=>i});const i=n.p+"assets/images/view-transitions-1f6ee42e35b5b2eee7f1f36cd29d5267.svg"}}]);