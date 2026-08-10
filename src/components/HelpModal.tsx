import { useEffect } from 'react';
import { X, Mail, MessageSquare, Info } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function HelpModal({ isOpen, onClose }: HelpModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md mx-2 sm:mx-4 animate-scaleIn overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Info className="w-5 h-5 text-purple-500" />
            Feedback
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Punya pertanyaan, menemukan bug, atau ingin memberikan saran fitur untuk Journal App? Hubungi dibawah ini
          </p>

          <div className="space-y-2">
            {/* Email Support */}
            <a 
              href="mailto:ferdiantoferi1303@gmail.com?subject=Feedback%20Journal%20App"
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition group"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition">
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Email</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">ferdiantoferi1303@gmail.com</p>
              </div>
            </a>

            {/* discord */}
            <button 
              disabled
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-slate-700 opacity-50 cursor-not-allowed"
            >
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Discord</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Segera hadir</p>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-700 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Journal App v1.5.0 • Dibuat oleh Feri
          </p>
        </div>
      </div>
    </div>
  );
}

export default HelpModal;