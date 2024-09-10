import type { start, build } from '@tramvai/cli';

type UnionToIntersection<T> = (T extends any ? (x: T) => any : never) extends (x: infer R) => any
  ? R
  : never;

export type StartOptions = UnionToIntersection<Parameters<typeof start>[0]>;

export type BuildOptions = UnionToIntersection<Parameters<typeof build>[0]>;
