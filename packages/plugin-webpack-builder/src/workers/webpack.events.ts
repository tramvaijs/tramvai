import { Configuration, InputParameters } from '@tramvai/api/lib/config';
import { BuildTarget, BuildType } from '../webpack/webpack-config';
import { ProgressState } from '../utils/progress-bar/types';

export const DEV_SERVER_STARTED = 'dev-server-started';
export const BUILD_DONE = 'build-done';
export const BUILD_FAILED = 'build-failed';
export const WATCH_RUN = 'watch-run';
export const PROGRESS = 'progress';
export const INVALIDATE = 'invalidate';
export const INVALIDATE_DONE = 'invalidate-done';
export const EXIT = 'exit';

export type WebpackWorkerData = {
  type: BuildType;
  target: BuildTarget;
  port: number;
  inputParameters: InputParameters;
  extraConfiguration: Partial<Configuration>;
};

export type WebpackWorkerIncomingEventsPayload = {
  [INVALIDATE]: {
    event: typeof INVALIDATE;
  };
  [EXIT]: {
    event: typeof EXIT;
  };
};

export type ProgressType = 'start' | 'update' | 'done';

export type WebpackWorkerOutgoingEventsPayload = {
  [DEV_SERVER_STARTED]: {
    event: typeof DEV_SERVER_STARTED;
  };
  [BUILD_DONE]: {
    event: typeof BUILD_DONE;
  };
  [BUILD_FAILED]: {
    event: typeof BUILD_FAILED;
    errors?: { message: string; stack?: string }[];
  };
  [PROGRESS]: {
    event: typeof PROGRESS;
    type: ProgressType;
    state: ProgressState;
  };
  [WATCH_RUN]: {
    event: typeof WATCH_RUN;
  };
  [INVALIDATE_DONE]: {
    event: typeof INVALIDATE_DONE;
  };
};
