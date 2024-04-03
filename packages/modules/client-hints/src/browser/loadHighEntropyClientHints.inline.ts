export function loadHighEntropyClientHints() {
  if (window.navigator.userAgentData !== undefined) {
    window.navigator.userAgentData
      .getHighEntropyValues([
        'architecture',
        'bitness',
        'model',
        'platformVersion',
        'fullVersionList',
      ])
      .then((result) => {
        window.__TRAMVAI_USER_AGENT_DATA = result;
      })
      .catch(() => {});
  }
}
