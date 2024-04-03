import { RequestManager } from './requestManager';

const createRequestManager = (request: any) => {
  return new RequestManager({
    request,
  });
};

describe('requestManager', () => {
  describe('getIpFromRequest', () => {
    it('gets IP from X-Real-IP header', () => {
      const requestManager = createRequestManager({
        headers: {
          'x-real-ip': '172.0.0.1',
        },
        socket: {
          remoteAddress: '192.168.0.1',
        },
      });

      expect(requestManager.getClientIp()).toBe('172.0.0.1');
    });

    it('gets IP from socket.remoteAddress otherwise', () => {
      const requestManager = createRequestManager({
        socket: {
          remoteAddress: '192.168.0.1',
        },
      });
      expect(requestManager.getClientIp()).toBe('192.168.0.1');
    });

    it('returns empty string if request object has no required data', () => {
      expect(createRequestManager({}).getClientIp()).toBe('');
      expect(createRequestManager({ connection: {} }).getClientIp()).toBe('');
    });
  });

  it('getHeaders', () => {
    const requestManager = createRequestManager({
      headers: {
        a: '123',
        b: '456',
        c: null,
      },
    });

    expect(requestManager.getHeaders()).toEqual({
      a: '123',
      b: '456',
      c: null,
    });
    expect(requestManager.getHeader('a')).toBe('123');
    expect(requestManager.getHeader('b')).toBe('456');
    expect(requestManager.getHeader('c')).toBe(null);
    expect(requestManager.getHeader('d')).toBeUndefined();
  });

  it('getUrl', () => {
    const requestManager = createRequestManager({
      protocol: 'https://',
      url: '/abc/',
      headers: {
        host: 'www.test.test',
      },
    });

    expect(requestManager.getUrl()).toBe('https://www.test.test/abc/');
  });

  it('get parsed Url with query params', () => {
    const requestManager = createRequestManager({
      query: { abc: '123', efg: '456' },
    });

    expect(requestManager.getParsedUrl()).toEqual(
      expect.objectContaining({ query: { abc: '123', efg: '456' } })
    );
  });

  it('getUrl with x-original-host', () => {
    const requestManager = createRequestManager({
      protocol: 'https://',
      url: '/abc/',
      headers: {
        host: 'www.test.test',
        'x-original-host': 'www.tinkoff.ru',
      },
    });

    expect(requestManager.getUrl()).toBe('https://www.tinkoff.ru/abc/');
  });

  it('getHost', () => {
    const requestManager = createRequestManager({
      headers: {
        host: 'www.test.test',
      },
    });

    expect(requestManager.getHost()).toBe('www.test.test');
  });
  it('getHost with x-original-host', () => {
    const requestManager = createRequestManager({
      headers: {
        host: 'www.test.test',
        'x-original-host': 'www.tinkoff.ru',
      },
    });

    expect(requestManager.getHost()).toBe('www.tinkoff.ru');
  });
});
