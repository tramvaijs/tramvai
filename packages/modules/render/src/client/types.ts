import type { ExtractDependencyType } from '@tinkoff/dippy';
import type { REACT_SERVER_RENDER_MODE } from '@tramvai/tokens-render';

type Renderer = (params: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  element: any;
  container: () => Element;
  callback: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  log: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  renderMode?: ExtractDependencyType<typeof REACT_SERVER_RENDER_MODE>;
}) => any;

export { Renderer };
