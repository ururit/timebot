import { type ReactNode } from 'react';

const cn = (...inputs: (string | undefined | null | false)[]) =>
  inputs.filter(Boolean).join(' ');

/**
 * Современный календарь в тренде 2026 — минимализм, градиенты, неоновые акценты.
 */
export function GlassCalendarGrid({ isDark }: { isDark: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-[20px] transition-all duration-500">
      {/* Фон с градиентными блобами */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 15% 15%, rgba(10,132,255,0.25) 0%, transparent 60%), radial-gradient(circle at 75% 85%, rgba(94,92,230,0.2) 0%, transparent 60%), radial-gradient(circle at 30% 70%, rgba(48,209,88,0.15) 0%, transparent 60%), radial-gradient(circle at 70% 20%, rgba(255,159,10,0.18) 0%, transparent 60%)`,
        }}
      />

      {/* Неоновая подсветка — имитация света от экрана */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background: `linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 40%), linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 20%)`,
          backgroundSize: '300% 100%',
          animation: 'shimmer 12s linear infinite',
        }}
      />

      {/* Основная сетка — прозрачная поверхность */}
      <div className="relative p-6 text-left">
        <div className="grid grid-cols-7 gap-2 w-full">
          {/* Заголовки дней */}
          {['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'].map((day, idx) => (
            <div key={idx} className="text-xs font-medium text-center py-1">
              {day}
            </div>
          ))}

          {/* Дни месяца — современные, с неоновыми акцентами */}
          {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
            <div
              key={day}
              className="flex items-center justify-center h-16 w-16 rounded-xl bg-white/[0.06] dark:bg-black/[0.06] border border-white/[0.08] dark:border-white/[0.08] shadow-sm hover:shadow-md transition-shadow duration-200"
              style={{
                // Условия для выделения дней
                backgroundColor: day % 5 === 0 ? 'rgba(255, 69, 58, 0.08)' : 'transparent',
                boxShadow: day % 5 === 0 ? 'inset 0 0.5px 0 rgba(255, 255, 255, 0.08)' : '',
              }}
            >
              {day}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}