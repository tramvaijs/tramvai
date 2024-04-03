import { createApp, createBundle, declareAction } from '@tramvai/core';
import { createEvent, createReducer, useStoreSelector, connect, useActions } from '@tramvai/state';
import { COMBINE_REDUCERS, CommonModule } from '@tramvai/module-common';
import { SpaRouterModule } from '@tramvai/module-router';
import { RenderModule } from '@tramvai/module-render';
import { ServerModule } from '@tramvai/module-server';
import { LogModule } from '@tramvai/module-log';

const selector = ({ id }) => id;
const rootEvent = createEvent('root');
const rootStore = createReducer('rootStore', { id: 0 }).on(rootEvent, ({ id }) => {
  return { id: id + 1 };
});
const childEvent = createEvent('child');
const childStore = createReducer('childStore', { id: 0 }).on(childEvent, ({ id }) => {
  return { id: id + 1 };
});
(rootStore as any).dependencies = [childStore];

const nonRegisteredStore = createReducer({
  name: 'nonRegistered',
  initialState: { value: 'initial' },
  events: {
    registerStore: () => ({ value: 'registered' }),
  },
});

const { registerStore } = nonRegisteredStore.events;

const action = declareAction({
  name: 'action',
  fn() {
    this.dispatch(childEvent());
    this.dispatch(rootEvent());
  },
});

const actionRegister = declareAction({
  name: 'register',
  fn() {
    this.dispatch(registerStore());
  },
  conditions: {
    always: true,
  },
});

const Child = connect([childStore], ({ childStore: { id } }) => ({ id }))((props: any) => {
  const state = props.id;

  if (state > 0) {
    throw new Error('');
  }

  return <div>{state}</div>;
});

const Root = () => {
  const state = useStoreSelector(rootStore, selector);
  const registeredState = useStoreSelector(nonRegisteredStore, ({ value }) => value);
  const act = useActions(action);

  return (
    <div>
      <div id="registered">{registeredState}</div>
      <div id="content">{state}</div>
      {state === 0 ? (
        <div>
          <Child />
        </div>
      ) : (
        <div id="updated">no child</div>
      )}
      <button id="button" type="button" onClick={act}>
        Act
      </button>
    </div>
  );
};

const bundle = createBundle({
  name: 'mainDefault',
  components: {
    pageDefault: Root,
  },
  actions: [actionRegister],
});

createApp({
  name: 'router',
  modules: [
    CommonModule,
    RenderModule,
    ServerModule,
    LogModule,
    SpaRouterModule.forRoot([{ name: 'root', path: '/' }]),
  ],
  providers: [
    {
      provide: COMBINE_REDUCERS,
      multi: true,
      useValue: [rootStore, childStore],
    },
  ],
  bundles: {
    mainDefault: () => Promise.resolve({ default: bundle }),
  },
});
