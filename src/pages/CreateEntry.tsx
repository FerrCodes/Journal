import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { MOOD_OPTIONS } from '../types/journal';
import type { MoodValue } from '../types/journal';
import { toast } from 'sonner'
import { PenSquare, Save, Tag, Loader2, Image, Upload, X, Music, Cloud, ArrowLeft } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';

function CreateEntry() {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
  const [files, setFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User tidak ditemukan.');
      const { data: entryData, error: insertError } = await supabase
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
        })
        .select()
        .single();
      if (insertError) throw insertError;
      if (files.length > 0 && entryData) {
        setUploading(true);
        const imageUrls = await uploadImages(entryData.id);
        const imageInserts = imageUrls.map((url) => ({ entry_id: entryData.id, image_url: url }));
        const { error: imageError } = await supabase.from('entry_images').insert(imageInserts);
        if (imageError) throw imageError;
      }
      toast.success(t('journal.saveSuccess'));
      navigate('/');
    } catch (err: unknown) {
      setError((err as Error).message);
      toast.error(t('journal.saveFailed') + ': ' + (err as Error).message);
    } finally {
      setLoading(false);
      setUploading(false);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length + files.length > 3) {
      toast.warning(t('journal.maxPhotos'));
      return;
    }
    setFiles([...files, ...selectedFiles]);
    const previews = selectedFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...previews]);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const uploadImages = async (entryId: string): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${entryId}/${uuidv4()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('entry-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from('entry-images')
        .getPublicUrl(filePath);

      uploadedUrls.push(urlData.publicUrl);
    }
    return uploadedUrls;
  };

  return (
    <div className="w-full max-w-full overflow-hidden px-4 py-6">
      <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">  
        <div className="flex items-center gap-2">
          <PenSquare className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">{t('journal.newEntry')}</h1>
        </div>
        <Link 
          to="/"
          className="inline-flex items-center gap-1 px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white rounded-lg transition text-xs sm:text-sm"
        >
          <ArrowLeft className="hidden sm:inline">←</ArrowLeft>
          <ArrowLeft className="sm:hidden">←</ArrowLeft>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Judul */}
        <div>
          {t('journal.titleOptional')}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('journal.titlePlaceholder')}
            className="w-full max-w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm sm:text-base"
          />
        </div>

        {/* Isi Jurnal */}
        <div>
        {t('journal.contentLabel')} <span className="text-red-500">*</span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={6}
            placeholder={t('journal.contentPlaceholder')}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-y text-sm sm:text-base"
          />
        </div>

        {/* Mood */}
        <div>
          {t('journal.moodLabel')} <span className="text-red-500">*</span>
          <div className="flex flex-wrap gap-2">
            {MOOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setMood(option.value)}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl transition text-xs sm:text-sm font-medium ${
                  mood === option.value
                    ? 'bg-blue-500 text-white shadow-md shadow-blue-500/25'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
              >
                {option.emoji} {t(option.labelKey)}
              </button>
            ))}
          </div>
        </div>

        {/* Lagu Favorit */}
        <div className="border-t border-gray-200 dark:border-slate-700 pt-6">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-1">
            <Music className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            {t('journal.songLabel')} <span className="text-gray-400 dark:text-gray-500">(Opsional)</span>
          </label>
          <div className="space-y-3">
            <input
              type="text"
              value={songTitle}
              onChange={(e) => setSongTitle(e.target.value)}
              placeholder={t('journal.songTitlePlaceholder')}
              className="w-full max-w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm sm:text-base"
            />
            <input
              type="text"
              value={songArtist}
              onChange={(e) => setSongArtist(e.target.value)}
              placeholder={t('journal.songArtistPlaceholder')}
              className="w-full max-w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm sm:text-base"
            />
            <input
              type="url"
              value={songUrl}
              onChange={(e) => setSongUrl(e.target.value)}
              placeholder={t('journal.songUrlPlaceholder')}
              className="w-full max-w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Cuaca */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
            <Cloud className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            {t('journal.weatherLabel')} <span className="text-gray-400 dark:text-gray-500">(Opsional)</span>
          </label>
          <input
            type="text"
            value={weather}
            onChange={(e) => setWeather(e.target.value)}
            placeholder={t('journal.weatherPlaceholder')}
            className="w-full max-w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm sm:text-base"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
            <Tag className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            {t('journal.tagsLabel')} <span className="text-gray-400 dark:text-gray-500">(Opsional)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('journal.tagsPlaceholder')}
              className="w-full max-w-full flex-1 px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm sm:text-base"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-5 py-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition text-sm font-medium whitespace-nowrap"
            >
              {t('journal.addTag')}
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

        {/* Upload Foto */}
        <div className="border-t border-gray-200 dark:border-slate-700 pt-6">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
            <Image className="w-4 h-4" />
            {t('journal.photoLabel')} <span className="text-gray-400 dark:text-gray-500">{t('journal.photoMax')}</span>
          </label>

          {imagePreviews.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-lg border border-gray-200 dark:border-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {files.length < 3 && (
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-xl transition cursor-pointer text-sm font-medium">
              <Upload className="w-4 h-4" />
              {t('journal.choosePhoto')}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || uploading || !content}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 text-sm sm:text-base shadow-md shadow-blue-500/20"
        >
          {loading || uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('common.saving')}
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {t('journal.saveJournal')}
            </>
          )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateEntry;