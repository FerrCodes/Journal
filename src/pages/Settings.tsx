import { useReminder } from '../hooks/useReminder';
import { Bell, BellOff, Clock, AlertCircle } from 'lucide-react';

function Settings() {
  const { settings, permission, requestPermission, saveSettings } = useReminder();

  const handleEnableChange = (enabled: boolean) => {
    if (enabled && permission !== 'granted') {
      requestPermission().then((granted) => {
        if (granted) {
          saveSettings({ ...settings, enabled: true });
        }
      });
    } else {
      saveSettings({ ...settings, enabled });
    }
  };

  const handleHourChange = (hour: number) => {
    saveSettings({ ...settings, hour });
  };

  const handleMinuteChange = (minute: number) => {
    saveSettings({ ...settings, minute });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
        <Bell className="w-6 h-6" />
        Pengaturan Reminder
      </h2>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md space-y-6">
        {/* Status Izin Notifikasi */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
          <div className="flex items-center gap-3">
            {permission === 'granted' ? (
              <Bell className="w-5 h-5 text-green-500" />
            ) : permission === 'denied' ? (
              <BellOff className="w-5 h-5 text-red-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            )}
            <span className="text-gray-700 dark:text-gray-300">
              Izin Notifikasi:{' '}
              <span className="font-medium">
                {permission === 'granted'
                  ? '✅ Diizinkan'
                  : permission === 'denied'
                  ? '❌ Ditolak'
                  : '⏳ Belum diminta'}
              </span>
            </span>
          </div>
          {permission !== 'granted' && (
            <button
              onClick={requestPermission}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition text-sm"
            >
              Minta Izin
            </button>
          )}
        </div>

        {/* Toggle Reminder */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Aktifkan Reminder Harian</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Dapatkan notifikasi setiap hari untuk mengingatkan menulis jurnal
            </p>
          </div>
          <button
            onClick={() => handleEnableChange(!settings.enabled)}
            className={`relative w-14 h-8 rounded-full transition ${
              settings.enabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <div
              className={`absolute top-1 w-6 h-6 bg-white rounded-full transition ${
                settings.enabled ? 'right-1' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* Pilih Waktu */}
        {settings.enabled && (
          <div className="space-y-4">
            <div>
              <label className=" font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Waktu Reminder
              </label>
              <div className="flex gap-4 items-center">
                <select
                  value={settings.hour}
                  onChange={(e) => handleHourChange(Number(e.target.value))}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>
                      {i.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
                <span className="text-gray-500 dark:text-gray-400">:</span>
                <select
                  value={settings.minute}
                  onChange={(e) => handleMinuteChange(Number(e.target.value))}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => (
                    <option key={m} value={m}>
                      {m.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400">
              ⏰ Notifikasi akan dikirim setiap hari pukul{' '}
              <strong>
                {settings.hour.toString().padStart(2, '0')}:
                {settings.minute.toString().padStart(2, '0')}
              </strong>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            💡 Notifikasi akan muncul di browser selama aplikasi terbuka. 
            Pastikan browser diizinkan mengirim notifikasi.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Settings;