import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useUIStore } from '../../store/uiStore';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export function AppShell() {
  const { toasts, removeToast } = useUIStore();

  const toastIcon = (type: string) => {
    if (type === 'success') return <CheckCircle size={16} className="text-green-400" />;
    if (type === 'error') return <AlertCircle size={16} className="text-red-400" />;
    return <Info size={16} className="text-blue-400" />;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      {/* Toast notifications */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              className="flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 shadow-xl max-w-sm"
            >
              {toastIcon(toast.type)}
              <p className="text-sm text-slate-100 flex-1">{toast.message}</p>
              <button onClick={() => removeToast(toast.id)} className="text-slate-500 hover:text-white">
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
