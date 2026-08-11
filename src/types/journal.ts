export interface JournalEntry {
  id: string;
  title: string | null;
  content: string;
  mood: 1 | 2 | 3 | 4 | 5;
  song_title: string | null;
  song_artist: string | null;
  song_url: string | null;
  weather: string | null;
  tags: string[];
  created_at: string;
  custom_date?: string;
  is_favorite?: boolean;
  is_archived?: boolean;
  images?: EntryImage[];
}

export interface EntryImage {
  id: string;
  entry_id: string;
  image_url: string;
  created_at: string;
}

export const MOOD_OPTIONS = [
  { value: 1, emoji: '😢', labelKey: 'moods.1' },
  { value: 2, emoji: '😐', labelKey: 'moods.2' },
  { value: 3, emoji: '😊', labelKey: 'moods.3' },
  { value: 4, emoji: '😄', labelKey: 'moods.4' },
  { value: 5, emoji: '🤯', labelKey: 'moods.5' },
] as const;

export type MoodValue = typeof MOOD_OPTIONS[number]['value'];