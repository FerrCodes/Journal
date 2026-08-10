import jsPDF from 'jspdf';
import type { JournalEntry } from '../types/journal';
import { MOOD_OPTIONS } from '../types/journal';

export const exportSingleEntry = async (entry: JournalEntry) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = margin;

  // Title
  doc.setFontSize(20);
  doc.setTextColor(30, 58, 138);
  doc.text('Journal Entry', margin, y);
  y += 10;

  // Date
  doc.setFontSize(12);
  doc.setTextColor(100, 116, 139);
  const date = new Date(entry.created_at).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.text(`📅 ${date}`, margin, y);
  y += 8;

  // Mood
  const mood = MOOD_OPTIONS.find(m => m.value === entry.mood);
  doc.text(`Mood: ${mood?.emoji} ${mood?.label || 'Biasa Aja'}`, margin, y);
  y += 8;

  // Title
  doc.setFontSize(16);
  doc.setTextColor(31, 41, 55);
  doc.text(entry.title || 'Tanpa Judul', margin, y);
  y += 10;

  // Content
  doc.setFontSize(12);
  doc.setTextColor(55, 65, 81);
  const splitContent = doc.splitTextToSize(entry.content, pageWidth - margin * 2);
  doc.text(splitContent, margin, y);
  y += splitContent.length * 6 + 6;

  // Song
  if (entry.song_title) {
    doc.setFontSize(12);
    doc.setTextColor(30, 58, 138);
    doc.text(`🎵 ${entry.song_title}${entry.song_artist ? ` - ${entry.song_artist}` : ''}`, margin, y);
    y += 8;
  }

  // Weather
  if (entry.weather) {
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text(`☁️ Cuaca: ${entry.weather}`, margin, y);
    y += 8;
  }

  // Tags
  if (entry.tags && entry.tags.length > 0) {
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text(`Tags: ${entry.tags.map(t => `#${t}`).join(' ')}`, margin, y);
  }

  // Save
  doc.save(`jurnal_${entry.title || 'tanpa_judul'}_${new Date(entry.created_at).toISOString().split('T')[0]}.pdf`);
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
  doc.text(`Total: ${entries.length} entri`, margin, y);
  y += 10;
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

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
    const date = new Date(entry.created_at).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    doc.text(`#${index + 1} · ${date}`, margin, y);
    y += 6;

    // Mood + Title
    const mood = MOOD_OPTIONS.find(m => m.value === entry.mood);
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`${mood?.emoji} ${entry.title || 'Tanpa Judul'}`, margin, y);
    y += 6;

    // Content preview
    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);
    const preview = entry.content.length > 100 ? entry.content.substring(0, 100) + '...' : entry.content;
    const splitPreview = doc.splitTextToSize(preview, pageWidth - margin * 2);
    doc.text(splitPreview, margin, y);
    y += splitPreview.length * 5 + 4;

    // Separator
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;
  });

  // Save
  doc.save(`jurnal_semua_${new Date().toISOString().split('T')[0]}.pdf`);
};