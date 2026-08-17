// critical asset used to test the retry logic.
// Blocked by playwright on the original host, so the retry script re-requests it
// from the fallback CDN, where the request succeeds.
window.__retryTargetLoaded = true;
