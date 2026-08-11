import jsPDF from 'jspdf';
import type { JournalEntry } from '../types/journal';
import i18n from '../i18n';

// Helper function untuk ambil terjemahan
const t = (key: string) => i18n.t(key);

// Helper function untuk format tanggal ikut bahasa
const formatDate = (dateString: string, includeTime = false) => {
  const date = new Date(dateString);
  const locale = i18n.language === 'en' ? 'en-US' : 'id-ID';
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...(includeTime && { hour: '2-digit', minute: '2-digit' }),
  }).format(date);
};

// Helper function untuk dapetin label mood TANPA emoji (biar nggak error di PDF)
const getMoodLabel = (moodValue: number) => {
  // Ambil terjemahan mood dari i18n (misal: "Senang" atau "Happy")
  return t(`moods.${moodValue}`);
};

export const exportSingleEntry = async (entry: JournalEntry) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = margin;

  // Header Title
  doc.setFontSize(22);
  doc.setTextColor(30, 58, 138); // Biru tua
  doc.text(t('detail.title'), margin, y);
  y += 12;

  // Date & Time
  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139); // Abu-abu
  doc.text(formatDate(entry.created_at, true), margin, y);
  y += 8;

  // Mood (Tanpa Emoji!)
  doc.setTextColor(55, 65, 81);
  doc.text(`${t('detail.mood')}: ${getMoodLabel(entry.mood)}`, margin, y);
  y += 12;

  // Entry Title
  doc.setFontSize(18);
  doc.setTextColor(31, 41, 55); // Hitam keabu-abuan
  const titleText = entry.title || t('dashboard.untitled');
  doc.text(titleText, margin, y);
  y += 10;

  // Garis pemisah
  doc.setDrawColor(229, 231, 235);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // Content
  doc.setFontSize(12);
  doc.setTextColor(55, 65, 81);
  const splitContent = doc.splitTextToSize(entry.content, pageWidth - margin * 2);
  doc.text(splitContent, margin, y);
  y += splitContent.length * 7 + 10;

  // Song Section
  if (entry.song_title) {
    doc.setFontSize(12);
    doc.setTextColor(30, 58, 138);
    doc.text(`${t('detail.favoriteSongToday')}:`, margin, y);
    y += 7;
    
    doc.setTextColor(55, 65, 81);
    const songText = `${entry.song_title}${entry.song_artist ? ` - ${entry.song_artist}` : ''}`;
    doc.text(songText, margin + 5, y);
    y += 10;
  }

  // Weather Section
  if (entry.weather) {
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text(`${t('journal.weatherLabel')}: ${entry.weather}`, margin, y);
    y += 10;
  }

  // Tags Section
  if (entry.tags && entry.tags.length > 0) {
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text(`Tags: ${entry.tags.map(tag => `#${tag}`).join(' ')}`, margin, y);
  }

  // Footer (PERBAIKAN: doc.getNumberOfPages())
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(`Journal App • ${t('settings.createdBy')} Feri`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
  }

  // Save File
  const fileName = entry.title ? entry.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'untitled';
  doc.save(`${fileName}_${new Date(entry.created_at).toISOString().split('T')[0]}.pdf`);
};

export const exportAllEntries = async (entries: JournalEntry[]) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = margin;

  // Header
  doc.setFontSize(24);
  doc.setTextColor(30, 58, 138);
  doc.text('Journal App', margin, y);
  y += 10;

  doc.setFontSize(12);
  doc.setTextColor(100, 116, 139);
  // Gunakan terjemahan untuk "Total: X entri"
  doc.text(`${t('stats.totalJournals')}: ${entries.length} ${t('dashboard.entries')}`, margin, y);
  y += 10;

  // Garis pemisah header
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 12;

  // Loop entries
  entries.forEach((entry, index) => {
    // Check if need new page
    if (y > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage();
      y = margin;
    }

    // Date
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`#${index + 1} • ${formatDate(entry.created_at)}`, margin, y);
    y += 6;

    // Mood + Title (Tanpa Emoji!)
    doc.setFontSize(12);
    doc.setTextColor(31, 41, 55);
    const titleText = entry.title || t('dashboard.untitled');
    doc.text(`${getMoodLabel(entry.mood)} - ${titleText}`, margin, y);
    y += 6;

    // Content preview
    doc.setFontSize(10);
    doc.setTextColor(75, 85, 99);
    const preview = entry.content.length > 150 ? entry.content.substring(0, 150) + '...' : entry.content;
    const splitPreview = doc.splitTextToSize(preview, pageWidth - margin * 2);
    doc.text(splitPreview, margin, y);
    y += splitPreview.length * 5 + 6;

    // Separator antar jurnal
    doc.setDrawColor(230, 230, 230);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;
  });

  // Footer di setiap halaman (PERBAIKAN: doc.getNumberOfPages())
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(`Journal App • ${t('settings.createdBy')} Feri`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
  }

  // Save File
  doc.save(`journal_export_${new Date().toISOString().split('T')[0]}.pdf`);
};