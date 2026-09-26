const cn = (...inputs: (string | undefined | null | false)[]) =>
  inputs.filter(Boolean).join(' ');

type BlobSpec = {
  x: number;
  y: number;
  size: number;
  blur: number;
  duration: number;
  drift: number;
  rotate: number;
  lightBg: string;
  darkBg: string;
};

/**
 * Harmonized ambient blob composition.
 * Goal: more blobs, gentle blur, colourful like the reference, but arranged in clear clusters.
 */
export function LiquidBackground({ isDark }: { isDark: boolean }) {
  const blobs: BlobSpec[] = [
    // top-left hero cluster
    {
      x: 8, y: 12, size: 430, blur: 8, duration: 30, drift: 42, rotate: -10,
      lightBg: 'radial-gradient(circle at 28% 32%, rgba(255,112,214,0.86) 0%, rgba(255,112,214,0.70) 22%, transparent 54%), radial-gradient(circle at 72% 26%, rgba(111,220,255,0.68) 0%, transparent 34%), radial-gradient(circle at 52% 74%, rgba(149,118,255,0.76) 0%, rgba(149,118,255,0.56) 28%, transparent 62%), linear-gradient(135deg, rgba(249,104,214,0.74) 0%, rgba(130,94,255,0.74) 55%, rgba(87,197,255,0.66) 100%)',
      darkBg: 'radial-gradient(circle at 28% 32%, rgba(255,102,214,0.28) 0%, rgba(255,102,214,0.22) 22%, transparent 54%), radial-gradient(circle at 72% 26%, rgba(111,220,255,0.22) 0%, transparent 34%), radial-gradient(circle at 52% 74%, rgba(149,118,255,0.24) 0%, rgba(149,118,255,0.18) 28%, transparent 62%), linear-gradient(135deg, rgba(249,104,214,0.22) 0%, rgba(130,94,255,0.22) 55%, rgba(87,197,255,0.18) 100%)',
    },
    {
      x: 21, y: 24, size: 240, blur: 6, duration: 24, drift: 28, rotate: 12,
      lightBg: 'radial-gradient(circle at 30% 34%, rgba(255,170,107,0.68) 0%, transparent 30%), radial-gradient(circle at 70% 58%, rgba(255,111,205,0.72) 0%, rgba(145,113,255,0.62) 38%, transparent 72%), linear-gradient(135deg, rgba(255,157,116,0.52) 0%, rgba(255,108,191,0.62) 46%, rgba(117,196,255,0.54) 100%)',
      darkBg: 'radial-gradient(circle at 30% 34%, rgba(255,170,107,0.20) 0%, transparent 30%), radial-gradient(circle at 70% 58%, rgba(255,111,205,0.22) 0%, rgba(145,113,255,0.18) 38%, transparent 72%), linear-gradient(135deg, rgba(255,157,116,0.17) 0%, rgba(255,108,191,0.20) 46%, rgba(117,196,255,0.16) 100%)',
    },
    {
      x: 36, y: 13, size: 170, blur: 5, duration: 21, drift: 24, rotate: -8,
      lightBg: 'radial-gradient(circle at 38% 30%, rgba(255,248,215,0.64) 0%, rgba(255,248,215,0.22) 26%, transparent 56%), linear-gradient(135deg, rgba(255,182,130,0.46) 0%, rgba(178,132,255,0.46) 52%, rgba(108,209,255,0.42) 100%)',
      darkBg: 'radial-gradient(circle at 38% 30%, rgba(255,248,215,0.20) 0%, rgba(255,248,215,0.08) 26%, transparent 56%), linear-gradient(135deg, rgba(255,182,130,0.14) 0%, rgba(178,132,255,0.14) 52%, rgba(108,209,255,0.12) 100%)',
    },

    // upper-right band
    {
      x: 79, y: 18, size: 380, blur: 8, duration: 31, drift: 40, rotate: 9,
      lightBg: 'radial-gradient(circle at 34% 28%, rgba(255,112,214,0.80) 0%, rgba(255,112,214,0.56) 24%, transparent 56%), radial-gradient(circle at 74% 34%, rgba(104,216,255,0.60) 0%, transparent 34%), radial-gradient(circle at 58% 74%, rgba(140,105,255,0.72) 0%, rgba(140,105,255,0.48) 32%, transparent 66%), linear-gradient(135deg, rgba(255,103,193,0.66) 0%, rgba(155,98,255,0.68) 58%, rgba(88,194,255,0.56) 100%)',
      darkBg: 'radial-gradient(circle at 34% 28%, rgba(255,112,214,0.24) 0%, rgba(255,112,214,0.18) 24%, transparent 56%), radial-gradient(circle at 74% 34%, rgba(104,216,255,0.18) 0%, transparent 34%), radial-gradient(circle at 58% 74%, rgba(140,105,255,0.22) 0%, rgba(140,105,255,0.16) 32%, transparent 66%), linear-gradient(135deg, rgba(255,103,193,0.20) 0%, rgba(155,98,255,0.20) 58%, rgba(88,194,255,0.16) 100%)',
    },
    {
      x: 66, y: 33, size: 250, blur: 6, duration: 25, drift: 30, rotate: -12,
      lightBg: 'radial-gradient(circle at 30% 34%, rgba(255,203,96,0.60) 0%, transparent 28%), radial-gradient(circle at 72% 64%, rgba(255,115,199,0.68) 0%, rgba(116,201,255,0.50) 40%, transparent 74%), linear-gradient(135deg, rgba(255,191,104,0.44) 0%, rgba(255,113,196,0.54) 44%, rgba(110,197,255,0.46) 100%)',
      darkBg: 'radial-gradient(circle at 30% 34%, rgba(255,203,96,0.18) 0%, transparent 28%), radial-gradient(circle at 72% 64%, rgba(255,115,199,0.20) 0%, rgba(116,201,255,0.15) 40%, transparent 74%), linear-gradient(135deg, rgba(255,191,104,0.14) 0%, rgba(255,113,196,0.17) 44%, rgba(110,197,255,0.14) 100%)',
    },
    {
      x: 92, y: 35, size: 185, blur: 5, duration: 22, drift: 22, rotate: 8,
      lightBg: 'radial-gradient(circle at 38% 34%, rgba(255,122,210,0.70) 0%, rgba(255,122,210,0.40) 24%, transparent 54%), linear-gradient(135deg, rgba(255,144,111,0.38) 0%, rgba(166,124,255,0.48) 56%, rgba(105,214,255,0.44) 100%)',
      darkBg: 'radial-gradient(circle at 38% 34%, rgba(255,122,210,0.20) 0%, rgba(255,122,210,0.12) 24%, transparent 54%), linear-gradient(135deg, rgba(255,144,111,0.12) 0%, rgba(166,124,255,0.16) 56%, rgba(105,214,255,0.15) 100%)',
    },

    // center bridge
    {
      x: 25, y: 54, size: 290, blur: 7, duration: 28, drift: 34, rotate: 7,
      lightBg: 'radial-gradient(circle at 28% 34%, rgba(255,123,210,0.58) 0%, transparent 28%), radial-gradient(circle at 70% 66%, rgba(113,220,255,0.46) 0%, rgba(158,227,184,0.42) 40%, transparent 74%), linear-gradient(135deg, rgba(255,147,116,0.34) 0%, rgba(255,112,198,0.46) 42%, rgba(102,210,255,0.40) 100%)',
      darkBg: 'radial-gradient(circle at 28% 34%, rgba(255,123,210,0.18) 0%, transparent 28%), radial-gradient(circle at 70% 66%, rgba(113,220,255,0.14) 0%, rgba(158,227,184,0.13) 40%, transparent 74%), linear-gradient(135deg, rgba(255,147,116,0.11) 0%, rgba(255,112,198,0.14) 42%, rgba(102,210,255,0.13) 100%)',
    },
    {
      x: 44, y: 49, size: 160, blur: 5, duration: 20, drift: 20, rotate: -10,
      lightBg: 'radial-gradient(circle at 36% 34%, rgba(255,255,255,0.48) 0%, rgba(255,255,255,0.14) 24%, transparent 54%), linear-gradient(135deg, rgba(255,170,124,0.30) 0%, rgba(196,135,255,0.36) 58%, rgba(107,205,255,0.32) 100%)',
      darkBg: 'radial-gradient(circle at 36% 34%, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.05) 24%, transparent 54%), linear-gradient(135deg, rgba(255,170,124,0.09) 0%, rgba(196,135,255,0.11) 58%, rgba(107,205,255,0.10) 100%)',
    },
    {
      x: 54, y: 66, size: 205, blur: 6, duration: 24, drift: 24, rotate: 11,
      lightBg: 'radial-gradient(circle at 32% 36%, rgba(168,236,169,0.46) 0%, transparent 26%), radial-gradient(circle at 72% 62%, rgba(255,118,199,0.58) 0%, rgba(111,198,255,0.34) 42%, transparent 72%), linear-gradient(135deg, rgba(159,225,162,0.34) 0%, rgba(255,128,201,0.40) 42%, rgba(98,202,255,0.30) 100%)',
      darkBg: 'radial-gradient(circle at 32% 36%, rgba(168,236,169,0.14) 0%, transparent 26%), radial-gradient(circle at 72% 62%, rgba(255,118,199,0.16) 0%, rgba(111,198,255,0.10) 42%, transparent 72%), linear-gradient(135deg, rgba(159,225,162,0.11) 0%, rgba(255,128,201,0.13) 42%, rgba(98,202,255,0.09) 100%)',
    },

    // lower-right composition
    {
      x: 75, y: 82, size: 480, blur: 9, duration: 34, drift: 46, rotate: -9,
      lightBg: 'radial-gradient(circle at 30% 34%, rgba(255,114,204,0.78) 0%, rgba(255,114,204,0.56) 24%, transparent 56%), radial-gradient(circle at 76% 28%, rgba(110,220,255,0.64) 0%, transparent 32%), radial-gradient(circle at 62% 72%, rgba(255,188,111,0.42) 0%, rgba(161,115,255,0.58) 36%, transparent 72%), linear-gradient(135deg, rgba(255,121,196,0.66) 0%, rgba(150,103,255,0.66) 54%, rgba(88,194,255,0.56) 100%)',
      darkBg: 'radial-gradient(circle at 30% 34%, rgba(255,114,204,0.24) 0%, rgba(255,114,204,0.18) 24%, transparent 56%), radial-gradient(circle at 76% 28%, rgba(110,220,255,0.18) 0%, transparent 32%), radial-gradient(circle at 62% 72%, rgba(255,188,111,0.13) 0%, rgba(161,115,255,0.18) 36%, transparent 72%), linear-gradient(135deg, rgba(255,121,196,0.20) 0%, rgba(150,103,255,0.20) 54%, rgba(88,194,255,0.16) 100%)',
    },
    {
      x: 60, y: 86, size: 230, blur: 6, duration: 22, drift: 24, rotate: 13,
      lightBg: 'radial-gradient(circle at 36% 28%, rgba(255,199,110,0.58) 0%, transparent 26%), radial-gradient(circle at 66% 66%, rgba(255,122,204,0.56) 0%, rgba(123,208,255,0.36) 42%, transparent 76%), linear-gradient(135deg, rgba(255,191,110,0.38) 0%, rgba(255,123,201,0.42) 44%, rgba(114,198,255,0.34) 100%)',
      darkBg: 'radial-gradient(circle at 36% 28%, rgba(255,199,110,0.16) 0%, transparent 26%), radial-gradient(circle at 66% 66%, rgba(255,122,204,0.16) 0%, rgba(123,208,255,0.11) 42%, transparent 76%), linear-gradient(135deg, rgba(255,191,110,0.12) 0%, rgba(255,123,201,0.13) 44%, rgba(114,198,255,0.10) 100%)',
    },
    {
      x: 94, y: 70, size: 180, blur: 5, duration: 20, drift: 20, rotate: -7,
      lightBg: 'radial-gradient(circle at 34% 34%, rgba(175,234,172,0.46) 0%, transparent 26%), linear-gradient(135deg, rgba(148,225,161,0.34) 0%, rgba(119,200,255,0.32) 52%, rgba(202,136,255,0.30) 100%)',
      darkBg: 'radial-gradient(circle at 34% 34%, rgba(175,234,172,0.14) 0%, transparent 26%), linear-gradient(135deg, rgba(148,225,161,0.11) 0%, rgba(119,200,255,0.10) 52%, rgba(202,136,255,0.09) 100%)',
    },
  ];

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div
        className={cn(
          'absolute inset-0 transition-colors duration-700',
          isDark ? 'bg-[#09090B]' : 'bg-[#EEE8E4]'
        )}
      />

      {blobs.map((blob, idx) => (
        <div
          key={idx}
          className={cn(
            'absolute ambient-blob',
            isDark ? 'ambient-blob--dark' : 'ambient-blob--light'
          )}
          style={{
            width: blob.size,
            height: blob.size,
            left: `${blob.x}%`,
            top: `${blob.y}%`,
            background: isDark ? blob.darkBg : blob.lightBg,
            filter: `blur(${blob.blur}px)`,
            ['--blob-drift' as any]: `${blob.drift}px`,
            ['--blob-rotate' as any]: `${blob.rotate}deg`,
            transform: 'translate(-50%, -50%)',
            animationDuration: `${blob.duration}s, ${Math.round(blob.duration * 0.76)}s, ${Math.round(blob.duration * 0.90)}s`,
            animationDelay: `${idx * -2.8}s, ${idx * -1.8}s, ${idx * -1.3}s`,
            animationDirection: `${idx % 2 === 0 ? 'normal' : 'reverse'}, normal, ${idx % 3 === 0 ? 'reverse' : 'normal'}`,
          }}
        />
      ))}

      <div
        className="absolute inset-0"
        style={{
          background: isDark
            ? 'linear-gradient(180deg, rgba(255,255,255,0.008), transparent 28%, rgba(0,0,0,0.075) 100%)'
            : 'linear-gradient(180deg, rgba(255,255,255,0.14), transparent 26%, rgba(120,96,78,0.020) 100%)',
        }}
      />
    </div>
  );
}
