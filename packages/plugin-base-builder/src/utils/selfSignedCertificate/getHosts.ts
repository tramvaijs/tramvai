import os from 'os';

export const getDefaultHosts = () => {
  const defaultHosts = ['localhost'];
  const networkInterfaces = os.networkInterfaces();

  for (const networkInterfaceKey in networkInterfaces) {
    const networkInterfacesInfo = networkInterfaces[networkInterfaceKey];

    if (networkInterfacesInfo) {
      for (const info of networkInterfacesInfo) {
        // https://github.com/nodejs/node/issues/42787
        //@ts-expect-error
        if (info.family === 'IPv4' || info.family === '4') {
          defaultHosts.push(info.address);
        }
      }
    }
  }

  return defaultHosts;
};

export const getHosts = (host?: string) => {
  const hosts = new Set([...getDefaultHosts()]);

  if (host && !hosts.has(host)) {
    hosts.add(host);
  }
  return Array.from(hosts);
};
