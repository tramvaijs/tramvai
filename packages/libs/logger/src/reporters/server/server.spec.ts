import { NodeBasicReporter } from './nodeBasic';

jest.setSystemTime(0);

describe('log/server', () => {
  it('should log deep objects by default', () => {
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
