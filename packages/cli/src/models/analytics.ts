import type { Visitor } from 'universal-analytics';
import ua from 'universal-analytics';
import isString from '@tinkoff/utils/is/string';
import { performance } from 'perf_hooks';

interface Event {
  name: string;
}

interface ActionEvent extends Event {
  category: 'command' | 'task';
  executionTime?: number;
  label?: string;
  parameters?: any;
}

interface ErrorEvent extends Event {
  errorMessage?: string;
  errorStatus?: number;
}

export class Analytics {
  private readonly enabled: boolean;

  private visitor: Visitor;

  private trackErrorInternal = ({ name, errorMessage, errorStatus }: ErrorEvent, resolve) => {
    if (!this.enabled) {
      resolve();

      return;
    }

    this.visitor.event('error', name, errorMessage, errorStatus).send(resolve);
  };

  private trackCommandInternal = (
    { name, executionTime, label, parameters, category }: ActionEvent,
    resolve
  ) => {
    if (!this.enabled) {
      resolve();

      return;
    }

    const path = [category, name, label].join('/');
    const event = this.visitor
      .screenview({ cd: path })
      .event(category, name, isString(parameters) ? parameters : JSON.stringify(parameters));
    if (executionTime) {
      event.timing(category, name, Math.floor(executionTime));
    }

    event.send(resolve);
  };

  private trackTimingInternal = ({ name, executionTime, category }: ActionEvent, resolve) => {
    if (!this.enabled) {
      resolve();

      return;
    }

    this.visitor.timing(category, name, Math.floor(executionTime)).send(resolve);
  };

  private readonly trackError = this.promisify(this.trackErrorInternal);

  private readonly track = this.promisify(this.trackCommandInternal);

  private readonly trackTiming = this.promisify(this.trackTimingInternal);

  constructor({ trackingCode, packageInfo: { name, version }, enabled }) {
    this.enabled = enabled ?? false;

    if (this.enabled) {
      this.visitor = ua(trackingCode);

      this.visitor.set('ds', 'app');
      this.visitor.set('an', name);
      this.visitor.set('av', version);
      this.visitor.set('aid', 'tramvai-cli');
    }
  }

  trackAfter(actionEvent: ActionEvent) {
    const startedAt = performance.now();
    const trackingPromise = this.track(actionEvent);
    return async <TResult>(promise: Promise<TResult>): Promise<TResult> => {
      try {
        const result = await promise;
        return Promise.all([
          trackingPromise,
          this.trackTiming({ ...actionEvent, executionTime: performance.now() - startedAt }),
        ]).then(() => result);
      } catch (e) {
        return this.trackError({
          name: actionEvent.name,
          errorMessage: e.name,
          errorStatus: e.status,
        }).then(() => {
          throw e;
        });
      }
    };
  }

  private promisify<TEvent>(func: (event: TEvent, resolve: any, ...args) => void) {
    return function promisified(event: TEvent, ...args): Promise<void> {
      return new Promise((resolve) => func(event, resolve, ...args));
    };
  }

  // tslint:disable-line member-ordering
}
