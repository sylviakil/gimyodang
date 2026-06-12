'use client';
import { Prescription } from '@/types';

interface PrescriptionCardProps {
  prescription: Prescription;
  onAccept: () => void;
  onDecline: () => void;
  onMore?: () => void;
  loading?: boolean;
}

const PRICE_CODE_LABELS: Record<string, string> = {
  A: 'A — 망각의 대가',
  B: 'B — 감각의 대가',
  C: 'C — 관계의 대가',
  D: 'D — 본질의 대가',
  E: 'E — 시간의 대가',
};

export default function PrescriptionCard({
  prescription,
  onAccept,
  onDecline,
  onMore,
  loading = false,
}: PrescriptionCardProps) {
  return (
    <div className="bg-[#15110a]/70 backdrop-blur-md border-2 border-dashed border-[#C9A84C]/50 rounded-xl p-5 relative overflow-hidden animate-fade-in shadow-2xl">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C]/60 to-transparent" />
      <div className="absolute top-0 right-0 w-16 h-[1px] bg-gradient-to-l from-[#C9A84C]/30 to-transparent" />
      <div className="absolute top-0 right-0 w-[1px] h-16 bg-gradient-to-b from-[#C9A84C]/30 to-transparent" />

      {/* 헤더 */}
      <div className="flex items-start justify-between mb-4 pb-3 border-b border-[#C9A84C]/20">
        <div>
          <p className="text-[9px] uppercase tracking-[0.4em] text-[#C9A84C] font-sans font-bold mb-1">
            기묘당 처방전
          </p>
          <h3 className="text-xl font-bold text-[#C9A84C] font-serif">{prescription.name}</h3>
        </div>
        <span className="text-[9px] border border-[#C9A84C]/30 px-2 py-0.5 text-[#C9A84C] rounded bg-[#C9A84C]/5 font-sans uppercase tracking-wider shrink-0">
          {prescription.original}
        </span>
      </div>

      {/* 내용 */}
      <div className="space-y-3 text-xs font-serif">
        <div>
          <span className="text-[9px] uppercase tracking-wider text-[#C9A84C] font-sans font-bold block mb-0.5">형상</span>
          <p className="text-white/80 leading-relaxed">{prescription.visual}</p>
        </div>
        <div>
          <span className="text-[9px] uppercase tracking-wider text-[#C9A84C] font-sans font-bold block mb-0.5">재료</span>
          <p className="text-white/80 leading-relaxed">{prescription.ingredients}</p>
        </div>
        <div>
          <span className="text-[9px] uppercase tracking-wider text-[#C9A84C] font-sans font-bold block mb-0.5">효능</span>
          <p className="text-white/90 leading-relaxed">{prescription.effect}</p>
        </div>

        {/* 대가 — 강조 */}
        <div className="bg-red-950/30 border border-red-500/20 rounded-lg p-3 mt-2">
          <span className="text-[9px] uppercase tracking-widest text-red-400 font-sans font-bold block mb-1">
            ⚠️ 역설적 대가 ({PRICE_CODE_LABELS[prescription.price_code] ?? prescription.price_code})
          </span>
          <p className="text-red-200/90 leading-relaxed">{prescription.price}</p>
        </div>

        {/* 메타 */}
        <div className="flex gap-3 pt-1 text-[9px] text-white/30 font-sans uppercase tracking-wider">
          <span>욕망 {prescription.desire_code}</span>
          <span>·</span>
          <span>규모 {prescription.scale}</span>
        </div>
      </div>

      {/* 버튼 */}
      <div className="grid grid-cols-2 gap-3 mt-5 font-sans">
        <button
          onClick={onDecline}
          disabled={loading}
          className="py-2.5 rounded border border-white/15 text-white/60 hover:bg-white/5 text-xs transition-all disabled:opacity-40 cursor-pointer"
        >
          거두고 물러나기
        </button>
        <button
          onClick={onAccept}
          disabled={loading}
          className="py-2.5 rounded bg-[#C9A84C] text-black hover:bg-[#d6b26d] text-xs font-bold transition-all disabled:opacity-40 shadow-lg cursor-pointer"
        >
          {loading ? '조제 중...' : '과자를 삼키고 수락'}
        </button>
      </div>
      {onMore && (
        <button
          onClick={onMore}
          disabled={loading}
          className="w-full mt-2 py-2 rounded border border-[#C9A84C]/20 text-[#C9A84C]/60 hover:text-[#C9A84C] hover:border-[#C9A84C]/40 text-[10px] font-sans transition-all disabled:opacity-40 cursor-pointer"
        >
          더 알고 싶다 (심화 설명)
        </button>
      )}
    </div>
  );
}
