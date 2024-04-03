// https://developer.mozilla.org/en-US/docs/Web/API/ViewTransition#instance_properties
interface ViewTransition {
  finished: Promise<void>;
  ready: Promise<void>;
  updateCallbackDone: Promise<void>;
  skipTransition(): void;
}

interface Document {
  startViewTransition(cb: () => Promise<void> | void): ViewTransition;
}
