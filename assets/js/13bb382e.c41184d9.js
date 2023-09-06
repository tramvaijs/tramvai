"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[2179],{3905:(e,r,n)=>{n.d(r,{Zo:()=>c,kt:()=>m});var t=n(7294);function a(e,r,n){return r in e?Object.defineProperty(e,r,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[r]=n,e}function o(e,r){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var t=Object.getOwnPropertySymbols(e);r&&(t=t.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),n.push.apply(n,t)}return n}function i(e){for(var r=1;r<arguments.length;r++){var n=null!=arguments[r]?arguments[r]:{};r%2?o(Object(n),!0).forEach((function(r){a(e,r,n[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(n,r))}))}return e}function l(e,r){if(null==e)return{};var n,t,a=function(e,r){if(null==e)return{};var n,t,a={},o=Object.keys(e);for(t=0;t<o.length;t++)n=o[t],r.indexOf(n)>=0||(a[n]=e[n]);return a}(e,r);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(t=0;t<o.length;t++)n=o[t],r.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var s=t.createContext({}),p=function(e){var r=t.useContext(s),n=r;return e&&(n="function"==typeof e?e(r):i(i({},r),e)),n},c=function(e){var r=p(e.components);return t.createElement(s.Provider,{value:r},e.children)},d={inlineCode:"code",wrapper:function(e){var r=e.children;return t.createElement(t.Fragment,{},r)}},u=t.forwardRef((function(e,r){var n=e.components,a=e.mdxType,o=e.originalType,s=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),u=p(n),m=a,h=u["".concat(s,".").concat(m)]||u[m]||d[m]||o;return n?t.createElement(h,i(i({ref:r},c),{},{components:n})):t.createElement(h,i({ref:r},c))}));function m(e,r){var n=arguments,a=r&&r.mdxType;if("string"==typeof e||a){var o=n.length,i=new Array(o);i[0]=u;var l={};for(var s in r)hasOwnProperty.call(r,s)&&(l[s]=r[s]);l.originalType=e,l.mdxType="string"==typeof e?e:a,i[1]=l;for(var p=2;p<o;p++)i[p]=n[p];return t.createElement.apply(null,i)}return t.createElement.apply(null,n)}u.displayName="MDXCreateElement"},7778:(e,r,n)=>{n.r(r),n.d(r,{assets:()=>c,contentTitle:()=>s,default:()=>m,frontMatter:()=>l,metadata:()=>p,toc:()=>d});var t=n(7462),a=n(3366),o=(n(7294),n(3905)),i=["components"],l={title:"@tramvai/react",sidebar_position:2},s=void 0,p={unversionedId:"references/tramvai/react",id:"references/tramvai/react",title:"@tramvai/react",description:"@tramvai/react - library for integrating tramvai features with React components",source:"@site/tmp-docs/references/tramvai/react.md",sourceDirName:"references/tramvai",slug:"/references/tramvai/react",permalink:"/docs/references/tramvai/react",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/get-started/overview.md/tmp-docs/references/tramvai/react.md",tags:[],version:"current",sidebarPosition:2,frontMatter:{title:"@tramvai/react",sidebar_position:2},sidebar:"sidebar",previous:{title:"@tramvai/core",permalink:"/docs/references/tramvai/core"},next:{title:"@tramvai/papi",permalink:"/docs/references/tramvai/papi"}},c={},d=[{value:"Install",id:"install",level:2},{value:"DI",id:"di",level:2},{value:"useDi",id:"usedi",level:3},{value:"withDi",id:"withdi",level:3},{value:"useDiContainer",id:"usedicontainer",level:3},{value:"Error",id:"error",level:2},{value:"ErrorBoundary",id:"errorboundary",level:3},{value:"FallbackError",id:"fallbackerror",level:3},{value:"withError",id:"witherror",level:3},{value:"lazy",id:"lazy",level:2},{value:"Handling chunk loading errors",id:"handling-chunk-loading-errors",level:3},{value:"Using Suspense with lazy components",id:"using-suspense-with-lazy-components",level:3}],u={toc:d};function m(e){var r=e.components,n=(0,a.Z)(e,i);return(0,o.kt)("wrapper",(0,t.Z)({},u,n,{components:r,mdxType:"MDXLayout"}),(0,o.kt)("p",null,(0,o.kt)("inlineCode",{parentName:"p"},"@tramvai/react")," - library for integrating tramvai features with ",(0,o.kt)("inlineCode",{parentName:"p"},"React")," components"),(0,o.kt)("h2",{id:"install"},"Install"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-bash"},"npm i --save @tramvai/react\n")),(0,o.kt)("h2",{id:"di"},"DI"),(0,o.kt)("p",null,"When creating components, you may need to get data from di, for this there is a hook ",(0,o.kt)("inlineCode",{parentName:"p"},"useDi")," and HoC ",(0,o.kt)("inlineCode",{parentName:"p"},"withDi")),(0,o.kt)("h3",{id:"usedi"},"useDi"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-tsx"},"type useDi = (deps: Record<string, string | Token>) => Record<string, any>;\n")),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-tsx"},"type useDi = (dep: string | Token) => any;\n")),(0,o.kt)("p",null,"A hook into which we can pass both an object with the required dependencies and an object with data will be returned to us, as well as a single token, where the result will be returned to us. When we call ",(0,o.kt)("inlineCode",{parentName:"p"},"useDi"),", we get data from di and if we don't find data in di, an error will occur."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-javascript"},"import React from 'react';\nimport { useDi } from '@tramvai/react';\n\nconst MyComponent = () => {\n  const { logger } = useDi({ logger: 'logger' }); // pass the object\n  const Region = useDi(regionToken); // pass a single token\n\n  logger.info('text');\n\n  return (\n    <div>\n      Component\n      <Region />\n    </div>\n  );\n};\n")),(0,o.kt)("h3",{id:"withdi"},"withDi"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-tsx"},"type withDi = (\n  deps: Record<string, string | Token>\n) => (wrapper: React.ReactElement<any>) => React.ReactElement<any>;\n")),(0,o.kt)("p",null,"A HoC that allows you to wrap any components, get data from ",(0,o.kt)("inlineCode",{parentName:"p"},"DI")," and pass the result with dependencies to the props of the component"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-javascript"},"import React from 'react';\nimport { withDi } from '@tramvai/react';\n\n@withDi({ logger: LOGGER_TOKEN })\nclass BoxyPage extends Component {\n  render() {\n    this.props.logger.info('text');\n    return <div>Component</div>;\n  }\n}\n")),(0,o.kt)("h3",{id:"usedicontainer"},"useDiContainer"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-tsx"},"type useDiContainer = () => DI.Container;\n")),(0,o.kt)("p",null,"Getting an instance of a DI container that has been added to the application context."),(0,o.kt)("p",null,"It is better not to use this hook, as it is very low-level and is intended for developing new hooks"),(0,o.kt)("h2",{id:"error"},"Error"),(0,o.kt)("p",null,"To handle errors during rendering, React uses ",(0,o.kt)("a",{parentName:"p",href:"https://ru.reactjs.org/docs/error-boundaries.html#introducing-error-boundaries"},"Error Boundary"),". This package provides its own version of Error Boundary which will log an error through a generic logger and display a stub for the wrapped component if an error occurs."),(0,o.kt)("h3",{id:"errorboundary"},"ErrorBoundary"),(0,o.kt)("p",null,"Error Boundary component that monitors errors down the tree and, in case of a render error, will log an error and display the ",(0,o.kt)("inlineCode",{parentName:"p"},"fallbackComponent")," component (passed as a props, by default it is a FallbackError from this package) instead of the fallen render subtree."),(0,o.kt)("p",null,"You can override the ",(0,o.kt)("inlineCode",{parentName:"p"},"fallbackComponent")," through the ",(0,o.kt)("inlineCode",{parentName:"p"},"ERROR_BOUNDARY_FALLBACK_COMPONENT_TOKEN")," provider."),(0,o.kt)("h3",{id:"fallbackerror"},"FallbackError"),(0,o.kt)("p",null,"Component used by default as a stub for a subtree in which a render error occurred"),(0,o.kt)("h3",{id:"witherror"},"withError"),(0,o.kt)("p",null,"Hook wrapping component in ErrorBoundary."),(0,o.kt)("h2",{id:"lazy"},"lazy"),(0,o.kt)("p",null,"To dynamically import components with SSR support, there is a high order ",(0,o.kt)("inlineCode",{parentName:"p"},"lazy")," component:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-tsx"},"import { lazy } from '@tramvai/react';\n\nconst LazyComponent = lazy(() => import('./components/foo'), {\n  loading: <div>Loading...</div>,\n});\n\n<LazyComponent />;\n")),(0,o.kt)("h3",{id:"handling-chunk-loading-errors"},"Handling chunk loading errors"),(0,o.kt)("p",null,"We suggest to use ",(0,o.kt)("inlineCode",{parentName:"p"},"@loadable")," ",(0,o.kt)("a",{parentName:"p",href:"https://loadable-components.com/docs/error-boundaries/"},"approach"),", which assumes, that you must wrap lazy components in ErrorBoundary:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-tsx"},"import { lazy, UniversalErrorBoundary } from '@tramvai/react';\n\nconst Component = lazy(() => import('./Component'));\n\nconst ComponentWrapper = () => {\n  return (\n    // feel free to use your own implementation\n    <UniversalErrorBoundary error={null} fallback={() => null}>\n      <Component />\n    </UniversalErrorBoundary>\n  );\n};\n")),(0,o.kt)("h3",{id:"using-suspense-with-lazy-components"},"Using Suspense with lazy components"),(0,o.kt)("p",null,"If you are using React 18, you can display fallback UI for lazy component while it is loading. To do so, you need to pass ",(0,o.kt)("inlineCode",{parentName:"p"},"suspense: true")," to lazy method options:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-tsx"},"import { Suspense } from 'react';\nimport { lazy } from '@tramvai/react';\n\nconst Component = lazy(() => import('./Component'), { suspense: true });\n\nconst ComponentWrapper = () => {\n  return (\n    <Suspense fallback={<h4>Loading...</h4>}>\n      <Component />\n    </Suspense>\n  );\n};\n")),(0,o.kt)("p",null,"See more in our ",(0,o.kt)("a",{parentName:"p",href:"https://tramvai.dev/docs/guides/react-18#error-handling"},"React 18 guide"),"!"))}m.isMDXComponent=!0}}]);