'use client';
import confectionsData from '@/lib/confections.json';
import CandleFlicker from '@/components/ui/CandleFlicker';

interface RecipePanelProps {
  desireCode: string;
}

interface Ingredient {
  name: string;
  ohaeng: string;
  symbol: string;
}

interface Confection {
  category: string;
  source: string;
  ingredients: Ingredient[];
  steps: string[];
  desire_tags: string[];
  historical_note: string;
}

const OHAENG_COLORS: Record<string, string> = {
  木: '#4A7C4E',
  火: '#8B2635',
  土: '#8B6914',
  金: '#9BA8B5',
  水: '#2A4A5C',
};

export default function RecipePanel({ desireCode }: RecipePanelProps) {
  // 욕망 코드에 맞는 과자 중 랜덤 1개 선택
  const codeLabel = {
    '①': '①지움', '②': '②강함', '③': '③연결',
    '④': '④복수', '⑤': '⑤진실', '⑥': '⑥회귀', '⑦': '⑦해방',
  }[desireCode] ?? '';

  const matched = Object.entries(confectionsData as Record<string, Confection>).filter(([, c]) =>
    c.desire_tags.some((t) => t.startsWith(desireCode))
  );

  const [name, data] = matched.length > 0
    ? matched[Math.floor(Math.random() * matched.length)]
    : Object.entries(confectionsData as Record<string, Confection>)[0];

  return (
    <div className="bg-[#15110a]/60 backdrop-blur-md border border-[#C9A84C]/30 rounded-xl p-5 h-full flex flex-col relative overflow-hidden animate-fade-in">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C]/40 to-transparent" />

      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
        <div>
          <p className="text-[9px] uppercase tracking-[0.4em] text-[#C9A84C] font-sans font-bold">
            처방 재료 탐색 중...
          </p>
          <h3 className="text-lg font-bold text-white font-serif mt-0.5">{name}</h3>
          <p className="text-[10px] text-white/40 font-sans">{data.category} · {data.source}</p>
        </div>
        <CandleFlicker size="sm" />
      </div>

      {/* 재료 */}
      <div className="space-y-2 mb-4">
        <p className="text-[9px] uppercase tracking-widest text-[#C9A84C] font-sans">주요 재료</p>
        <div className="space-y-1.5">
          {data.ingredients.map((ing) => (
            <div key={ing.name} className="flex items-center gap-2 text-xs font-sans">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0"
                style={{ background: OHAENG_COLORS[ing.ohaeng] ?? '#333' }}
              >
                {ing.ohaeng}
              </span>
              <span className="text-white/90">{ing.name}</span>
              <span className="text-white/40 ml-auto">— {ing.symbol}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 제조 과정 */}
      <div className="space-y-1.5 mb-4">
        <p className="text-[9px] uppercase tracking-widest text-[#C9A84C] font-sans">조제 과정</p>
        {data.steps.map((step, i) => (
          <div key={i} className="flex items-start gap-2 text-[11px] text-white/60 font-sans">
            <span className="text-[#C9A84C] mt-0.5 shrink-0">{i + 1}.</span>
            <span>{step}</span>
          </div>
        ))}
      </div>

      {/* 역사 노트 */}
      <div className="mt-auto pt-3 border-t border-white/5">
        <p className="text-[10px] italic text-white/40 font-serif leading-relaxed">
          {data.historical_note}
        </p>
      </div>
    </div>
  );
}
