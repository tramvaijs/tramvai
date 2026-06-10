import type { Options as ParserOptions } from 'node-html-parser';

export type ParseOptions = Partial<ParserOptions>;

export const parseHtml = (
  html: string,
  parserOptions: ParseOptions = {
    blockTextElements: { script: false, style: false },
  }
) => {
  if (!html) {
    return null;
  }

  const prettier = require('prettier');
  const { parse } = require('node-html-parser');

  const prettyHtml = prettier.format(html, { parser: 'html', printWidth: 120 });
  // @ts-ignore - используется тайпинг от 3 prettier, а в проекте 2
  const parsed = parse(prettyHtml, parserOptions);

  return {
    parsed,
    body: parsed.querySelector('body')?.innerHTML,
    head: parsed.querySelector('head')?.innerHTML,
    application: parsed.querySelector('.application')?.innerHTML,
  };
};
