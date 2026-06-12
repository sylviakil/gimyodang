'use client';
import { Prescription } from '@/types';
import { ALL_DESIRE_CARDS } from '@/lib/desireCards';

interface Step2PrescriptionProps {
  prescription: Partial<Prescription>;
  desireContent: string;
  onDesireContentChange: (v: string) => void;
  onChange: (p: Partial<Prescription>) => void;
  onNext: () => void;
  onBack: () => void;
}

const CONFECTION_NAMES = [
  '약과', '올란', '다식', '강정', '인절미',
  '수정과', '식혜', '전병', '꿀떡', '개성주악',
  '빙반', '약식', '정과', '엿', '조란',
];

const PRICE_CODES = [
  { code: 'A', label: 'A — 망각의 대가 (기억·정체성 소실)' },
  { code: 'B', label: 'B — 감각의 대가 (특정 감각 차단)' },
  { code: 'C', label: 'C — 관계의 대가 (연결 단절·변형)' },
  { code: 'D', label: 'D — 본질의 대가 (자아의 근본 변화)' },
  { code: 'E', label: 'E — 시간의 대가 (과거·미래 변형)' },
];

export default function Step2Prescription({
  prescription, desireContent, onDesireContentChange,
  onChange, onNext, onBack,
}: Step2PrescriptionProps) {
  const valid =
    prescription.name && prescription.original && prescription.ingredients &&
    prescription.effect && prescription.price && prescription.desire_code &&
    prescription.price_code && desireContent;

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div className="text-center space-y-1">
        <p className="text-[10px] uppercase tracking-[0.4em] text-[#C9A84C] font-sans font-bold">Step 2 — 처방 작성</p>
        <p className="text-xs text-white/50 font-sans">손님의 욕망과 기묘당 처방전을 작성하십시오.</p>
      </div>

      {/* 욕망 코드 */}
      <div className="space-y-1.5">
        <label className="text-[10px] uppercase tracking-wider text-[#C9A84C] font-sans font-bold block">욕망 코드</label>
        <div className="grid grid-cols-4 gap-2">
          {ALL_DESIRE_CARDS.filter((c, i, arr) => arr.findIndex(x => x.code === c.code) === i).map((c) => (
            <button
              key={c.code}
              onClick={() => onChange({ ...prescription, desire_code: c.code })}
              className={`py-1.5 rounded-lg border text-[10px] font-sans transition-all cursor-pointer ${
                prescription.desire_code === c.code
                  ? 'border-[#C9A84C] text-[#C9A84C] bg-[#C9A84C]/10'
                  : 'border-white/10 text-white/50 hover:border-white/20'
              }`}
            >
              {c.code} {c.label.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* 욕망 내용 */}
      <Field label="손님의 욕망 내용" required>
        <textarea
          value={desireContent}
          onChange={(e) => onDesireContentChange(e.target.value)}
          placeholder="손님이 연화에게 고백한 욕망을 적으시오"
          rows={2}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#C9A84C] font-serif resize-none"
        />
      </Field>

      {/* 원형 과자 */}
      <Field label="원형 과자 (조선 단과자)" required>
        <select
          value={prescription.original ?? ''}
          onChange={(e) => onChange({ ...prescription, original: e.target.value })}
          className="w-full bg-zinc-900/80 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C9A84C] font-sans"
        >
          <option value="">선택하시오</option>
          {CONFECTION_NAMES.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </Field>

      {/* 처방 이름 */}
      <Field label="처방 이름 (예: 회귀올란 回歸栗卵)" required>
        <input
          value={prescription.name ?? ''}
          onChange={(e) => onChange({ ...prescription, name: e.target.value })}
          placeholder="처방의 이름과 한자를 적으시오"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#C9A84C] font-sans"
        />
      </Field>

      {/* 재료 */}
      <Field label="핵심 재료와 상징 (2-3가지)" required>
        <textarea
          value={prescription.ingredients ?? ''}
          onChange={(e) => onChange({ ...prescription, ingredients: e.target.value })}
          placeholder="예: 밤(귀환·중심)과 계피(각성·시간)로..."
          rows={2}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#C9A84C] font-serif resize-none"
        />
      </Field>

      {/* 효능 */}
      <Field label="효능 (욕망을 직면하게 하는 변화)" required>
        <textarea
          value={prescription.effect ?? ''}
          onChange={(e) => onChange({ ...prescription, effect: e.target.value })}
          placeholder="과자를 드시면 어떤 심리·감각적 변화가 일어납니까"
          rows={2}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#C9A84C] font-serif resize-none"
        />
      </Field>

      {/* 대가 코드 */}
      <Field label="대가 유형" required>
        <div className="space-y-1.5">
          {PRICE_CODES.map((pc) => (
            <button
              key={pc.code}
              onClick={() => onChange({ ...prescription, price_code: pc.code })}
              className={`w-full text-left px-3 py-1.5 rounded-lg border text-[10px] font-sans transition-all cursor-pointer ${
                prescription.price_code === pc.code
                  ? 'border-[#C9A84C] text-[#C9A84C] bg-[#C9A84C]/10'
                  : 'border-white/10 text-white/50 hover:border-white/20'
              }`}
            >
              {pc.label}
            </button>
          ))}
        </div>
      </Field>

      {/* 대가 (필수 — 불변 법칙) */}
      <Field label="대가 (必須 — 암시적으로 표현)" required>
        <textarea
          value={prescription.price ?? ''}
          onChange={(e) => onChange({ ...prescription, price: e.target.value })}
          placeholder="직접 선언 금지. 감각과 암시로 표현하시오. 예: '이 과자를 드시고 나면...'"
          rows={2}
          className="w-full bg-red-950/20 border border-red-500/20 rounded-lg px-3 py-2 text-xs text-red-200 placeholder-red-300/20 focus:outline-none focus:border-red-500/50 font-serif resize-none"
        />
      </Field>

      {/* 규모 */}
      <Field label="처방 규모">
        <div className="flex gap-3">
          {(['個', '雙', '群'] as const).map((s) => (
            <button
              key={s}
              onClick={() => onChange({ ...prescription, scale: s })}
              className={`flex-1 py-1.5 rounded-lg border text-xs font-sans transition-all cursor-pointer ${
                prescription.scale === s
                  ? 'border-[#C9A84C] text-[#C9A84C] bg-[#C9A84C]/10'
                  : 'border-white/10 text-white/50 hover:border-white/20'
              }`}
            >
              {s === '個' ? '個 (개인)' : s === '雙' ? '雙 (둘)' : '群 (집단)'}
            </button>
          ))}
        </div>
      </Field>

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 py-2.5 rounded-lg border border-white/10 text-white/60 hover:bg-white/5 text-xs font-sans cursor-pointer">
          ← 손님 설정으로
        </button>
        <button
          onClick={onNext}
          disabled={!valid}
          className="flex-2 px-8 py-2.5 rounded-lg bg-[#C9A84C] text-black font-bold text-xs hover:bg-[#d6b26d] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          다음 — 결말 선택 →
        </button>
      </div>
    </div>
  );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] uppercase tracking-wider text-[#C9A84C] font-sans font-bold block">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}
