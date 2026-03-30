# @tinkoff/meta-tags-generate

Library for generating and updating meta-tags in browser.

Link to complete SEO and Meta documentation - https://tramvai.dev/docs/features/seo/

## Api

- `Meta({ list: [] }): Meta` - object used for constructing an instance of meta-tags based on passed sources
- `Render(meta: Meta): { render(options?: { placement?: TagPlacement }): string }` - render of specific _Meta_ instance as a string. Used in SSR. By default renders tags intended for `<head>`, but can also render tags for `<body>` (e.g. `jsonLd`) if `{ placement: 'body' }` is passed.
- `Update(meta: Meta): { update(options?: { placement?: TagPlacement }): void }` - updates meta-tags layout in browser. Used in browser while SPA-navigations. By default updates tags intended for `<head>`, but can also update tags for `<body>` (e.g. `jsonLd`) if `{ placement: 'body' }` is passed.
