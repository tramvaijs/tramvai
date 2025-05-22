export type BrowserMap = Record<string, Record<string, number>>;

export type SatisfiesOptions = {
  env?: 'defaults';
  forceMinimumUnknownVersions?: boolean;
};
