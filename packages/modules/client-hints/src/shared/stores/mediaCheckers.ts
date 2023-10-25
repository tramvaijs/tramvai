import type { DisplayMode } from '../../types';
import type { Media } from './media';

export function fromClientHints(media: Media): boolean {
  return !!media.synchronized;
}

export function displayMode(media: Media): DisplayMode {
  return media.displayMode;
}

export function isSupposed(media: Media): boolean {
  return !!media.supposed;
}

export function isRetina(media: Media): boolean {
  return !!media.retina;
}
