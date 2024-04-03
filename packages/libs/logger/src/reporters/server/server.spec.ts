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

describe('log/server', () => {
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
});
