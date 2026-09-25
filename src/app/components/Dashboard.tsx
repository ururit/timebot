import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTimeStore } from '@/app/store/TimeStore';
import { useOutletContext } from 'react-router';
import { Clock, TrendingUp, TrendingDown, CalendarDays, RotateCcw, EyeOff, Eye, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CalendarGrid } from './CalendarGrid';
import { WeeklyStats } from './WeeklyStats';
import { getDailyNormConfig } from '../utils/holidays';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

/**
 * Объёмное стекло — имитация физической толщины панели:
 * - светящаяся кромка сверху/слева (как у настоящего стекла на свету)
 * - плотная направленная тень снизу (панель "лежит" на фоне)
 * - внутренняя подсветка нижней кромки (свет проходит сквозь стекло)
 * - широкий диагональный блик (отражение окна/лампы)
 */
function SpecularHighlight({ isDark }: { isDark: boolean }) {
  return (
    <div className="absolute inset-0 rounded-[20px] overflow-hidden pointer-events-none z-[2]">
      {/* Верхняя светящаяся кромка — единый цветокор для обеих тем */}
      <div
        className="absolute top-0 left-[8%] right-[25%] h-[2px] rounded-full"
        style={{
          background: `linear-gradient(90deg, transparent, ${
            isDark ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.55)'
          } 30%, rgba(255,255,255,0.15) 70%, transparent)`,
          filter: 'blur(0.3px)',
          opacity: isDark ? 1 : 0.85,
        }}
      />
      {/* Светлая грань слева — приглушена в обеих */}
      <div
        className="absolute top-[8%] bottom-[40%] left-0 w-[2px] rounded-full"
        style={{
          background: `linear-gradient(180deg, ${
            isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.15)'
          }, transparent 70%)`,
          filter: 'blur(0.2px)',
        }}
      />
      {/* Внутренняя подсветка нижней кромки — приглушена в обеих */}
      <div
        className="absolute bottom-0 left-[15%] right-[15%] h-[1px] rounded-full"
        style={{
          background: isDark
            ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 40%, rgba(255,255,255,0.04) 60%, transparent)'
            : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08) 40%, rgba(255,255,255,0.05) 60%, transparent)',
        }}
      />
      {/* Внутренний контур — фаска стекла, тише в обеих */}
      <div
        className="absolute inset-[1.5px] rounded-[18px]"
        style={{
          border: '1px solid',
          borderColor: isDark
            ? 'rgba(255,255,255,0.04)'
            : 'rgba(255,255,255,0.08)',
        }}
      />
      {/* Диагональный блик — убран в обеих темах */}
      {/* Хроматическое преломление по краям — едва заметное */}
      <div
        className="absolute inset-0"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse 120% 55% at 70% 90%, rgba(10,132,255,0.03) 0%, transparent 45%), radial-gradient(ellipse 100% 40% at 15% 85%, rgba(255,69,58,0.02) 0%, transparent 40%)'
            : 'radial-gradient(ellipse 120% 55% at 70% 90%, rgba(10,132,255,0.03) 0%, transparent 45%), radial-gradient(ellipse 100% 40% at 15% 85%, rgba(255,69,58,0.02) 0%, transparent 40%)',
        }}
      />
    </div>
  );
}

export function Dashboard() {
  const { isDark } = useOutletContext<{ isDark: boolean }>();
  const { state, recordArrival, recordDeparture, resetToday, getMonthlyBalance, adjustMonthlyBalance, strictMode } = useTimeStore();

  const [remainingTime, setRemainingTime] = useState('0:00:00');
  const [timerHidden, setTimerHidden] = useState(() => {
    return localStorage.getItem('timerHidden') === 'true';
  });

  const toggleTimer = () => {
    const next = !timerHidden;
    setTimerHidden(next);
    localStorage.setItem('timerHidden', next ? 'true' : 'false');
  };

  const now = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`, [now]);

  const currentUserData = state.currentUser ? state.data[state.currentUser.id] : null;
  const todayEntry = currentUserData?.entries[todayKey];

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (todayEntry?.arrival && !todayEntry.departure) {
      interval = setInterval(() => {
        const _now = new Date();
        const arrival = new Date(todayEntry.arrival!);
        const diff = _now.getTime() - arrival.getTime();

        const standardSeconds = getDailyNormConfig(_now, strictMode) * 60;
        const targetMs = standardSeconds * 1000;
        const remaining = targetMs - diff;

        if (remaining > 0) {
          const hours = Math.floor(remaining / (1000 * 60 * 60));
          const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
          setRemainingTime(`${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
        } else {
          setRemainingTime('0:00:00');
        }
      }, 1000);
    } else {
      setRemainingTime('0:00:00');
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [todayEntry?.arrival, todayEntry?.departure]);

  const currentMonthBalance = getMonthlyBalance(now.getFullYear(), now.getMonth());
  const balanceHours = Math.floor(Math.abs(currentMonthBalance) / 60);
  const balanceMins = Math.abs(currentMonthBalance) % 60;
  const balanceText = `${currentMonthBalance >= 0 ? '+' : '-'}${balanceHours}ч ${balanceMins}м`;
  const dailyNormSeconds = getDailyNormConfig(now, strictMode) * 60;
  const shiftStart = todayEntry?.arrival ? new Date(todayEntry.arrival).getTime() : null;
  const shiftEnd = todayEntry?.departure ? new Date(todayEntry.departure).getTime() : Date.now();
  const workedSeconds = shiftStart ? Math.max(0, Math.floor((shiftEnd - shiftStart) / 1000)) : 0;
  const progressPercent = dailyNormSeconds > 0 ? Math.min(100, Math.round((workedSeconds / dailyNormSeconds) * 100)) : 0;
  const workedDuration = `${Math.floor(workedSeconds / 3600)}ч ${Math.floor((workedSeconds % 3600) / 60)}м`;
  const dailyNormDuration = `${Math.floor(dailyNormSeconds / 3600)}ч ${Math.floor((dailyNormSeconds % 3600) / 60)}м`;
  const progressStatus = todayEntry?.departure ? 'День завершён' : todayEntry?.arrival ? 'Сейчас в работе' : 'Отметь начало дня';

  const glassPanelClass = cn(
    'lg-panel rounded-[20px] transition-all duration-500',
    isDark
      ? 'bg-[rgba(28,28,30,0.6)] border-white/[0.1] shadow-[0_10px_36px_rgba(0,0,0,0.4),0_3px_10px_rgba(0,0,0,0.2),inset_0_0.5px_0_rgba(255,255,255,0.12),inset_0_-1px_2px_rgba(0,0,0,0.1)]'
      : 'bg-[rgba(217,217,217,0.48)] border-white/[0.4] shadow-[0_14px_44px_rgba(0,0,0,0.25),0_4px_12px_rgba(0,0,0,0.12),inset_0_0.5px_0_rgba(255,255,255,0.5),inset_0_-1px_1px_rgba(0,0,0,0.04)]'
  );

  // Одинаковая «левитация» для обеих кнопок (одна формула тени).
  // При нажатии кнопка уходит вровень с дэшбордом (active:shadow-none + scale).
  const btnGlow = (rgb: string) =>
    `shadow-[0_10px_36px_rgba(${rgb},0.4),0_3px_10px_rgba(${rgb},0.2),inset_0_0.5px_0_rgba(255,255,255,0.5),inset_0_1px_0_rgba(255,255,255,0.25)] active:shadow-none`;

  const smallBtnClass = cn(
    'lg-chip px-[18px] py-[8px] text-xs font-medium',
    isDark
      ? 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.06] text-[#98989D]'
      : 'bg-black/[0.03] hover:bg-black/[0.06] border-black/[0.06] text-[#8E8E93]'
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-5"
    >
      {/* Timer + Balance row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* ────── Timer panel ────── */}
        <AnimatePresence mode="wait">
          {timerHidden ? (
            <motion.button
              key="hidden"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={toggleTimer}
              className={cn(
                glassPanelClass,
                'flex flex-col items-center justify-center text-center gap-2 cursor-pointer hover:opacity-80 active:scale-[0.97] py-6'
              )}
              whileTap={{ scale: 0.97 }}
            >
              <SpecularHighlight isDark={isDark} />
              <Eye className={cn('w-5 h-5', isDark ? 'text-[#98989D]' : 'text-[#8E8E93]')} />
              <span className={cn('text-sm font-medium', isDark ? 'text-[#98989D]' : 'text-[#8E8E93]')}>
                Показать таймер
              </span>
            </motion.button>
          ) : (
            <motion.div
              key="visible"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={cn(glassPanelClass, 'flex flex-col items-center justify-center text-center relative p-8', !isDark && 'bg-[rgba(217,217,217,0)]')}
            >
              <SpecularHighlight isDark={isDark} />

              <div className="absolute top-4 right-4 flex items-center gap-2 z-[3]">
                {todayEntry?.arrival && (
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={resetToday}
                    className={cn(smallBtnClass)}
                    title="Сбросить сегодняшний день"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </motion.button>
                )}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleTimer}
                  className={cn(smallBtnClass)}
                  title="Скрыть таймер"
                >
                  <EyeOff className="w-4 h-4" />
                </motion.button>
              </div>

              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-2 mb-2 mt-6 sm:mt-0 z-[3]"
              >
                <Clock className={cn('w-5 h-5', isDark ? 'text-[#0A84FF]' : 'text-[#007AFF]')} />
                <h2 className="text-base font-semibold opacity-80">Остаток на сегодня</h2>
              </motion.div>

              <motion.div
                key={remainingTime}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'text-4xl sm:text-5xl md:text-6xl font-bold tabular-nums tracking-tight whitespace-nowrap z-[3]',
                  remainingTime === '0:00:00'
                    ? isDark
                      ? 'text-[#F2F2F7]'
                      : 'text-[#1C1C1E]'
                    : isDark
                      ? 'text-[#F2F2F7]'
                      : 'text-[#1C1C1E]'
                )}
              >
                {remainingTime}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ────── Monthly balance ────── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className={cn(glassPanelClass, 'flex flex-col items-center justify-center text-center p-8', !isDark && 'bg-[rgba(217,217,217,0)]')}
        >
          <SpecularHighlight isDark={isDark} />

          <div className="flex items-center gap-2 mb-2 z-[3]">
            <motion.div
              animate={
                currentMonthBalance >= 0
                  ? { scale: [1, 1.1, 1] }
                  : { scale: [1, 1.05, 1] }
              }
              transition={{ duration: 0.3 }}
            >
              {currentMonthBalance >= 0
                ? <TrendingUp className="w-5 h-5 text-[#34C759]" />
                : <TrendingDown className="w-5 h-5 text-[#FF3B30]" />}
            </motion.div>
            <h2 className="text-base font-semibold opacity-80">Баланс за месяц</h2>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 mt-1 z-[3]">
            <motion.button
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => adjustMonthlyBalance(now.getFullYear(), now.getMonth(), -5)}
              className={cn(
                'lg-chip w-9 h-9 sm:w-11 sm:h-11 flex-shrink-0 flex items-center justify-center font-bold text-xl sm:text-2xl',
                isDark
                  ? 'bg-white/[0.04] hover:bg-[#FF453A]/10 border-white/[0.06] text-[#FF453A]'
                  : 'bg-black/[0.03] hover:bg-[#FF3B30]/08 border-black/[0.06] text-[#FF3B30]'
              )}
              title="Убавить 5 минут"
            >
              <span className="mb-1">-</span>
            </motion.button>
            <motion.div
              key={balanceText}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'font-bold tabular-nums tracking-tight px-1 text-3xl sm:text-[48px] whitespace-nowrap',
                currentMonthBalance > 0
                  ? 'text-[#34C759]'
                  : currentMonthBalance < 0
                    ? 'text-[#FF3B30]'
                    : ''
              )}
            >
              {balanceText}
            </motion.div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => adjustMonthlyBalance(now.getFullYear(), now.getMonth(), 5)}
              className={cn(
                'lg-chip w-9 h-9 sm:w-11 sm:h-11 flex-shrink-0 flex items-center justify-center font-bold text-xl sm:text-2xl',
                isDark
                  ? 'bg-white/[0.04] hover:bg-[#30D158]/10 border-white/[0.06] text-[#30D158]'
                  : 'bg-black/[0.03] hover:bg-[#34C759]/08 border-black/[0.06] text-[#34C759]'
              )}
              title="Добавить 5 минут"
            >
              <span className="mb-1">+</span>
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* ────── Action buttons ────── */}
      <div className="grid grid-cols-2 gap-4">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          whileHover={
            !todayEntry?.arrival
              ? {
                  scale: 1.02,
                  backgroundColor: isDark
                    ? 'rgba(48,209,88,0.15)'
                    : 'rgba(52,199,89,0.12)',
                }
              : {}
          }
          whileTap={{ scale: 0.97 }}
          onClick={recordArrival}
          disabled={!!todayEntry?.arrival}
          className={cn(
            'py-10 md:py-14 lg-panel rounded-[24px] font-semibold text-xl sm:text-2xl md:text-3xl transition-all duration-300 active:scale-[0.97]',
            isDark
              ? 'bg-[#30D158]/12 border-[#30D158]/25 text-[#30D158] disabled:opacity-25 disabled:shadow-none disabled:active:scale-100'
              : 'bg-[#34C759]/12 border-[#34C759]/25 text-[#34C759] disabled:opacity-25 disabled:shadow-none disabled:active:scale-100',
            !todayEntry?.arrival ? btnGlow(isDark ? '48,209,88' : '52,199,89') : ''
          )}
        >
          {!todayEntry?.arrival && (
            <motion.div
              className="absolute inset-0 rounded-[24px]"
              animate={{
                background: isDark
                  ? [
                      'radial-gradient(circle at 30% 50%, rgba(48,209,88,0.08) 0%, transparent 60%)',
                      'radial-gradient(circle at 70% 50%, rgba(48,209,88,0.08) 0%, transparent 60%)',
                      'radial-gradient(circle at 30% 50%, rgba(48,209,88,0.08) 0%, transparent 60%)',
                    ]
                  : [
                      'radial-gradient(circle at 30% 50%, rgba(42,194,87,0.3) 0%, transparent 60%)',
                      'radial-gradient(circle at 70% 50%, rgba(42,194,87,0.3) 0%, transparent 60%)',
                      'radial-gradient(circle at 30% 50%, rgba(42,194,87,0.3) 0%, transparent 60%)',
                    ],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              style={{ boxShadow: '0 0 10px 0 rgba(200, 200, 200, 1)' }}
            />
          )}
          <span className="relative z-[1]">Я пришёл</span>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          whileHover={
            todayEntry?.arrival && !todayEntry?.departure
              ? {
                  scale: 1.02,
                  backgroundColor: isDark
                    ? 'rgba(255,69,58,0.15)'
                    : 'rgba(255,59,48,0.12)',
                }
              : {}
          }
          whileTap={{ scale: 0.97 }}
          onClick={recordDeparture}
          disabled={!todayEntry?.arrival || !!todayEntry?.departure}
          className={cn(
            'py-10 md:py-14 lg-panel rounded-[24px] font-semibold text-xl sm:text-2xl md:text-3xl transition-all duration-300 active:scale-[0.97]',
            isDark
              ? 'bg-[#FF453A]/12 border-[#FF453A]/25 text-[#FF453A] disabled:opacity-25 disabled:shadow-none disabled:active:scale-100'
              : 'bg-[rgba(246,5,5,0.2)] border-[#FF3B30]/25 text-[#FF3B30] disabled:opacity-25 disabled:shadow-none disabled:active:scale-100',
            todayEntry?.arrival && !todayEntry?.departure ? btnGlow(isDark ? '255,69,58' : '255,59,48') : ''
          )}
        >
          {todayEntry?.arrival && !todayEntry?.departure && (
            <motion.div
              className="absolute inset-0 rounded-[24px]"
              animate={{
                background: isDark
                  ? [
                      'radial-gradient(circle at 30% 50%, rgba(255,69,58,0.08) 0%, transparent 60%)',
                      'radial-gradient(circle at 70% 50%, rgba(255,69,58,0.08) 0%, transparent 60%)',
                      'radial-gradient(circle at 30% 50%, rgba(255,69,58,0.08) 0%, transparent 60%)',
                    ]
                  : [
                      'radial-gradient(circle at 30% 50%, rgba(255,59,48,0.08) 0%, transparent 60%)',
                      'radial-gradient(circle at 70% 50%, rgba(255,59,48,0.08) 0%, transparent 60%)',
                      'radial-gradient(circle at 30% 50%, rgba(255,59,48,0.08) 0%, transparent 60%)',
                    ],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
          <span className="relative z-[1]">Я ушёл</span>
        </motion.button>
      </div>

      {/* ────── Daily progress ────── */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.18 }}
        className={cn(glassPanelClass, 'relative overflow-hidden p-5 sm:p-6', !isDark && 'bg-[rgba(217,217,217,0)]')}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={cn('absolute -right-8 -top-16 h-44 w-44 rounded-full blur-3xl', isDark ? 'bg-[#0A84FF]/20' : 'bg-[#64D2FF]/30')} />
          <div className={cn('absolute -bottom-20 left-[28%] h-36 w-48 rounded-full blur-3xl', isDark ? 'bg-[#5E5CE6]/15' : 'bg-[#BF5AF2]/15')} />
        </div>
        <SpecularHighlight isDark={isDark} />
        <div className="relative z-[3] flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex min-w-0 items-center gap-3 sm:w-[35%]">
            <div className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]',
              isDark ? 'border-white/10 bg-white/[0.08] text-[#64D2FF]' : 'border-white/70 bg-white/45 text-[#007AFF]'
            )}>
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold tracking-tight">Прогресс дня</h2>
              <div className={cn('mt-1 flex items-center gap-1.5 text-xs', isDark ? 'text-[#98989D]' : 'text-[#6E6E73]')}>
                <span className={cn('h-1.5 w-1.5 rounded-full', todayEntry?.arrival && !todayEntry?.departure ? 'bg-[#30D158] shadow-[0_0_8px_rgba(48,209,88,0.8)]' : 'bg-[#0A84FF]')} />
                {progressStatus}
              </div>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center justify-between gap-3 text-xs">
              <span className={cn('font-medium', isDark ? 'text-white/75' : 'text-[#3A3A3C]')}>Отработано {workedDuration}</span>
              <span className={isDark ? 'text-[#98989D]' : 'text-[#8E8E93]'}>Норма {dailyNormDuration}</span>
            </div>
            <div className={cn('h-2.5 overflow-hidden rounded-full p-[1px] shadow-[inset_0_1px_3px_rgba(0,0,0,0.18)]', isDark ? 'bg-black/30' : 'bg-black/[0.08]')}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full bg-gradient-to-r from-[#0A84FF] via-[#5E5CE6] to-[#BF5AF2] shadow-[0_0_12px_rgba(94,92,230,0.55)]"
              />
            </div>
          </div>

          <div className="flex shrink-0 items-baseline gap-1 sm:justify-end sm:w-[12%]">
            <span className="text-3xl font-bold tabular-nums tracking-tight bg-gradient-to-br from-[#64D2FF] via-[#0A84FF] to-[#BF5AF2] bg-clip-text text-transparent">{progressPercent}</span>
            <span className={cn('text-sm font-semibold', isDark ? 'text-white/60' : 'text-[#8E8E93]')}>%</span>
          </div>
        </div>
      </motion.div>

      {/* ────── History ────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className={cn(glassPanelClass, 'p-6 text-left', !isDark && 'bg-[rgba(235,235,235,0)] text-[rgba(214,214,214,1)]')}
      >
        <SpecularHighlight isDark={isDark} />
        <div className="flex items-center gap-2 mb-5 ml-1 relative z-[3]">
          <CalendarDays className={cn('w-5 h-5', isDark ? 'text-[#0A84FF]' : 'text-[#007AFF]')} />
          <h2 className="text-base font-semibold">История отметок</h2>
        </div>
        <div className="relative z-[3]">
          <CalendarGrid />
        </div>
      </motion.div>

      {/* ────── Weekly Stats ────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
      >
        <WeeklyStats />
      </motion.div>
    </motion.div>
  );
}
