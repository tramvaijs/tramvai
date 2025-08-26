import { parentPort, workerData } from 'node:worker_threads';
import { logger } from './logger';
import { enumerateErrorProperties } from '../utils/errors';

const { endpoint, debug, dryRun } = workerData;

const queue: Promise<any>[] = [];

parentPort?.on('message', async (message) => {
  switch (message.event) {
    case 'SEND_EVENT': {
      sendEvent(message.payload);
      break;
    }
    case 'EXIT': {
      await Promise.allSettled(queue);
      parentPort?.postMessage({ event: 'SHUTDOWN_COMPLETE' });
      process.exit(0);
      break;
    }
  }
});

async function sendEvent(event: Record<string, any>) {
  try {
    if (debug || dryRun) {
      logger.event({
        type: event.level.toLowerCase() as 'error' | 'warning' | 'info',
        event: event.event,
        message: event.message,
        payload: event,
      });
    }

    if ('error' in event && event.error instanceof Error) {
      enumerateErrorProperties(event.error);
    }

    if (!dryRun) {
      const abortController = new AbortController();
      setTimeout(() => abortController.abort(new Error('request timeout')), 5000);

      const request = fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([event]),
        signal: abortController.signal,
      });

      queue.push(request);

      const response = await request;

      if (!response.ok || response.status >= 400) {
        logger.event({
          type: 'error',
          event: 'analytics-worker',
          message: `Error sending analytics data, response with status: ${response.status}`,
        });

        // prevent infinite loop in case of error
        if (event.event !== 'cli:analytics:send-failed') {
          sendEvent({
            event: 'cli:analytics:send-failed',
            level: 'ERROR',
            message: `Error sending analytics data, response with status: ${response.status}`,
          });
        }
      }
    }
  } catch (error) {
    logger.event({
      type: 'error',
      event: 'analytics-worker',
      message: `Error sending analytics data: ${error instanceof Error ? error.message : String(error)}`,
    });

    // prevent infinite loop in case of error
    if (event.event !== 'cli:analytics:send-failed') {
      sendEvent({
        event: 'cli:analytics:send-failed',
        level: 'ERROR',
        message: `Error sending analytics data: ${error instanceof Error ? error.message : String(error)}`,
        error,
      });
    }
  }
}
