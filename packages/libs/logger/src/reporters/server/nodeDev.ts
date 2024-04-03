import figures from 'figures';
import chalk from 'chalk';
import mergeDeep from '@tinkoff/utils/object/mergeDeep';
import { NodeBasicReporter } from './nodeBasic';
import { parseStack } from './utils/error';
import { chalkColor, chalkBgColor } from './utils/chalk';
import { TYPE_COLOR_MAP, LEVEL_COLOR_MAP } from './utils/fancy';
import type { LogObj } from '../../logger.h';

const DEFAULTS = {
  secondaryColor: 'grey',
  formatOptions: {
    colors: true,
    compact: false,
  },
};

const TYPE_ICONS = {
  info: figures('ℹ'),
  success: figures('✔'),
  debug: figures('›'),
  trace: figures('›'),
  log: '',
};

export class NodeDevReporter extends NodeBasicReporter {
  constructor(options) {
    super(mergeDeep(DEFAULTS, options));
  }

  // eslint-disable-next-line class-methods-use-this
  formatStack(stack) {
    const grey = chalkColor('grey');
    const cyan = chalkColor('cyan');

    return `\n${parseStack(stack)
      .map(
        (line) =>
          `  ${line.replace(/^at +/, (m) => grey(m)).replace(/\((.+)\)/, (_, m) => `(${cyan(m)})`)}`
      )
      .join('\n')}`;
  }

  formatType(logObj: LogObj, isBadge) {
    const typeColor =
      TYPE_COLOR_MAP[logObj.type] || LEVEL_COLOR_MAP[logObj.level] || this.options.secondaryColor;

    if (isBadge) {
      return chalkBgColor(typeColor).black(` ${logObj.type.toUpperCase()} `);
    }

    const _type =
      typeof TYPE_ICONS[logObj.type] === 'string'
        ? TYPE_ICONS[logObj.type]
        : logObj.icon || logObj.type;
    return _type ? chalkColor(typeColor)(_type) : '';
  }

  formatLogObj(logObj: LogObj) {
    const [message, ...additional] = this.formatArgs(logObj.args).split('\n');

    const isBadge =
      typeof logObj.badge !== 'undefined' ? Boolean(logObj.badge) : logObj.level <= 20;

    const secondaryColor = chalkColor(this.options.secondaryColor);

    const date = secondaryColor(this.formatDate(logObj.date));

    const type = this.formatType(logObj, isBadge);

    const name = logObj.name ?? chalk.cyan(`${logObj.name}`);

    const formattedMessage = message.replace(/`([^`]+)`/g, (_, m) => chalk.cyan(m));

    let line = this.filterAndJoin([type, name, date, formattedMessage]);

    line += additional.length ? `\n${additional.join('\n')}` : '';

    return isBadge ? `\n${line}\n` : line;
  }
}
