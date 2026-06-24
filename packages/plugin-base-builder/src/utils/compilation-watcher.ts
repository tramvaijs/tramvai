export class CompilationWatcher {
  compilationPromise?: Promise<void>;
  resolveCompilation?: () => void;
  compilationAlive: boolean = false;

  isCompilationInProgress = () => {
    return Boolean(this.compilationPromise);
  };

  startCompilation = () => {
    this.compilationPromise = new Promise((resolve, reject) => {
      this.resolveCompilation = resolve;
    });
  };

  endCompilation = () => {
    this.resolveCompilation?.();
    this.compilationPromise = undefined;
  };

  waitCompilation = () => {
    return this.compilationPromise;
  };

  setCompilationAlive() {
    this.compilationAlive = true;
  }

  destroyCompilation() {
    this.compilationAlive = false;
  }
}
