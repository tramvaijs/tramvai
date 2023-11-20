import React, { useState } from 'react';
import type { Wrapper } from '@tinkoff/layout-factory';

import type { PlayerTrack } from '../types';

export const PlayerContext = React.createContext<{
  isPlaying: boolean;
  setIsPlaying: (v: boolean) => void;
  currentTrack: PlayerTrack | null;
  setCurrentTrack: (v: PlayerTrack) => void;
}>({
  isPlaying: false,
  setIsPlaying: () => {},
  currentTrack: null,
  setCurrentTrack: () => {},
});

export const layoutWrapper: Wrapper = (Component) => (props) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<PlayerTrack | null>(null);

  return (
    <PlayerContext.Provider
      value={{
        isPlaying,
        setIsPlaying,
        currentTrack,
        setCurrentTrack,
      }}
    >
      <Component {...props} />
    </PlayerContext.Provider>
  );
};
