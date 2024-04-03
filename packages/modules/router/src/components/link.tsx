import type { ReactNode, AnchorHTMLAttributes } from 'react';
import { isValidElement, cloneElement, useCallback, useState } from 'react';
import { useNavigate } from '@tinkoff/router';
import type { NavigateOptions } from '@tinkoff/router';

import { usePrefetch } from '../hooks/usePrefetch';

type AnchorLinkProps = Pick<AnchorHTMLAttributes<HTMLAnchorElement>, 'id' | 'className' | 'style'>;

interface Props extends Partial<AnchorLinkProps> {
  // если передан react элемент, то он будет использован в качестве компонента для рендера и в него будут переданы аргументы href и onClick
  // иначе будет отрендерен html-элемент <a> с переданной ссылкой и текстом из children
  children?: ReactNode;
  // урл для перехода
  url: string;
  // get-параметры для перехода
  query?: Record<string, string>;
  // должен ли новый урл заменить текущий в истории, или нужно добавить новый переход в историю
  replace?: boolean;
  // target свойства тега <a>
  target?: string;
  // калбек, при клике на ссылку
  onClick?: Function;
  // дополнительные опции перехода
  navigateOptions?: Partial<NavigateOptions>;
  /**
   * @description enable or disable target page resources prefetching
   * @default true
   */
  prefetch?: boolean;

  /**
   * @description enable view transition for underlying navigation
   * @default false
   */
  viewTransition?: boolean;
}

function Link(props: Props) {
  const {
    children,
    onClick,
    url,
    query,
    replace,
    target,
    navigateOptions,
    prefetch = true,
    viewTransition = false,
    ...otherProps
  } = props;
  const navigate = useNavigate({ url, query, replace, viewTransition, ...navigateOptions });
  const [linkElement, setLinkElement] = useState(null);

  usePrefetch({
    url,
    prefetch,
    target: linkElement,
  });

  const handleClick = useCallback(
    (event) => {
      // ignores the navigation when clicked using right mouse button or
      // by holding a special modifier key: ctrl, command, win, alt, shift
      if (
        target ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.shiftKey ||
        event.button !== 0
      ) {
        return;
      }

      event.preventDefault();
      navigate();
      onClick && onClick(event);
    },
    [navigate, target, onClick]
  );

  const extraProps = {
    href: url,
    onClick: handleClick,
    target,
  };

  if (isValidElement(children)) {
    return cloneElement(children, {
      // @ts-expect-error
      ref: (element) => {
        // @ts-expect-error
        const { ref } = children;

        // preserve original ref
        if (typeof ref === 'function') {
          ref(element);
        } else if (typeof ref === 'object' && ref !== null) {
          ref.current = element;
        }

        setLinkElement(element);
      },
      ...extraProps,
    });
  }

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <a ref={(element) => setLinkElement(element)} {...otherProps} {...extraProps}>
      {children}
    </a>
  );
}

Link.displayName = 'Link';

export { Link };
