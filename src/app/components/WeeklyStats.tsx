import { useState } from 'react';
import { motion } from 'motion/react';
import { useTimeStore } from '@/app/store/TimeStore';
import { useOutletContext } from 'react-router';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isSameDay, parseISO, differenceInSeconds } from 'date-fns';
import { ru } from 'date-fns/locale';
import { getWorkDayType, getDailyNormConfig } from '../utils/holidays';
import { SpecularHighlight } from './GlassPanel';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface EditablePillProps {
  label: string;
  value: string | null;
  onSave: (val: string | null) => void;
  isDark: boolean;
}

function EditablePill({ label, value, onSave, isDark }: EditablePillProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const displayValue = value ? format(parseISO(value), 'HH:mm') : '-';

  const handleSave = () => {
    if (editValue === '') {
      onSave(null);
    } else if (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(editValue)) {
      onSave(editValue);
    }
    setIsEditing(false);
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all border backdrop-blur-[3px]",
        isDark
          ? "bg-white/[0.04] border-white/[0.04] hover:bg-white/[0.07]"
          : "bg-black/[0.02] border-black/[0.04] hover:bg-black/[0.04]"
      )}
      onClick={() => {
        if (!isEditing) {
          setIsEditing(true);
          setEditValue(value ? format(parseISO(value), 'HH:mm') : '');
        }
      }}
    >
      <span className={cn("font-medium text-[12px]", isDark ? "text-[#98989D]" : "text-[#6E6E73]")}>{label}</span>
      {isEditing ? (
        <input
          autoFocus
          className={cn(
            "w-12 bg-transparent text-right outline-none font-semibold text-[13px]",
            isDark ? "text-[#F2F2F7]" : "text-[#1C1C1E]"
          )}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          placeholder="00:00"
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') setIsEditing(false);
          }}
        />
      ) : (
        <span className={cn("font-medium cursor-pointer text-[12px]", isDark ? "text-[#F2F2F7]" : "text-[#1C1C1E]")}>{displayValue}</span>
      )}
    </div>
  );
}

export function WeeklyStats() {
  const { isDark } = useOutletContext<{ isDark: boolean }>();
  const { state, updateEntry } = useTimeStore();
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: currentWeekStart, end: weekEnd });
  const workDays = weekDays.filter(day => {
    const dayOfWeek = day.getDay();
    if (dayOfWeek >= 1 && dayOfWeek <= 5) return true;
    return getWorkDayType(day) === 'work';
  });

  const nextWeek = () => setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  const prevWeek = () => setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  const resetToToday = () => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const calculateTotalWorkTime = (arrival: string | null, departure: string | null) => {
    if (!arrival || !departure) return 0;
    try {
      const arr = parseISO(arrival);
      const dep = parseISO(departure);
      return Math.max(0, differenceInSeconds(dep, arr));
    } catch { return 0; }
  };

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}ч ${m}м`;
  };

  const formatOvertime = (seconds: number, standardSeconds: number) => {
    const diff = seconds - standardSeconds;
    const isNegative = diff < 0;
    const absSeconds = Math.abs(diff);
    const h = Math.floor(absSeconds / 3600);
    const m = Math.floor((absSeconds % 3600) / 60);

    if (diff === 0) return '0ч 0м';

    const sign = isNegative ? '-' : '+';
    return `${sign}${h}ч ${m}м`;
  };

  const glassPanelClass = cn(
    "lg-panel p-6 sm:p-8 rounded-[20px] transition-all duration-500",
    isDark
      ? 'bg-[rgba(28,28,30,0.6)] border-white/[0.1] shadow-[0_10px_36px_rgba(0,0,0,0.4),0_3px_10px_rgba(0,0,0,0.2),inset_0_-1px_2px_rgba(0,0,0,0.1)]'
      : 'bg-[rgba(255,255,255,0.58)] border-white/[0.62] shadow-[0_14px_44px_rgba(0,0,0,0.16),0_4px_12px_rgba(0,0,0,0.08),inset_0_0.5px_0_rgba(255,255,255,0.72),inset_0_-1px_1px_rgba(0,0,0,0.03)]'
  );

  const navBtn = cn(
    "lg-chip p-2 rounded-xl active:scale-90",
    isDark
      ? "bg-white/[0.04] border-white/[0.06] hover:bg-white/[0.08] text-[#F2F2F7]"
      : "bg-black/[0.03] border-black/[0.06] hover:bg-black/[0.06] text-[#1C1C1E]"
  );

  let weeklyTotalSeconds = 0;
  let weeklyTotalStandardSeconds = 0;

  return (
    <div className="space-y-4">
      <div className={cn(glassPanelClass, "overflow-hidden")}>
        <SpecularHighlight isDark={isDark} />
        <div className="relative z-[3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <CalendarDays className={cn("w-5 h-5", isDark ? "text-[#0A84FF]" : "text-[#007AFF]")} />
            <h2 className={cn("text-lg font-semibold tracking-tight", isDark ? "text-[#F2F2F7]" : "text-[#1C1C1E]")}>
              Статистика недели
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <motion.button whileTap={{ scale: 0.9 }} onClick={prevWeek} className={navBtn}>
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={resetToToday}
              className={cn(navBtn, "px-4 text-sm font-medium")}
            >
              Сегодня
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={nextWeek} className={navBtn}>
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        <div className={cn(
          "relative z-[3] grid gap-3",
          workDays.length === 6 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5"
        )}>
          {workDays.map((day, idx) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const entry = state.currentUser ? state.data[state.currentUser.id]?.entries[dateStr] : null;
            const dayType = getWorkDayType(day);
            const isToday = isSameDay(day, new Date());
            const isWeekend = day.getDay() === 0 || day.getDay() === 6;
            const totalSeconds = calculateTotalWorkTime(entry?.arrival || null, entry?.departure || null);

            const isHoliday = dayType === 'holiday';

            const standardSeconds = getDailyNormConfig(day) * 60;

            weeklyTotalSeconds += totalSeconds;
            weeklyTotalStandardSeconds += standardSeconds;

            const diff = totalSeconds - standardSeconds;

            return (
              <motion.div
                key={dateStr}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className={cn(
                  "lg-panel p-4 sm:p-5 rounded-[20px] transition-all duration-300 flex flex-col",
                  isDark
                    ? isToday
                      ? "bg-[#0A84FF]/[0.06] border-[#0A84FF]/20 ring-[0.5px] ring-[#0A84FF]/25"
                      : "bg-white/[0.03] border-white/[0.04]"
                    : cn(
                      isToday && !isWeekend ? "bg-[#EAF3FA]" : "bg-white",
                      "border-black/[0.04] shadow-[0_0_48px_0_rgba(0,0,0,0.18)]",
                      isToday && !isWeekend && "border-[#007AFF]/20 ring-[0.5px] ring-[#007AFF]/20"
                    )
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={cn(
                    "font-semibold text-base",
                    isHoliday ? (isDark ? "text-[#FF453A]" : "text-[#D70015]") : isDark ? "text-[#F2F2F7]" : "text-[#1C1C1E]"
                  )}>
                    {format(day, 'cccccc', { locale: ru })}
                  </span>
                  <span className={cn("text-sm font-medium", isDark ? "text-[#98989D]" : "text-[#6E6E73]")}>
                    {format(day, 'dd')}
                  </span>
                </div>

                <div className="flex flex-col gap-2 flex-1">
                  <EditablePill
                    label="Приход"
                    value={entry?.arrival || null}
                    onSave={(val) => updateEntry(dateStr, 'arrival', val)}
                    isDark={isDark}
                  />
                  <EditablePill
                    label="Уход"
                    value={entry?.departure || null}
                    onSave={(val) => updateEntry(dateStr, 'departure', val)}
                    isDark={isDark}
                  />
                </div>

                <hr className={cn("my-3 border-t", isDark ? "border-white/[0.05]" : "border-black/[0.05]")} />

                <div className="flex items-center justify-between mt-auto">
                  <span className={cn("text-[13px]", isDark ? "text-[#98989D]" : "text-[#6E6E73]")}>
                    Итог:
                  </span>
                  <span className={cn(
                    "font-semibold text-[14px]",
                    isHoliday && totalSeconds === 0 ? (isDark ? "text-[#98989D]" : "text-[#6E6E73]") : diff > 0 ? (isDark ? "text-[#34C759]" : "text-[#248A3D]") : diff < 0 ? "text-[#FF3B30]" : ""
                  )}>
                    {isHoliday && totalSeconds === 0 ? (
                      "Выходной"
                    ) : totalSeconds > 0 ? (
                      formatOvertime(totalSeconds, standardSeconds)
                    ) : (
                      "-"
                    )}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className={cn(glassPanelClass, "overflow-hidden")}>
        <SpecularHighlight isDark={isDark} />
        <div className="relative z-[3] grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-12 h-12 rounded-[16px] flex items-center justify-center border",
            isDark ? "bg-[#0A84FF]/10 border-[#0A84FF]/20" : "bg-[#007AFF]/10 border-[#007AFF]/20"
          )}>
            <CalendarDays className={cn("w-6 h-6", isDark ? "text-[#0A84FF]" : "text-[#007AFF]")} />
          </div>
          <div>
            <span className={cn("block text-xs font-medium mb-0.5 uppercase tracking-wider", isDark ? "text-[#98989D]" : "text-[#6E6E73]")}>
              Отработано
            </span>
            <span className={cn("text-3xl font-bold tabular-nums tracking-tight", isDark ? "text-[#F2F2F7]" : "text-[#1C1C1E]")}>
              {formatDuration(weeklyTotalSeconds)}
            </span>
          </div>
        </div>

        <div className={cn(
          "flex items-center justify-start md:justify-end gap-4 border-t md:border-t-0 md:border-l pt-5 md:pt-0 md:pl-6",
          isDark ? "border-white/[0.06]" : "border-black/[0.06]"
        )}>
          <div className="text-left md:text-right">
            <span className={cn("block text-xs font-medium mb-0.5 uppercase tracking-wider", isDark ? "text-[#98989D]" : "text-[#6E6E73]")}>
              {weeklyTotalSeconds >= weeklyTotalStandardSeconds ? "Переработка" : "Недоработка"}
            </span>
            <div className="flex items-center md:justify-end gap-3">
              <span className={cn(
                "text-3xl font-bold tabular-nums tracking-tight transition-colors border border-transparent",
                (weeklyTotalSeconds - weeklyTotalStandardSeconds) >= 0
                  ? isDark ? "text-[#34C759]" : "text-[#248A3D]"
                  : isDark ? "text-[#FF3B30]" : "text-[rgba(204,0,0,1)]"
              )}>
                {formatOvertime(weeklyTotalSeconds, weeklyTotalStandardSeconds)}
              </span>
              {(weeklyTotalSeconds - weeklyTotalStandardSeconds) > 0 ? (
                <div className={cn("px-2 py-0.5 rounded-md text-xs font-bold uppercase", isDark ? "bg-[#34C759]/15 text-[#34C759]" : "bg-[#248A3D]/15 text-[#248A3D]")}>
                  OK
                </div>
              ) : (weeklyTotalSeconds - weeklyTotalStandardSeconds) < 0 && (
                <div className="px-2 py-0.5 rounded-md bg-[#FF3B30]/15 text-[#FF3B30] text-xs font-bold uppercase">
                  -
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
