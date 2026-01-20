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

/**
 * Token for user language preferences
 * On server: parsed from Accept-Language header
 * On client: from navigator.languages
 * Returns array of language codes in order of preference and normalized to ISO-639-1
 */
export const USER_LANGUAGE_TOKEN = createToken<string[]>('user language');
