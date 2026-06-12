'use client';
import { useMemo } from 'react';
import { Sparkles, Sword, Heart, Flame, Eye, Undo2, Wind } from 'lucide-react';
import { DesireCard } from '@/types';
import { ALL_DESIRE_CARDS, getRandomCards } from '@/lib/desireCards';

interface DesireCardsProps {
  selected: DesireCard | null;
  onSelect: (card: DesireCard) => void;
}

function getIcon(iconName: string, className = 'w-5 h-5') {
  switch (iconName) {
    case 'Sword':    return <Sword    className={className} />;
    case 'Heart':    return <Heart    className={className} />;
    case 'Flame':    return <Flame    className={className} />;
    case 'Eye':      return <Eye      className={className} />;
    case 'Undo2':    return <Undo2    className={className} />;
    case 'Wind':     return <Wind     className={className} />;
    default:         return <Sparkles className={className} />;
  }
}

const CODE_COLORS: Record<string, string> = {
  '①': '#3D4F6B', '②': '#5C4A1A', '③': '#8B3A4A',
  '④': '#2C1A1A', '⑤': '#2A4A5C', '⑥': '#3A4A2A', '⑦': '#2A3A4A',
};

export default function DesireCards({ selected, onSelect }: DesireCardsProps) {
  // 세션당 5개 고정 (컴포넌트 마운트 시 한 번만)
  const cards = useMemo(() => getRandomCards(5), []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      <div className="text-center space-y-2">
        <p className="text-[10px] uppercase tracking-[0.4em] text-[#C9A84C] font-sans font-bold">
          [ 제 4 장 ] 욕망 카드 선택
        </p>
        <p className="text-[11px] text-white/50 max-w-md mx-auto font-sans leading-relaxed">
          그대가 직면한 응어리는 어떤 자락에 속합니까? 처방을 원하시는 욕망 카드를 선택하십시오.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((card) => {
          const isSelected = selected?.id === card.id;
          const bgColor = CODE_COLORS[card.code] ?? '#2C1A1A';
          return (
            <button
              key={card.id}
              onClick={() => onSelect(card)}
              className={`p-5 flex flex-col justify-between text-left border-2 rounded-xl transition-all min-h-[180px] relative overflow-hidden group cursor-pointer outline-none ${
                isSelected
                  ? 'border-[#C9A84C] shadow-[0_0_25px_rgba(201,168,76,0.35)] scale-[1.03]'
                  : 'border-white/10 hover:border-[#C9A84C]/50 hover:scale-[1.01]'
              }`}
              style={{ background: isSelected ? `${bgColor}CC` : `${bgColor}66` }}
            >
              <div className="text-[10px] text-[#C9A84C] font-mono tracking-wider">
                욕망 {card.code}
              </div>
              <div className="flex-1 flex flex-col justify-end space-y-2 mt-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center border transition-colors ${
                  isSelected ? 'bg-[#C9A84C]/20 border-[#C9A84C]/50 text-[#C9A84C]' : 'bg-white/5 border-white/10 text-white/60 group-hover:border-[#C9A84C]/30 group-hover:text-[#C9A84C]'
                }`}>
                  {getIcon(card.icon)}
                </div>
                <h4 className="text-sm font-bold text-white font-serif leading-tight">
                  {card.label}
                </h4>
                <p className="text-[10px] text-white/50 leading-relaxed font-sans line-clamp-2">
                  {card.description}
                </p>
              </div>
              {isSelected && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#C9A84C] animate-ping" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
