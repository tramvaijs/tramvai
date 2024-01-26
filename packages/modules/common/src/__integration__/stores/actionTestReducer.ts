import { createEvent, createReducer } from '@tramvai/state';

export enum ActionStatus {
  notInitialized = 'notInitialized',
  startPagePending = 'startPagePending',
  startPageResolved = 'startPageResolved',
  startPageAborted = 'startPageAborted',
  endPagePending = 'endPagePending',
  endPageResolved = 'endPageResolved',
}

export type ActionsInitialState = {
  actionStatus: ActionStatus[];
  actionExecutionOnServerResult: string[];
  actionExecutionOnClientResult: string[];
};

const initialState: ActionsInitialState = {
  actionStatus: [ActionStatus.notInitialized],
  actionExecutionOnServerResult: [],
  actionExecutionOnClientResult: [],
};

export const actionsReducer = createReducer({
  name: 'testAction',
  initialState,
  events: {
    setSharedActionStatus: (state, actionStatus: ActionStatus) => ({
      ...state,
      actionStatus: [...state.actionStatus, actionStatus],
    }),
    pushToActionExecutionOnServerResult: (state, payload: string) => ({
      ...state,
      actionExecutionOnServerResult: [...state.actionExecutionOnServerResult, payload],
    }),
    pushToActionExecutionOnClientResult: (state, payload: string) => ({
      ...state,
      actionExecutionOnClientResult: [...state.actionExecutionOnClientResult, payload],
    }),
  },
});

export const {
  pushToActionExecutionOnServerResult,
  pushToActionExecutionOnClientResult,
  setSharedActionStatus,
} = actionsReducer.events;
