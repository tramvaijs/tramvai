var _ref;
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import { Provider } from '@tramvai/core';
export const providers: Provider[] = [
    (_ref = {
        provide: 'a',
        useFactory: ()=>{}
    }, Object.defineProperty(_ref, '__stack', {
        enumerable: false,
        value: new globalThis.Error().stack
    }), _ref)
];
