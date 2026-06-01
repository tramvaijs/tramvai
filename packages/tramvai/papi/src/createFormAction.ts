import { createPapiMethod } from './createPapiMethod';
import type { PapiParameters } from './types';

export type FormActionParameters<Result = any, Deps = any, ErrorResult = any> = Omit<
  PapiParameters<Result, Deps>,
  'method'
>;

export const createFormAction = <Result = any, Deps = any>(
  formAction: FormActionParameters<Result, Deps>
) => {
  return createPapiMethod({ ...formAction, method: 'post' });
};
