import { PapiResultCode } from './resultCode';

export type PapiOkResponse = {
  resultCode: PapiResultCode.OK;
  payload: Record<string, unknown>;
};

export type PapiErrorResponse = {
  resultCode: PapiResultCode.ERROR;
  error: Record<string, unknown>;
};

export type PapiRedirectResponse = {
  resultCode: PapiResultCode.REDIRECT;
  nextUrl: string;
};

export type PapiInternalErrorResponse = {
  resultCode: PapiResultCode.INTERNAL_ERROR;
  errorMessage: string;
};

/** This type is used to form JSON response body of Papi. */
export type PapiResponse =
  | PapiOkResponse
  | PapiErrorResponse
  | PapiRedirectResponse
  | PapiInternalErrorResponse;
