import type { Navigation, HistoryOptions, NavigationType, HistoryState } from '../types';
import type { RouteTree } from '../tree/tree';

export type Listener = (arg: {
  url: string;
  type?: NavigationType;
  navigateState?: any;
  replace?: boolean;
  history?: boolean;
  isBack?: boolean;
  hasUAVisualTransition?: boolean;
  viewTransition?: boolean;
  viewTransitionTypes?: string[];
}) => Promise<void>;

export abstract class History {
  protected listener?: Listener;
  protected tree?: RouteTree;

  init(navigation: Navigation): void {}

  unsubscribe(): void {}

  abstract save(navigation: Navigation): void;

  abstract go(to: number, options?: HistoryOptions): Promise<void>;

  /**
   * Получает стабильное значение window.history.state, необходимое для работы ViewTransition.
   *
   * Т.К. window.history.state обнуляется при инициализации tmsg чата.
   *
   * Возвращает undefined, если роут сразу вызывает redirect guard.
   * */
  abstract getCurrentState(): HistoryState | undefined;

  listen(listener: Listener): void {
    this.listener = listener;
  }

  setTree(tree: RouteTree): void {
    this.tree = tree;
  }
}
