import { createToken, Scope } from '@tinkoff/dippy';
import type { Container } from '@tinkoff/dippy';
import type { PageAction } from './action';

export * from './action';
export * from './command';
export * from './bundle';
export * from './hooks';
export * from './tramvaiHooks';

export const BUNDLE_LIST_TOKEN = createToken('bundleList');
export const ACTIONS_LIST_TOKEN = createToken<PageAction[]>('actionsList');
export const MODULES_LIST_TOKEN = createToken('modulesList');
export const APP_INFO_TOKEN = createToken<{ appName: string; [key: string]: string }>('appInfo');
export const ROOT_DI_TOKEN = createToken<Container>('tramvai root di', { scope: Scope.SINGLETON });
