"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[2417],{3905:(I,g,e)=>{e.d(g,{Zo:()=>o,kt:()=>c});var i=e(7294);function t(I,g,e){return g in I?Object.defineProperty(I,g,{value:e,enumerable:!0,configurable:!0,writable:!0}):I[g]=e,I}function a(I,g){var e=Object.keys(I);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(I);g&&(i=i.filter((function(g){return Object.getOwnPropertyDescriptor(I,g).enumerable}))),e.push.apply(e,i)}return e}function n(I){for(var g=1;g<arguments.length;g++){var e=null!=arguments[g]?arguments[g]:{};g%2?a(Object(e),!0).forEach((function(g){t(I,g,e[g])})):Object.getOwnPropertyDescriptors?Object.defineProperties(I,Object.getOwnPropertyDescriptors(e)):a(Object(e)).forEach((function(g){Object.defineProperty(I,g,Object.getOwnPropertyDescriptor(e,g))}))}return I}function C(I,g){if(null==I)return{};var e,i,t=function(I,g){if(null==I)return{};var e,i,t={},a=Object.keys(I);for(i=0;i<a.length;i++)e=a[i],g.indexOf(e)>=0||(t[e]=I[e]);return t}(I,g);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(I);for(i=0;i<a.length;i++)e=a[i],g.indexOf(e)>=0||Object.prototype.propertyIsEnumerable.call(I,e)&&(t[e]=I[e])}return t}var A=i.createContext({}),l=function(I){var g=i.useContext(A),e=g;return I&&(e="function"==typeof I?I(g):n(n({},g),I)),e},o=function(I){var g=l(I.components);return i.createElement(A.Provider,{value:g},I.children)},d={inlineCode:"code",wrapper:function(I){var g=I.children;return i.createElement(i.Fragment,{},g)}},r=i.forwardRef((function(I,g){var e=I.components,t=I.mdxType,a=I.originalType,A=I.parentName,o=C(I,["components","mdxType","originalType","parentName"]),r=l(e),c=t,m=r["".concat(A,".").concat(c)]||r[c]||d[c]||a;return e?i.createElement(m,n(n({ref:g},o),{},{components:e})):i.createElement(m,n({ref:g},o))}));function c(I,g){var e=arguments,t=g&&g.mdxType;if("string"==typeof I||t){var a=e.length,n=new Array(a);n[0]=r;var C={};for(var A in g)hasOwnProperty.call(g,A)&&(C[A]=g[A]);C.originalType=I,C.mdxType="string"==typeof I?I:t,n[1]=C;for(var l=2;l<a;l++)n[l]=e[l];return i.createElement.apply(null,n)}return i.createElement.apply(null,e)}r.displayName="MDXCreateElement"},2680:(I,g,e)=>{e.r(g),e.d(g,{assets:()=>o,contentTitle:()=>A,default:()=>c,frontMatter:()=>C,metadata:()=>l,toc:()=>d});var i=e(7462),t=e(3366),a=(e(7294),e(3905)),n=["components"],C={id:"flow",title:"Navigation Flow"},A=void 0,l={unversionedId:"features/routing/flow",id:"features/routing/flow",title:"Navigation Flow",description:"tramvai router is universal, and work both on server and client sides. But navigation flow is different for all environments and router modules. Also, router has it is own lifecycle, but this flow is embedded in commandLineRunner lifecycle.",source:"@site/tmp-docs/03-features/07-routing/02-navigation-flow.md",sourceDirName:"03-features/07-routing",slug:"/features/routing/flow",permalink:"/docs/features/routing/flow",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/get-started/overview.md/tmp-docs/03-features/07-routing/02-navigation-flow.md",tags:[],version:"current",sidebarPosition:2,frontMatter:{id:"flow",title:"Navigation Flow"},sidebar:"sidebar",previous:{title:"Overview",permalink:"/docs/features/routing/overview"},next:{title:"Working with Url",permalink:"/docs/features/routing/working-with-url"}},o={},d=[{value:"Server navigation",id:"server-navigation",level:2},{value:"Client initialization",id:"client-initialization",level:2},{value:"Client SPA navigation",id:"client-spa-navigation",level:2},{value:"Client NoSPA navigation",id:"client-nospa-navigation",level:2}],r={toc:d};function c(I){var g=I.components,C=(0,t.Z)(I,n);return(0,a.kt)("wrapper",(0,i.Z)({},r,C,{components:g,mdxType:"MDXLayout"}),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"tramvai")," router is universal, and work both on server and client sides. But navigation flow is different for all environments and router modules. Also, router has it is own lifecycle, but this flow is embedded in ",(0,a.kt)("inlineCode",{parentName:"p"},"commandLineRunner")," lifecycle."),(0,a.kt)("h2",{id:"server-navigation"},"Server navigation"),(0,a.kt)("p",null,"At server-side, router navigation will be executed at ",(0,a.kt)("a",{parentName:"p",href:"/docs/features/app-lifecycle#resolve_user_deps"},"resolve_user_deps")," command. Router ",(0,a.kt)("inlineCode",{parentName:"p"},"hooks")," and ",(0,a.kt)("inlineCode",{parentName:"p"},"guards")," will be launched in the process:"),(0,a.kt)("p",null,(0,a.kt)("img",{alt:"Diagram",src:e(8902).Z,width:"921",height:"1431"})),(0,a.kt)("admonition",{type:"info"},(0,a.kt)("p",{parentName:"admonition"},"Router will run page actions at ",(0,a.kt)("a",{parentName:"p",href:"/docs/features/app-lifecycle#resolve_page_deps"},"resolve_page_deps")," stage.")),(0,a.kt)("h2",{id:"client-initialization"},"Client initialization"),(0,a.kt)("p",null,"After page load, router rehydration will be executed at ",(0,a.kt)("a",{parentName:"p",href:"/docs/features/app-lifecycle#customer_start"},"customer_start")," command. Only ",(0,a.kt)("inlineCode",{parentName:"p"},"guards")," will be launched in the process:"),(0,a.kt)("p",null,(0,a.kt)("img",{alt:"Diagram",src:e(5981).Z,width:"921",height:"821"})),(0,a.kt)("admonition",{type:"info"},(0,a.kt)("p",{parentName:"admonition"},"Router will run page actions (failed on server or client-side only) at ",(0,a.kt)("a",{parentName:"p",href:"/docs/features/app-lifecycle#clear"},"clear")," stage.")),(0,a.kt)("h2",{id:"client-spa-navigation"},"Client SPA navigation"),(0,a.kt)("p",null,"All client navigations with SPA router have a lifecycle, similar to server-side flow. Router ",(0,a.kt)("inlineCode",{parentName:"p"},"hooks")," and ",(0,a.kt)("inlineCode",{parentName:"p"},"guards")," will be launched in the process:"),(0,a.kt)("p",null,(0,a.kt)("img",{alt:"Diagram",src:e(9242).Z,width:"1111",height:"1341"})),(0,a.kt)("admonition",{type:"info"},(0,a.kt)("p",{parentName:"admonition"},"Router will run ",(0,a.kt)("inlineCode",{parentName:"p"},"commandLineRunner")," stages ",(0,a.kt)("inlineCode",{parentName:"p"},"resolve_user_deps"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"resolve_page_deps")," and ",(0,a.kt)("inlineCode",{parentName:"p"},"spa_transition")," sequentially at ",(0,a.kt)("inlineCode",{parentName:"p"},"beforeNavigate")," hook, and stage ",(0,a.kt)("inlineCode",{parentName:"p"},"after_spa_transition")," on ",(0,a.kt)("inlineCode",{parentName:"p"},"afterNavigate")," hook."),(0,a.kt)("p",{parentName:"admonition"},"And as you can see, actions behaviour depends on ",(0,a.kt)("inlineCode",{parentName:"p"},"SPA actions mode"),". This mode allows you to control when to execute actions - before target page rendering or after. More information about SPA Mode in ",(0,a.kt)("a",{parentName:"p",href:"/docs/features/routing/how-to#setting-when-actions-should-be-performed-during-spa-transitions"},"Documentation how to change SPA actions mode"))),(0,a.kt)("h2",{id:"client-nospa-navigation"},"Client NoSPA navigation"),(0,a.kt)("p",null,"This flow is simple - just a hard reload for any navigations:"),(0,a.kt)("p",null,(0,a.kt)("img",{alt:"Diagram",src:e(8079).Z,width:"421",height:"351"})))}c.isMDXComponent=!0},8079:(I,g,e)=>{e.d(g,{Z:()=>i});const i="data:image/svg+xml;base64,PHN2ZyBob3N0PSI2NWJkNzExNDRlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIHdpZHRoPSI0MjFweCIgaGVpZ2h0PSIzNTFweCIgdmlld0JveD0iLTAuNSAtMC41IDQyMSAzNTEiIGNvbnRlbnQ9IiZsdDtteGZpbGUmZ3Q7Jmx0O2RpYWdyYW0gaWQ9JnF1b3Q7OHJ5R0JHOVJlSnNmX0pHZTNDRXQmcXVvdDsgbmFtZT0mcXVvdDtQYWdlLTEmcXVvdDsmZ3Q7eFpaUmI1c3dFTWMvRGE4STQ0YWtqMnVhZGcrYk5DMFBXeDlkT01DYnd5SGpCTmlubndFVFRDQnRsR1phSWtXK3YrK0kvZlBkR1lldWQ5V3paSG42RlNNUWp1OUZsVU1mSGQ5ZjNWSDkyd2gxSndTQkVSTEpvMDRpZzdEbGY4Q0lubEgzUElKaTVLZ1FoZUw1V0F3eHl5QlVJNDFKaWVYWUxVWXgvdGVjSlRBUnRpRVRVL1VIajFScXR1VXZCLzB6OENUdC81a0U5OTNNanZYT1ppZEZ5aUlzTFlsdUhMcVdpS29iN2FvMWlJWmR6NldMZXpvemUxeVloRXhkRWtCWFhjU0JpYjNabkZtWXF2dmRTdHhuRVRRQm5rTWZ5cFFyMk9Zc2JHWkxmYnhhUzlWT2FJdm9ZYUVrL29ZMUNwUnROUFhhejNHbTU5WDRUaGRyMW44QXFhQ3lKTFA0WjhBZEtGbHJGelBiY3l5SFk3anJ0ZFE2QXJvd0lqTkhueHdmTmREUkF3UG9ES3ozV2IxREoySkYycElrRXlCMER0N2FiNzYzUWRVVE1EVkg2QlNkdjV4QlIrNXZnSTZRQ1NxSWRFMFpFNlZLTWNHTWljMmdQb3dUYi9ENWdwZ2JocjlBcWRvMENMWlhPTVlORlZjL20zQjNZYXdYYStheE1rOXVqYm8zTXIwMUs2Z3hYK3k1SWF5MStyaXpKMVRnWG9abXo2WkJORnQvODhna0NLYjRZZHh1NXZpM29aK2taTFhsa0NQUFZHRTkrVnNqREpsQWxvdlpWSGk2emw4UHVoVmNHQjJjNUpOaU1nRmxvazVTNnNqa29peGJUZ3BVcDVBQzZXYnN3Qk9tNEkzZVJxN29iVkh3R2l5QzJkNFdjeUVzenppTy9UQzhUU0VUTXE3a21VSStGcmRkeUtmY3I2bmp2dVZaaUV1ZTZTdk1GUmpxbE1YTVRTWEVlc1oxM1J2VERzSVZ2TWFYMEk0WXJPSmIwZmJPcEsrTisrNGY0YWJUalA3ZVp2VEhMdW4vZVEzNTNqaDcvVG1lYzFmNEZUeTFPYnhLZGYxa2VCK2xtNzg9Jmx0Oy9kaWFncmFtJmd0OyZsdDsvbXhmaWxlJmd0OyI+CiAgICA8ZGVmcy8+CiAgICA8Zz4KICAgICAgICA8cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iNDIwIiBoZWlnaHQ9IjM1MCIgZmlsbD0icmdiKDI1NSwgMjU1LCAyNTUpIiBzdHJva2U9IiMwMDAwMDAiIHBvaW50ZXItZXZlbnRzPSJhbGwiLz4KICAgICAgICA8cmVjdCB4PSIzMCIgeT0iMTMwIiB3aWR0aD0iMjcwIiBoZWlnaHQ9IjE5MCIgZmlsbD0icmdiKDI1NSwgMjU1LCAyNTUpIiBzdHJva2U9IiNjMmMyYzIiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWRhc2hhcnJheT0iOSA5IiBwb2ludGVyLWV2ZW50cz0iYWxsIi8+CiAgICAgICAgPHBhdGggZD0iTSAxNTUgOTAgTCAxNTUgMTMwIEwgMTU1IDE1My42MyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2IoMCwgMCwgMCkiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgcG9pbnRlci1ldmVudHM9InN0cm9rZSIvPgogICAgICAgIDxwYXRoIGQ9Ik0gMTU1IDE1OC44OCBMIDE1MS41IDE1MS44OCBMIDE1NSAxNTMuNjMgTCAxNTguNSAxNTEuODggWiIgZmlsbD0icmdiKDAsIDAsIDApIiBzdHJva2U9InJnYigwLCAwLCAwKSIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBwb2ludGVyLWV2ZW50cz0iYWxsIi8+CiAgICAgICAgPHJlY3QgeD0iOTAiIHk9IjMwIiB3aWR0aD0iMTMwIiBoZWlnaHQ9IjYwIiByeD0iOSIgcnk9IjkiIGZpbGw9IiNmZmYyY2MiIHN0cm9rZT0iI2Q2YjY1NiIgcG9pbnRlci1ldmVudHM9ImFsbCIvPgogICAgICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0wLjUgLTAuNSkiPgogICAgICAgICAgICA8c3dpdGNoPgogICAgICAgICAgICAgICAgPGZvcmVpZ25PYmplY3QgcG9pbnRlci1ldmVudHM9Im5vbmUiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHJlcXVpcmVkRmVhdHVyZXM9Imh0dHA6Ly93d3cudzMub3JnL1RSL1NWRzExL2ZlYXR1cmUjRXh0ZW5zaWJpbGl0eSIgc3R5bGU9Im92ZXJmbG93OiB2aXNpYmxlOyB0ZXh0LWFsaWduOiBsZWZ0OyI+CiAgICAgICAgICAgICAgICAgICAgPGRpdiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbCIgc3R5bGU9ImRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiB1bnNhZmUgY2VudGVyOyBqdXN0aWZ5LWNvbnRlbnQ6IHVuc2FmZSBjZW50ZXI7IHdpZHRoOiAxMjhweDsgaGVpZ2h0OiAxcHg7IHBhZGRpbmctdG9wOiA2MHB4OyBtYXJnaW4tbGVmdDogOTFweDsiPgogICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGRhdGEtZHJhd2lvLWNvbG9ycz0iY29sb3I6IHJnYigwLCAwLCAwKTsgIiBzdHlsZT0iYm94LXNpemluZzogYm9yZGVyLWJveDsgZm9udC1zaXplOiAwcHg7IHRleHQtYWxpZ246IGNlbnRlcjsiPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT0iZGlzcGxheTogaW5saW5lLWJsb2NrOyBmb250LXNpemU6IDEycHg7IGZvbnQtZmFtaWx5OiBIZWx2ZXRpY2E7IGNvbG9yOiByZ2IoMCwgMCwgMCk7IGxpbmUtaGVpZ2h0OiAxLjI7IHBvaW50ZXItZXZlbnRzOiBhbGw7IHdoaXRlLXNwYWNlOiBub3JtYWw7IG92ZXJmbG93LXdyYXA6IG5vcm1hbDsiPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvdXRlci5uYXZpZ2F0ZQogICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICAgICAgPC9mb3JlaWduT2JqZWN0PgogICAgICAgICAgICAgICAgPHRleHQgeD0iMTU1IiB5PSI2NCIgZmlsbD0icmdiKDAsIDAsIDApIiBmb250LWZhbWlseT0iSGVsdmV0aWNhIiBmb250LXNpemU9IjEycHgiIHRleHQtYW5jaG9yPSJtaWRkbGUiPgogICAgICAgICAgICAgICAgICAgIHJvdXRlci5uYXZpZ2F0ZQogICAgICAgICAgICAgICAgPC90ZXh0PgogICAgICAgICAgICA8L3N3aXRjaD4KICAgICAgICA8L2c+CiAgICAgICAgPHJlY3QgeD0iODUiIHk9IjE2MCIgd2lkdGg9IjE0MCIgaGVpZ2h0PSI2MCIgcng9IjkiIHJ5PSI5IiBmaWxsPSIjZGFlOGZjIiBzdHJva2U9IiM2YzhlYmYiIHBvaW50ZXItZXZlbnRzPSJhbGwiLz4KICAgICAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMC41IC0wLjUpIj4KICAgICAgICAgICAgPHN3aXRjaD4KICAgICAgICAgICAgICAgIDxmb3JlaWduT2JqZWN0IHBvaW50ZXItZXZlbnRzPSJub25lIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiByZXF1aXJlZEZlYXR1cmVzPSJodHRwOi8vd3d3LnczLm9yZy9UUi9TVkcxMS9mZWF0dXJlI0V4dGVuc2liaWxpdHkiIHN0eWxlPSJvdmVyZmxvdzogdmlzaWJsZTsgdGV4dC1hbGlnbjogbGVmdDsiPgogICAgICAgICAgICAgICAgICAgIDxkaXYgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWwiIHN0eWxlPSJkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogdW5zYWZlIGNlbnRlcjsganVzdGlmeS1jb250ZW50OiB1bnNhZmUgY2VudGVyOyB3aWR0aDogMTM4cHg7IGhlaWdodDogMXB4OyBwYWRkaW5nLXRvcDogMTkwcHg7IG1hcmdpbi1sZWZ0OiA4NnB4OyI+CiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgZGF0YS1kcmF3aW8tY29sb3JzPSJjb2xvcjogcmdiKDAsIDAsIDApOyAiIHN0eWxlPSJib3gtc2l6aW5nOiBib3JkZXItYm94OyBmb250LXNpemU6IDBweDsgdGV4dC1hbGlnbjogY2VudGVyOyI+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPSJkaXNwbGF5OiBpbmxpbmUtYmxvY2s7IGZvbnQtc2l6ZTogMTJweDsgZm9udC1mYW1pbHk6IEhlbHZldGljYTsgY29sb3I6IHJnYigwLCAwLCAwKTsgbGluZS1oZWlnaHQ6IDEuMjsgcG9pbnRlci1ldmVudHM6IGFsbDsgd2hpdGUtc3BhY2U6IG5vcm1hbDsgb3ZlcmZsb3ctd3JhcDogbm9ybWFsOyI+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWY9Li4uCiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgICAgICA8L2ZvcmVpZ25PYmplY3Q+CiAgICAgICAgICAgICAgICA8dGV4dCB4PSIxNTUiIHk9IjE5NCIgZmlsbD0icmdiKDAsIDAsIDApIiBmb250LWZhbWlseT0iSGVsdmV0aWNhIiBmb250LXNpemU9IjEycHgiIHRleHQtYW5jaG9yPSJtaWRkbGUiPgogICAgICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmPS4uLgogICAgICAgICAgICAgICAgPC90ZXh0PgogICAgICAgICAgICA8L3N3aXRjaD4KICAgICAgICA8L2c+CiAgICAgICAgPHJlY3QgeD0iMTgwIiB5PSIyNjAiIHdpZHRoPSIxMjAiIGhlaWdodD0iNjAiIGZpbGw9InJnYigyNTUsIDI1NSwgMjU1KSIgc3Ryb2tlPSIjYzJjMmMyIiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1kYXNoYXJyYXk9IjkgOSIgcG9pbnRlci1ldmVudHM9ImFsbCIvPgogICAgICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0wLjUgLTAuNSkiPgogICAgICAgICAgICA8c3dpdGNoPgogICAgICAgICAgICAgICAgPGZvcmVpZ25PYmplY3QgcG9pbnRlci1ldmVudHM9Im5vbmUiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHJlcXVpcmVkRmVhdHVyZXM9Imh0dHA6Ly93d3cudzMub3JnL1RSL1NWRzExL2ZlYXR1cmUjRXh0ZW5zaWJpbGl0eSIgc3R5bGU9Im92ZXJmbG93OiB2aXNpYmxlOyB0ZXh0LWFsaWduOiBsZWZ0OyI+CiAgICAgICAgICAgICAgICAgICAgPGRpdiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbCIgc3R5bGU9ImRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiB1bnNhZmUgY2VudGVyOyBqdXN0aWZ5LWNvbnRlbnQ6IHVuc2FmZSBjZW50ZXI7IHdpZHRoOiAxMThweDsgaGVpZ2h0OiAxcHg7IHBhZGRpbmctdG9wOiAyOTBweDsgbWFyZ2luLWxlZnQ6IDE4MXB4OyI+CiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgZGF0YS1kcmF3aW8tY29sb3JzPSJjb2xvcjogcmdiKDAsIDAsIDApOyAiIHN0eWxlPSJib3gtc2l6aW5nOiBib3JkZXItYm94OyBmb250LXNpemU6IDBweDsgdGV4dC1hbGlnbjogY2VudGVyOyI+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPSJkaXNwbGF5OiBpbmxpbmUtYmxvY2s7IGZvbnQtc2l6ZTogMTJweDsgZm9udC1mYW1pbHk6IEhlbHZldGljYTsgY29sb3I6IHJnYigwLCAwLCAwKTsgbGluZS1oZWlnaHQ6IDEuMjsgcG9pbnRlci1ldmVudHM6IGFsbDsgd2hpdGUtc3BhY2U6IG5vcm1hbDsgb3ZlcmZsb3ctd3JhcDogbm9ybWFsOyI+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUm91dGVyCiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgICAgICA8L2ZvcmVpZ25PYmplY3Q+CiAgICAgICAgICAgICAgICA8dGV4dCB4PSIyNDAiIHk9IjI5NCIgZmlsbD0icmdiKDAsIDAsIDApIiBmb250LWZhbWlseT0iSGVsdmV0aWNhIiBmb250LXNpemU9IjEycHgiIHRleHQtYW5jaG9yPSJtaWRkbGUiPgogICAgICAgICAgICAgICAgICAgIFJvdXRlcgogICAgICAgICAgICAgICAgPC90ZXh0PgogICAgICAgICAgICA8L3N3aXRjaD4KICAgICAgICA8L2c+CiAgICA8L2c+CiAgICA8c3dpdGNoPgogICAgICAgIDxnIHJlcXVpcmVkRmVhdHVyZXM9Imh0dHA6Ly93d3cudzMub3JnL1RSL1NWRzExL2ZlYXR1cmUjRXh0ZW5zaWJpbGl0eSIvPgogICAgICAgIDxhIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAsLTUpIiB4bGluazpocmVmPSJodHRwczovL3d3dy5kaWFncmFtcy5uZXQvZG9jL2ZhcS9zdmctZXhwb3J0LXRleHQtcHJvYmxlbXMiIHRhcmdldD0iX2JsYW5rIj4KICAgICAgICAgICAgPHRleHQgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIxMHB4IiB4PSI1MCUiIHk9IjEwMCUiPgogICAgICAgICAgICAgICAgVmlld2VyIGRvZXMgbm90IHN1cHBvcnQgZnVsbCBTVkcgMS4xCiAgICAgICAgICAgIDwvdGV4dD4KICAgICAgICA8L2E+CiAgICA8L3N3aXRjaD4KPC9zdmc+"},9242:(I,g,e)=>{e.d(g,{Z:()=>i});const i=e.p+"assets/images/navigate-flow-client-spa.drawio-189a56b0f8292c5c70f1460be637ca69.svg"},8902:(I,g,e)=>{e.d(g,{Z:()=>i});const i=e.p+"assets/images/navigate-flow-server.drawio-3895120a119daca95be215798f868010.svg"},5981:(I,g,e)=>{e.d(g,{Z:()=>i});const i=e.p+"assets/images/rehydrate-client.drawio-7518319c71e15401859028945885dafc.svg"}}]);