import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { MOOD_OPTIONS } from '../types/journal';
import type { MoodValue } from '../types/journal';
import { toast } from 'react-toastify';
import { PenSquare, Save, Tag, Loader2 } from 'lucide-react';
import { searchSongs } from '../services/lastfm';

function CreateEntry() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<MoodValue>(3);
  const [songTitle, setSongTitle] = useState('');
  const [songArtist, setSongArtist] = useState('');
  const [songUrl, setSongUrl] = useState('');
  const [weather, setWeather] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // State untuk pencarian lagu
  const [searchResults, setSearchResults] = useState<Array<{ id: string; title: string; artist: string; url: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User tidak ditemukan.');

      const { error: insertError } = await supabase
        .from('entries')
        .insert({
          user_id: user.id,
          title: title || null,
          content: content,
          mood: mood,
          song_title: songTitle || null,
          song_artist: songArtist || null,
          song_url: songUrl || null,
          weather: weather || null,
          tags: tags,
        });

      if (insertError) throw insertError;
      toast.success('✅ Jurnal berhasil disimpan!');
      navigate('/');
    } catch (err: unknown) {
      setError((err as Error).message);
      toast.error('❌ Gagal menyimpan jurnal: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Fungsi untuk pencarian lagu
  const handleSearchSong = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchSongs(query);
      setSearchResults(results);
      setShowResults(results.length > 0);
    } catch (error) {
      console.error('Gagal mencari lagu:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Fungsi untuk memilih lagu dari hasil pencarian
  const selectSong = (song: { id: string; title: string; artist: string; url: string }) => {
    setSongTitle(song.title);
    setSongArtist(song.artist);
    setSongUrl(song.url);
    setSearchResults([]);
    setShowResults(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        <PenSquare className="w-6 h-6" />
        Tulis Jurnal Baru
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">Judul (Opsional)</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Judul hari ini..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">
            Isi Jurnal <span className="text-red-500">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={6}
            placeholder="Ceritakan hari ini..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none resize-y"
          />
        </div>

        <div>
          <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">
            Mood Hari Ini <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {MOOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setMood(option.value)}
                className={`px-4 py-2 rounded-lg transition ${
                  mood === option.value
                    ? 'border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                    : 'border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700'
                }`}
              >
                {option.emoji} {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
          <h3 className="text-base font-medium mb-3 text-gray-700 dark:text-gray-300">Lagu Favorit Hari Ini (Opsional)</h3>
          <div className="space-y-3">
            {/* Input Judul Lagu dengan Pencarian */}
            <div className="relative">
              <input
                type="text"
                value={songTitle}
                onChange={(e) => {
                  setSongTitle(e.target.value);
                  handleSearchSong(e.target.value);
                }}
                placeholder="Judul Lagu"
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                </div>
              )}

              {/* Hasil Pencarian */}
              {showResults && searchResults.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.map((song) => (
                    <button
                      key={song.id}
                      onClick={() => selectSong(song)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-slate-700 transition flex items-center gap-3 border-b border-gray-100 dark:border-slate-700 last:border-0"
                    >
                      <div className="w-10 h-10 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg">🎵</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{song.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{song.artist}</p>
                      </div>
                      <span className="text-xs text-blue-500 dark:text-blue-400">Pilih</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <input
              type="text"
              value={songArtist}
              onChange={(e) => setSongArtist(e.target.value)}
              placeholder="Artis"
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input
              type="url"
              value={songUrl}
              onChange={(e) => setSongUrl(e.target.value)}
              placeholder="Link Spotify/YouTube"
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">Cuaca (Opsional)</label>
          <input
            type="text"
            value={weather}
            onChange={(e) => setWeather(e.target.value)}
            placeholder="Contoh: Cerah, Hujan, Mendung"
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Tags */}
        <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
          <h3 className="text-base font-medium mb-3 text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Tags (Opsional)
          </h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ketik tag, lalu Enter..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition"
            >
              Tambah
            </button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-blue-500 dark:text-blue-400 hover:text-red-500 dark:hover:text-red-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !content}
          className="w-full py-3 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
        >
          {loading ? (
            'Menyimpan...'
          ) : (
            <>
              <Save className="w-4 h-4" />
              Simpan Jurnal
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default CreateEntry;