
export type SongType = {
  id: string,
  label: string,
  name: string,
  artist?: string,
  bpm?: number,
  isCustom?: boolean,
  isLabel?: 1|0,
}

export type SetlistType = {
  id: string;
  name: string;
  songs: SongType[];
};