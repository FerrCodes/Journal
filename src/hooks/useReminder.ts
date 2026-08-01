import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';

interface ReminderSettings {
  enabled: boolean;
  hour: number;
  minute: number;
}

export function useReminder() {
  const [settings, setSettings] = useState<ReminderSettings>(() => {
    const saved = localStorage.getItem('reminderSettings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return { enabled: false, hour: 21, minute: 0 };
  });

  const [permission, setPermission] = useState<NotificationPermission>('default');

  // Cek izin notifikasi saat pertama kali
  useEffect(() => {
    if ('Notification' in window) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
      setPermission(Notification.permission);
    }
  }, []);

  // Minta izin notifikasi
  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Browser tidak mendukung notifikasi.');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      toast.error('Izin notifikasi ditolak. Silakan izinkan di pengaturan browser.');
      return false;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    return result === 'granted';
  };

  // Simpan pengaturan
  const saveSettings = (newSettings: ReminderSettings) => {
    setSettings(newSettings);
    localStorage.setItem('reminderSettings', JSON.stringify(newSettings));
    
    if (newSettings.enabled) {
      toast.success(`✅ Reminder diatur pada ${newSettings.hour.toString().padStart(2, '0')}:${newSettings.minute.toString().padStart(2, '0')}`);
    } else {
      toast.info('⏰ Reminder dimatikan');
    }
  };

  // Kirim notifikasi
const sendNotification = useCallback((title: string, body: string) => {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  try {
    new Notification(title, {
      body: body,
      icon: '📓',
      silent: false,
    });
  } catch (error) {
    console.error('Gagal mengirim notifikasi:', error);
  }
}, []);

const checkReminder = useCallback(() => {
  if (!settings.enabled) return;
  if (Notification.permission !== 'granted') return;

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  if (currentHour === settings.hour && currentMinute === settings.minute) {
    const lastSent = localStorage.getItem('lastReminderDate');
    const today = new Date().toDateString();
    
    if (lastSent !== today) {
      sendNotification(
        '📓 Waktunya Menulis Jurnal!',
        'Jangan lupa tulis pengalaman hari ini di Journal App 📝'
      );
      localStorage.setItem('lastReminderDate', today);
    }
  }
}, [settings.enabled, settings.hour, settings.minute, sendNotification]);

  // Setup interval setiap menit
  useEffect(() => {
    if (!settings.enabled) return;

    const interval = setInterval(checkReminder, 60000); // 1 menit
    return () => clearInterval(interval);
  }, [settings.enabled, checkReminder]);

  return {
    settings,
    permission,
    requestPermission,
    saveSettings,
    sendNotification,
  };
}