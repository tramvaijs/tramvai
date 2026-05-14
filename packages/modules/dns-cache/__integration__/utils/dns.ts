/* eslint-disable no-param-reassign */
import dns from 'dns';

export const dnsLookupCalls: Record<string, number> = {};

export const resetDnsLookupCalls = () => {
  Object.keys(dnsLookupCalls).forEach((key) => delete dnsLookupCalls[key]);
};

export const mapHostsToLocalIP = (hosts: string[]) => {
  const originalLookup = dns.lookup as any;

  // @ts-expect-error
  dns.lookup = function customLookup(hostname: any, options: any, callback: any) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    if (hosts.includes(hostname)) {
      dnsLookupCalls[hostname] = (dnsLookupCalls[hostname] || 0) + 1;

      if (options && options.all) {
        callback(null, [{ address: '127.0.0.1', family: 4 }]);
      } else {
        callback(null, '127.0.0.1', 4);
      }
      return;
    }
    return originalLookup(hostname, options, callback);
  };
};
/* eslint-enable no-param-reassign */
