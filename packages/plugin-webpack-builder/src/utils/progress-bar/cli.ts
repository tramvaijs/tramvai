import c from 'ansis';
import chalk from 'chalk';

import { BLOCK_CHAR, BLOCK_CHAR2, BAR_LENGTH } from './const';
import { range } from './utils';

export const colorize = (color: string) => {
  if (color[0] === '#') {
    return chalk.hex(color);
  }

  return chalk.keyword(color);
};

export const renderBar = (progress: number, color: string) => {
  const w = progress * (BAR_LENGTH / 100);
  const bg = c.white(BLOCK_CHAR);
  const fg = colorize(color)(BLOCK_CHAR2);

  return range(BAR_LENGTH)
    .map((i) => (i < w ? fg : bg))
    .join('');
};

export function ellipsis(str: string, n: number) {
  if (str.length <= n - 3) {
    return str;
  }
  return `${str.slice(0, Math.max(0, n - 1))}...`;
}

export function ellipsisLeft(str: string, n: number) {
  if (str.length <= n - 3) {
    return str;
  }
  return `...${str.slice(str.length - n - 1)}`;
}
