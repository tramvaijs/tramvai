import { expectTypeOf } from 'expect-type';
import type { InfiniteData, QueryKey } from '@tanstack/react-query';
import { createToken } from '@tinkoff/dippy';
import type { SafeUseInfiniteQueryOptions } from './create';
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

describe('fork', () => {
  it('with getNextPageParam', async () => {
    type Response = { hasNext: boolean; nextCursor?: number };

    const query = createInfiniteQuery({
      initialPageParam: 0,
      key: 'test',
      fn: async () => {
        return {} as Response;
      },
    });

    const fork = query.fork({});

    expectTypeOf(fork).toEqualTypeOf<ReturnType<typeof query.fork>>();
  });

  it('with empty query options', async () => {
    const query = createInfiniteQuery({
      key: 'test',
      fn: async () => {
        return 25;
      },
    });

    const fork = query.fork({});

    expectTypeOf(fork).toEqualTypeOf<ReturnType<typeof query.fork>>();
  });
});

// `SafeUseInfiniteQueryOptions` picks the `UseInfiniteQueryOptions` generic parameters layout
// based on the installed @tanstack/react-query version. When that detection breaks, generic
// arguments silently land in the wrong slots instead of failing loudly, so guard it here.
describe('SafeUseInfiniteQueryOptions', () => {
  type Options = SafeUseInfiniteQueryOptions<string, Error, string, QueryKey, number>;

  it('resolves TPageParam to the page param options', () => {
    expectTypeOf<Options['initialPageParam']>().toEqualTypeOf<number>();
  });

  it('resolves TQueryKey to the query key', () => {
    expectTypeOf<NonNullable<Options['queryKey']>>().toEqualTypeOf<QueryKey>();
  });
});
