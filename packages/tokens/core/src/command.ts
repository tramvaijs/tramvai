import type { Container, MultiTokenInterface, Provider } from '@tinkoff/dippy';
import { Scope, createToken } from '@tinkoff/dippy';

const multiOptions = { multi: true } as const;

export type Command = () => any;

export interface CommandLineRunner {
  lines: CommandLines;

  run(
    type: keyof CommandLines,
    status: keyof CommandLineDescription,
    providers?: Provider[],
    customDi?: Container,
    key?: string | number
  ): Promise<Container>;
}

export type CommandLineDescription = Record<string, MultiTokenInterface<Command>[]>;

export type CommandLines = {
  server: CommandLineDescription;
  client: CommandLineDescription;
};

export const COMMAND_LINE_RUNNER_TOKEN = createToken<CommandLineRunner>('commandLineRunner');
export const COMMAND_LINES_TOKEN = createToken<CommandLines>('commandLines');

export const commandLineListTokens = {
  // Block: Initializing
  /**
   * @server Singleton services initialization (e.g. app server creation)
   * @browser First stage after `platform.js` loaded and executed (prefer fast and synchronous actions, critical for earlier initialization)
   * @scope Singleton
   */
  init: createToken<Command>('init', { multi: true, scope: Scope.SINGLETON }),
  /**
   * @server Singleton services running (e.g. app server start)
   * @browser Useful for usage in browser environment (first place where customer lines will be executed)
   * @scope Singleton
   */
  listen: createToken<Command>('listen', { multi: true, scope: Scope.SINGLETON }),

  // Block: Request handling
  /**
   * @server First stage of client request processing (prefer fast and synchronous actions, critical for next stages)
   * @browser Stage for any actions which should be executed only once in browser session (client router will be hydrated here)
   * @scope Request
   */
  customerStart: createToken<Command>('customer_start', multiOptions),
  /**
   * @server Stage for resolving user info (e.g. authentication, and current router.navigate for current url will be executed here)
   * @browser Stage for for resolving user info, will be executed at page initialization and for SPA-navigations
   * @scope Request
   */
  resolveUserDeps: createToken<Command>('resolve_user_deps', multiOptions),
  /**
   * @server Stage for resolving page data (page actions will be executed here)
   * @browser Stage for for resolving page data, will be executed at page initialization and for SPA-navigations
   * @scope Request
   */
  resolvePageDeps: createToken<Command>('resolve_page_deps', multiOptions),
  /**
   * @server Stage when all data is ready (page HTML will be generated here)
   * @browser Will be executed only once at page initialization (app HTML will be hydrated here)
   * @scope Request
   */
  generatePage: createToken<Command>('generate_page', multiOptions),
  /**
   * @server Stage when all data is ready (page HTML will be generated here)
   * @browser Stage for any actions which should be executed after hydration (e.g. state modification, unfinished and `browserOnly` page actions will be executed here)
   * @scope Request
   */
  clear: createToken<Command>('clear', multiOptions), // Cleanup

  // Block: Client navigations
  /**
   * @browser Stage when SPA-transition started (if `ROUTER_SPA_ACTIONS_RUN_MODE_TOKEN` are changed to `before`, next page actions will be executed here)
   * @scope Request
   */
  spaTransition: createToken<Command>('spa_transition', multiOptions),
  /**
   * @browser Stage after SPA-transition is finished (by default, next page actions will be executed here)
   * @scope Request
   */
  afterSpaTransition: createToken<Command>('after_spa_transition', multiOptions),

  // Block: Server stop
  /**
   * @server Singleton services cleanup (e.g. app server close)
   * @scope Singleton
   */
  close: createToken<Command>('close', { multi: true, scope: Scope.SINGLETON }),
};
