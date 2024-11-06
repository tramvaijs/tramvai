"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[2861],{3905:function(e,t,n){n.d(t,{Zo:function(){return p},kt:function(){return m}});var a=n(7294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},i=Object.keys(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var l=a.createContext({}),u=function(e){var t=a.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},p=function(e){var t=u(e.components);return a.createElement(l.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},c=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,i=e.originalType,l=e.parentName,p=s(e,["components","mdxType","originalType","parentName"]),c=u(n),m=r,h=c["".concat(l,".").concat(m)]||c[m]||d[m]||i;return n?a.createElement(h,o(o({ref:t},p),{},{components:n})):a.createElement(h,o({ref:t},p))}));function m(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=n.length,o=new Array(i);o[0]=c;var s={};for(var l in t)hasOwnProperty.call(t,l)&&(s[l]=t[l]);s.originalType=e,s.mdxType="string"==typeof e?e:r,o[1]=s;for(var u=2;u<i;u++)o[u]=n[u];return a.createElement.apply(null,o)}return a.createElement.apply(null,n)}c.displayName="MDXCreateElement"},129:function(e,t,n){n.r(t),n.d(t,{assets:function(){return l},contentTitle:function(){return o},default:function(){return d},frontMatter:function(){return i},metadata:function(){return s},toc:function(){return u}});var a=n(7462),r=(n(7294),n(3905));const i={id:"react-18",title:"React 18 features"},o=void 0,s={unversionedId:"guides/react-18",id:"guides/react-18",title:"React 18 features",description:"What's new in React 18",source:"@site/tmp-docs/guides/react-18.md",sourceDirName:"guides",slug:"/guides/react-18",permalink:"/docs/guides/react-18",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/tmp-docs/guides/react-18.md",tags:[],version:"current",frontMatter:{id:"react-18",title:"React 18 features"},sidebar:"sidebar",previous:{title:"Error Boundaries",permalink:"/docs/guides/error-boundary"},next:{title:"Server optimization",permalink:"/docs/guides/server-optimization"}},l={},u=[{value:"What&#39;s new in React 18",id:"whats-new-in-react-18",level:2},{value:"Concurrent React",id:"concurrent-react",level:3},{value:"Batching updates",id:"batching-updates",level:3},{value:"Transitions",id:"transitions",level:3},{value:"Suspense",id:"suspense",level:3},{value:"Strict mode",id:"strict-mode",level:3},{value:"Tramvai integration",id:"tramvai-integration",level:2},{value:"Streaming rendering",id:"streaming-rendering",level:3},{value:"Selective hydration",id:"selective-hydration",level:3},{value:"SPA-navigations with startTransition",id:"spa-navigations-with-starttransition",level:3},{value:"Suspense in Child App",id:"suspense-in-child-app",level:3},{value:"Tramvai use cases",id:"tramvai-use-cases",level:2},{value:"Suspense",id:"suspense-1",level:3},{value:"Use cases",id:"use-cases",level:4},{value:"startTransition/useTransition",id:"starttransitionusetransition",level:3},{value:"Use cases",id:"use-cases-1",level:4},{value:"useId",id:"useid",level:3},{value:"useDeferredValue",id:"usedeferredvalue",level:3},{value:"How it works?",id:"how-it-works",level:4},{value:"Use cases",id:"use-cases-2",level:4},{value:"Difference from debounce/throttling",id:"difference-from-debouncethrottling",level:4},{value:"Error handling",id:"error-handling",level:3},{value:"Source links",id:"source-links",level:2}],p={toc:u};function d(e){let{components:t,...n}=e;return(0,r.kt)("wrapper",(0,a.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("h2",{id:"whats-new-in-react-18"},"What's new in React 18"),(0,r.kt)("h3",{id:"concurrent-react"},"Concurrent React"),(0,r.kt)("p",null,"Many of the features in React 18 are built on top of the brand-new mechanism \u2013 concurrent renderer, that allows to interrupt rendering. It is increase performance of the client rendering overall."),(0,r.kt)("p",null,"Worth noting, that concurrent rendering ",(0,r.kt)("a",{parentName:"p",href:"/docs/features/rendering/hydration"},"automatically enables")," only for parts, those using it. That's why migration to React 18 will not be a problem."),(0,r.kt)("h3",{id:"batching-updates"},"Batching updates"),(0,r.kt)("p",null,"Batching is the process of grouping multiple updates into one single render. Previously updates inside of promises, setTimeout or native eventHandlers were not batched by default, but now such updates will be batched automatically."),(0,r.kt)("p",null,"Also, if you are using ",(0,r.kt)("inlineCode",{parentName:"p"},"unstable_batchedUpdates")," you can stop using it safely."),(0,r.kt)("p",null,"You can see code examples ",(0,r.kt)("a",{parentName:"p",href:"https://github.com/tramvaijs/tramvai/blob/main/examples/react-18-integration/src/features/batching/counter.tsx"},"here"),"."),(0,r.kt)("h3",{id:"transitions"},"Transitions"),(0,r.kt)("p",null,"Transition is a new concept in React to distinguish between urgent and non-urgent updates:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},"urgent updates - direct interaction, like typing, clicking, pressing, and so on;"),(0,r.kt)("li",{parentName:"ul"},"non-urgent updates - transition the UI from one view to another;")),(0,r.kt)("p",null,"Urgent updates supposed to be handled immediately and show updated UI. In opposite, non-urgent updates are not showing every intermediate value on screen, but final result only. Such separation helps to cope with blocked user interactions due to non-urgent updates."),(0,r.kt)("p",null,"Any updates are urgent by default, but ",(0,r.kt)("inlineCode",{parentName:"p"},"startTransition")," and ",(0,r.kt)("inlineCode",{parentName:"p"},"useTransition")," let you mark some updates as not urgent. If an ",(0,r.kt)("inlineCode",{parentName:"p"},"urgent")," update will happen during a ",(0,r.kt)("inlineCode",{parentName:"p"},"non-urgent")," one React stop the current rendering and render only the latest update."),(0,r.kt)("p",null,"As far as you know, content wrapped in ",(0,r.kt)("inlineCode",{parentName:"p"},"Suspense")," can be suspended for different reasons. To recall:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},"there is ",(0,r.kt)("a",{parentName:"li",href:"/docs/references/tramvai/react#lazy"},"lazy")," component render, wrapped in ",(0,r.kt)("inlineCode",{parentName:"li"},"Suspense"),";"),(0,r.kt)("li",{parentName:"ul"},"there is data loading in a component, wrapped in ",(0,r.kt)("inlineCode",{parentName:"li"},"Suspense"),". Tramvai does not support it yet, but you can look into ",(0,r.kt)("a",{parentName:"li",href:"https://relay.dev/docs/guided-tour/rendering/loading-states/"},"Relay implementation"),", or ",(0,r.kt)("a",{parentName:"li",href:"https://github.com/acdlite/rfcs/blob/first-class-promises/text/0000-first-class-support-for-promises.md"},"origin RFC"),";"),(0,r.kt)("li",{parentName:"ul"},"content, wrapped in ",(0,r.kt)("inlineCode",{parentName:"li"},"Suspense")," is waiting for corresponding CSS (currently in development by React team);")),(0,r.kt)("p",null,"So, if a component will be suspended during non-urgent update React will prevent already-visible content from being replaced by a fallback. Instead, React will delay render until data has loaded."),(0,r.kt)("p",null,"To recap: any update of the state (",(0,r.kt)("inlineCode",{parentName:"p"},"const [, setState] = useState(true)"),"), wrapped in ",(0,r.kt)("inlineCode",{parentName:"p"},"startTransition")," will be considered as non-urgent and will not block user input."),(0,r.kt)("h3",{id:"suspense"},"Suspense"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"Suspense")," lets to display ",(0,r.kt)("inlineCode",{parentName:"p"},"fallback")," content for the parts of UI, that not ready to be displayed yet. In Tramvai it is suitable only for lazy components at the moment."),(0,r.kt)("p",null,"As far as you know Tramvai ships its own ",(0,r.kt)("a",{parentName:"p",href:"/docs/references/tramvai/react#lazy"},"way")," for lazy code loading \u2013 ",(0,r.kt)("inlineCode",{parentName:"p"},"@tramvai/lazy"),". In comparison to classic ",(0,r.kt)("inlineCode",{parentName:"p"},"React.lazy"),", Tramvai version has some advantages:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},"it optimized for SSR;"),(0,r.kt)("li",{parentName:"ul"},"code of a component loads on the client before hydration;")),(0,r.kt)("p",null,"That's why we recommend using only ",(0,r.kt)("inlineCode",{parentName:"p"},"@tramvai/lazy")," in Tramvai apps."),(0,r.kt)("p",null,"Note, that all the content, wrapped in ",(0,r.kt)("inlineCode",{parentName:"p"},"Suspense"),", even if it not suspends by self reasons, will be suspended."),(0,r.kt)("p",null,"Also, ",(0,r.kt)("inlineCode",{parentName:"p"},"Suspense")," usage enables selective hydration. We have a ",(0,r.kt)("a",{parentName:"p",href:"/docs/features/rendering/hydration"},"guide")," about it already. Check it out!"),(0,r.kt)("p",null,"In addition, ",(0,r.kt)("inlineCode",{parentName:"p"},"Suspense")," allows to ",(0,r.kt)("a",{parentName:"p",href:"#error-handling"},"intercept")," server-side and hydration errors."),(0,r.kt)("h3",{id:"strict-mode"},"Strict mode"),(0,r.kt)("p",null,"In order for components to work properly in the future, a new behavior has been added to ",(0,r.kt)("inlineCode",{parentName:"p"},"StrictMode")," called ",(0,r.kt)("inlineCode",{parentName:"p"},"StrictEffects"),". The idea is to catch effects that don't work properly during development by React mounting the component twice, i.e.: ",(0,r.kt)("inlineCode",{parentName:"p"},"mount => unmount => mount"),", calling corresponding effects and unsubscribe functions. It works only in DEV environment. You can enable it ",(0,r.kt)("a",{parentName:"p",href:"/docs/references/modules/render#react-strict-mode"},"such")," way."),(0,r.kt)("h2",{id:"tramvai-integration"},"Tramvai integration"),(0,r.kt)("p",null,"When you are using React 18, several features will be allowed to use:"),(0,r.kt)("h3",{id:"streaming-rendering"},"Streaming rendering"),(0,r.kt)("p",null,"We have an article about ",(0,r.kt)("a",{parentName:"p",href:"/docs/features/rendering/streaming"},"streaming rendering"),", check it out."),(0,r.kt)("h3",{id:"selective-hydration"},"Selective hydration"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"hydrateRoot")," wraps in ",(0,r.kt)("inlineCode",{parentName:"p"},"startTransition")," on the client automatically. See ",(0,r.kt)("a",{parentName:"p",href:"/docs/features/rendering/hydration"},"more"),"."),(0,r.kt)("h3",{id:"spa-navigations-with-starttransition"},"SPA-navigations with startTransition"),(0,r.kt)("p",null,"We have experimental support for concurrent rendering with SPA-transitions - all navigations will be wrapped in ",(0,r.kt)("inlineCode",{parentName:"p"},"startTransition")," automatically, and while rendering the next screen, the page will be responsive because the rendering process will be interruptible."),(0,r.kt)("p",null,"To enable this feature, you need to provide ",(0,r.kt)("inlineCode",{parentName:"p"},"experiments.reactTransitions")," to ",(0,r.kt)("inlineCode",{parentName:"p"},"tramvai.json")," config:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-json",metastring:'title="tramvai.json"',title:'"tramvai.json"'},'{\n  "experiments": {\n    "reactTransitions": true\n  }\n}\n')),(0,r.kt)("p",null,":::warn"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"reactTransitions")," is incompatible with direct ",(0,r.kt)("a",{parentName:"p",href:"/docs/features/routing/working-with-url#routerstore-reducer"},(0,r.kt)("inlineCode",{parentName:"a"},"router")," store")," usage in React components."),(0,r.kt)("p",null,"Bad:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"const route = useStore(RouterStore);\n")),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"const route = useSelector('router', (state) => state.router);\n")),(0,r.kt)("p",null,"Good:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"const route = useRoute();\n")),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"const route = pageService.getCurrentRoute();\n")),(0,r.kt)("p",null,":::"),(0,r.kt)("h3",{id:"suspense-in-child-app"},"Suspense in Child App"),(0,r.kt)("p",null,"Each Child App wraps into ",(0,r.kt)("inlineCode",{parentName:"p"},"Suspense")," automatically."),(0,r.kt)("h2",{id:"tramvai-use-cases"},"Tramvai use cases"),(0,r.kt)("h3",{id:"suspense-1"},"Suspense"),(0,r.kt)("h4",{id:"use-cases"},"Use cases"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},"displaying a fallback UI, during ",(0,r.kt)("inlineCode",{parentName:"li"},"lazy")," component load"),(0,r.kt)("li",{parentName:"ul"},"handling server-side errors;")),(0,r.kt)("p",null,"Look to the code example ",(0,r.kt)("a",{parentName:"p",href:"https://github.com/tramvaijs/tramvai/blob/main/examples/react-18-integration/src/features/suspense/async.tsx"},"here"),"."),(0,r.kt)("h3",{id:"starttransitionusetransition"},"startTransition/useTransition"),(0,r.kt)("p",null,"Mark a state update inside it as ",(0,r.kt)("inlineCode",{parentName:"p"},"non-urgent"),", that allows to not block user input during subsequent updates ",(0,r.kt)("inlineCode",{parentName:"p"},"urgent")," updates."),(0,r.kt)("p",null,"Outside the components you should use ",(0,r.kt)("inlineCode",{parentName:"p"},"startTransition")," function, instead of ",(0,r.kt)("inlineCode",{parentName:"p"},"useTransition")," hook."),(0,r.kt)("h4",{id:"use-cases-1"},"Use cases"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},"wrap a navigation between tabs, when you have heavy to render tab components;"),(0,r.kt)("li",{parentName:"ul"},"don't show fallback UI for suspended components;")),(0,r.kt)("p",null,"Take a look to the ",(0,r.kt)("a",{parentName:"p",href:"https://github.com/tramvaijs/tramvai/blob/main/examples/react-18-integration/src/features/hooks/use-transition.tsx"},"example"),". Try to switch to the ",(0,r.kt)("inlineCode",{parentName:"p"},"Slow")," tab, and then to the ",(0,r.kt)("inlineCode",{parentName:"p"},"Another")," tab immediately. Navigation will happen straight away, despite slow rendering of the ",(0,r.kt)("inlineCode",{parentName:"p"},"Slow")," tab. Also, there is no loading state for suspended content, when click to the ",(0,r.kt)("inlineCode",{parentName:"p"},"Switch")," button."),(0,r.kt)("h3",{id:"useid"},"useId"),(0,r.kt)("p",null,"Hook to generate same identifiers on server and client. Without it, if you will do it by yourself, e.g. just calling ",(0,r.kt)("inlineCode",{parentName:"p"},"uuid"),", result values will be different on server and client. Also, you can't use simple counter (",(0,r.kt)("inlineCode",{parentName:"p"},"nextId++"),") for it, because React does not guarantee the order in which the client components are hydrated. Don't use it for generating keys in a list."),(0,r.kt)("p",null,"There is an ",(0,r.kt)("a",{parentName:"p",href:"https://github.com/tramvaijs/tramvai/blob/main/examples/react-18-integration/src/features/hooks/use-id.tsx"},"example")," in our repo. Run the app, go to the ",(0,r.kt)("inlineCode",{parentName:"p"},"/hooks")," and look to the console. There is a hydration error for the ",(0,r.kt)("inlineCode",{parentName:"p"},"WithoutHook")," component, and no such error for ",(0,r.kt)("inlineCode",{parentName:"p"},"WithHook"),"."),(0,r.kt)("h3",{id:"usedeferredvalue"},"useDeferredValue"),(0,r.kt)("p",null,"Lets you defer re-rendering a non-urgent part of the UI."),(0,r.kt)("p",null,"Look at ",(0,r.kt)("a",{parentName:"p",href:"https://github.com/tramvaijs/tramvai/blob/main/examples/react-18-integration/src/features/hooks/use-deferred-value.tsx"},"example"),"."),(0,r.kt)("h4",{id:"how-it-works"},"How it works?"),(0,r.kt)("p",null,"There are two steps for it:"),(0,r.kt)("ol",null,(0,r.kt)("li",{parentName:"ol"},"First, when the update happens, React makes a render with ",(0,r.kt)("strong",{parentName:"li"},"updated main")," state, but with ",(0,r.kt)("strong",{parentName:"li"},"not updated deferred")," state;"),(0,r.kt)("li",{parentName:"ol"},"Then in background, React tries to re-render with both main and deferred states updated. However, if it suspends or a new state update received, React will cancel the background render and retry it with a new value.")),(0,r.kt)("h4",{id:"use-cases-2"},"Use cases"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},"defer the rendering of a heavy UI;"),(0,r.kt)("li",{parentName:"ul"},"don't show ",(0,r.kt)("inlineCode",{parentName:"li"},"Suspense")," fallback for suspended components;")),(0,r.kt)("p",null,"Run the example app and go to the ",(0,r.kt)("inlineCode",{parentName:"p"},"/hooks"),". Note, that user input does not block by the heavy results render."),(0,r.kt)("h4",{id:"difference-from-debouncethrottling"},"Difference from debounce/throttling"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"useDeferredValue"),":"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},"Designed for the rendering optimizations and integrated with React deeply;"),(0,r.kt)("li",{parentName:"ul"},"There is no fixed time delay, so React will adjust to the user;"),(0,r.kt)("li",{parentName:"ul"},"Can abandon the rendering, by contrast ",(0,r.kt)("inlineCode",{parentName:"li"},"throttle")," and ",(0,r.kt)("inlineCode",{parentName:"li"},"debounce")," just postpone the moment when rendering blocks.")),(0,r.kt)("p",null,"However, ",(0,r.kt)("inlineCode",{parentName:"p"},"throttle")," and ",(0,r.kt)("inlineCode",{parentName:"p"},"debounce")," are still useful. For example, they can let you fire fewer network requests."),(0,r.kt)("h3",{id:"error-handling"},"Error handling"),(0,r.kt)("p",null,"Given the new features, handling rendering errors in React 18 looks like this:"),(0,r.kt)("ol",null,(0,r.kt)("li",{parentName:"ol"},"If an error happens during SSR, then instead of throwing it to the whole application, React will find nearest ",(0,r.kt)("inlineCode",{parentName:"li"},"Suspense")," boundary up to tree and include it fallback to the server response."),(0,r.kt)("li",{parentName:"ol"},"After that, on the client, React determines what could not be rendered and starts a client-side render from scratch for these parts."),(0,r.kt)("li",{parentName:"ol"},"If the client render was successful, React will render it, otherwise it will throw an error that can be caught by the ",(0,r.kt)("inlineCode",{parentName:"li"},"Error Boundary"),".")),(0,r.kt)("p",null,"Note, that same logic applies to the hydration errors, that is React discard server results to nearest ",(0,r.kt)("inlineCode",{parentName:"p"},"Suspense")," boundary and renders in on the client from scratch."),(0,r.kt)("p",null,"That's why we are strongly recommend to wrap in ",(0,r.kt)("inlineCode",{parentName:"p"},"Suspense")," boundary important parts of your application to improve performance. You can use the next structure as a reference:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-tsx"},"<ErrorBoundary fallback>\n  <Suspense fallback>\n    <Component />\n  </Suspense>\n</ErrorBoundary>\n")),(0,r.kt)("p",null,"Note, that Tramvai add ErrorBoundary by default. See ",(0,r.kt)("a",{parentName:"p",href:"/docs/features/error-boundaries"},"more"),"."),(0,r.kt)("p",null,"Also, Tramvai log the rendering errors and deduplicate them, to avoid noise. In general, we are recommend do not ignore hydration errors, because they are affect performance. As the last resort you can ",(0,r.kt)("a",{parentName:"p",href:"https://react.dev/reference/react-dom/hydrate#suppressing-unavoidable-hydration-mismatch-errors"},"use")," ",(0,r.kt)("inlineCode",{parentName:"p"},"suppressHydrationWarning={true}")," on the React component, e.g. to display time."),(0,r.kt)("h2",{id:"source-links"},"Source links"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"https://react.dev/blog/2022/03/29/react-v18"},"React 18 overview")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"https://github.com/reactwg/react-18/discussions/21"},"Automatic batching")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"https://github.com/reactwg/react-18/discussions/41"},"Transitions")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"https://github.com/reactwg/react-18/discussions/65"},"Real world example with transitions")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"https://github.com/reactwg/react-18/discussions/7"},"Suspense")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"https://github.com/reactjs/rfcs/blob/main/text/0215-server-errors-in-react-18.md"},"Server errors in React 18")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"https://react.dev/blog/2022/03/08/react-18-upgrade-guide"},"React 18 upgrade guide"))))}d.isMDXComponent=!0}}]);