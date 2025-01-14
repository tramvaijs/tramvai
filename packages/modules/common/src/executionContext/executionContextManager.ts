import type {
  ExecutionContext,
  ExecutionContextManager as Interface,
  ExecutionContextOptions,
} from '@tramvai/tokens-common';
import { ExecutionAbortError } from '@tinkoff/errors';

const EMPTY_VALUES = {};

const normalizeOptions = (
  nameOrOptions: string | ExecutionContextOptions
): ExecutionContextOptions => {
  return typeof nameOrOptions === 'string' ? { name: nameOrOptions } : nameOrOptions;
};

export class ExecutionContextManager implements Interface {
  public async withContext<T>(
    parentContext: ExecutionContext | null,
    nameOrOptions: string | ExecutionContextOptions,
    cb: (context: ExecutionContext, abortController: AbortController) => Promise<T>
  ): Promise<T> {
    const options = normalizeOptions(nameOrOptions);
    const { name, values: selfValues = EMPTY_VALUES } = options;

    const contextName = parentContext ? `${parentContext.name}.${name}` : name;

    if (parentContext?.abortSignal.aborted) {
      throw new ExecutionAbortError({
        message: `Execution aborted in context "${contextName}"`,
        reason: parentContext.abortSignal.reason,
        contextName,
      });
    }

    const abortController = new AbortController();
    let abortListener: ((event: any) => void) | undefined;

    let values = selfValues;

    if (parentContext) {
      values = {
        ...parentContext.values,
        ...selfValues,
      };

      // In fact, type of event will be the `Event` from `lib.dom.d.ts`
      // but for the same reason, described in `node-abort-controller`,
      // we do not use it here
      abortListener = (event: any) => {
        abortController.abort(event.target.reason);
      };

      // Abort child context `AbortController` if parent `AbortController` was aborted
      parentContext.abortSignal.addEventListener('abort', abortListener);
    }

    const context: ExecutionContext = {
      name: contextName,
      abortSignal: abortController.signal,
      values,
    };

    try {
      return await cb(context, abortController);
    } catch (error: any) {
      if (typeof error === 'object' && !error.executionContextName) {
        error.executionContextName = context.name;
      }

      throw error;
    } finally {
      if (abortListener !== undefined && parentContext) {
        parentContext.abortSignal.removeEventListener('abort', abortListener);
      }
    }
  }
}
