import { format, parseISO, isSameDay as isSameDayFns, startOfDay, getDate } from 'date-fns';
import { id } from 'date-fns/locale';

// Format tanggal ke "YYYY-MM-DD" (pakai local time)
export const formatDateKey = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

// Format tanggal ke key unik untuk Map (pakai angka, lebih cepat)
export const getDateKey = (date: Date): string => {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
};

// Cek apakah dua tanggal sama (ignore time)
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return isSameDayFns(date1, date2);
};

// Format tanggal ke format Indonesia (contoh: "9 Agustus 2026")
export const formatDateIndonesia = (dateString: string): string => {
  const date = parseISO(dateString);
  return format(date, 'd MMMM yyyy', { locale: id });
};

// Dapatkan awal hari (00:00:00)
export const getStartOfDay = (date: Date): Date => {
  return startOfDay(date);
};

// Dapatkan tanggal dari string
export const parseDate = (dateString: string): Date => {
  return parseISO(dateString);
};

// Format untuk display di kalender (angka hari)
export const getDayNumber = (date: Date): number => {
  return getDate(date);
};