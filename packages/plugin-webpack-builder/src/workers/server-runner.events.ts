export const COMPILE = 'compile';
export const EXIT = 'exit';
export const APPLICATION_SERVER_STARTED = 'application-server-started';

export type ServerRunnerIncomingEventsPayload = {
  [COMPILE]: {
    event: typeof COMPILE;
    code: string;
  };
  [EXIT]: {
    event: typeof EXIT;
  };
};

export type ServerRunnerOutgoingEventsPayload = {
  [APPLICATION_SERVER_STARTED]: {
    event: typeof APPLICATION_SERVER_STARTED;
  };
};
