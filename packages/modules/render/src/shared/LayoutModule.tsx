import { Module, Scope } from '@tramvai/core';
import { createLayout, composeLayoutOptions } from '@tinkoff/layout-factory';
import {
  DEFAULT_LAYOUT_COMPONENT,
  DEFAULT_HEADER_COMPONENT,
  DEFAULT_FOOTER_COMPONENT,
  DEFAULT_ERROR_BOUNDARY_COMPONENT,
  LAYOUT_OPTIONS,
} from '@tramvai/tokens-render';

const RenderChildrenComponent = ({ children }) => children;

@Module({
  providers: [
    {
      provide: DEFAULT_LAYOUT_COMPONENT,
      scope: Scope.SINGLETON,
      useFactory: ({ layoutOptions }) => {
        const options = composeLayoutOptions(layoutOptions);
        return createLayout(options);
      },
      deps: {
        layoutOptions: { token: LAYOUT_OPTIONS, optional: true },
      },
    },
    {
      provide: 'componentDefaultList',
      scope: Scope.SINGLETON,
      multi: true,
      useFactory: (components) => ({
        ...components,
        nestedLayoutDefault: RenderChildrenComponent,
      }),
      deps: {
        layoutDefault: DEFAULT_LAYOUT_COMPONENT,
        footerDefault: { token: DEFAULT_FOOTER_COMPONENT, optional: true },
        headerDefault: { token: DEFAULT_HEADER_COMPONENT, optional: true },
        errorBoundaryDefault: { token: DEFAULT_ERROR_BOUNDARY_COMPONENT, optional: true },
      },
    },
  ],
})
export class LayoutModule {}
