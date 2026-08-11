import { useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import type { JournalEntry } from '../types/journal';
import { MOOD_OPTIONS } from '../types/journal';
import { useTranslation } from 'react-i18next';
import { 
  formatDateKey, 
  getDateKey, 
  formatDateIndonesia, 
  isSameDay,
  parseDate
} from '../utils/dateUtils';

interface DayCellProps {
  dayNumber: number;
  date: Date;
  isToday: boolean;
  hasEntry: boolean;
  isSelected: boolean;
  onClick: (date: Date) => void;
}

const DayCell = ({ 
  dayNumber, 
  date, 
  isToday, 
  hasEntry, 
  isSelected, 
  onClick 
}: DayCellProps) => {
  return (
    <div className="min-h-[44px] sm:min-h-[52px] md:min-h-[60px]">
      <button
        onClick={() => onClick(date)}
        className={`
          w-full h-full min-h-[44px] sm:min-h-[52px] md:min-h-[60px]
          flex flex-col items-center justify-center rounded-lg transition relative
          ${isSelected ? 'bg-blue-500 text-white dark:bg-blue-600 shadow-sm' : ''}
          ${!isSelected && isToday ? 'border-2 border-blue-500 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/20' : ''}
          ${!isSelected && !isToday && hasEntry ? 'bg-blue-50 dark:bg-slate-700 hover:bg-blue-100 dark:hover:bg-slate-600' : ''}
          ${!isSelected && !isToday && !hasEntry ? 'hover:bg-gray-100 dark:hover:bg-slate-800' : ''}
          text-gray-900 dark:text-gray-100
        `}
        aria-label={`${dayNumber} ${hasEntry ? 'Ada jurnal' : 'Tidak ada jurnal'}`}
      >
        <span className="text-xs sm:text-sm md:text-base font-semibold leading-none">
          {dayNumber}
        </span>
        {hasEntry && !isSelected && (
          <span className="mt-1 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-blue-500 dark:bg-blue-400" />
        )}
      </button>
    </div>
  );
};

function Calendar() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { t, i18n } = useTranslation();

  // Group entries by date
  const entriesByDate = useMemo(() => {
    const map = new Map<string, JournalEntry[]>();
    entries.forEach(entry => {
      const entryDate = parseDate(entry.created_at);
      const key = getDateKey(entryDate);
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(entry);
    });
    return map;
  }, [entries]);

  // Cache dates untuk bulan yang sedang aktif
  const monthDates = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const totalSlots = Math.ceil((firstDay + daysInMonth) / 7) * 7;
    
    const dates = [];
    for (let i = 0; i < totalSlots; i++) {
      const dayNumber = i - firstDay + 1;
      const isValid = dayNumber > 0 && dayNumber <= daysInMonth;
      const date = isValid ? new Date(year, month, dayNumber) : null;
      dates.push({ date, isValid, dayNumber });
    }
    return dates;
  }, [currentDate]);

  // FETCH ENTRIES - Perbaiki di sini!
  useEffect(() => {
    const loadEntries = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

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

    loadEntries();
  }, []);

  const getMoodEmoji = useCallback((mood: number | null | undefined) => {
    if (mood === null || mood === undefined) return '😐';
    const found = MOOD_OPTIONS.find((m) => m.value === mood);
    return found ? found.emoji : '😐';
  }, []);

  const hasEntryOnDate = useCallback((date: Date): boolean => {
    const key = getDateKey(date);
    return entriesByDate.has(key);
  }, [entriesByDate]);

  const getEntriesOnDate = useCallback((date: Date): JournalEntry[] => {
    const key = getDateKey(date);
    return entriesByDate.get(key) || [];
  }, [entriesByDate]);

  const prevMonth = useCallback(() => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDate(null);
  }, []);

  const nextMonth = useCallback(() => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDate(null);
  }, []);

  const handleDateClick = useCallback((date: Date) => {
    const dateStr = formatDateKey(date);
    setSelectedDate(dateStr);
  }, []);

  const renderCalendar = useCallback(() => {
  const today = new Date();
  const weeks: React.ReactNode[] = [];
  let week: React.ReactNode[] = [];
  let weekIndex = 0;

  monthDates.forEach(({ date, isValid, dayNumber }, index) => {
    if (isValid && date) {
      const isToday = isSameDay(date, today);
      const hasEntry = hasEntryOnDate(date);
      const dateKey = formatDateKey(date);
      const isSelected = selectedDate === dateKey;

      week.push(
        <DayCell
          key={`day-${index}`}
          dayNumber={dayNumber}
          date={date}
          isToday={isToday}
          hasEntry={hasEntry}
          isSelected={isSelected}
          onClick={handleDateClick}
        />
      );
    } else {
      week.push(
        <div key={`empty-${index}`} className="w-full h-full min-h-[44px] sm:min-h-[52px] md:min-h-[60px]" />
      );
    }

    if (week.length === 7) {
      weeks.push(
        <div key={`week-${weekIndex}`} className="grid grid-cols-7 gap-1">
          {week}
        </div>
      );
      week = [];
      weekIndex++;
    }
  });

  return weeks;
}, [monthDates, selectedDate, hasEntryOnDate, handleDateClick]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-8 text-center">
        <div className="animate-pulse text-gray-600 dark:text-gray-400">
          ⏳ {t('common.loading')}
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-blue-500" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {t('calendar.title')}
            </h1>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white rounded-lg transition text-sm"
          >
            ← Kembali
          </Link>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-8 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {t('calendar.noJournalsTitle')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {t('calendar.noJournalsDesc')}
          </p>
          <Link
            to="/new"
            className="inline-block mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
          >
            + {t('calendar.createJournal')}
          </Link>
        </div>
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
            {t('calendar.title')}
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
          {new Intl.DateTimeFormat(i18n.language === 'en' ? 'en-US' : 'id-ID', { month: 'long', year: 'numeric' }).format(currentDate)}
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
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
          {(i18n.language === 'en' 
            ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] 
            : ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
          ).map((day) => (
            <div 
              key={day} 
              className="text-center text-[10px] sm:text-xs md:text-sm font-semibold text-gray-500 dark:text-gray-400 py-1"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="space-y-1 sm:space-y-2">
          {renderCalendar()}
        </div>
      </div>

      {/* Daftar Jurnal di Tanggal Terpilih */}
      {selectedDate && (
        <div className="mt-4 sm:mt-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            📅 {formatDateIndonesia(selectedDate)}
          </h3>
          {(() => {
            const [year, month, day] = selectedDate.split('-').map(Number);
            const dateObj = new Date(year, month - 1, day);
            const entriesOnDate = getEntriesOnDate(dateObj);
            
            if (entriesOnDate.length === 0) {
              return (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('calendar.noEntriesOnDate')}
                </p>
              );
            }

            return (
              <div className="space-y-3">
                {entriesOnDate.map((entry) => (
                  <Link
                    key={entry.id}
                    to={`/entry/${entry.id}`}
                    className="block bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md border border-gray-100 dark:border-slate-700 p-3 sm:p-4 transition hover:border-blue-300 dark:hover:border-blue-700"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg sm:text-xl shrink-0">{getMoodEmoji(entry.mood)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {entry.title || t('dashboard.untitled')}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 break-words">
                          {entry.content.length > 60 ? entry.content.substring(0, 60) + '...' : entry.content}
                        </p>
                      </div>
                      <span className="text-gray-300 dark:text-gray-600 text-sm shrink-0">→</span>
                    </div>
                  </Link>
                ))}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

export default Calendar;