export interface MediaInfo {
  width: number;
  height: number;
  isTouch: boolean;
  retina: boolean;
  displayMode: DisplayMode;
}

export type DisplayMode = 'browser' | 'standalone' | 'unknown';
