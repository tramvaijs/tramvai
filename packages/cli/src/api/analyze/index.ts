import type { Provider } from '@tinkoff/dippy';
import { createCommand } from '../../commands/createCommand';

export interface Params {
  target: string;
  plugin?: 'bundle' | 'whybundled' | 'statoscope';
  showConfig?: boolean;
  fileCache?: boolean;
  verboseWebpack?: boolean;
}

export type AnalyzeCommand = (params: Params, providers?: Provider[]) => Promise<void>;

export default createCommand({
  name: 'analyze',
  command: async (di): Promise<void> => {
    throw new Error(
      'tramvai analyze is deprecated, please use `tramvai start|build --analyze=pluginName`\n'
    );
  },
});
