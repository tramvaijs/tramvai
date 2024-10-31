import { useMemo } from 'react';
import type { Container } from '@tinkoff/dippy';
import type { ComponentType } from 'react';
import { DIContext } from '@tramvai/react';
import { EXTEND_RENDER } from '@tramvai/tokens-render';
import { CHILD_APP_RENDER_CHILDREN_TOKEN } from '@tramvai/tokens-child-app';

export interface WrapperProps<T extends Record<string, any>> {
  di: Container;
  props: T;
}

export const renderWrapper = <T extends Record<string, any>>(
  ChildAppComponent: ComponentType<T>
) => {
  return ({ di, props }: WrapperProps<T>) => {
    const Wrapper = useMemo(() => {
      const wrappers = di.get({
        token: EXTEND_RENDER,
        optional: true,
      });

      const ChildAppChildren = di.get({
        token: CHILD_APP_RENDER_CHILDREN_TOKEN,
        optional: true,
      });

      let Result = ChildAppChildren ? (
        <ChildAppComponent {...props}>
          <ChildAppChildren di={di} {...props} />
        </ChildAppComponent>
      ) : (
        <ChildAppComponent {...props} />
      );

      if (wrappers !== null) {
        for (const wrapper of wrappers) {
          Result = wrapper(Result);
        }
      }

      return Result;
    }, [di, props]);

    return <DIContext.Provider value={di}>{Wrapper}</DIContext.Provider>;
  };
};
