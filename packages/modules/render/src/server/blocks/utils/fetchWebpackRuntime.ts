let runtimeCode;

export const fetchWebpackRuntime = async (webpackRuntimeURL: string) => {
  if (runtimeCode) {
    return runtimeCode;
  }

  const response = await fetch(webpackRuntimeURL);

  if (!response.ok) {
    throw new Error('Failed to request webpack runtime!');
  }

  runtimeCode = await response.text();

  return runtimeCode;
};
