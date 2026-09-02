/**
 * @jest-environment @tramvai/test-unit-jest/lib/jsdom-environment
 */
import { processStreamedEvents } from './processStreamedEvents';

describe('client/processStreamedEvents', () => {
  const createDeps = () => {
    const dispatched: any[] = [];
    const store = {
      dispatch: jest.fn((event: any) => {
        dispatched.push(event);
        return event.payload;
      }),
    } as any;
    const MyReducerStore = { storeName: 'myReducer' };
    const dispatcher = { stores: { myReducer: MyReducerStore } } as any;

    return { store, dispatcher, dispatched, MyReducerStore };
  };

  afterEach(() => {
    delete (window as any).__TRAMVAI_STREAMED_EVENTS;
  });

  it('replays accumulated queue and maps storeName -> reducer class', () => {
    const { store, dispatcher, dispatched, MyReducerStore } = createDeps();

    (window as any).__TRAMVAI_STREAMED_EVENTS = {
      queue: [{ type: 'myReducer_success', payload: { a: 1 }, store: 'myReducer' }],
      push(event: any) {
        this.queue.push(event);
      },
    };

    processStreamedEvents({ store, dispatcher });

    expect(dispatched).toHaveLength(1);
    expect(dispatched[0]).toEqual({
      type: 'myReducer_success',
      payload: { a: 1 },
      store: MyReducerStore,
    });
    expect((window as any).__TRAMVAI_STREAMED_EVENTS.queue).toHaveLength(0);
  });

  it('passes store: null when reducer is not registered', () => {
    const { store, dispatcher, dispatched } = createDeps();

    (window as any).__TRAMVAI_STREAMED_EVENTS = {
      queue: [{ type: 'unknown_event', payload: 1, store: 'notRegistered' }],
      push(event: any) {
        this.queue.push(event);
      },
    };

    processStreamedEvents({ store, dispatcher });

    expect(dispatched[0].store).toBeNull();
  });

  it('swaps push to direct dispatch for events arriving after processing', () => {
    const { store, dispatcher, dispatched, MyReducerStore } = createDeps();

    (window as any).__TRAMVAI_STREAMED_EVENTS = {
      queue: [],
      push(event: any) {
        this.queue.push(event);
      },
    };

    processStreamedEvents({ store, dispatcher });

    (window as any).__TRAMVAI_STREAMED_EVENTS.push({
      type: 'myReducer_success',
      payload: { b: 2 },
      store: 'myReducer',
    });

    expect(dispatched).toHaveLength(1);
    expect(dispatched[0]).toEqual({
      type: 'myReducer_success',
      payload: { b: 2 },
      store: MyReducerStore,
    });
  });

  it('does not break the queue when a single dispatch throws', () => {
    const { dispatcher } = createDeps();
    const dispatched: any[] = [];
    const store = {
      dispatch: jest.fn((event: any) => {
        if (event.type === 'boom') {
          throw new Error('boom');
        }
        dispatched.push(event);
      }),
    } as any;

    (window as any).__TRAMVAI_STREAMED_EVENTS = {
      queue: [
        { type: 'boom', payload: null, store: null },
        { type: 'myReducer_success', payload: { c: 3 }, store: 'myReducer' },
      ],
      push(event: any) {
        this.queue.push(event);
      },
    };

    expect(() => processStreamedEvents({ store, dispatcher })).not.toThrow();
    expect(dispatched).toHaveLength(1);
    expect(dispatched[0].type).toBe('myReducer_success');
  });
});
