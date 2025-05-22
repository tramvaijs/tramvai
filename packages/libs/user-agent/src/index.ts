import { parseUserAgentHeader } from './parse-user-agent-header/parseUserAgentHeader';
import { isBrowserSatisfiesRequirements } from './satisfies/is-browser-satisfies-requirements';

export { parseUserAgentHeader, parseUserAgentHeader as parse };
export { isBrowserSatisfiesRequirements, isBrowserSatisfiesRequirements as satisfies };
export { parseClientHintsHeaders as parseClientHints } from './client-hints/parse-client-hints-headers/parseClientHintsHeaders';
export { ClientHintsHeaders } from './client-hints/parse-client-hints-headers/consts';
export { parseClientHintsUserAgentData } from './client-hints/parse-client-hints-user-agent-data/parseClientHintsUserAgentData';
export * from './types';
