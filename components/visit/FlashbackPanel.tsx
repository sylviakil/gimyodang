'use client';
import { Flashback } from '@/types';

interface FlashbackPanelProps {
  flashback: Flashback;
}

export default function FlashbackPanel({ flashback }: FlashbackPanelProps) {
  return (
    <div className="bg-[#15110a]/60 backdrop-blur-md border border-[#C9A84C]/30 rounded-xl p-5 h-full flex flex-col relative overflow-hidden animate-fade-in">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C]/40 to-transparent" />
      <div className="absolute top-0 right-0 w-20 h-20 bg-[#C9A84C]/3 rounded-bl-full pointer-events-none" />

      <div className="mb-4 pb-3 border-b border-white/5">
        <p className="text-[9px] uppercase tracking-[0.4em] text-[#C9A84C] font-sans font-bold">
          손님의 마음 구도 (회상 영사)
        </p>
      </div>

      <blockquote className="font-serif italic text-sm text-white/80 leading-relaxed flex-1">
        "{flashback.text}"
      </blockquote>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {flashback.tags.map((tag) => (
          <span
            key={tag}
            className="text-[9px] bg-white/5 border border-white/10 text-white/60 px-2 py-0.5 rounded font-sans"
          >
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
}
