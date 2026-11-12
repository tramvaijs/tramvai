import type { RouterPlugin } from '@tinkoff/router';

const isBrowser = typeof window !== 'undefined';
const query = isBrowser ? new URLSearchParams(window.location.search) : null;

// open the app with `?perf` to log the timeline of every view transition to the console
const logEnabled = query?.has('perf') ?? false;

// open the app with `?actions=after` to run page actions after the navigation commit
export const spaActionsMode = query?.get('actions') === 'after' ? 'after' : 'before';

let marks: Array<{ name: string; time: number }> = [];
let desyncRenders = 0;

const reset = (name: string) => {
  marks = [];
  desyncRenders = 0;
  mark(name);
};

export const mark = (name: string) => {
  if (!isBrowser) {
    return;
  }

  marks.push({ name, time: performance.now() });
  // visible in the Timings track of the DevTools Performance panel
  performance.mark(`vt:${name}`);
};

// render of the component, where router store and `useRoute` point to different routes
export const markDesyncRender = () => {
  desyncRenders++;
};

const measure = (name: string, from: string, to: string) => {
  const start = marks.find((item) => item.name === from);
  const end = marks.find((item) => item.name === to);

  if (start && end) {
    performance.measure(`vt:${name}`, { start: start.time, end: end.time });
  }
};

const report = () => {
  measure('before snapshot', marks[0].name, 'startViewTransition');
  measure('snapshot', 'startViewTransition', 'update callback');
  measure('render', 'update callback', 'update callback done');
  measure('animation', 'update callback done', 'finished');

  if (logEnabled) {
    const start = marks[0].time;

    // eslint-disable-next-line no-console
    console.table(
      marks
        .map(({ name, time }) => ({ event: name, ms: Math.round((time - start) * 10) / 10 }))
        .concat({ event: 'desync renders', ms: desyncRenders })
    );
  }
};

export const perfRouterPlugin: RouterPlugin = {
  apply(router) {
    if (!isBrowser) {
      return;
    }

    document.addEventListener('click', () => reset('click'), true);
    window.addEventListener('popstate', () => reset('popstate'), true);

    router.registerHook('beforeNavigate', async () => mark('beforeNavigate'));
    router.registerSyncHook('change', () => mark('change'));
    router.registerHook('afterNavigate', async () => mark('afterNavigate'));

    // view transitions typings are not available in the example
    const doc = document as any;
    const startViewTransition = doc.startViewTransition?.bind(document);

    if (!startViewTransition) {
      return;
    }

    doc.startViewTransition = (arg: any) => {
      mark('startViewTransition');

      const update = typeof arg === 'function' ? arg : arg.update;
      const markedUpdate = () => {
        mark('update callback');
        return update();
      };
      const transition = startViewTransition(
        typeof arg === 'function' ? markedUpdate : { ...arg, update: markedUpdate }
      );

      transition.updateCallbackDone.then(
        () => mark('update callback done'),
        () => {}
      );
      transition.finished.then(
        () => {
          mark('finished');
          report();
        },
        () => {}
      );

      return transition;
    };
  },
};
