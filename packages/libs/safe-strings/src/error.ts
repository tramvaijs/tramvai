export type AnyError = Error & { [key: string]: any };

export interface SerializedError {
  message: string;
  stack?: string;
  [key: string]: any;
}

export function serializeError(error: AnyError): SerializedError {
  return {
    ...error,
    message: error.message,
    stack: error.stack,
  };
}

export function deserializeError(serializedError: SerializedError): AnyError {
  const error = new Error(serializedError.message);
  Object.assign(error, serializedError);
  return error;
}
