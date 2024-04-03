import { expectTypeOf } from 'expect-type';
import type { InfiniteData } from '@tanstack/react-query';
import { createToken } from '@tinkoff/dippy';
import { createInfiniteQuery } from './create';
import { useInfiniteQuery } from './use';

describe('parameters', () => {
  it('no parameters', async () => {
    const query = createInfiniteQuery({
      key: 'test',
      fn: async () => {},
    });

    const { data } = useInfiniteQuery(query);

    expectTypeOf(data).toEqualTypeOf<InfiniteData<void> | undefined>();
  });

  it('specified parameter', async () => {
    const query = createInfiniteQuery({
      key: 'test',
      fn: async (param: string) => {
        return 25;
      },
    });

    // @ts-expect-error
    useQuery(query);
    // @ts-expect-error
    useQuery(query, 5);
    // @ts-expect-error
    useQuery(query, {});

    const { data } = useInfiniteQuery(query, 'test');

    expectTypeOf(data).toEqualTypeOf<InfiniteData<number> | undefined>();
  });
});

describe('deps', () => {
  const NUMBER_TOKEN = createToken<number>();
  const STRING_TOKEN = createToken<string>();

  it('use deps in key and fn', () => {
    createInfiniteQuery({
      key() {
        expectTypeOf(this.deps).toEqualTypeOf({});
        return '';
      },
      actionNamePostfix: 'testQueryPostfix',
      async fn() {
        expectTypeOf(this.deps).toEqualTypeOf({});
        return '';
      },
    });

    createInfiniteQuery({
      key() {
        expectTypeOf(this.deps).toEqualTypeOf<{
          num: number;
          str: string;
        }>();
        return '';
      },
      actionNamePostfix: 'testQueryPostfix',
      async fn() {
        expectTypeOf(this.deps).toEqualTypeOf<{
          num: number;
          str: string;
        }>();
        return '';
      },
      deps: {
        num: NUMBER_TOKEN,
        str: STRING_TOKEN,
      },
    });
  });
});
