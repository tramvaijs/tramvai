import chalk from 'chalk';

import textTable from 'text-table';
import { range } from '.';

import { BLOCK_CHAR, BLOCK_CHAR2, BAR_LENGTH } from './consts';

export const colorize = (color) => {
  if (color[0] === '#') {
    return chalk.hex(color);
  }

  return chalk[color] || chalk.keyword(color);
};

export const renderBar = (progress, color) => {
  const w = progress * (BAR_LENGTH / 100);
  const bg = chalk.white(BLOCK_CHAR);
  const fg = colorize(color)(BLOCK_CHAR2);

  return range(BAR_LENGTH)
    .map((i) => (i < w ? fg : bg))
    .join('');
};

export function createTable(data) {
  return textTable(data, {
    align: data[0].map(() => 'l'),
  }).replace(/\n/g, '\n\n');
}

export function ellipsis(str, n) {
  if (str.length <= n - 3) {
    return str;
  }
  return `${str.substr(0, n - 1)}...`;
}

export function ellipsisLeft(str, n) {
  if (str.length <= n - 3) {
    return str;
  }
  return `...${str.substr(str.length - n - 1)}`;
}
