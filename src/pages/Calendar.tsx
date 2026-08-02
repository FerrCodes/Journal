import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import type { JournalEntry } from '../types/journal';
import { MOOD_OPTIONS } from '../types/journal';

function Calendar() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEntries, setSelectedEntries] = useState<JournalEntry[]>([]);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEntries();
  }, []);

  const getMoodEmoji = (mood: number) => {
    const found = MOOD_OPTIONS.find((m) => m.value === mood);
    return found ? found.emoji : '😐';
  };

  const formatDateFull = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  const hasEntryOnDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return entries.some((e) => e.created_at.startsWith(dateStr));
  };

  const getEntriesOnDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return entries.filter((e) => e.created_at.startsWith(dateStr));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(null);
    setSelectedEntries([]);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(null);
    setSelectedEntries([]);
  };

  const handleDateClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    setSelectedDate(dateStr);
    setSelectedEntries(getEntriesOnDate(date));
  };

  // ============= RENDER KALENDER =============
  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    const totalSlots = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;
    const weeks = [];
    let week = [];

    for (let i = 0; i < totalSlots; i++) {
      const dayNumber = i - firstDayOfMonth + 1;
      const date = new Date(year, month, dayNumber);
      const isToday = date.toDateString() === today.toDateString();
      const hasEntry = dayNumber > 0 && dayNumber <= daysInMonth && hasEntryOnDate(date);
      const isSelected = dayNumber > 0 && dayNumber <= daysInMonth && selectedDate === date.toISOString().split('T')[0];
      const isValid = dayNumber > 0 && dayNumber <= daysInMonth;

      week.push(
        <div
          key={i}
          className="min-h-[44px] sm:min-h-[52px] md:min-h-[60px]"
        >
          {isValid ? (
            <button
              onClick={() => handleDateClick(date)}
              className={`
                w-full h-full min-h-[44px] sm:min-h-[52px] md:min-h-[60px]
                flex flex-col items-center justify-center rounded-lg transition relative
                ${isSelected ? 'bg-blue-500 text-white dark:bg-blue-600 shadow-sm' : ''}
                ${!isSelected && isToday ? 'border-2 border-blue-500 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/20' : ''}
                ${!isSelected && !isToday && hasEntry ? 'bg-blue-50 dark:bg-slate-700 hover:bg-blue-100 dark:hover:bg-slate-600' : ''}
                ${!isSelected && !isToday && !hasEntry ? 'hover:bg-gray-100 dark:hover:bg-slate-800' : ''}
                text-gray-900 dark:text-gray-100
              `}
            >
              <span className="text-xs sm:text-sm md:text-base font-semibold leading-none">
                {dayNumber}
              </span>
              {hasEntry && !isSelected && (
                <span className="mt-1 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-blue-500 dark:bg-blue-400" />
              )}
            </button>
          ) : (
            <div className="w-full h-full min-h-[44px] sm:min-h-[52px] md:min-h-[60px]" />
          )}
        </div>
      );

      if (week.length === 7) {
        weeks.push(
          <div className="grid grid-cols-7 gap-1 calendar-grid">
            {week}
          </div>
        );
        week = [];
      }
    }

    return weeks;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-8 text-center">
        <div className="text-gray-600 dark:text-gray-400">⏳ Memuat kalender...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
            Kalender
          </h1>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-1 px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white rounded-lg transition text-sm"
        >
          <span className="hidden sm:inline">← Kembali</span>
          <span className="sm:hidden">←</span>
        </Link>
      </div>

      {/* Navigasi Bulan */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <button
          onClick={prevMonth}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition active:scale-95"
          aria-label="Bulan sebelumnya"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100">
          {new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(currentDate)}
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition active:scale-95"
          aria-label="Bulan berikutnya"
        >
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Grid Kalender */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-3 sm:p-4 md:p-6">
        {/* Hari dalam minggu */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
          {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
            <div 
              key={day} 
              className="text-center text-[10px] sm:text-xs md:text-sm font-semibold text-gray-500 dark:text-gray-400 py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Kalender */}
        <div className="space-y-1 sm:space-y-2">
          {renderCalendar()}
        </div>
      </div>

      {/* Daftar Jurnal di Tanggal Terpilih */}
      {selectedDate && (
        <div className="mt-4 sm:mt-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            📅 {formatDateFull(selectedDate)}
          </h3>
          {selectedEntries.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Tidak ada jurnal pada tanggal ini.
            </p>
          ) : (
            <div className="space-y-3">
              {selectedEntries.map((entry) => (
                <Link
                  key={entry.id}
                  to={`/entry/${entry.id}`}
                  className="block bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md border border-gray-100 dark:border-slate-700 p-3 sm:p-4 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg sm:text-xl shrink-0">{getMoodEmoji(entry.mood)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100  w-full">
                        {entry.title || 'Tanpa Judul'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 break-words w-full max-w-[200px] sm:max-w-full overflow-hidden">
                        {entry.content.length > 60 ? entry.content.substring(0, 60) + '...' : entry.content}
                      </p>
                    </div>
                    <span className="text-gray-300 dark:text-gray-600 text-sm shrink-0">→</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Calendar;