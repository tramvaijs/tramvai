import { createEvent, createReducer } from '@tramvai/state';

export type FormActionSuccessResult = {
  data: Record<string, unknown>;
};
export type FormActionErrorResult = {
  error: Record<string, unknown>;
};
export type FormActionResult = FormActionSuccessResult | FormActionErrorResult;

export const setFormActionResult = createEvent<FormActionResult>('setFormActionResult');

export const FormActionResultStore = createReducer<FormActionResult | undefined>(
  'formActionResult',
  undefined
).on(setFormActionResult, (_, payload) => payload);
