"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[9766],{3905:(e,t,i)=>{i.d(t,{Zo:()=>d,kt:()=>u});var a=i(7294);function n(e,t,i){return t in e?Object.defineProperty(e,t,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[t]=i,e}function r(e,t){var i=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),i.push.apply(i,a)}return i}function o(e){for(var t=1;t<arguments.length;t++){var i=null!=arguments[t]?arguments[t]:{};t%2?r(Object(i),!0).forEach((function(t){n(e,t,i[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(i)):r(Object(i)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(i,t))}))}return e}function s(e,t){if(null==e)return{};var i,a,n=function(e,t){if(null==e)return{};var i,a,n={},r=Object.keys(e);for(a=0;a<r.length;a++)i=r[a],t.indexOf(i)>=0||(n[i]=e[i]);return n}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(a=0;a<r.length;a++)i=r[a],t.indexOf(i)>=0||Object.prototype.propertyIsEnumerable.call(e,i)&&(n[i]=e[i])}return n}var l=a.createContext({}),m=function(e){var t=a.useContext(l),i=t;return e&&(i="function"==typeof e?e(t):o(o({},t),e)),i},d=function(e){var t=m(e.components);return a.createElement(l.Provider,{value:t},e.children)},p={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},c=a.forwardRef((function(e,t){var i=e.components,n=e.mdxType,r=e.originalType,l=e.parentName,d=s(e,["components","mdxType","originalType","parentName"]),c=m(i),u=n,f=c["".concat(l,".").concat(u)]||c[u]||p[u]||r;return i?a.createElement(f,o(o({ref:t},d),{},{components:i})):a.createElement(f,o({ref:t},d))}));function u(e,t){var i=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var r=i.length,o=new Array(r);o[0]=c;var s={};for(var l in t)hasOwnProperty.call(t,l)&&(s[l]=t[l]);s.originalType=e,s.mdxType="string"==typeof e?e:n,o[1]=s;for(var m=2;m<r;m++)o[m]=i[m];return a.createElement.apply(null,o)}return a.createElement.apply(null,i)}c.displayName="MDXCreateElement"},9238:(e,t,i)=>{i.r(t),i.d(t,{assets:()=>d,contentTitle:()=>l,default:()=>u,frontMatter:()=>s,metadata:()=>m,toc:()=>p});var a=i(7462),n=i(3366),r=(i(7294),i(3905)),o=["components"],s={id:"migration",title:"Automatic migrations",sidebar_position:4},l=void 0,m={unversionedId:"features/migration",id:"features/migration",title:"Automatic migrations",description:"Automatic migrations allow you to update the code and application settings when updating versions of tram modules or packages in the application itself.",source:"@site/tmp-docs/features/migration.md",sourceDirName:"features",slug:"/features/migration",permalink:"/docs/features/migration",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/get-started/overview.md/tmp-docs/features/migration.md",tags:[],version:"current",sidebarPosition:4,frontMatter:{id:"migration",title:"Automatic migrations",sidebar_position:4},sidebar:"sidebar",previous:{title:"File-System Pages",permalink:"/docs/features/routing/file-system-pages"},next:{title:"Bundle optimization",permalink:"/docs/guides/bundle-optimization"}},d={},p=[{value:"Why migrations are needed",id:"why-migrations-are-needed",level:2},{value:"How to use migrations",id:"how-to-use-migrations",level:2},{value:"How to disable migrations",id:"how-to-disable-migrations",level:2},{value:"How migrations work",id:"how-migrations-work",level:2},{value:"Q/A",id:"qa",level:2},{value:"Do I need to store <code>.tramvai-migrate-applied.json</code> in VCS?",id:"do-i-need-to-store-tramvai-migrate-appliedjson-in-vcs",level:3}],c={toc:p};function u(e){var t=e.components,i=(0,n.Z)(e,o);return(0,r.kt)("wrapper",(0,a.Z)({},c,i,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"Automatic migrations allow you to update the code and application settings when updating versions of tram modules or packages in the application itself."),(0,r.kt)("h2",{id:"why-migrations-are-needed"},"Why migrations are needed"),(0,r.kt)("p",null,"Sometimes in the tram there is a need to make some kind of breaking changes and to simplify such a transition for end users, automatic migrations are used. Migrations allow you to transfer the application codebase to a new version of the interfaces in an automatic mode and practically without the participation of developers."),(0,r.kt)("h2",{id:"how-to-use-migrations"},"How to use migrations"),(0,r.kt)("p",null,"Migrations are performed automatically when new versions of tram packages are installed. The file ",(0,r.kt)("inlineCode",{parentName:"p"},".tramvai-migrate-applied.json")," in the root of the project is used to save information about migrations that have already been performed."),(0,r.kt)("p",null,"All that remains for application developers to do is:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},"study the doc on ",(0,r.kt)("a",{parentName:"li",href:"https://tramvai.dev/docs/releases/migration"},"latest migrations for packages")),(0,r.kt)("li",{parentName:"ul"},"commit changes in the file ",(0,r.kt)("inlineCode",{parentName:"li"},".tramvai-migrate-applied.json"),", because it saves information about completed migrations and it is better to save it so as not to perform migrations again"),(0,r.kt)("li",{parentName:"ul"},"if after migrations ",(0,r.kt)("inlineCode",{parentName:"li"},"package.json")," has changed, then you need to install packages to update the lock file in the project."),(0,r.kt)("li",{parentName:"ul"},"review and commit all other changes that have occurred in the project (review is necessary because it is difficult to take into account all use cases in the migration, and also the result after the code transformation may not correspond to the linter settings in the current project)."),(0,r.kt)("li",{parentName:"ul"},"check the application for problems and make changes in accordance with the migration dock")),(0,r.kt)("h2",{id:"how-to-disable-migrations"},"How to disable migrations"),(0,r.kt)("p",null,"Add environment variable ",(0,r.kt)("inlineCode",{parentName:"p"},"SKIP_TRAMVAI_MIGRATIONS")," before starting package installation."),(0,r.kt)("h2",{id:"how-migrations-work"},"How migrations work"),(0,r.kt)("p",null,"1.",(0,r.kt)("inlineCode",{parentName:"p"},"@tramvai/core")," contains the dependency ",(0,r.kt)("inlineCode",{parentName:"p"},"@tramvai/tools-migrate"),"\n1.",(0,r.kt)("inlineCode",{parentName:"p"},"@tramvai/tools-migrate")," contains a script that runs on 'postinstall'\n1.script analyzes tramvai modules in 'node_modules' and find all migrations\n1.further the file ",(0,r.kt)("inlineCode",{parentName:"p"},".tramvai-migrate-applied.json")," is checked and a list of already selected migrations is taken from it if such a file exists\n1.The code of migrations that are not in the list of completed ones is executed. Migrations are performed sequentially\n1.in the file ",(0,r.kt)("inlineCode",{parentName:"p"},".tramvai-migrate-applied.json")," is added information about the migrations just performed, if the file was before, or this file is created"),(0,r.kt)("h2",{id:"qa"},"Q/A"),(0,r.kt)("h3",{id:"do-i-need-to-store-tramvai-migrate-appliedjson-in-vcs"},"Do I need to store ",(0,r.kt)("inlineCode",{parentName:"h3"},".tramvai-migrate-applied.json")," in VCS?"),(0,r.kt)("p",null,"Yes, otherwise, during the next migrations, we will not know which migrations have already been performed and repeated migrations will be performed"))}u.isMDXComponent=!0}}]);