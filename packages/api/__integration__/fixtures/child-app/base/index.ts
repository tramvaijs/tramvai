import { provide } from '@tinkoff/dippy';

const sharedProviders = [
  provide({
    provide: 'ooo',
    useValue: 'aaa',
  }),
];

console.log('Cool child app', sharedProviders);
