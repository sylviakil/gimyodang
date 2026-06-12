'use client';

interface Step3EndingProps {
  endingContent: string;
  endingTone: 'warm' | 'cold' | 'open' | '';
  onContentChange: (v: string) => void;
  onToneChange: (t: 'warm' | 'cold' | 'open') => void;
  onNext: () => void;
  onBack: () => void;
}

const TONES = [
  { id: 'warm', label: '온기 (warm)', desc: '따뜻하지만 무언가 돌이킬 수 없이 달라진 결말', color: '#C9A84C' },
  { id: 'cold', label: '냉기 (cold)', desc: '차갑고 서늘하게 끝나는 결말',                  color: '#9BA8B5' },
  { id: 'open', label: '열림 (open)', desc: '해소되지 않은 채 유예된 결말',                  color: '#7B5EA7' },
] as const;

export default function Step3Ending({
  endingContent, endingTone,
  onContentChange, onToneChange,
  onNext, onBack,
}: Step3EndingProps) {
  const valid = endingContent.trim().length > 20 && endingTone !== '';

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center space-y-1">
        <p className="text-[10px] uppercase tracking-[0.4em] text-[#C9A84C] font-sans font-bold">Step 3 — 결말 선택</p>
        <p className="text-xs text-white/50 font-sans">처방을 수락한 후 손님에게 일어나는 결말을 작성하십시오.</p>
      </div>

      {/* 결말 톤 */}
      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-wider text-[#C9A84C] font-sans font-bold block">결말 톤</label>
        <div className="grid grid-cols-3 gap-3">
          {TONES.map((tone) => (
            <button
              key={tone.id}
              onClick={() => onToneChange(tone.id)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                endingTone === tone.id
                  ? 'border-2 scale-[1.02]'
                  : 'border border-white/10 hover:border-white/20'
              }`}
              style={endingTone === tone.id ? { borderColor: tone.color, background: `${tone.color}15` } : {}}
            >
              <p className="text-xs font-sans font-bold mb-1" style={{ color: tone.color }}>{tone.label}</p>
              <p className="text-[10px] text-white/50 leading-relaxed">{tone.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 결말 서사 */}
      <div className="space-y-1.5">
        <label className="text-[10px] uppercase tracking-wider text-[#C9A84C] font-sans font-bold block">
          결말 서사 <span className="text-red-400">*</span>
        </label>
        <p className="text-[10px] text-white/30 font-sans">
          ⚠️ 결말이 무조건 해피엔딩이어선 안 됩니다. 무언가가 돌이킬 수 없이 달라진 채로 끝나야 합니다.
        </p>
        <textarea
          value={endingContent}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="처방을 수락하고 과자를 삼킨 손님에게 어떤 일이 일어났습니까? (최소 20자)"
          rows={6}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#C9A84C] font-serif resize-none leading-relaxed"
        />
        <p className="text-[9px] text-white/20 font-sans text-right">{endingContent.length}자</p>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 py-2.5 rounded-lg border border-white/10 text-white/60 hover:bg-white/5 text-xs font-sans cursor-pointer">
          ← 처방 작성으로
        </button>
        <button
          onClick={onNext}
          disabled={!valid}
          className="flex-2 px-8 py-2.5 rounded-lg bg-[#C9A84C] text-black font-bold text-xs hover:bg-[#d6b26d] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          다음 — 공개 발행 →
        </button>
      </div>
    </div>
  );
}
