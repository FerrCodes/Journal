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
}

export const MOOD_OPTIONS = [
  { value: 1, emoji: '😢', label: 'Sangat Sedih' },
  { value: 2, emoji: '😐', label: 'Biasa Aja' },
  { value: 3, emoji: '😊', label: 'Senang' },
  { value: 4, emoji: '😄', label: 'Sangat Senang' },
  { value: 5, emoji: '🤯', label: 'Luar Biasa!' },
] as const;

export type MoodValue = typeof MOOD_OPTIONS[number]['value'];