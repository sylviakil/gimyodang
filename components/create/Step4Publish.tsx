'use client';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface Step4PublishProps {
  guestName: string;
  confectionName: string;
  endingTone: string;
  status: 'idle' | 'saving' | 'saved' | 'failed';
  onPublish: () => void;
  onBack: () => void;
  onGoGallery: () => void;
}

export default function Step4Publish({
  guestName, confectionName, endingTone,
  status, onPublish, onBack, onGoGallery,
}: Step4PublishProps) {
  const toneLabel = { warm: '온기', cold: '냉기', open: '열림' }[endingTone] ?? endingTone;

  return (
    <div className="space-y-6 max-w-2xl mx-auto text-center">
      <div className="space-y-1">
        <p className="text-[10px] uppercase tracking-[0.4em] text-[#C9A84C] font-sans font-bold">Step 4 — 공개 발행</p>
        <p className="text-xs text-white/50 font-sans">이야기를 기묘당 궤짝 갤러리에 공개합니다.</p>
      </div>

      {/* 미리보기 */}
      <div className="bg-white/5 border border-[#C9A84C]/30 rounded-xl p-6 text-left space-y-3">
        <h3 className="text-lg font-serif text-[#C9A84C] font-bold">{confectionName || '(처방 이름)'}</h3>
        <div className="space-y-1 text-xs font-sans text-white/60">
          <p>손님: <span className="text-white">{guestName || '(이름 없음)'}</span></p>
          <p>결말 톤: <span className="text-white">{toneLabel}</span></p>
        </div>
        <p className="text-[10px] text-white/30 font-sans">* 갤러리에 공개되며 다른 손님들이 감상할 수 있습니다.</p>
      </div>

      {status === 'saved' ? (
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-2 text-[#C9A84C]">
            <CheckCircle2 className="w-10 h-10" />
            <p className="font-serif text-lg">이야기가 기묘당 궤짝에 봉인되었습니다.</p>
          </div>
          <button
            onClick={onGoGallery}
            className="px-8 py-3 rounded-lg bg-[#C9A84C] text-black font-bold text-sm hover:bg-[#d6b26d] transition-all cursor-pointer"
          >
            궤짝 갤러리로 이동 →
          </button>
        </div>
      ) : (
        <div className="flex gap-3 justify-center">
          <button onClick={onBack} className="px-6 py-2.5 rounded-lg border border-white/10 text-white/60 hover:bg-white/5 text-xs font-sans cursor-pointer">
            ← 결말 수정
          </button>
          <button
            onClick={onPublish}
            disabled={status === 'saving'}
            className="px-10 py-2.5 rounded-lg bg-[#C9A84C] text-black font-bold text-sm hover:bg-[#d6b26d] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
          >
            {status === 'saving' ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> 봉인 중...</>
            ) : (
              '궤짝에 봉인하여 공개'
            )}
          </button>
        </div>
      )}

      {status === 'failed' && (
        <p className="text-xs text-red-400 font-sans">저장에 실패했습니다. 다시 시도해 주십시오.</p>
      )}
    </div>
  );
}
