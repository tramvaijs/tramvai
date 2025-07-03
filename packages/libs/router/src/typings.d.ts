// https://developer.mozilla.org/en-US/docs/Web/API/ViewTransition#instance_properties
// https://www.w3.org/TR/css-view-transitions-2/#view-transitions-extension-types
interface ViewTransition {
  finished: Promise<void>;
  ready: Promise<void>;
  updateCallbackDone: Promise<void>;
  skipTransition(): void;
  types?: Set<string>;
}

interface Document {
  startViewTransition(cb: () => Promise<void> | void): ViewTransition;
  startViewTransition(options: {
    update: () => Promise<void> | void;
    types?: string[];
  }): ViewTransition;
}

interface Window {
  ViewTransition: {
    prototype: ViewTransition;
  };
}

// https://developer.mozilla.org/en-US/docs/Web/API/PopStateEvent/hasUAVisualTransition
interface PopStateEvent {
  readonly hasUAVisualTransition: boolean;
}
