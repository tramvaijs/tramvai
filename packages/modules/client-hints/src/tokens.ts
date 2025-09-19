import { createToken } from '@tinkoff/dippy';
import type { UAParserExtensionsTypes, UserAgent } from '@tinkoff/user-agent';

export const USER_AGENT_TOKEN = createToken<UserAgent>('userAgent');

export const USER_AGENT_PARSER_EXTENSIONS_TOKEN = createToken<UAParserExtensionsTypes>(
  'userAgentParserExtensions',
  { multi: true }
);

export const PARSER_CLIENT_HINTS_ENABLED = createToken<boolean>(
  'client-hints parserClientHints enabled'
);
