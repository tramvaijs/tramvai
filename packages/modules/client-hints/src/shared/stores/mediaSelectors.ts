import { useSelector } from '@tramvai/state';
import type { Media } from './media';
import { fromClientHints, isSupposed, isRetina, displayMode } from './mediaCheckers';
import type { DisplayMode } from '../../types';

export function useMedia(): Media {
  return useSelector('media', ({ media }) => media);
}

export function useFromClientHints(): boolean {
  return fromClientHints(useMedia());
}

export function useIsSupposed(): boolean {
  return isSupposed(useMedia());
}

export function useIsRetina(): boolean {
  return isRetina(useMedia());
}

export function useDisplayMode(): DisplayMode {
  return displayMode(useMedia());
}
