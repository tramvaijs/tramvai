"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[308],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>d});var r=n(7294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function a(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var l=r.createContext({}),m=function(e){var t=r.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):a(a({},t),e)),n},p=function(e){var t=m(e.components);return r.createElement(l.Provider,{value:t},e.children)},c={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},u=r.forwardRef((function(e,t){var n=e.components,i=e.mdxType,o=e.originalType,l=e.parentName,p=s(e,["components","mdxType","originalType","parentName"]),u=m(n),d=i,h=u["".concat(l,".").concat(d)]||u[d]||c[d]||o;return n?r.createElement(h,a(a({ref:t},p),{},{components:n})):r.createElement(h,a({ref:t},p))}));function d(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var o=n.length,a=new Array(o);a[0]=u;var s={};for(var l in t)hasOwnProperty.call(t,l)&&(s[l]=t[l]);s.originalType=e,s.mdxType="string"==typeof e?e:i,a[1]=s;for(var m=2;m<o;m++)a[m]=n[m];return r.createElement.apply(null,a)}return r.createElement.apply(null,n)}u.displayName="MDXCreateElement"},3510:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>l,default:()=>d,frontMatter:()=>s,metadata:()=>m,toc:()=>c});var r=n(7462),i=n(3366),o=(n(7294),n(3905)),a=["components"],s={},l=void 0,m={unversionedId:"references/modules/metrics",id:"references/modules/metrics",title:"metrics",description:"Module provides the interface described in @platform/metrics-types. On server the interface is implemented with public package prom-client that provides metrics on url /metrics Prometheus format.",source:"@site/tmp-docs/references/modules/metrics.md",sourceDirName:"references/modules",slug:"/references/modules/metrics",permalink:"/docs/references/modules/metrics",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/get-started/overview.md/tmp-docs/references/modules/metrics.md",tags:[],version:"current",frontMatter:{},sidebar:"sidebar",previous:{title:"log",permalink:"/docs/references/modules/log"},next:{title:"mocker",permalink:"/docs/references/modules/mocker"}},p={},c=[{value:"Explanation",id:"explanation",level:2},{value:"Monitoring outgoing requests",id:"monitoring-outgoing-requests",level:3},{value:"Event Loop Lag",id:"event-loop-lag",level:3},{value:"Client metrics",id:"client-metrics",level:3},{value:"instantMetricsReporter",id:"instantmetricsreporter",level:4},{value:"Metrics list",id:"metrics-list",level:2},{value:"Application metrics",id:"application-metrics",level:3},{value:"Outgoing requests",id:"outgoing-requests",level:3},{value:"Node.js metrics",id:"nodejs-metrics",level:3},{value:"How to",id:"how-to",level:2},{value:"Usage Example",id:"usage-example",level:3},{value:"Make service names showed in metrics instead of hostnames",id:"make-service-names-showed-in-metrics-instead-of-hostnames",level:3},{value:"Use metrics to profile performance in browser",id:"use-metrics-to-profile-performance-in-browser",level:3},{value:"Use custom port for metrics endpoint",id:"use-custom-port-for-metrics-endpoint",level:3},{value:"Debug",id:"debug",level:2},{value:"Exported tokens",id:"exported-tokens",level:2}],u={toc:c};function d(e){var t=e.components,n=(0,i.Z)(e,a);return(0,o.kt)("wrapper",(0,r.Z)({},u,n,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"Module provides the interface described in ",(0,o.kt)("inlineCode",{parentName:"p"},"@platform/metrics-types"),". On server the interface is implemented with public package ",(0,o.kt)("inlineCode",{parentName:"p"},"prom-client")," that provides metrics on url ",(0,o.kt)("inlineCode",{parentName:"p"},"/metrics")," Prometheus format."),(0,o.kt)("p",null,"More details about metrics type, parameters and how to use it see in ",(0,o.kt)("a",{parentName:"p",href:"https://github.com/siimon/prom-client"},"docs to ",(0,o.kt)("inlineCode",{parentName:"a"},"prom-client")),"."),(0,o.kt)("h2",{id:"explanation"},"Explanation"),(0,o.kt)("h3",{id:"monitoring-outgoing-requests"},"Monitoring outgoing requests"),(0,o.kt)("p",null,"To monitor the state of the outgoing requests (like number of requests, number of error, time execution) the module monkey-patches ",(0,o.kt)("inlineCode",{parentName:"p"},"request")," and ",(0,o.kt)("inlineCode",{parentName:"p"},"get")," methods of the standard modules ",(0,o.kt)("inlineCode",{parentName:"p"},"http")," and ",(0,o.kt)("inlineCode",{parentName:"p"},"https"),". To make it work just add metrics module to the app."),(0,o.kt)("p",null,"Next labels are added to metrics:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"http method"),(0,o.kt)("li",{parentName:"ul"},"http response code"),(0,o.kt)("li",{parentName:"ul"},"service name")),(0,o.kt)("p",null,"Name of the service calculates by comparing request urls with values in ",(0,o.kt)("inlineCode",{parentName:"p"},"MetricsServicesRegistry"),". Initially the register is bootstrapped with the inverted content of env variables, e.g. if some url from env is a substring of the request url, then the name of the env become the service name. If several envs matches this logic then the env with the longest url is used."),(0,o.kt)("h3",{id:"event-loop-lag"},"Event Loop Lag"),(0,o.kt)("p",null,"This module has their own implementation of Event Loop Lag metric - ",(0,o.kt)("inlineCode",{parentName:"p"},"nodejs_eventloop_setinterval_lag_seconds")," histogram, this metric implemented with ",(0,o.kt)("inlineCode",{parentName:"p"},"setTimeout"),"."),(0,o.kt)("h3",{id:"client-metrics"},"Client metrics"),(0,o.kt)("p",null,"Module implements feature to collect metrics from the clients and share it with Prometheus by sending metrics from the client to server papi-route."),(0,o.kt)("p",null,"Metrics module can help in implementing this functionality in common cases. To create metric register provider for the token ",(0,o.kt)("inlineCode",{parentName:"p"},"REGISTER_INSTANT_METRIC_TOKEN"),". Your provider should return list of two entities - first is a slug of papi-route and second is an instance of Counter. E.g.:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-javascript"},"import { provide } from '@tramvai/core';\n\nprovide({\n  provide: REGISTER_INSTANT_METRIC_TOKEN,\n  scope: Scope.SINGLETON,\n  multi: true,\n  deps: {\n    metrics: METRICS_MODULE_TOKEN,\n  },\n  useFactory({ metrics }) {\n    return ['page-load', new Counter({ name: 'client_page_load_total', help: 'Client page load' })];\n  },\n});\n")),(0,o.kt)("p",null,"After that to increment metric ",(0,o.kt)("inlineCode",{parentName:"p"},"client_page_load_total")," you can call papi-route ",(0,o.kt)("inlineCode",{parentName:"p"},"/metrics/page-load"),"."),(0,o.kt)("h4",{id:"instantmetricsreporter"},"instantMetricsReporter"),(0,o.kt)("p",null,"In practice it become clear that besides metric collection it often needed to collect logs with details. This can be implemented with ",(0,o.kt)("inlineCode",{parentName:"p"},"instantMetricsReporter"),". When calling logger module will check that any metric with the slug equal to the event of the log is exist. If so module will send request to the corresponding papi-route."),(0,o.kt)("p",null,"Next way you can log event and increment server metric:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-javascript"},"import { provide } from '@tramvai/core';\nprovide({\n  provide: commandLineListTokens.init,\n  multi: true,\n  deps: {\n    logger: LOGGER_TOKEN,\n  },\n  useFactory({ logger }) {\n    return () => {\n      window.on('load', () => {\n        logger.info({ event: 'page-load' });\n      })\n    };\n  },\n}),\n")),(0,o.kt)("h2",{id:"metrics-list"},"Metrics list"),(0,o.kt)("h3",{id:"application-metrics"},"Application metrics"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"http_requests_total")," counter - application response count by status code"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"http_requests_execution_time")," histogram - application response time"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"command_line_runner_execution_time")," histogram - (measure application lifecycle)","[03-features/06-app-lifecycle.md]")),(0,o.kt)("h3",{id:"outgoing-requests"},"Outgoing requests"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"http_sent_requests_total")," counter - request count from application to external APIs"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"http_sent_requests_duration")," histogram - request time from application to external APIs"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"http_sent_requests_errors")," counter - request from application to external APIs errors count"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"dns_resolve_duration")," histogram - DNS resolve time"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"tcp_connect_duration")," histogram - TCP connect time"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"tls_handshake_duration")," histogram - TLS handshake time")),(0,o.kt)("h3",{id:"nodejs-metrics"},"Node.js metrics"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"nodejs_eventloop_lag_p90_seconds")," gauge - event loop lag in 90 percentile from ",(0,o.kt)("inlineCode",{parentName:"li"},"prom-client")),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"nodejs_eventloop_setinterval_lag_seconds")," histogram - event loop lag from custom ",(0,o.kt)("inlineCode",{parentName:"li"},"setTimeout")," measurement"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"nodejs_heap_space_size_used_bytes")," gauge - used memory size from ",(0,o.kt)("inlineCode",{parentName:"li"},"prom-client")),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"nodejs_gc_duration_seconds")," histogram - GC duration from ",(0,o.kt)("inlineCode",{parentName:"li"},"prom-client")),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"nodejs_active_handles")," gauge - total number of active handles from ",(0,o.kt)("inlineCode",{parentName:"li"},"prom-client")),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"nodejs_active_requests")," gauge - total number of active requests from ",(0,o.kt)("inlineCode",{parentName:"li"},"prom-client"))),(0,o.kt)("h2",{id:"how-to"},"How to"),(0,o.kt)("h3",{id:"usage-example"},"Usage Example"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-tsx"},"import { createToken } from '@tinkoff/dippy';\nimport { Module, provide } from '@tramvai/core';\nimport { Counter, Metrics, METRICS_MODULE_TOKEN } from '@tramvai/tokens-metrics';\n\ninterface SomeModuleOptions {\n  metrics: Metrics;\n}\n\nclass SomeModule {\n  private metricActionCounter: Counter;\n\n  constructor(options: SomeModuleOptions) {\n    this.metricActionCounter = options.metrics.counter({\n      name: 'some_actions_total',\n      help: 'Total count of some actions',\n    });\n  }\n\n  public action(): void {\n    this.metricActionCounter.inc();\n\n    // Do some meaningful action\n  }\n}\n\nexport const SOME_MODULE = createToken<SomeModule>('someModule');\n\n@Module({\n  providers: [\n    provide({\n      provide: SOME_MODULE,\n      useFactory: (deps) => new SomeModule(deps),\n      deps: {\n        metrics: METRICS_MODULE_TOKEN,\n      },\n    }),\n  ],\n})\nexport class SomeModuleContainer {}\n")),(0,o.kt)("h3",{id:"make-service-names-showed-in-metrics-instead-of-hostnames"},"Make service names showed in metrics instead of hostnames"),(0,o.kt)("p",null,"It is possible to give a hint to module about the service name in case url is dynamic. To do that:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"use token ",(0,o.kt)("inlineCode",{parentName:"li"},"METRICS_SERVICES_REGISTRY_TOKEN"),";"),(0,o.kt)("li",{parentName:"ul"},"call ",(0,o.kt)("inlineCode",{parentName:"li"},'metricsServicesRegistry.register("Part of the url or the whole url", "Name of service")'))),(0,o.kt)("h3",{id:"use-metrics-to-profile-performance-in-browser"},"Use metrics to profile performance in browser"),(0,o.kt)("p",null,"To measure length of the events you must use method ",(0,o.kt)("inlineCode",{parentName:"p"},"startTimer")," of classes Gauge, Histogram, Summary. In dev-mode these classes are patched and methods to work with timers will use ",(0,o.kt)("a",{parentName:"p",href:"https://developer.mozilla.org/en-US/docs/Web/API/Performance"},"PerformanceApi"),"."),(0,o.kt)("p",null,"Example without additional fields:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},"const metric = metrics.gauge({\n  name: 'request_measure',\n  help: 'Request duration measure',\n});\n\nconst endTimer = metric.startTimer();\n\nfetch(url).then(() => {\n  endTimer();\n\n  // output the result - performance.getEntriesByName('request_measure');\n});\n")),(0,o.kt)("p",null,"Example with adding dynamic fields:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},"const metric = metrics.gauge({\n  name: 'request_measure',\n  help: 'Request duration measure',\n});\n\nconst endTimer = metric.startTimer({ method: 'GET' });\n\nfetch(url).then(() => {\n  endTimer({ status: 200 });\n\n  // output the result - performance.getEntriesByName('request_measure{method=\"GET\",status=\"200\"}');\n});\n")),(0,o.kt)("h3",{id:"use-custom-port-for-metrics-endpoint"},"Use custom port for metrics endpoint"),(0,o.kt)("p",null,"It can be done with token ",(0,o.kt)("inlineCode",{parentName:"p"},"UTILITY_SERVER_PORT_TOKEN")," as it works for any ",(0,o.kt)("a",{parentName:"p",href:"/docs/references/modules/server#specify-port-for-utility-paths"},"utility path"),":"),(0,o.kt)("h2",{id:"debug"},"Debug"),(0,o.kt)("p",null,"The module uses loggers with the next ids: ",(0,o.kt)("inlineCode",{parentName:"p"},"metrics:perf"),", ",(0,o.kt)("inlineCode",{parentName:"p"},"metrics:papi")),(0,o.kt)("h2",{id:"exported-tokens"},"Exported tokens"),(0,o.kt)("p",null,(0,o.kt)("a",{parentName:"p",href:"/docs/references/tokens/metrics"},"link")))}d.isMDXComponent=!0}}]);