import { useEffect, useState } from 'react';

const cn = (...inputs: (string | undefined | null | false)[]) =>
  inputs.filter(Boolean).join(' ');

/**
 * Яркий анимированный фон с насыщенными цветными блобами.
 * Именно через них проявляется Liquid Glass: backdrop-blur преломляет яркие цвета.
 */
export function LiquidBackground({ isDark }: { isDark: boolean }) {
  const [blobs] = useState(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      // Чередуем крупные и мелкие шарики
      size: i % 3 === 0 ? 220 + Math.random() * 220 : 80 + Math.random() * 140,
      x: 3 + Math.random() * 94,
      y: 3 + Math.random() * 94,
      duration: 12 + Math.random() * 22,
      delay: Math.random() * -30,
    }))
  );

  // Для светлой темы — пастельные, но насыщенные цвета
  // Для тёмной — яркие неоновые оттенки
  const colors = isDark
    ? [
        'rgba(10, 132, 255, 0.3)',
        'rgba(94, 92, 230, 0.25)',
        'rgba(48, 209, 88, 0.2)',
        'rgba(255, 159, 10, 0.22)',
        'rgba(255, 69, 58, 0.16)',
        'rgba(10, 132, 255, 0.2)',
        'rgba(94, 92, 230, 0.16)',
        'rgba(255, 159, 10, 0.15)',
        'rgba(48, 209, 88, 0.13)',
        'rgba(175, 82, 222, 0.18)',
        'rgba(255, 69, 58, 0.1)',
        'rgba(10, 132, 255, 0.14)',
      ]
    : [
        'rgba(0, 122, 255, 0.45)',
        'rgba(88, 86, 214, 0.35)',
        'rgba(52, 199, 89, 0.3)',
        'rgba(255, 149, 0, 0.35)',
        'rgba(255, 59, 48, 0.25)',
        'rgba(0, 122, 255, 0.3)',
        'rgba(88, 86, 214, 0.25)',
        'rgba(255, 149, 0, 0.25)',
        'rgba(52, 199, 89, 0.2)',
        'rgba(175, 82, 222, 0.25)',
        'rgba(255, 59, 48, 0.18)',
        'rgba(0, 122, 255, 0.22)',
      ];

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Базовый фон */}
      <div
        className={cn(
          'absolute inset-0 transition-colors duration-700',
          isDark ? 'bg-[#0C0C0E]' : 'bg-[#F5F7FA]'
        )}
      />

      {/* Цветные блобы — через них виден Liquid Glass эффект */}
      {blobs.map((blob, idx) => (
        <div
          key={blob.id}
          className="absolute rounded-full"
          style={{
            width: blob.size,
            height: blob.size,
            left: `${blob.x}%`,
            top: `${blob.y}%`,
            background: `radial-gradient(circle at 40% 35%, ${colors[idx]} 0%, transparent 65%)`,
            animation: `liquidBlob ${blob.duration}s ease-in-out infinite`,
            animationDelay: `${blob.delay}s`,
            transform: 'translate(-50%, -50%)',
            willChange: 'transform',
          }}
        />
      ))}

      {/* Дополнительный градиент для глубины */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse 80% 60% at 20% 20%, rgba(10,132,255,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 70% at 80% 80%, rgba(94,92,230,0.06) 0%, transparent 60%)'
            : 'radial-gradient(ellipse 80% 60% at 20% 20%, rgba(0,122,255,0.04) 0%, transparent 60%), radial-gradient(ellipse 60% 70% at 80% 80%, rgba(88,86,214,0.03) 0%, transparent 60%)',
        }}
      />

      <style>{`
        @keyframes liquidBlob {
          0%, 100% {
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
            transform: translate(-50%, -50%) scale(1);
          }
          33% {
            border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
            transform: translate(-40%, -60%) scale(1.05);
          }
          66% {
            border-radius: 50% 30% 60% 50% / 40% 50% 60% 50%;
            transform: translate(-60%, -40%) scale(0.95);
          }
        }
      `}</style>
    </div>
  );
}