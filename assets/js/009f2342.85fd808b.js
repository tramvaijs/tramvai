"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[7776],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>f});var r=n(7294);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function s(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function c(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var a=r.createContext({}),u=function(e){var t=r.useContext(a),n=t;return e&&(n="function"==typeof e?e(t):s(s({},t),e)),n},p=function(e){var t=u(e.components);return r.createElement(a.Provider,{value:t},e.children)},m={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},l=r.forwardRef((function(e,t){var n=e.components,o=e.mdxType,i=e.originalType,a=e.parentName,p=c(e,["components","mdxType","originalType","parentName"]),l=u(n),f=o,g=l["".concat(a,".").concat(f)]||l[f]||m[f]||i;return n?r.createElement(g,s(s({ref:t},p),{},{components:n})):r.createElement(g,s({ref:t},p))}));function f(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var i=n.length,s=new Array(i);s[0]=l;var c={};for(var a in t)hasOwnProperty.call(t,a)&&(c[a]=t[a]);c.originalType=e,c.mdxType="string"==typeof e?e:o,s[1]=c;for(var u=2;u<i;u++)s[u]=n[u];return r.createElement.apply(null,s)}return r.createElement.apply(null,n)}l.displayName="MDXCreateElement"},4426:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>a,default:()=>f,frontMatter:()=>c,metadata:()=>u,toc:()=>m});var r=n(7462),o=n(3366),i=(n(7294),n(3905)),s=["components"],c={},a=void 0,u={unversionedId:"references/tokens/metrics",id:"references/tokens/metrics",title:"metrics",description:"Tramvai tokens for integration and extension metric module.",source:"@site/tmp-docs/references/tokens/metrics.md",sourceDirName:"references/tokens",slug:"/references/tokens/metrics",permalink:"/docs/references/tokens/metrics",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/get-started/overview.md/tmp-docs/references/tokens/metrics.md",tags:[],version:"current",frontMatter:{},sidebar:"sidebar",previous:{title:"http-client",permalink:"/docs/references/tokens/http-client"},next:{title:"react-query",permalink:"/docs/references/tokens/react-query"}},p={},m=[{value:"Tokens list",id:"tokens-list",level:2}],l={toc:m};function f(e){var t=e.components,n=(0,o.Z)(e,s);return(0,i.kt)("wrapper",(0,r.Z)({},l,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"Tramvai tokens for integration and extension ",(0,i.kt)("a",{parentName:"p",href:"/docs/references/modules/metrics"},"metric module"),"."),(0,i.kt)("h2",{id:"tokens-list"},"Tokens list"),(0,i.kt)("p",null,(0,i.kt)("pre",{parentName:"p"},(0,i.kt)("code",{parentName:"pre",className:"language-typescript"},"import { createToken } from '@tinkoff/dippy';\nimport type {\n  Counter,\n  CounterConfiguration,\n  Gauge,\n  GaugeConfiguration,\n  Histogram,\n  HistogramConfiguration,\n  Summary,\n  SummaryConfiguration,\n} from 'prom-client';\n\ninterface Metrics {\n  counter<T extends string = string>(opt: CounterConfiguration<T>): Counter<T>;\n  gauge<T extends string = string>(opt: GaugeConfiguration<T>): Gauge<T>;\n  histogram<T extends string = string>(opt: HistogramConfiguration<T>): Histogram<T>;\n  summary<T extends string = string>(opt: SummaryConfiguration<T>): Summary<T>;\n}\n\nexport type ModuleConfig = {\n  enableConnectionResolveMetrics: boolean;\n};\n\nexport { Counter, Gauge, Histogram, Summary, Metrics };\n\n/**\n * @description\n * Metric module implementation\n */\nexport const METRICS_MODULE_TOKEN = createToken<Metrics>('metricsModule');\n\nexport interface MetricsServicesRegistryInterface {\n  register(url: string, serviceName: string): void;\n  registerEnv(env: Record<string, unknown>): void;\n  getServiceName(url: string): string | void;\n}\n\n/**\n * @description\n * Utility for pointing out to metric module which service name to set for different requests\n */\nexport const METRICS_SERVICES_REGISTRY_TOKEN =\n  createToken<MetricsServicesRegistryInterface>('metricsServicesRegistry');\n\n/**\n * @description\n * Token for registering counter metric which can be incremented with POST papi request\n */\nexport const REGISTER_INSTANT_METRIC_TOKEN =\n  createToken<[string, Counter<string>]>('registerInstantMetric');\n\n/**\n * @description\n * Configuration for the metrics\n */\nexport const METRICS_MODULE_CONFIG_TOKEN = createToken<ModuleConfig>('metrics-module-config');\n\n"))))}f.isMDXComponent=!0}}]);