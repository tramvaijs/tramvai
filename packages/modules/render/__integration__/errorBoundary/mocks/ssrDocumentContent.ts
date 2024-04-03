export const SSRDocumentContentMocks = {
  extendRender: {
    render: `<html lang="ru">
  <head>
    <title>Error EXTEND_RENDER error at /extend-render-error/</title>
    <script></script>
    <link data-chunk="rootErrorBoundary" rel="stylesheet" href="\${STATIC_URL}/dist/client/rootErrorBoundary.css" >
    <script id="__LOADABLE_REQUIRED_CHUNKS__" type="application/json"></script>
    <script id="__LOADABLE_REQUIRED_CHUNKS___ext" type="application/json"></script>
    <script async data-chunk="rootErrorBoundary" src="\${STATIC_URL}/dist/client/react.js"></script>
    <script async data-chunk="rootErrorBoundary" src="\${STATIC_URL}/dist/client/rootErrorBoundary.js"></script>
  </head>
  <body>
    <h1 class="error--module__title">Root Error Boundary</h1>
  </body>
</html>
`,
    hydrate: `<html lang="ru"><head><title>Error EXTEND_RENDER error at /extend-render-error/</title><script>window.serverUrl = {"href":"/extend-render-error/","origin":"http://localhost","protocol":"http:","username":"","password":"","port":"","pathname":"/extend-render-error/","path":"/extend-render-error/","search":"","hash":"","query":{}};window.serverError = new Error("EXTEND_RENDER error");Object.assign(window.serverError, {"name":"Error","status":500,"message":"EXTEND_RENDER error"});</script>
<link data-chunk="rootErrorBoundary" rel="stylesheet" href="\${STATIC_URL}/dist/client/rootErrorBoundary.css">
<script id="__LOADABLE_REQUIRED_CHUNKS__" type="application/json">[]</script><script id="__LOADABLE_REQUIRED_CHUNKS___ext" type="application/json">{"namedChunks":[]}</script>
<script async="" data-chunk="rootErrorBoundary" src="\${STATIC_URL}/dist/client/react.js"></script>
<script async="" data-chunk="rootErrorBoundary" src="\${STATIC_URL}/dist/client/rootErrorBoundary.js"></script>
</head><body><h1 class="error--module__title">Root Error Boundary</h1></body></html>`,
  },
  globalError: {
    render: `<html lang="ru">
  <head>
    <title>Error Global Error at /global-error/</title>
    <script></script>
    <link data-chunk="rootErrorBoundary" rel="stylesheet" href="\${STATIC_URL}/dist/client/rootErrorBoundary.css" >
    <script id="__LOADABLE_REQUIRED_CHUNKS__" type="application/json"></script>
    <script id="__LOADABLE_REQUIRED_CHUNKS___ext" type="application/json"></script>
    <script async data-chunk="rootErrorBoundary" src="\${STATIC_URL}/dist/client/react.js"></script>
    <script async data-chunk="rootErrorBoundary" src="\${STATIC_URL}/dist/client/rootErrorBoundary.js"></script>
  </head>
  <body>
    <h1 class="error--module__title">Root Error Boundary</h1>
  </body>
</html>
`,
    hydrate: `<html lang="ru"><head><title>Error Global Error at /global-error/</title><script>window.serverUrl = {"href":"/global-error/","origin":"http://localhost","protocol":"http:","username":"","password":"","port":"","pathname":"/global-error/","path":"/global-error/","search":"","hash":"","query":{}};window.serverError = new Error("Global Error");Object.assign(window.serverError, {"name":"HttpError","status":503,"message":"Global Error"});</script>
<link data-chunk="rootErrorBoundary" rel="stylesheet" href="\${STATIC_URL}/dist/client/rootErrorBoundary.css">
<script id="__LOADABLE_REQUIRED_CHUNKS__" type="application/json">[]</script><script id="__LOADABLE_REQUIRED_CHUNKS___ext" type="application/json">{"namedChunks":[]}</script>
<script async="" data-chunk="rootErrorBoundary" src="\${STATIC_URL}/dist/client/react.js"></script>
<script async="" data-chunk="rootErrorBoundary" src="\${STATIC_URL}/dist/client/rootErrorBoundary.js"></script>
</head><body><h1 class="error--module__title">Root Error Boundary</h1></body></html>`,
  },
  nestedLayout: {
    render: `<html lang="ru">
  <head>
    <title>Error Error Nested Layout SSR at /page-error-nested-layout-error/</title>
    <script></script>
    <link data-chunk="rootErrorBoundary" rel="stylesheet" href="\${STATIC_URL}/dist/client/rootErrorBoundary.css" >
    <script id="__LOADABLE_REQUIRED_CHUNKS__" type="application/json"></script>
    <script id="__LOADABLE_REQUIRED_CHUNKS___ext" type="application/json"></script>
    <script async data-chunk="rootErrorBoundary" src="\${STATIC_URL}/dist/client/react.js"></script>
    <script async data-chunk="rootErrorBoundary" src="\${STATIC_URL}/dist/client/rootErrorBoundary.js"></script>
  </head>
  <body>
    <h1 class="error--module__title">Root Error Boundary</h1>
  </body>
</html>
`,
    hydrate: `<html lang="ru"><head><title>Error Error Nested Layout SSR at /page-error-nested-layout-error/</title><script>window.serverUrl = {"href":"/page-error-nested-layout-error/","origin":"http://localhost","protocol":"http:","username":"","password":"","port":"","pathname":"/page-error-nested-layout-error/","path":"/page-error-nested-layout-error/","search":"","hash":"","query":{}};window.serverError = new Error("Error Nested Layout SSR");Object.assign(window.serverError, {"name":"Error","status":500,"message":"Error Nested Layout SSR"});</script>
<link data-chunk="rootErrorBoundary" rel="stylesheet" href="\${STATIC_URL}/dist/client/rootErrorBoundary.css">
<script id="__LOADABLE_REQUIRED_CHUNKS__" type="application/json">[]</script><script id="__LOADABLE_REQUIRED_CHUNKS___ext" type="application/json">{"namedChunks":[]}</script>
<script async="" data-chunk="rootErrorBoundary" src="\${STATIC_URL}/dist/client/react.js"></script>
<script async="" data-chunk="rootErrorBoundary" src="\${STATIC_URL}/dist/client/rootErrorBoundary.js"></script>
</head><body><h1 class="error--module__title">Root Error Boundary</h1></body></html>`,
  },
};
