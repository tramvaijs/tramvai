"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[5509],{3905:(e,t,a)=>{a.d(t,{Zo:()=>c,kt:()=>u});var n=a(7294);function r(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function i(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function o(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?i(Object(a),!0).forEach((function(t){r(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function p(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},i=Object.keys(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var l=n.createContext({}),s=function(e){var t=n.useContext(l),a=t;return e&&(a="function"==typeof e?e(t):o(o({},t),e)),a},c=function(e){var t=s(e.components);return n.createElement(l.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},m=n.forwardRef((function(e,t){var a=e.components,r=e.mdxType,i=e.originalType,l=e.parentName,c=p(e,["components","mdxType","originalType","parentName"]),m=s(a),u=r,v=m["".concat(l,".").concat(u)]||m[u]||d[u]||i;return a?n.createElement(v,o(o({ref:t},c),{},{components:a})):n.createElement(v,o({ref:t},c))}));function u(e,t){var a=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=a.length,o=new Array(i);o[0]=m;var p={};for(var l in t)hasOwnProperty.call(t,l)&&(p[l]=t[l]);p.originalType=e,p.mdxType="string"==typeof e?e:r,o[1]=p;for(var s=2;s<i;s++)o[s]=a[s];return n.createElement.apply(null,o)}return n.createElement.apply(null,a)}m.displayName="MDXCreateElement"},6964:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>c,contentTitle:()=>l,default:()=>u,frontMatter:()=>p,metadata:()=>s,toc:()=>d});var n=a(7462),r=a(3366),i=(a(7294),a(3905)),o=["components"],p={id:"tramvai-update",title:"How to update tramvai version?",sidebar_label:"How to update tramvai?"},l=void 0,s={unversionedId:"how-to/tramvai-update",id:"how-to/tramvai-update",title:"How to update tramvai version?",description:"Most of the libraries in the tramvai repository are combined into a common versioning - these are core packages, tram modules and tokens.",source:"@site/tmp-docs/how-to/tramvai-update.md",sourceDirName:"how-to",slug:"/how-to/tramvai-update",permalink:"/docs/how-to/tramvai-update",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/get-started/overview.md/tmp-docs/how-to/tramvai-update.md",tags:[],version:"current",frontMatter:{id:"tramvai-update",title:"How to update tramvai version?",sidebar_label:"How to update tramvai?"},sidebar:"sidebar",previous:{title:"ssr-async-components",permalink:"/docs/how-to/ssr-async-components"},next:{title:"@tramvai/core",permalink:"/docs/references/tramvai/core"}},c={},d=[{value:"Upgrading to a latest version",id:"upgrading-to-a-latest-version",level:2},{value:"Upgrading to a prerelease version",id:"upgrading-to-a-prerelease-version",level:2},{value:"Upgrading to a specific version",id:"upgrading-to-a-specific-version",level:2},{value:"Installing the new tramvai package in the app",id:"installing-the-new-tramvai-package-in-the-app",level:2},{value:"Checking tramvai versions in the app",id:"checking-tramvai-versions-in-the-app",level:2}],m={toc:d};function u(e){var t=e.components,a=(0,r.Z)(e,o);return(0,i.kt)("wrapper",(0,n.Z)({},m,a,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"Most of the libraries in the ",(0,i.kt)("inlineCode",{parentName:"p"},"tramvai")," repository are combined into a common versioning - these are ",(0,i.kt)("inlineCode",{parentName:"p"},"core")," packages, tram modules and tokens.\nThis makes it much easier to upgrade tramvai to a specific version."),(0,i.kt)("p",null,"Detailed documentation is available in the ",(0,i.kt)("a",{parentName:"p",href:"/docs/concepts/versioning"},"Release section")),(0,i.kt)("p",null,"The cli command ",(0,i.kt)("inlineCode",{parentName:"p"},"tramvai update")," has been developed to update packages.\nThis command updates the versions of all ",(0,i.kt)("inlineCode",{parentName:"p"},"@tramvai/*")," and ",(0,i.kt)("inlineCode",{parentName:"p"},"@tramvai-tinkoff/*")," dependencies in the application, and tries to deduplicate the ",(0,i.kt)("inlineCode",{parentName:"p"},"lock")," file, adjusting to the package manager being used.\nMigrations are also triggered."),(0,i.kt)("p",null,"The cli command ",(0,i.kt)("inlineCode",{parentName:"p"},"tramvai add <packageName>")," is developed to install packages.\nThis command sets the specified ",(0,i.kt)("inlineCode",{parentName:"p"},"@tramvai/*")," or ",(0,i.kt)("inlineCode",{parentName:"p"},"@tramvai-tinkoff/*")," dependency of the desired version in the application, and tries to deduplicate in the ",(0,i.kt)("inlineCode",{parentName:"p"},"lock")," file, adjusting to the used package manager.\nMigrations are also triggered."),(0,i.kt)("h2",{id:"upgrading-to-a-latest-version"},"Upgrading to a latest version"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"tramvai update")," by default use ",(0,i.kt)("inlineCode",{parentName:"p"},"latest"),":"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-bash"},"tramvai update\n")),(0,i.kt)("h2",{id:"upgrading-to-a-prerelease-version"},"Upgrading to a prerelease version"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-bash"},"tramvai update prerelease\n")),(0,i.kt)("h2",{id:"upgrading-to-a-specific-version"},"Upgrading to a specific version"),(0,i.kt)("p",null,"Third argument allows you to specify the version range or exact version:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-bash"},"tramvai update ^1\n")),(0,i.kt)("p",null,"or"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-bash"},"tramvai update 1.0.0\n")),(0,i.kt)("h2",{id:"installing-the-new-tramvai-package-in-the-app"},"Installing the new tramvai package in the app"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"tramvai add <packageName>")," by default installs the package to ",(0,i.kt)("inlineCode",{parentName:"p"},"dependencies"),":"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-bash"},"npx tramvai add @tramvai/module-router\n")),(0,i.kt)("p",null,"The ",(0,i.kt)("inlineCode",{parentName:"p"},"--dev")," flag will install the package to ",(0,i.kt)("inlineCode",{parentName:"p"},"devDependencies"),":"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-bash"},"npx tramvai add @tramvai/test-unit --dev\n")),(0,i.kt)("h2",{id:"checking-tramvai-versions-in-the-app"},"Checking tramvai versions in the app"),(0,i.kt)("p",null,"The utility ",(0,i.kt)("inlineCode",{parentName:"p"},"@tramvai/tools-check-versions")," has been created to automatically check the synchronization of tramvai versions.\nTo check, you need to run the command:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-bash"},"yarn tramvai-check-versions\n")))}u.isMDXComponent=!0}}]);