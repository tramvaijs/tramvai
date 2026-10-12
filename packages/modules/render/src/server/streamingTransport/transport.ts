import { finished } from 'stream';
import { safeStringify } from '@tramvai/safe-strings';
import type { StreamingTransport } from '@tramvai/tokens-render';
import type {
  SERVER_RESPONSE_STREAM,
  SERVER_RESPONSE_TASK_MANAGER,
} from '@tramvai/tokens-server-private';
import { createStreamingRegistry } from '../../shared/streamingTransport/registry.inline';
import { STREAMING_REGISTRY_GLOBAL } from '../../shared/streamingTransport/constants';

const registry = `window.${STREAMING_REGISTRY_GLOBAL}`;

/**
 * Registry is created once in the page head, before any streamed data
 */
export const streamingRegistryInitScript = `${registry} = ${registry} || (${createStreamingRegistry})();`;

const noop = () => {};

/**
 * Only fields useful for debugging, without stack, headers and other request details
 */
const getErrorDetails = (error: unknown) => {
  if (!error || typeof error !== 'object') {
    return undefined;
  }

  const { name, message, status } = error as { name?: string; message?: string; status?: unknown };

  return {
    name,
    message,
    status: typeof status === 'number' ? status : undefined,
  };
};

/**
 * Methods for the render module only
 */
export interface ServerStreamingTransport extends StreamingTransport {
  /**
   * Application shell is placed into the response tasks queue, scripts can be written after it
   */
  onShellSent(): void;
  /**
   * Response stream timeout is exceeded, unsettled values are rejected
   */
  abort(reason: Error): void;
}

export const createStreamingTransport = ({
  responseTaskManager,
  responseStream,
}: {
  responseTaskManager: typeof SERVER_RESPONSE_TASK_MANAGER;
  responseStream: typeof SERVER_RESPONSE_STREAM;
}): ServerStreamingTransport => {
  let shellSent = false;
  const bufferedScripts: string[] = [];
  let abortDeadline: (reason: Error) => void = noop;
  const deadline = new Promise<never>((_, reject) => {
    abortDeadline = reject;
  });

  deadline.catch(noop);

  // scripts are written inside the application root, any script before the shell breaks hydration in React 18,
  // so they are buffered until the shell is placed into the response tasks queue
  const pushScript = (script: string) => {
    if (!shellSent) {
      bufferedScripts.push(script);
      return;
    }

    responseTaskManager.push(async () => {
      // stream can be already finished, e.g. when response was aborted
      if (responseStream.destroyed) {
        return;
      }

      responseStream.push(`<script>${script}</script>`);
    });
  };

  return {
    stream(key, promise) {
      responseTaskManager.push(() =>
        Promise.race([promise, deadline]).then(
          (data) => pushScript(`${registry}.resolve(${safeStringify(key)},${safeStringify(data)})`),
          (error) => {
            const details =
              process.env.NODE_ENV === 'development' ? getErrorDetails(error) : undefined;

            pushScript(
              details
                ? `${registry}.reject(${safeStringify(key)},${safeStringify(details)})`
                : `${registry}.reject(${safeStringify(key)})`
            );
          }
        )
      );
    },
    emit(channel, payload) {
      pushScript(`${registry}.emit(${safeStringify(channel)},${safeStringify(payload)})`);
    },
    onFinish(callback) {
      finished(responseStream, () => callback());
    },
    onShellSent() {
      shellSent = true;
      bufferedScripts.splice(0).forEach(pushScript);
    },
    abort(reason) {
      abortDeadline(reason);
    },
  };
};
