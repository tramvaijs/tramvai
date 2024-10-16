import { expectTypeOf } from 'expect-type';
import { createToken, optional } from '@tinkoff/dippy';
import { useDi } from './hooks';

describe('react DI', () => {
  describe('useDi', () => {
    it('should resolve token', () => {
      const TOKEN = createToken<number>('num');

      const resolved = useDi(TOKEN);

      expectTypeOf(resolved).toEqualTypeOf<number>();
    });

    it('should resolve optional token', () => {
      const TOKEN = createToken<number>('num');

      const resolved = useDi(optional(TOKEN));

      expectTypeOf(resolved).toEqualTypeOf<number | null>();
    });

    it('should resolve multi token', () => {
      const TOKEN = createToken<number>('num', { multi: true });

      const resolved = useDi(TOKEN);

      expectTypeOf(resolved).toEqualTypeOf<number[]>();
    });

    it('should resolve optional multi token', () => {
      const TOKEN = createToken<number>('num', { multi: true });

      const resolved = useDi(optional(TOKEN));

      expectTypeOf(resolved).toEqualTypeOf<number[] | null>();
    });
  });
});
