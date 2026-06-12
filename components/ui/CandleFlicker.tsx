'use client';

interface CandleFlickerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function CandleFlicker({ size = 'md', className = '' }: CandleFlickerProps) {
  const sizes = {
    sm: { base: 'w-2 h-6',  flame: 'w-1.5 h-3', glow: 'w-4 h-4' },
    md: { base: 'w-3 h-10', flame: 'w-2 h-4',   glow: 'w-6 h-6' },
    lg: { base: 'w-4 h-14', flame: 'w-3 h-6',   glow: 'w-8 h-8' },
  };
  const s = sizes[size];

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      {/* 불꽃 */}
      <div className={`relative ${s.flame}`}>
        <div className={`absolute inset-0 rounded-full bg-[#C9A84C] candle-flame blur-[2px]`} />
        <div className={`absolute inset-1 rounded-full bg-white/80 candle-flame`} />
        {/* 빛 번짐 */}
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${s.glow} rounded-full bg-[#C9A84C]/30 blur-sm candle-flame`}
        />
      </div>
      {/* 심지 */}
      <div className={`${s.base} bg-gradient-to-b from-[#F2E8D5] to-[#8B6914] rounded-sm opacity-90`} />
    </div>
  );
}
