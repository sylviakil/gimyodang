'use client';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps?: number;
}

const STEPS = [
  { n: 1, label: '손님 설정' },
  { n: 2, label: '처방 작성' },
  { n: 3, label: '결말 선택' },
  { n: 4, label: '공개 발행' },
];

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((step, i) => {
        const done   = step.n < currentStep;
        const active = step.n === currentStep;
        return (
          <div key={step.n} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-sans transition-all ${
                active ? 'bg-[#C9A84C] text-black shadow-[0_0_12px_rgba(201,168,76,0.4)]'
                : done  ? 'bg-[#C9A84C]/30 text-[#C9A84C] border border-[#C9A84C]/40'
                : 'bg-white/5 text-white/30 border border-white/10'
              }`}>
                {done ? '✓' : step.n}
              </div>
              <span className={`text-[9px] font-sans uppercase tracking-wider hidden md:block ${
                active ? 'text-[#C9A84C]' : done ? 'text-white/50' : 'text-white/20'
              }`}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-[1px] mx-1 transition-all ${done ? 'bg-[#C9A84C]/40' : 'bg-white/10'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
