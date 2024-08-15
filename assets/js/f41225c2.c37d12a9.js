"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[6794],{3905:(e,t,n)=>{n.d(t,{Zo:()=>u,kt:()=>m});var a=n(7294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},i=Object.keys(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var s=a.createContext({}),p=function(e){var t=a.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},u=function(e){var t=p(e.components);return a.createElement(s.Provider,{value:t},e.children)},c={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},d=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,i=e.originalType,s=e.parentName,u=l(e,["components","mdxType","originalType","parentName"]),d=p(n),m=r,k=d["".concat(s,".").concat(m)]||d[m]||c[m]||i;return n?a.createElement(k,o(o({ref:t},u),{},{components:n})):a.createElement(k,o({ref:t},u))}));function m(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=n.length,o=new Array(i);o[0]=d;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l.mdxType="string"==typeof e?e:r,o[1]=l;for(var p=2;p<i;p++)o[p]=n[p];return a.createElement.apply(null,o)}return a.createElement.apply(null,n)}d.displayName="MDXCreateElement"},6143:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>u,contentTitle:()=>s,default:()=>m,frontMatter:()=>l,metadata:()=>p,toc:()=>c});var a=n(7462),r=n(3366),i=(n(7294),n(3905)),o=["components"],l={id:"links-and-navigation",title:"Links and Navigation"},s=void 0,p={unversionedId:"features/routing/links-and-navigation",id:"features/routing/links-and-navigation",title:"Links and Navigation",description:"`` Component",source:"@site/tmp-docs/03-features/07-routing/04-links-and-navigation.md",sourceDirName:"03-features/07-routing",slug:"/features/routing/links-and-navigation",permalink:"/docs/features/routing/links-and-navigation",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/tmp-docs/03-features/07-routing/04-links-and-navigation.md",tags:[],version:"current",sidebarPosition:4,frontMatter:{id:"links-and-navigation",title:"Links and Navigation"},sidebar:"sidebar",previous:{title:"Working with Url",permalink:"/docs/features/routing/working-with-url"},next:{title:"Hooks and Guards",permalink:"/docs/features/routing/hooks-and-guards"}},u={},c=[{value:"<code>&lt;Link&gt;</code> Component",id:"link-component",level:2},{value:"Page resources prefetch",id:"page-resources-prefetch",level:3},{value:"<code>useNavigate()</code> Hook",id:"usenavigate-hook",level:2},{value:"<code>PageService</code> Service",id:"pageservice-service",level:2},{value:"Navigation",id:"navigation",level:3},{value:"Route Update",id:"route-update",level:3},{value:"History Back",id:"history-back",level:3},{value:"History Forward",id:"history-forward",level:3},{value:"History Go",id:"history-go",level:3},{value:"<code>NavigateOptions</code>",id:"navigateoptions",level:3}],d={toc:c};function m(e){var t=e.components,n=(0,r.Z)(e,o);return(0,i.kt)("wrapper",(0,a.Z)({},d,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("h2",{id:"link-component"},(0,i.kt)("inlineCode",{parentName:"h2"},"<Link>")," Component"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"Link")," - main component for ",(0,i.kt)("inlineCode",{parentName:"p"},"tramvai")," router navigations inside React components."),(0,i.kt)("p",null,"By default, Link will render ",(0,i.kt)("inlineCode",{parentName:"p"},"<a>")," as a children. You can change this by passing a React component as a children - passed component should accept props ",(0,i.kt)("inlineCode",{parentName:"p"},"href"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"onClick")," that should be used in order to make the navigation."),(0,i.kt)("p",null,"Example:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-tsx"},"import { Link } from '@tramvai/module-router';\nimport CustomLink from '@any-ui-kit/link';\n\nexport const WrappedCustomLink = () => {\n  return (\n    <Link url=\"/test/\">\n      <CustomLink />\n    </Link>\n  );\n};\n\nexport const DefaultLink = () => {\n  return <Link url=\"/test/\">Click me</Link>;\n};\n")),(0,i.kt)("admonition",{type:"tip"},(0,i.kt)("p",{parentName:"admonition"},"Consider to use ",(0,i.kt)("a",{parentName:"p",href:"/docs/features/routing/view-transitions"},"View Transitions API")," to animate your navigations")),(0,i.kt)("h3",{id:"page-resources-prefetch"},"Page resources prefetch"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"Link")," component will try to prefetch resources for passed ",(0,i.kt)("inlineCode",{parentName:"p"},"url"),", if this ",(0,i.kt)("inlineCode",{parentName:"p"},"url")," is handled by the application router."),(0,i.kt)("p",null,"It will help to make subsequent page-loads faster because target page assets already be saved in browser cache."),(0,i.kt)("admonition",{type:"info"},(0,i.kt)("p",{parentName:"admonition"},"Your passed component need to be wrapped in the ",(0,i.kt)("inlineCode",{parentName:"p"},"forwardRef")," for routes assets prefetching")),(0,i.kt)("p",null,"How it works:"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},"Component determines when it is in the viewport (using ",(0,i.kt)("inlineCode",{parentName:"li"},"Intersection Observer"),")"),(0,i.kt)("li",{parentName:"ul"},"waits until the browser is idle (using ",(0,i.kt)("inlineCode",{parentName:"li"},"requestIdleCallback"),")"),(0,i.kt)("li",{parentName:"ul"},"checks if the user isn't on a slow connection (using ",(0,i.kt)("inlineCode",{parentName:"li"},"navigator.connection.effectiveType"),") or has data-saver enabled (using ",(0,i.kt)("inlineCode",{parentName:"li"},"navigator.connection.saveData"),")"),(0,i.kt)("li",{parentName:"ul"},"triggers page resources (js, css) prefetching")),(0,i.kt)("p",null,"Main reference for this feature - ",(0,i.kt)("a",{parentName:"p",href:"https://github.com/GoogleChromeLabs/quicklink"},"quicklink")," library."),(0,i.kt)("p",null,"If you want to disable this behaviour, pass ",(0,i.kt)("inlineCode",{parentName:"p"},"prefetch={false}")," property."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-tsx"},'export const WrapLink = () => {\n  return (\n    <Link url="/test/" prefetch={false}>\n      Click me\n    </Link>\n  );\n};\n')),(0,i.kt)("h2",{id:"usenavigate-hook"},(0,i.kt)("inlineCode",{parentName:"h2"},"useNavigate()")," Hook"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"useNavigate")," hook - another way to make navigation from React component."),(0,i.kt)("p",null,"By default, ",(0,i.kt)("inlineCode",{parentName:"p"},"useNavigate")," returns a function, which can be called with any url (string or ",(0,i.kt)("inlineCode",{parentName:"p"},"NavigateOptions")," object):"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-tsx"},"import { useNavigate } from '@tramvai/module-router';\n\nexport const Page = () => {\n  const navigate = useNavigate();\n\n  return (\n    <button type=\"button\" onClick={() => navigate('/test/')}>\n      Navigate to /test/\n    </button>\n  );\n};\n")),(0,i.kt)("p",null,"Also, you can create a navigation callback with predefined parameters:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-tsx"},"import { useNavigate } from '@tramvai/module-router';\n\nexport const Page = () => {\n  const navigateToTest = useNavigate({ url: '/test/', query: { a: '1', b: '2' } });\n\n  return (\n    <button type=\"button\" onClick={navigateToTest}>\n      Navigate to /test/\n    </button>\n  );\n};\n")),(0,i.kt)("h2",{id:"pageservice-service"},(0,i.kt)("inlineCode",{parentName:"h2"},"PageService")," Service"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"PageService")," - is a wrapper for working with ",(0,i.kt)("inlineCode",{parentName:"p"},"tramvai")," router. Serves to hide routing internals and is the preferred way of working with router. Available via ",(0,i.kt)("inlineCode",{parentName:"p"},"PAGE_SERVICE_TOKEN")," token."),(0,i.kt)("p",null,"This service is intended for use in DI providers and actions."),(0,i.kt)("h3",{id:"navigation"},"Navigation"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"navigate(url)")," method make a navigation to a new page and accept target url as argument (string or ",(0,i.kt)("inlineCode",{parentName:"p"},"NavigateOptions")," object):"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-ts"},"import { provide, commandLineListTokens } from '@tramvai/core';\nimport { PAGE_SERVICE_TOKEN } from '@tramvai/module-router';\n\nconst provider = provide({\n  provide: commandLineListTokens.resolvePageDeps,\n  useFactory: ({ pageService }) => {\n    return function redirect() {\n      if (pageService.getCurrentUrl().pathname === '/test/') {\n        return pageService.navigate({ url: '/redirect/', replace: true });\n      }\n    };\n  },\n  deps: {\n    pageService: PAGE_SERVICE_TOKEN,\n  },\n});\n")),(0,i.kt)("h3",{id:"route-update"},"Route Update"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"updateCurrentRoute(options)")," method updates the current route without page reload with new parameters (",(0,i.kt)("inlineCode",{parentName:"p"},"BaseNavigateOptions")," object), for example you can change query parameters:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-ts"},"import { provide, declareAction } from '@tramvai/core';\nimport { PAGE_SERVICE_TOKEN } from '@tramvai/module-router';\n\nconst action = declareAction({\n  name: 'action',\n  fn() {\n    const { pageService } = this.deps;\n\n    if (pageService.getCurrentUrl().pathname === '/test/') {\n      return pageService.updateCurrentRoute({ query: { a: '1', b: '2' } });\n    }\n  },\n  deps: {\n    pageService: PAGE_SERVICE_TOKEN,\n  },\n});\n")),(0,i.kt)("h3",{id:"history-back"},"History Back"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-tsx"},"type HistoryOptions = {\n  historyFallback: string;\n  replace?: boolean;\n};\n")),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"back(options?: HistoryOptions)")," method will go back through history"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"historyFallback")," - optional url for navigation. It is navigated to passed url ",(0,i.kt)("strong",{parentName:"li"},"only")," if browser history is empty."),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"replace")," - whether the passed ",(0,i.kt)("inlineCode",{parentName:"li"},"historyFallback")," url will be replaced in the browser history or added to the history.")),(0,i.kt)("h3",{id:"history-forward"},"History Forward"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"forward()")," method will go forward through history"),(0,i.kt)("h3",{id:"history-go"},"History Go"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"go(to)")," method will go to the specified delta by history"),(0,i.kt)("h3",{id:"navigateoptions"},(0,i.kt)("inlineCode",{parentName:"h3"},"NavigateOptions")),(0,i.kt)("p",null,"Object that allows to specify transition options both to ",(0,i.kt)("a",{parentName:"p",href:"#navigation"},"navigate")," and ",(0,i.kt)("a",{parentName:"p",href:"#route-update"},"updateCurrentRoute")," transitions:"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"code")," - redirect code that is returned on server in case of redirects"),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"navigateState")," - any additional data that is stored with route")))}m.isMDXComponent=!0}}]);