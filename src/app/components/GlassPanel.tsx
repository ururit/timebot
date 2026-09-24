import { type ReactNode } from 'react';

const cn = (...inputs: (string | undefined | null | false)[]) =>
  inputs.filter(Boolean).join(' ');

/**
 * Объёмная стеклянная панель в стиле Liquid Glass.
 *
 * Эффект объёма достигается за счёт:
 * 1. Многослойной границы с преломлением (внешняя / внутренняя)
 * 2. Specular бликов, фиксированных под углом (свет падает слева-сверху)
 * 3. Цветных теней — имитация хроматического преломления
 * 4. Толщины стекла (inset border + внешний border)
 * 5. Бегущего шиммера по диагонали
 */
export function GlassPanel({ children, isDark, className }: {
  children: ReactNode;
  isDark: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden',
        'rounded-2xl backdrop-blur-[8px] backdrop-saturate-[1.2]',
        'transition-shadow duration-500',
        className
      )}
      style={{
        // Основной фон — полупрозрачный, но со слабой тонировкой
        backgroundColor: isDark
          ? 'rgba(22, 22, 26, 0.7)'
          : 'rgba(245, 247, 250, 0.6)',

        // Внешняя граница — имитация толстого стекла
        border: '0.5px solid',
        borderColor: isDark
          ? 'rgba(255, 255, 255, 0.08)'
          : 'rgba(255, 255, 255, 0.5)',

        // Тень: цветная снизу (преломление) + объёмная
        boxShadow: isDark
          ? [
              // Цветная тень — имитация преломления света сквозь стекло
              '0 8px 24px rgba(10, 132, 255, 0.06)',
              '0 2px 8px rgba(0, 0, 0, 0.2)',
              // Внутренняя тень для объёма
              'inset 0 0.5px 0 rgba(255, 255, 255, 0.06)',
              'inset 0 -0.5px 0 rgba(255, 255, 255, 0.02)',
            ].join(', ')
          : [
              '0 8px 24px rgba(0, 122, 255, 0.04)',
              '0 2px 8px rgba(0, 0, 0, 0.03)',
              'inset 0 0.5px 0 rgba(255, 255, 255, 0.6)',
              'inset 0 -0.5px 0 rgba(0, 0, 0, 0.02)',
            ].join(', '),
      }}
    >
      {/* 1. Specular блик — свет падает слева-сверху */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none z-[2]"
        style={{
          background: isDark
            ? [
                'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 40%)',
                'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 20%)',
              ].join(', ')
            : [
                'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, transparent 40%)',
                'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 20%)',
              ].join(', '),
        }}
      />

      {/* 2. Edge highlight — яркая полоска сверху (толщина стекла) */}
      <div
        className="absolute top-0 left-[10%] right-[30%] h-[0.5px] rounded-2xl pointer-events-none z-[3]"
        style={{
          background: isDark
            ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12) 30%, rgba(255,255,255,0.08) 70%, transparent)'
            : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5) 30%, rgba(255,255,255,0.3) 70%, transparent)',
        }}
      />

      {/* 3. Объёмная левая грань блика */}
      <div
        className="absolute top-[5%] bottom-[30%] left-0 w-[0.5px] rounded-2xl pointer-events-none z-[3]"
        style={{
          background: isDark
            ? 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 60%)'
            : 'linear-gradient(180deg, rgba(255,255,255,0.35) 0%, transparent 60%)',
        }}
      />

      {/* 4. Inner glow — внутреннее свечение (имитация толщины) */}
      <div
        className="absolute inset-[1px] rounded-[calc(1rem-1px)] pointer-events-none z-[2]"
        style={{
          border: '0.5px solid',
          borderColor: isDark
            ? 'rgba(255, 255, 255, 0.02)'
            : 'rgba(255, 255, 255, 0.1)',
        }}
      />

      {/* 5. Шиммер — бегущий блик по поверхности */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none z-[4]"
        style={{
          background: `linear-gradient(
            105deg,
            transparent 25%,
            ${isDark ? 'rgba(255,255,255,0.025)' : 'rgba(255,255,255,0.06)'} 27%,
            transparent 29%
          )`,
          backgroundSize: '300% 100%',
          animation: 'shimmer 12s linear infinite',
          opacity: 0.8,
        }}
      />

      {/* 6. Хроматическое преломление по краям */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none z-[1]"
        style={{
          border: '0.5px solid',
          borderColor: isDark
            ? 'rgba(10, 132, 255, 0.04)'
            : 'rgba(0, 122, 255, 0.03)',
          filter: 'blur(0.3px)',
        }}
      />

      {/* Контент */}
      <div className="relative z-[5]">
        {children}
      </div>
    </div>
  );
}