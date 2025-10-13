/**
 * @jest-environment @tramvai/test-unit-jest/lib/jsdom-environment
 */
import React from 'react';

import { testHook, testComponent, act as globalAct } from '@tramvai/test-react';
import { useStore, createReducer, createEvent } from '@tramvai/state';

function createMockStore() {
  const event = createEvent<number>('update');
  const reducer = createReducer('test', { id: 1 });

  reducer.on(event, (_, payload) => ({ id: payload }));

  return {
    reducer,
    event,
  };
}

describe('useStore', () => {
  it('return reducer state', () => {
    const { reducer } = createMockStore();
    const { result } = testHook(() => useStore(reducer), { stores: [reducer] });

    expect(result.current).toEqual({ id: 1 });
  });

  it('subscribe to reducer changes', () => {
    const { reducer, event } = createMockStore();
    const { context, result, act } = testHook(() => useStore(reducer), { stores: [reducer] });

    act(() => {
      context.dispatch(event(2));
    });

    expect(result.current).toEqual({ id: 2 });
  });

  it('batch updates (React feature)', () => {
    const { reducer, event } = createMockStore();
    const watchRender = jest.fn();

    const Component = () => {
      const state = useStore(reducer);
      watchRender(state);
      return null;
    };

    const { context } = testComponent(<Component />);

    globalAct(() => {
      context.dispatch(event(2));
      context.dispatch(event(3));
      context.dispatch(event(4));
      context.dispatch(event(5));
    });

    expect(watchRender).toHaveBeenCalledTimes(2);
    expect(watchRender).toHaveBeenCalledWith({ id: 1 });
    expect(watchRender).toHaveBeenCalledWith({ id: 5 });
  });

  it('register new reducer', () => {
    const { reducer } = createMockStore();
    const { result } = testHook(() => useStore(createReducer('lazy', 1)), { stores: [reducer] });

    expect(result.current).toEqual(1);
  });

  it('delete previous lazy reducer', () => {
    let id = 1;

    const { context, result, rerender } = testHook(() => {
      return useStore(createReducer(`lazy id ${id}`, id));
    });

    ++id;
    rerender();

    expect(() => context.getStore('lazy id 1')).toThrow();
    expect(result.current).toEqual(2);

    --id;
    rerender();

    expect(() => context.getStore('lazy id 2')).toThrow();
    expect(result.current).toEqual(1);
  });

  it('zombie children safe (React feature)', () => {
    const { reducer } = createMockStore();
    const removeEvent = createEvent('remove');
    const listReducer = createReducer<Array<{ id: number }>>('list', [
      { id: 1 },
      { id: 2 },
      { id: 3 },
    ]);
    const mapReducer = createReducer<Record<number, string>>('map', {
      1: 'first',
      2: 'second',
      3: 'third',
    });

    listReducer.on(removeEvent, () => [{ id: 2 }, { id: 3 }]);
    mapReducer.on(removeEvent, () => ({ 2: 'second', 3: 'third' }));

    const watchParentRender = jest.fn();
    const watchChildRender = jest.fn();

    const ChildComponent = ({ id }: { id: number }) => {
      const map = useStore(mapReducer);
      watchChildRender(id, map[id]);
      return null;
    };
    const ParentComponent = () => {
      const list = useStore(listReducer);
      watchParentRender(list);

      return (
        <>
          {list.map((item) => (
            <ChildComponent id={item.id} key={item.id} />
          ))}
        </>
      );
    };

    const { context } = testComponent(<ParentComponent />, { stores: [reducer] });

    globalAct(() => {
      context.dispatch(removeEvent());
    });

    expect(watchParentRender).toHaveBeenCalledTimes(2);
    expect(watchParentRender).toHaveBeenCalledWith([{ id: 1 }, { id: 2 }, { id: 3 }]);
    expect(watchParentRender).toHaveBeenCalledWith([{ id: 2 }, { id: 3 }]);

    expect(watchChildRender).toHaveBeenCalledTimes(5);
    expect(watchChildRender).toHaveBeenCalledWith(1, 'first');
    expect(watchChildRender).toHaveBeenCalledWith(2, 'second');
    expect(watchChildRender).toHaveBeenCalledWith(3, 'third');
    expect(watchChildRender).toHaveBeenCalledWith(2, 'second');
    expect(watchChildRender).toHaveBeenCalledWith(3, 'third');
  });
});
