import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTimeStore } from '@/app/store/TimeStore';
import { useOutletContext } from 'react-router';
import { RefreshCw, CheckCircle2, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export function AutoPunch() {
  const { isDark } = useOutletContext<{ isDark: boolean }>();
  const { state, isReady, recordArrival, recordDeparture, resetToday } = useTimeStore();
  const [statusMsg, setStatusMsg] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    if (!isReady || !state.currentUser) return;

    const now = new Date();
    const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const userData = state.data[state.currentUser.id];
    const todayEntry = userData?.entries[todayKey];

    if (!todayEntry || !todayEntry.arrival) {
      recordArrival();
      setStatusMsg('Время прихода успешно зафиксировано!');
    } else if (todayEntry.arrival && !todayEntry.departure) {
      recordDeparture();
      setStatusMsg('Время ухода успешно зафиксировано!');
    } else if (todayEntry.arrival && todayEntry.departure) {
      setShowResetConfirm(true);
      setStatusMsg('Вы уже отметили приход и уход сегодня.');
    }
  }, [isReady, state.currentUser?.id]);

  const handleReset = () => {
    resetToday();
    setShowResetConfirm(false);
    setStatusMsg('Сброшено. Перезагрузите страницу для новой отметки.');
  };

  const glassPanel = isDark
    ? 'bg-[rgba(28,28,30,0.72)] border-white/[0.06] shadow-[0_2px_24px_rgba(0,0,0,0.2)]'
    : 'bg-[rgba(255,255,255,0.48)] border-white/[0.4] shadow-[0_14px_44px_rgba(0,0,0,0.25),0_4px_12px_rgba(0,0,0,0.12),inset_0_0.5px_0_rgba(255,255,255,0.5)]';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "lg-panel max-w-md mx-auto p-8 rounded-[24px]",
        glassPanel
      )}
    >
      <div className="flex flex-col items-center text-center gap-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 150, damping: 12 }}
          className={cn(
            "lg-chip w-20 h-20 rounded-full flex items-center justify-center",
            isDark
              ? showResetConfirm
                ? "bg-[#FF9F0A]/10 border-[#FF9F0A]/20"
                : "bg-[#30D158]/10 border-[#30D158]/20"
              : showResetConfirm
                ? "bg-[#FF9500]/10 border-[#FF9500]/20"
                : "bg-[#34C759]/10 border-[#34C759]/20"
          )}
        >
          <motion.div
            animate={{ rotate: showResetConfirm ? 180 : 0 }}
            transition={{ duration: 0.4 }}
          >
            {showResetConfirm ? (
              <RefreshCw className={cn("w-10 h-10", isDark ? "text-[#FF9F0A]" : "text-[#FF9500]")} />
            ) : (
              <CheckCircle2 className={cn("w-10 h-10", isDark ? "text-[#30D158]" : "text-[#34C759]")} />
            )}
          </motion.div>
        </motion.div>

        <div>
          <h2 className={cn(
            "text-2xl font-semibold tracking-tight mb-1",
            isDark ? "text-[#F2F2F7]" : "text-[#1C1C1E]"
          )}>
            Автоматическая отметка
          </h2>
          <p className={cn(
            "text-base",
            isDark ? "text-[#98989D]" : "text-[#6E6E73]"
          )}>
            {statusMsg}
          </p>
        </div>

        <AnimatePresence>
          {showResetConfirm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={cn(
                "lg-panel w-full space-y-4 p-6 rounded-[20px] overflow-hidden",
                isDark ? "bg-white/[0.03] border-white/[0.06]" : "bg-black/[0.02] border-black/[0.06]"
              )}
            >
              <p className={cn("font-medium", isDark ? "text-[#F2F2F7]" : "text-[#1C1C1E]")}>
                Хотите сбросить сегодняшние отметки?
              </p>
              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleReset}
                  className="flex-1 py-3 rounded-2xl font-medium transition-all bg-[#FF453A] hover:bg-[#FF453A]/80 text-white shadow-[0_2px_12px_rgba(255,69,58,0.2)]"
                >
                  Да, сбросить
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowResetConfirm(false)}
                  className={cn(
                    "flex-1 py-3 rounded-2xl font-medium transition-all backdrop-blur-[3px] border",
                    isDark
                      ? "bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.06] text-[#F2F2F7]"
                      : "bg-black/[0.03] hover:bg-black/[0.06] border-black/[0.06] text-[#1C1C1E]"
                  )}
                >
                  Отмена
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
