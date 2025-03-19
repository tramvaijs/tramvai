/**
 * @jest-environment jsdom
 */

import React, { act } from 'react';
import type { Root } from 'react-dom/client';
import { hydrateRoot } from 'react-dom/client';
import { LazyRender } from './lazy-render';
import { mockIntersectionObserver } from '../mocks/mock-intersection-observer';

//@ts-expect-error
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('./use-observer-visible', () => {
  return require('./use-observer-visible.browser');
});

const Content = ({ onClick }: { onClick?(): void }) => (
  <section>
    <h1 onClick={onClick}>Original markup</h1>
  </section>
);

describe('ProgressiveRenderer', () => {
  let reactRoot: Root | null;
  let root: HTMLElement | null;
  beforeEach(() => {
    document.body.innerHTML =
      '<div id="root"><div><section><h1>Original markup</h1></section></div></div>';
    root = document.getElementById('root');
  });

  afterEach(() => {
    mockIntersectionObserver.clear();
    act(() => {
      reactRoot?.unmount();
    });
    reactRoot = null;
    root = null;
  });

  it('render original markup', () => {
    act(() => {
      reactRoot = hydrateRoot(
        root!,
        <LazyRender>
          <Content />
        </LazyRender>
      );
    });

    expect(root?.innerHTML).toMatchInlineSnapshot(
      `"<div><section><h1>Original markup</h1></section></div>"`
    );
  });

  it('custom observer mechanism', async () => {
    const useObserver = () => {
      const [isVisible, changeVisibility] = React.useState(false);
      React.useEffect(() => {
        setTimeout(() => changeVisibility(true), 0);
      });
      return isVisible;
    };

    act(() => {
      hydrateRoot(
        root!,
        <LazyRender useObserver={useObserver}>
          <Content />
          Custom text
        </LazyRender>
      );
    });
    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(root?.innerHTML).toMatchInlineSnapshot(
      `"<div><section><h1>Original markup</h1></section>Custom text</div>"`
    );
  });

  it('hydrate client markup on static mode', () => {
    const mockOnClick = jest.fn();

    act(() => {
      hydrateRoot(
        root!,
        <LazyRender mode="static">
          <Content onClick={mockOnClick} />
        </LazyRender>
      );
    });

    const h1 = root?.querySelector('h1');

    h1?.click();

    expect(mockOnClick.mock.calls.length).toBe(1);
  });

  it('hydrate client markup when block is visible', () => {
    const mockOnClick = jest.fn();

    act(() => {
      hydrateRoot(
        root!,
        <LazyRender>
          <Content onClick={mockOnClick} />
        </LazyRender>
      );
    });

    act(() => {
      mockIntersectionObserver.trigger([{ isIntersecting: true }]);
    });

    const h1 = root?.querySelector('h1');

    h1?.click();

    expect(mockOnClick.mock.calls.length).toBe(1);
  });

  it('prevent hydrate client markup when block is hidden', () => {
    const mockOnClick = jest.fn();

    act(() => {
      hydrateRoot(
        root!,
        <LazyRender>
          <Content onClick={mockOnClick} />
        </LazyRender>
      );
    });

    act(() => {
      mockIntersectionObserver.trigger([{ isIntersecting: false }]);
    });

    const h1 = root?.querySelector('h1');

    h1?.click();

    expect(mockOnClick.mock.calls.length).toBe(0);
  });
});
