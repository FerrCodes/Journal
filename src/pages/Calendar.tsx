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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  // Cek apakah ada jurnal di tanggal tertentu
  const hasEntryOnDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return entries.some((e) => e.created_at.startsWith(dateStr));
  };

  // Ambil jurnal di tanggal tertentu
  const getEntriesOnDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return entries.filter((e) => e.created_at.startsWith(dateStr));
  };

  // Navigasi bulan
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

  // Klik tanggal
  const handleDateClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    setSelectedDate(dateStr);
    setSelectedEntries(getEntriesOnDate(date));
  };

  // Render grid kalender
  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    const days = [];
    // Empty cells for days before first day
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 sm:h-14" />);
    }

    // Days in month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === today.toDateString();
      const hasEntry = hasEntryOnDate(date);
      const isSelected = selectedDate === date.toISOString().split('T')[0];

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(date)}
          className={`
            relative h-10 sm:h-14 rounded-xl transition flex items-center justify-center text-sm sm:text-base
            ${isSelected ? 'bg-blue-500 text-white dark:bg-blue-600' : ''}
            ${!isSelected && isToday ? 'border-2 border-blue-500 dark:border-blue-400' : ''}
            ${!isSelected && hasEntry ? 'hover:bg-blue-50 dark:hover:bg-slate-700' : ''}
            ${!isSelected && !hasEntry ? 'hover:bg-gray-100 dark:hover:bg-slate-800' : ''}
            text-gray-900 dark:text-gray-100
          `}
        >
          {day}
          {hasEntry && !isSelected && (
            <span className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400" />
          )}
        </button>
      );
    }

    return days;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <div className="text-gray-600 dark:text-gray-400">⏳ Memuat kalender...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-blue-500" />
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">Kalender</h1>
          </div>
          <Link 
            to="/" 
            className="inline-flex items-center gap-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white rounded-lg transition text-sm"
          >
            <span className="hidden sm:inline">← Kembali ke Dashboard</span>
            <span className="sm:hidden">← Kembali</span>
          </Link>
        </div>

      {/* Navigasi Bulan */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prevMonth}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
          {new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(currentDate)}
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition"
        >
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Grid Kalender */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 sm:p-6">
        {/* Hari dalam minggu */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
          {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
            <div key={day} className="text-center text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Tanggal */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {renderCalendar()}
        </div>
      </div>

      {/* Daftar Jurnal di Tanggal Terpilih */}
      {selectedDate && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            {formatDate(selectedDate)}
          </h3>
          {selectedEntries.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Tidak ada jurnal pada tanggal ini.</p>
          ) : (
            <div className="space-y-3">
              {selectedEntries.map((entry) => (
                <Link
                  key={entry.id}
                  to={`/entry/${entry.id}`}
                  className="block bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md border border-gray-100 dark:border-slate-700 p-4 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{getMoodEmoji(entry.mood)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {entry.title || 'Tanpa Judul'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {entry.content.substring(0, 60)}...
                      </p>
                    </div>
                    <span className="text-gray-300 dark:text-gray-600 text-sm">→</span>
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