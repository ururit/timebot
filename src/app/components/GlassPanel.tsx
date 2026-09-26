import { type ReactNode } from 'react';

const cn = (...inputs: (string | undefined | null | false)[]) =>
  inputs.filter(Boolean).join(' ');

/**
 * Нейтральная объёмная стеклянная панель без цветного преломления.
 * Глубина строится на фаске, внутренней тени и мягком внешнем подъёме.
 */
export function GlassPanel({ children, isDark, className }: {
  children: ReactNode;
  isDark: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl backdrop-blur-[6px] backdrop-saturate-[1.05]',
        'transition-[transform,box-shadow,border-color] duration-300',
        className
      )}
      style={{
        backgroundColor: isDark
          ? 'rgba(25, 25, 28, 0.58)'
          : 'rgba(255, 255, 255, 0.16)',
        backgroundImage: isDark
          ? 'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.018) 48%, rgba(0,0,0,0.14))'
          : 'linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.025) 52%, rgba(0,0,0,0.025))',
        border: '1px solid',
        borderColor: isDark
          ? 'rgba(255, 255, 255, 0.12)'
          : 'rgba(255, 255, 255, 0.42)',
        boxShadow: isDark
          ? [
              '0 20px 48px rgba(0,0,0,0.34)',
              '0 5px 15px rgba(0,0,0,0.20)',
              'inset 0 1px 0 rgba(255,255,255,0.14)',
              'inset 0 -1px 0 rgba(0,0,0,0.40)',
              'inset 1px 0 0 rgba(255,255,255,0.05)',
            ].join(', ')
          : [
              '0 18px 42px rgba(22,24,28,0.12)',
              '0 4px 12px rgba(22,24,28,0.07)',
              'inset 0 1px 0 rgba(255,255,255,0.68)',
              'inset 0 -1px 0 rgba(0,0,0,0.07)',
              'inset 1px 0 0 rgba(255,255,255,0.16)',
            ].join(', '),
      }}
    >
      {/* Верхняя грань — отражение света на толщине стекла. */}
      <div
        className="absolute top-0 left-[8%] right-[24%] h-px rounded-full pointer-events-none z-[2]"
        style={{
          background: isDark
            ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.22) 32%, rgba(255,255,255,0.07) 74%, transparent)'
            : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.65) 32%, rgba(255,255,255,0.22) 74%, transparent)',
        }}
      />

      {/* Внутренняя фаска даёт ощущение толщины без хроматических цветов. */}
      <div
        className="absolute inset-[1.5px] rounded-[calc(1rem-1.5px)] pointer-events-none z-[2]"
        style={{
          border: '1px solid',
          borderColor: isDark
            ? 'rgba(255,255,255,0.025)'
            : 'rgba(255,255,255,0.08)',
        }}
      />

      <div className="relative z-[3]">{children}</div>
    </div>
  );
}
