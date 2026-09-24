import { useState } from 'react';
import { motion } from 'motion/react';
import { useTimeStore } from '@/app/store/TimeStore';
import { useOutletContext } from 'react-router';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import * as Tooltip from '@radix-ui/react-tooltip';
import * as Popover from '@radix-ui/react-popover';
import { getWorkDayType } from '../utils/holidays';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

export function CalendarGrid() {
  const { isDark } = useOutletContext<{ isDark: boolean }>();
  const { state, setManualStatus, getDailyNorm, getMonthlyBalance } = useTimeStore();

  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const startingDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const navBtn = cn(
    'lg-chip p-2 active:scale-90',
    isDark
      ? 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.06] text-[#F2F2F7]'
      : 'bg-black/[0.03] hover:bg-black/[0.06] border-black/[0.06] text-[#1C1C1E]'
  );

  const days = [];
  for (let i = 0; i < startingDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const getDayInfo = (day: number) => {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dateObj = new Date(year, month, day);
    const dayType = getWorkDayType(dateObj);
    const isWeekend = dayType === 'weekend';
    const isHoliday = dayType === 'holiday';

    const entry = state.currentUser ? state.data[state.currentUser.id]?.entries[dateKey] : undefined;

    const todayDate = new Date();
    const isToday =
      todayDate.getFullYear() === year &&
      todayDate.getMonth() === month &&
      todayDate.getDate() === day;

    let colorClass = '';
    let tooltipText = '';

    if (entry?.manualStatus === 'sick') {
      colorClass = isDark
        ? 'bg-[rgba(255,255,255,0.08)] text-[#F2F2F7] font-medium backdrop-blur-[3px] border border-white/[0.06]'
        : 'bg-[rgba(0,0,0,0.04)] text-[#1C1C1E] font-medium backdrop-blur-[3px] border border-black/[0.06]';
      tooltipText = 'Больничный';
    } else if (entry?.manualStatus === 'vacation') {
      colorClass = isDark
        ? 'bg-[#FF9F0A]/25 text-[#FF9F0A] font-bold backdrop-blur-[3px] border border-[#FF9F0A]/25'
        : 'bg-[#FF9500]/25 text-[#FF9500] font-bold backdrop-blur-[3px] border border-[#FF9500]/25';
      tooltipText = 'Отпуск';
    } else if (entry?.arrival && entry?.departure) {
      const arr = new Date(entry.arrival);
      const dep = new Date(entry.departure);
      const workedMins = (dep.getTime() - arr.getTime()) / (1000 * 60);
      const norm = getDailyNorm(dateObj);
      const delta = workedMins - norm;

      if (delta > 0) {
        colorClass = isDark
          ? 'bg-[#30D158]/25 text-[#30D158] font-bold backdrop-blur-[3px] border border-[#30D158]/25'
          : 'bg-[#34C759]/25 text-[#34C759] font-bold backdrop-blur-[3px] border border-[#34C759]/25';
        tooltipText = `Переработка: +${Math.floor(delta / 60)}ч ${Math.round(delta % 60)}м`;
      } else if (delta < 0) {
        colorClass = isDark
          ? 'bg-[#FF453A]/25 text-[#FF453A] font-bold backdrop-blur-[3px] border border-[#FF453A]/25 shadow-[0_0_10px_0_rgba(200,200,200,1)]'
          : 'bg-[#FF3B30]/25 text-[#FF3B30] font-bold backdrop-blur-[3px] border border-[#FF3B30]/25 shadow-[0_0_10px_0_rgba(200,200,200,1)]';
        tooltipText = `Недоработка: ${Math.floor(Math.abs(delta) / 60)}ч ${Math.round(Math.abs(delta) % 60)}м`;
      } else {
        colorClass = isDark
          ? 'bg-white/[0.05] text-[#F2F2F7] backdrop-blur-[3px] border-white/[0.04]'
          : 'bg-black/[0.03] text-[#1C1C1E] backdrop-blur-[3px] border-black/[0.04]';
        tooltipText = 'Норма выполнена';
      }
    } else if (isHoliday || isWeekend) {
      // Выходной/праздник — красноватая объёмная карточка
      colorClass = isDark
        ? 'bg-[#FF453A]/[0.1] hover:bg-[#FF453A]/[0.16] text-[#FF453A]/80 border-[#FF453A]/20 shadow-[0_0_10px_0_rgba(200,200,200,1)]'
        : 'bg-[#FF3B30]/[0.07] hover:bg-[#FF3B30]/[0.12] text-[#FF3B30]/70 border-[#FF3B30]/20 shadow-[0_0_10px_0_rgba(200,200,200,1)]';
      tooltipText = isHoliday ? 'Праздник' : 'Выходной';
    } else {
      // Обычный день — белая объёмная карточка, выступающая на фоне панели
      colorClass = isDark
        ? 'bg-white/[0.08] hover:bg-white/[0.12] text-[#F2F2F7] border-white/[0.06] shadow-[0_2px_10px_rgba(0,0,0,0.25)]'
        : 'bg-white hover:bg-white/90 text-[#1C1C1E] border-black/[0.04] shadow-[0_0_10px_0_rgba(200,200,200,1)]';
    }

    if (isToday) {
      // Сегодняшний день — синий, полупрозрачный, сливается с контейнером
      colorClass = isDark
        ? 'bg-[#0A84FF]/[0.15] text-[#0A84FF] font-semibold border-[#0A84FF]/25 ring-[0.5px] ring-[#0A84FF]/25 shadow-none'
        : 'bg-[#007AFF]/[0.12] text-[#007AFF] font-semibold border-[#007AFF]/25 ring-[0.5px] ring-[#007AFF]/20 shadow-none';
    }

    return { dateKey, colorClass, tooltipText };
  };

  const monthBalance = state.currentUser ? getMonthlyBalance(year, month) : 0;
  const balanceHours = Math.floor(Math.abs(monthBalance) / 60);
  const balanceMins = Math.abs(monthBalance) % 60;
  const balanceText = `${monthBalance >= 0 ? '+' : '-'}${balanceHours}ч ${balanceMins}м`;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex flex-col">
          <h3 className={cn("text-xl font-semibold tracking-tight", isDark ? "text-[#F2F2F7]" : "text-[#1C1C1E]")}>
            {MONTHS[month]} {year}
          </h3>
          <span className={cn(
            "text-sm font-medium",
            monthBalance > 0 ? "text-[#34C759]" : monthBalance < 0 ? "text-[#FF3B30]" : isDark ? "text-[#98989D]" : "text-[#8E8E93]"
          )}>
            Итог: {balanceText}
          </span>
        </div>
        <div className="flex gap-2">
          <motion.button whileTap={{ scale: 0.9 }} onClick={handlePrevMonth} className={navBtn}>
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={handleNextMonth} className={navBtn}>
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-3 mb-2">
        {WEEKDAYS.map(wd => (
          <div key={wd} className={cn(
            "text-center text-[11px] uppercase tracking-wider font-medium py-1.5",
            isDark ? "text-[#98989D]" : "text-[#8E8E93]"
          )}>
            {wd}
          </div>
        ))}
      </div>

      <Tooltip.Provider delayDuration={100}>
        <div className="grid grid-cols-7 gap-1 sm:gap-3">
          {days.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} className="aspect-square" />;

            const { dateKey, colorClass, tooltipText } = getDayInfo(day);

            return (
              <Popover.Root key={idx}>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <Popover.Trigger asChild>
                      <button className={cn(
                        "aspect-square rounded-xl sm:rounded-[14px] flex items-center justify-center text-xs sm:text-sm transition-all duration-300 border text-sm font-medium",
                        isDark ? "border-white/[0.04]" : "border-black/[0.04]",
                        colorClass
                      )}>
                        {day}
                      </button>
                    </Popover.Trigger>
                  </Tooltip.Trigger>
                  {tooltipText && (
                    <Tooltip.Portal>
                      <Tooltip.Content
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-sm z-50 backdrop-blur-[6px] border shadow-2xl",
                          isDark
                            ? 'bg-[rgba(28,28,30,0.85)] border-white/[0.06] text-[#F2F2F7]'
                            : 'bg-[rgba(255,255,255,0.85)] border-black/[0.06] text-[#1C1C1E]'
                        )}
                        sideOffset={5}
                      >
                        {tooltipText}
                        <Tooltip.Arrow className={isDark ? "fill-[rgba(28,28,30,0.85)]" : "fill-[rgba(255,255,255,0.85)]"} />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  )}
                </Tooltip.Root>

                <Popover.Portal>
                  <Popover.Content
                    className={cn(
                      "z-50 w-48 p-2 rounded-2xl shadow-2xl backdrop-blur-[8px] border",
                      isDark
                        ? 'bg-[rgba(28,28,30,0.85)] border-white/[0.06] text-[#F2F2F7]'
                        : 'bg-[rgba(255,255,255,0.85)] border-black/[0.06] text-[#1C1C1E]'
                    )}
                    sideOffset={5}
                  >
                    <div className="flex flex-col gap-1">
                      <div className={cn(
                        "px-2 py-1 text-[11px] uppercase tracking-wider font-medium mb-1",
                        isDark ? "text-[#98989D]" : "text-[#8E8E93]"
                      )}>
                        Статус на {day} {MONTHS[month].toLowerCase()}
                      </div>
                      <button
                        onClick={() => setManualStatus(dateKey, 'vacation')}
                        className={cn("text-left px-3 py-2 rounded-xl text-sm transition-colors", isDark ? "hover:bg-white/[0.06]" : "hover:bg-black/[0.04]")}
                      >
                        🟡 Отпуск
                      </button>
                      <button
                        onClick={() => setManualStatus(dateKey, 'sick')}
                        className={cn("text-left px-3 py-2 rounded-xl text-sm transition-colors", isDark ? "hover:bg-white/[0.06]" : "hover:bg-black/[0.04]")}
                      >
                        ⚪ Больничный
                      </button>
                      <button
                        onClick={() => setManualStatus(dateKey, null)}
                        className={cn("text-left px-3 py-2 rounded-xl text-sm transition-colors text-[#FF453A]", isDark ? "hover:bg-white/[0.06]" : "hover:bg-black/[0.04]")}
                      >
                        Сбросить статус
                      </button>
                    </div>
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>
            );
          })}
        </div>
      </Tooltip.Provider>

      <div className="mt-6 flex flex-wrap gap-4 text-xs sm:text-sm font-medium justify-center">
        <div className="flex items-center gap-2 opacity-60"><div className="w-2.5 h-2.5 rounded-full bg-[#34C759]" /> Переработка</div>
        <div className="flex items-center gap-2 opacity-60"><div className="w-2.5 h-2.5 rounded-full bg-[#FF3B30]" /> Недоработка</div>
        <div className="flex items-center gap-2 opacity-60"><div className="w-2.5 h-2.5 rounded-full bg-[#FF9500]" /> Отпуск</div>
        <div className="flex items-center gap-2 opacity-60"><div className="w-2.5 h-2.5 rounded-full bg-white border border-black/[0.12]" /> Больничный</div>
      </div>
    </div>
  );
}
