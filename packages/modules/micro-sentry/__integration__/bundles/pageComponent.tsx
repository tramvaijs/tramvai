import { declareAction } from '@tramvai/core';
import { MICRO_SENTRY_INSTANCE_TOKEN } from '@tramvai/module-micro-sentry';
import { useActions } from '@tramvai/state';

const sendSampleErrorMessageAction = declareAction({
  name: 'sendSampleErrorMessageAction',
  fn() {
    const { microSentryClient } = this.deps;
    const error = new Error('Sample error message from tinkoff-examples/tincoin application');
    microSentryClient?.report(error);
  },
  deps: {
    microSentryClient: MICRO_SENTRY_INSTANCE_TOKEN,
  },
});

const Page = () => {
  const sendSampleErrorMessage = useActions(sendSampleErrorMessageAction);
  return (
    <div>
      <button type="button" onClick={sendSampleErrorMessage}>
        Send sample error to ErrorHub
      </button>
      <button
        type="button"
        onClick={() => {
          Promise.reject(new Error('Unhandled Promise Rejection error'));
        }}
      >
        Trigger Unhandle Promise Rejection Error
      </button>
      <button
        type="button"
        onClick={() => {
          throw new Error('Unhandled error');
        }}
      >
        Trigger unhandled error
      </button>
    </div>
  );
};
export default Page;
