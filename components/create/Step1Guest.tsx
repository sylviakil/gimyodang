'use client';
import { useState } from 'react';
import { EraType, PersonaState } from '@/types';
import { JOSEON_PERSONAS, MODERN_PERSONAS } from '@/data/personas';

interface Step1GuestProps {
  era: EraType;
  persona: PersonaState;
  onChange: (p: PersonaState) => void;
  onNext: () => void;
}

const AGE_OPTIONS = [
  { id: 'youth',  label: '10대 청춘' },
  { id: 'adult',  label: '20-30대' },
  { id: 'middle', label: '40-50대' },
  { id: 'elder',  label: '60대 이상' },
];

export default function Step1Guest({ era, persona, onChange, onNext }: Step1GuestProps) {
  const [customJob, setCustomJob] = useState('');
  const categories = era === 'joseon' ? JOSEON_PERSONAS : MODERN_PERSONAS;

  const selectJob = (job: string) => onChange({ ...persona, job, category: 'selected' });

  const valid = persona.name.trim().length > 0 && (persona.job.length > 0 || customJob.length > 0);

  const handleNext = () => {
    if (customJob) onChange({ ...persona, job: customJob, category: 'custom' });
    onNext();
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center space-y-1">
        <p className="text-[10px] uppercase tracking-[0.4em] text-[#C9A84C] font-sans font-bold">
          Step 1 — 손님 설정
        </p>
        <p className="text-xs text-white/50 font-sans">이야기 속 손님의 정체성을 설정하십시오.</p>
      </div>

      {/* 이름 */}
      <div className="space-y-1.5">
        <label className="text-[10px] uppercase tracking-wider text-[#C9A84C] font-sans font-bold block">이름 / 아명</label>
        <input
          value={persona.name}
          onChange={(e) => onChange({ ...persona, name: e.target.value })}
          placeholder="손님의 이름을 적으시오"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#C9A84C] font-serif"
        />
      </div>

      {/* 성별 */}
      <div className="space-y-1.5">
        <label className="text-[10px] uppercase tracking-wider text-[#C9A84C] font-sans font-bold block">성별 기색</label>
        <div className="flex gap-3">
          {(['yin', 'yang'] as const).map((g) => (
            <button
              key={g}
              onClick={() => onChange({ ...persona, gender: g })}
              className={`flex-1 py-2 rounded-lg border text-xs font-sans transition-all cursor-pointer ${
                persona.gender === g
                  ? 'border-[#C9A84C] text-[#C9A84C] bg-[#C9A84C]/10'
                  : 'border-white/10 text-white/50 hover:border-white/20'
              }`}
            >
              {g === 'yin' ? '여성 (陰)' : '남성 (陽)'}
            </button>
          ))}
        </div>
      </div>

      {/* 나이 */}
      <div className="space-y-1.5">
        <label className="text-[10px] uppercase tracking-wider text-[#C9A84C] font-sans font-bold block">연령 주기</label>
        <div className="grid grid-cols-4 gap-2">
          {AGE_OPTIONS.map((age) => (
            <button
              key={age.id}
              onClick={() => onChange({ ...persona, ageGroup: age.id as PersonaState['ageGroup'] })}
              className={`py-2 rounded-lg border text-[10px] font-sans transition-all cursor-pointer ${
                persona.ageGroup === age.id
                  ? 'border-[#C9A84C] text-[#C9A84C] bg-[#C9A84C]/10'
                  : 'border-white/10 text-white/50 hover:border-white/20'
              }`}
            >
              {age.label}
            </button>
          ))}
        </div>
      </div>

      {/* 직업 선택 */}
      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-wider text-[#C9A84C] font-sans font-bold block">신분 / 직군</label>
        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
          {categories.map((cat) => (
            <div key={cat.id}>
              <p className="text-[9px] uppercase tracking-wider text-white/30 font-sans mb-1">{cat.label}</p>
              <div className="grid grid-cols-2 gap-1.5">
                {cat.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => selectJob(item.label)}
                    className={`text-left px-2.5 py-1.5 rounded-lg border text-[10px] font-sans transition-all cursor-pointer ${
                      persona.job === item.label
                        ? 'border-[#C9A84C] text-[#C9A84C] bg-[#C9A84C]/10'
                        : 'border-white/10 text-white/50 hover:border-white/20'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <input
          value={customJob}
          onChange={(e) => setCustomJob(e.target.value)}
          placeholder="또는 직접 입력 (자유 수결)"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#C9A84C] font-sans"
        />
      </div>

      <button
        onClick={handleNext}
        disabled={!valid}
        className="w-full py-3 rounded-lg bg-[#C9A84C] text-black font-bold text-sm hover:bg-[#d6b26d] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        다음 — 처방 작성 →
      </button>
    </div>
  );
}
