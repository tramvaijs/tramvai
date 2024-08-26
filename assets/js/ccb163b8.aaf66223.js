"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[9361],{3905:function(e,t,n){n.d(t,{Zo:function(){return l},kt:function(){return d}});var o=n(7294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,o)}return n}function r(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function p(e,t){if(null==e)return{};var n,o,a=function(e,t){if(null==e)return{};var n,o,a={},i=Object.keys(e);for(o=0;o<i.length;o++)n=i[o],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(o=0;o<i.length;o++)n=i[o],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var m=o.createContext({}),s=function(e){var t=o.useContext(m),n=t;return e&&(n="function"==typeof e?e(t):r(r({},t),e)),n},l=function(e){var t=s(e.components);return o.createElement(m.Provider,{value:t},e.children)},c={inlineCode:"code",wrapper:function(e){var t=e.children;return o.createElement(o.Fragment,{},t)}},u=o.forwardRef((function(e,t){var n=e.components,a=e.mdxType,i=e.originalType,m=e.parentName,l=p(e,["components","mdxType","originalType","parentName"]),u=s(n),d=a,h=u["".concat(m,".").concat(d)]||u[d]||c[d]||i;return n?o.createElement(h,r(r({ref:t},l),{},{components:n})):o.createElement(h,r({ref:t},l))}));function d(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=n.length,r=new Array(i);r[0]=u;var p={};for(var m in t)hasOwnProperty.call(t,m)&&(p[m]=t[m]);p.originalType=e,p.mdxType="string"==typeof e?e:a,r[1]=p;for(var s=2;s<i;s++)r[s]=n[s];return o.createElement.apply(null,r)}return o.createElement.apply(null,n)}u.displayName="MDXCreateElement"},6514:function(e,t,n){n.r(t),n.d(t,{assets:function(){return m},contentTitle:function(){return r},default:function(){return c},frontMatter:function(){return i},metadata:function(){return p},toc:function(){return s}});var o=n(7462),a=(n(7294),n(3905));const i={id:"dynamic-page",title:"Page with dynamic parameters"},r=void 0,p={unversionedId:"tutorial/dynamic-page",id:"tutorial/dynamic-page",title:"Page with dynamic parameters",description:"In this tutorial, we will create a page with detailed information about the pokemon, available at the url /pokemon/:name.",source:"@site/tmp-docs/02-tutorial/05-dynamic-page.md",sourceDirName:"02-tutorial",slug:"/tutorial/dynamic-page",permalink:"/docs/tutorial/dynamic-page",draft:!1,editUrl:"https://github.com/tramvaijs/tramvai/-/edit/master/docs/tmp-docs/02-tutorial/05-dynamic-page.md",tags:[],version:"current",sidebarPosition:5,frontMatter:{id:"dynamic-page",title:"Page with dynamic parameters"},sidebar:"sidebar",previous:{title:"Fetch data",permalink:"/docs/tutorial/fetch-data"},next:{title:"Styling",permalink:"/docs/tutorial/styling"}},m={},s=[],l={toc:s};function c(e){let{components:t,...n}=e;return(0,a.kt)("wrapper",(0,o.Z)({},l,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"In this tutorial, we will create a page with detailed information about the pokemon, available at the url ",(0,a.kt)("inlineCode",{parentName:"p"},"/pokemon/:name"),".\nThe ",(0,a.kt)("inlineCode",{parentName:"p"},"pokeapi")," gives us information about the pokemon's elements, and its basic parameters, and we will try to display this information.\nTo create a url with dynamic parameters, the dynamic part of the path to the page component must be in square brackets, e.g. for the url ",(0,a.kt)("inlineCode",{parentName:"p"},"/pokemon/:name")," you have to create a component at the path ",(0,a.kt)("inlineCode",{parentName:"p"},"routes/pokemon/[name]/index.tsx"),"."),(0,a.kt)("p",null,"\u231b Create empty page component:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-tsx",metastring:'title="routes/pokemon/[name]/index.tsx"',title:'"routes/pokemon/[name]/index.tsx"'},"import React from 'react';\n\nexport const PokemonView = () => {\n  return <>Hi! This is PokemonView component :)</>;\n};\n\nexport default PokemonView;\n")),(0,a.kt)("p",null,"After that, you can click on any of the pokemon on the homepage ",(0,a.kt)("inlineCode",{parentName:"p"},"http://localhost:3000/")," and after going to ",(0,a.kt)("inlineCode",{parentName:"p"},"http://localhost:3000/pokemon/bulbasaur/")," you will see the ",(0,a.kt)("inlineCode",{parentName:"p"},"PokemonView")," component."),(0,a.kt)("p",null,"It's time to download more pokemon information!\nThe service ",(0,a.kt)("inlineCode",{parentName:"p"},"PAGE_SERVICE_TOKEN")," will be used to get the dynamic parameters of the current route."),(0,a.kt)("p",null,"\u231b Add a new action to the pokemon entity to load data using dynamic parameters from the route:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-tsx",metastring:'title="entities/pokemon/model.ts"',title:'"entities/pokemon/model.ts"'},"// highlight-next-line\nimport { PAGE_SERVICE_TOKEN } from '@tramvai/tokens-router';\n\nexport const fetchPokemonAction = declareAction({\n  name: 'fetchPokemon',\n  async fn() {\n    // access to the `:name` parameter of the current route via PAGE_SERVICE_TOKEN\n    // highlight-next-line\n    const { name } = this.deps.pageService.getCurrentRoute().params;\n\n    // loading information about the pokemon\n    const pokemonResponse = await this.deps.pokeapiHttpClient.get<Pokemon>(`/pokemon/${name}`);\n\n    // save information about the pokemon in the store\n    this.dispatch(pokemonLoadedEvent(pokemonResponse.payload));\n  },\n  deps: {\n    pokeapiHttpClient: POKEAPI_HTTP_CLIENT,\n    // highlight-next-line\n    pageService: PAGE_SERVICE_TOKEN,\n  },\n  conditions: {\n    // disable caching of the action, since it must be executed again for different name values\n    dynamic: true,\n  },\n});\n")),(0,a.kt)("admonition",{type:"tip"},(0,a.kt)("p",{parentName:"admonition"},"You can read more about the need to add an ",(0,a.kt)("inlineCode",{parentName:"p"},"dynamic")," condition to an action that depends on page parameters in ",(0,a.kt)("a",{parentName:"p",href:"/docs/concepts/action#peculiarities"},"Action documentation"))),(0,a.kt)("p",null,"\u231b Connect action to a page:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-tsx",metastring:'title="pages/pokemon/index.tsx"',title:'"pages/pokemon/index.tsx"'},"import React from 'react';\n// highlight-next-line\nimport { fetchPokemonAction } from '~entities/pokemon';\n\nexport const PokemonView = () => {\n  return <>Hi! This is PokemonView component :)</>;\n};\n\n// highlight-next-line\nPokemonView.actions = [fetchPokemonAction];\n\nexport default PokemonView;\n")),(0,a.kt)("p",null,"Before render Pokemon data, it is worth extending our ",(0,a.kt)("inlineCode",{parentName:"p"},"Pokemon")," interface."),(0,a.kt)("p",null,"\u231b Complete the ",(0,a.kt)("inlineCode",{parentName:"p"},"Pokemon")," interface:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-tsx",metastring:'title="entities/pokemon/model.ts"',title:'"entities/pokemon/model.ts"'},"export type Pokemon = {\n  id: number;\n  name: string;\n  // highlight-start\n  stats: PokemonStat[];\n  types: PokemonType[];\n// highlight-end\n};\n\n// highlight-start\nexport type PokemonStat = {\n  // characteristic value\n  base_stat: number;\n  // characteristic name\n  stat: { name: string };\n};\n// highlight-end\n\n// highlight-start\nexport type PokemonType = {\n  // element type\n  type: { name: string };\n};\n// highlight-end\n")),(0,a.kt)("p",null,"To get ",(0,a.kt)("inlineCode",{parentName:"p"},"PAGE_SERVICE_TOKEN")," from the DI in the component, we'll use the ",(0,a.kt)("inlineCode",{parentName:"p"},"useDi")," hook."),(0,a.kt)("p",null,"\u231b Add code to get information about the pokemon in ",(0,a.kt)("inlineCode",{parentName:"p"},"PokemonView"),":"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-tsx",metastring:'title="pages/pokemon/index.tsx"',title:'"pages/pokemon/index.tsx"'},"import React from 'react';\n// highlight-start\nimport { useStoreSelector } from '@tramvai/state';\nimport { useRoute } from '@tinkoff/router';\n// highlight-end\nimport { fetchPokemonAction } from '~entities/pokemon';\n\nexport const PokemonView = () => {\n  // highlight-start\n  // access to the `:name` parameter of the current route via `useRoute` hook\n  const { name } = useRoute().params;\n  // get information about a specific pokemon\n  const pokemon = useStoreSelector(PokemonsStore, (pokemons) => pokemons[name]);\n  // highlight-end\n\n  return <>Hi! This is PokemonView component :)</>;\n}\n\nPokemonView.actions = [fetchPokemonAction];\n\nexport default PokemonView;\n")),(0,a.kt)("p",null,"\u231b And render all the data on the page:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-tsx",metastring:'title="pages/pokemon/index.tsx"',title:'"pages/pokemon/index.tsx"'},"import React from 'react';\nimport { useStoreSelector } from '@tramvai/state';\n// highlight-next-line\nimport { Link } from '@tramvai/module-router';\nimport { useRoute } from '@tinkoff/router';\n// highlight-next-line\nimport type { Pokemon, PokemonStat } from '~entities/pokemon';\nimport { fetchPokemonAction, PokemonsStore } from '~entities/pokemon';\n\n// highlight-start\n// utility to search for characteristics, will allow us to draw only some\nconst findStatByName = (\n  pokemon: Pokemon,\n  statKey: string\n): PokemonStat | undefined => {\n  return pokemon.stats.find((stat) => statKey === stat.stat.name);\n};\n// highlight-end\n\nexport const PokemonView = () => {\n  const { name } = useRoute().params;\n  const pokemon = useStoreSelector(PokemonsStore, (pokemons) => pokemons[name]);\n\n  // highlight-start\n  // If there is no information about the pokemon, consider it to be loading\n  if (!pokemon) {\n    return <div>Loading...</div>;\n  }\n\n  const hpStat = findStatByName(pokemon, 'hp');\n  const attackStat = findStatByName(pokemon, 'attack');\n  const defenseStat = findStatByName(pokemon, 'defense');\n  const speedStat = findStatByName(pokemon, 'speed');\n\n  return (\n    <div>\n      <div>\n        <Link url=\"/\">Return to list</Link>\n      </div>\n      <img\n        alt={pokemon.name}\n        width={200}\n        height={200}\n        src={`https://img.pokemondb.net/artwork/large/${pokemon.name}.jpg`}\n      />\n      <h2>{pokemon.name}</h2>\n      <div>\n        <p>Stats</p>\n        <ul>\n          {hpStat && <li>HP: {hpStat.base_stat}</li>}\n          {attackStat && <li>Attack: {attackStat.base_stat}</li>}\n          {defenseStat && <li>Defense: {defenseStat.base_stat}</li>}\n          {speedStat && <li>Speed: {speedStat.base_stat}</li>}\n        </ul>\n      </div>\n      <div>\n        <p>Types</p>\n        <ul>\n          {pokemon.types.map((type) => {\n            const typeKey = type.type.name;\n            return (\n              <li key={typeKey} data-type={typeKey}> {typeKey} </li>\n            );\n          })}\n        </ul>\n      </div>\n    </div>\n  );\n  // highlight-end\n}\n\nPokemonView.actions = [fetchPokemonAction];\n\nexport default PokemonView;\n")),(0,a.kt)("p",null,"Done!"),(0,a.kt)("p",null,"Now you can go to the ",(0,a.kt)("inlineCode",{parentName:"p"},"http://localhost:3000/pokemon/bulbasaur/")," page, where you will find detailed information about this wonderful creature :)"),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("a",{parentName:"strong",href:"/docs/tutorial/styling"},"Next lesson"))))}c.isMDXComponent=!0}}]);