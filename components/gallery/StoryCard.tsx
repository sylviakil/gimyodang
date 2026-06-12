'use client';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Story } from '@/types';
import { generateCardConfig } from '@/lib/cardVisual';

interface StoryCardProps {
  story: Story;
  isLiked?: boolean;
  onToggleLike?: (id: string) => void;
}

const ERA_LABELS: Record<string, string> = {
  joseon: '조선 한양',
  modern: '현대 도시',
};

export default function StoryCard({ story, isLiked = false, onToggleLike }: StoryCardProps) {
  const cfg = story.card_visual_config ?? generateCardConfig(
    story.desire_type,
    story.era,
    story.ending_tone
  );

  const dateStr = new Date(story.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div
      className="relative rounded-xl overflow-hidden border-2 flex flex-col p-5 hover:scale-[1.01] transition-all duration-300 shadow-2xl group"
      style={{
        background: cfg.bgColor,
        borderColor: cfg.borderColor,
        borderStyle: cfg.borderStyle,
      }}
    >
      {/* 질감 레이어 */}
      {cfg.textureClass === 'hanji' && (
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(242,232,213,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(242,232,213,0.03)_1px,transparent_1px)] bg-[size:8px_12px] pointer-events-none" />
      )}
      {cfg.textureClass === 'concrete' && (
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] bg-[size:8px_8px] pointer-events-none" />
      )}

      {/* 장식 선 */}
      <div className="absolute top-0 right-0 w-12 h-[1px]" style={{ background: `linear-gradient(to left, ${cfg.borderColor}50, transparent)` }} />
      <div className="absolute top-0 right-0 h-12 w-[1px]" style={{ background: `linear-gradient(to bottom, ${cfg.borderColor}50, transparent)` }} />

      {/* 헤더 */}
      <div className="flex justify-between items-center text-[9px] uppercase tracking-wider font-mono text-white/40 border-b border-white/5 pb-2.5 mb-4">
        <span className="px-1.5 py-0.5 rounded text-[9px] font-serif border border-white/10 bg-white/5 text-white/60">
          {ERA_LABELS[story.era] ?? story.era}
        </span>
        <span>{dateStr}</span>
      </div>

      {/* 과자 이름 */}
      <div className="mb-4">
        <h3 className="text-lg font-serif font-bold text-white leading-tight group-hover:text-[#C9A84C] transition-colors flex items-start justify-between gap-2">
          <span>{story.confection_name}</span>
          <span className="text-[9px] text-white/40 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded font-sans uppercase font-normal shrink-0">
            {story.confection_original}
          </span>
        </h3>
        <p className="text-[11px] text-white/50 font-sans mt-1">
          {story.guest_name} · {story.desire_content}
        </p>
      </div>

      {/* 상세 */}
      <div className="space-y-2 text-xs flex-1">
        <div>
          <span className="text-[9px] text-[#C9A84C] font-sans uppercase tracking-wider font-bold block">재료</span>
          <p className="text-white/75 font-serif">{story.confection_ingredients}</p>
        </div>
        <div>
          <span className="text-[9px] text-[#C9A84C] font-sans uppercase tracking-wider font-bold block">효능</span>
          <p className="text-white/75 font-serif">{story.confection_effect}</p>
        </div>
        <div className="bg-red-950/20 border border-red-500/15 p-2.5 rounded-lg">
          <span className="text-[9px] text-red-400 font-sans uppercase tracking-widest font-bold block mb-0.5">대가</span>
          <p className="text-red-200/80 font-serif">{story.confection_price}</p>
        </div>
      </div>

      {/* 푸터 */}
      <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center">
        <Link
          href={`/gallery/${story.id}`}
          className="text-[10px] text-white/30 hover:text-[#C9A84C] transition-colors font-sans uppercase tracking-wider"
        >
          자세히 보기 →
        </Link>
        <div className="flex items-center gap-3">
          {onToggleLike && (
            <button
              onClick={() => onToggleLike(story.id)}
              className={`flex items-center gap-1 py-1 px-2 rounded-full cursor-pointer transition-all focus:outline-none ${
                isLiked
                  ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                  : 'bg-white/5 text-white/40 border border-white/10 hover:text-white'
              }`}
            >
              <Heart className={`w-3 h-3 ${isLiked ? 'fill-red-400' : ''}`} />
              <span className="text-[9px] font-mono">{story.likes_count}</span>
            </button>
          )}
          <span className="text-[9px] text-white/20 font-sans uppercase">{story.ending_tone}</span>
        </div>
      </div>
    </div>
  );
}
