import path from 'node:path';

const { delimiter: pathDelimiter } = path;
export const nodeModules = `${pathDelimiter}node_modules${pathDelimiter}`;

function first<P>(arr: ArrayLike<P>) {
  return arr[0];
}

function last<P>(arr: ArrayLike<P>): P | null {
  return arr.length > 0 ? arr[arr.length - 1] : null;
}

function firstMatch(regex: RegExp, str: string) {
  const m = regex.exec(str);
  return m ? m[0] : null;
}

function hasValue<P>(s: ArrayLike<P> | null) {
  return s && s.length > 0;
}

function removeAfter(delimiter: string, str: string) {
  return first(str.split(delimiter)) || '';
}

function removeBefore(delimiter: string, str: string) {
  return last(str.split(delimiter)) || '';
}

export function prettyHrtime(diff: [number, number], digits: number) {
  const [seconds, nanoseconds] = diff;
  const ms = seconds * 1000 + nanoseconds / 1e6;

  if (ms < 1) return `${(ms * 1000).toFixed(digits)}µs`;
  if (ms < 1000) return `${ms.toFixed(digits)}ms`;
  return `${(ms / 1000).toFixed(digits)}s`;
}

export const parseRequest = (requestStr: string | undefined) => {
  const parts = (requestStr || '').split('!');

  const file = path.relative(
    process.cwd(),
    removeAfter('?', removeBefore(nodeModules, parts.pop() ?? ''))
  );

  const loaders = parts.map((part) => firstMatch(/[a-z0-9-@]+-loader/, part)).filter(hasValue);

  return {
    file: hasValue(file) ? file : null,
    loaders,
  };
};
