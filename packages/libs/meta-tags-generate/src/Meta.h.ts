import type { MetaWalk, WalkItem } from './MetaWalk';

export type ListSources = Array<(walker: MetaWalk, ...args: any[]) => void>;
export type TransformValue = (value: WalkItem) => WalkItem;

export type TagPlacement = 'head' | 'body';
export type TagRecord = { tag: string; attributes?: Record<string, string>; innerHtml?: string };

export type TagValue = string | TagRecord;
export type OptionalTagValue = TagValue | null;

export type JsonLdValue = Record<string, any>;
type JsonLdProps = {
  jsonLd?: JsonLdValue | null;
};

export type MetaObj<M> = JsonLdProps & {
  [K in Exclude<keyof M, keyof JsonLdProps>]: OptionalTagValue;
};

export type Converter = (value: JsonLdValue | OptionalTagValue) => TagRecord | TagRecord[] | null;

export type SerializableMetaWalkState = [string, WalkItem][];

export type PatchMeta = {
  head: HTMLHeadElement;
  addTags: HTMLElement[];
  removeTagsArray: Element[];
};
