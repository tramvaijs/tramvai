export function getRetryUrl(url: string, retryMap: Record<string, string>): string {
  for (const key in retryMap) {
    const urlWithoutProtocol = url.split('//')[1];

    if (urlWithoutProtocol.indexOf(key) === 0) {
      return url.replace(key, retryMap[key]);
    }
  }
  return url;
}
