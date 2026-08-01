/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

const LASTFM_API_KEY = (import.meta as any).env.VITE_LASTFM_API_KEY;

if (!LASTFM_API_KEY) {
  console.warn('⚠️ VITE_LASTFM_API_KEY tidak ditemukan di .env');
}

export interface SongResult {
  id: string;
  title: string;
  artist: string;
  url: string;
}

export const searchSongs = async (query: string): Promise<SongResult[]> => {
  if (!query.trim()) return [];

  try {
    const response = await axios.get('https://ws.audioscrobbler.com/2.0/', {
      params: {
        method: 'track.search',
        track: query,
        api_key: LASTFM_API_KEY,
        format: 'json',
        limit: 5,
      },
    });

    const tracks = response.data.results?.trackmatches?.track || [];
    
    return tracks.map((track: any) => ({
      id: track.mbid || track.name + track.artist,
      title: track.name,
      artist: track.artist,
      url: track.url,
    }));
  } catch (error) {
    console.error('Error searching songs from Last.fm:', error);
    return [];
  }
};