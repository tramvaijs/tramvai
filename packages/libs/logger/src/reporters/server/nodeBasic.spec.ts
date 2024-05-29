import { NodeBasicReporter } from './nodeBasic';

jest.setSystemTime(0);

const fifthObjectDepth = {
  a: {
    b: {
      c: {
        d: {
          e: {
            f: 'f',
          },
        },
      },
    },
  },
};

const sixthObjectDepth = {
  a: {
    b: {
      c: {
        d: {
          e: {
            f: {
              g: 'g',
            },
          },
        },
      },
    },
  },
};

describe('@tinkoff/logger/reporters/nodeBasic', () => {
  it('default deep is 2', () => {
    const nodeBasicReporter = new NodeBasicReporter();

    expect(
      nodeBasicReporter.formatLogObj({
        args: [fifthObjectDepth],
      })
    ).toEqual('{ a: { b: { c: [Object] } } }');
  });

  it('with undefined depth show full object', () => {
    const nodeBasicReporter = new NodeBasicReporter({
      formatOptions: {
        depth: undefined,
      },
    });

    expect(
      nodeBasicReporter.formatLogObj({
        args: [sixthObjectDepth],
      })
    ).toEqual("{ a: { b: { c: { d: { e: { f: { g: 'g' } } } } } } }");
  });

  it('respect depth option', () => {
    const nodeBasicReporter = new NodeBasicReporter({
      formatOptions: {
        depth: 5,
      },
    });

    const fifthObjectDepth = {
      a: {
        b: {
          c: {
            d: {
              e: {
                f: 'f',
              },
            },
          },
        },
      },
    };

    const sixthObjectDepth = {
      a: {
        b: {
          c: {
            d: {
              e: {
                f: {
                  g: 'g',
                },
              },
            },
          },
        },
      },
    };

    expect(
      nodeBasicReporter.formatLogObj({
        args: [fifthObjectDepth],
      })
    ).toEqual("{ a: { b: { c: { d: { e: { f: 'f' } } } } } }");

    expect(
      nodeBasicReporter.formatLogObj({
        args: [sixthObjectDepth],
      })
    ).toEqual('{ a: { b: { c: { d: { e: { f: [Object] } } } } } }');
  });

  it('should log inner error', () => {
    // @ts-expect-error - typedefinition Error.cause in lib: ["es2022"]
    const error = new Error('outer error', { cause: new Error('inner error') });

    const nodeBasicReporter = new NodeBasicReporter();

    expect(
      nodeBasicReporter.formatLogObj({
        args: [error],
      })
    ).toEqual(expect.stringContaining('inner error'));
  });
});
