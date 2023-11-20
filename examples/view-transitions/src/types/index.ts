export type Track = {
  id: string;
  title: string;
  position: number;
  length: string;
};

export type PlayerTrack = Track & {
  albumId: string;
  artist: string;
  imageUrl: string;
};

export type Album = {
  id: string;
  name: string;
  artist: string;
  img: string;
};

export type AlbumWithTracks = Album & {
  tracks: Track[];
};
