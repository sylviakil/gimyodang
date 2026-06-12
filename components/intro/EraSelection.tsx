'use client';
import { useState } from 'react';
import { EraType } from '@/types';

interface EraSelectionProps {
  selectedEra: EraType | null;
  onSelect: (era: EraType) => void;
}

const ERAS: { id: EraType; label: string; sub: string; badge: string; desc: string; color: string }[] = [
  {
    id: 'joseon',
    label: '조선 한양 자시의 꽃살문',
    sub: '제 1 관문 (朝鮮)',
    badge: '금색조 (골드)',
    desc: '문틈 사이 촛불 희미한 자시(밤 11시), 거친 격자꽃 무늬 종이문 너머로 그윽한 조청 연기가 내려앉습니다.',
    color: '#C9A84C',
  },
  {
    id: 'modern',
    label: '도시 빌딩 그늘의 강철문',
    sub: '제 2 관문 (現代)',
    badge: '은색조 (실버)',
    desc: '스마트폰이 무용해지는 골목길 사각지대, 탄 조청 냄새가 섞인 시크한 은빛 셔터문이 무겁게 놓여 있습니다.',
    color: '#9BA8B5',
  },
];

export default function EraSelection({ selectedEra, onSelect }: EraSelectionProps) {
  const [hovered, setHovered] = useState<EraType | null>(null);

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-2 font-serif text-center">
      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-[0.4em] text-[#C9A84C] font-sans font-bold">
          [ 제 2 장 ] 기묘당이 현용할 시공의 대문
        </p>
        <p className="text-[11px] text-white/50 max-w-lg mx-auto font-sans leading-relaxed">
          어느 시간의 자락에서 기묘당의 단과자를 받겠습니까? 선택한 시대에 따라 연화의 말투와 분위기가 달라집니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto pt-2">
        {ERAS.map((era) => {
          const active = hovered === era.id || selectedEra === era.id;
          const isJoseon = era.id === 'joseon';

          return (
            <button
              key={era.id}
              onClick={() => onSelect(era.id)}
              onMouseEnter={() => setHovered(era.id)}
              onMouseLeave={() => setHovered(null)}
              className={`group relative p-6 rounded-xl border text-left flex flex-col justify-between aspect-[3/4] transition-all duration-500 overflow-hidden outline-none cursor-pointer ${
                active
                  ? isJoseon
                    ? 'bg-[#18130b]/40 backdrop-blur-md border-[#C9A84C] shadow-[0_0_25px_rgba(201,168,76,0.3)] scale-[1.02]'
                    : 'bg-white/15 backdrop-blur-md border-zinc-300 shadow-[0_0_25px_rgba(255,255,255,0.2)] scale-[1.02]'
                  : 'bg-white/5 backdrop-blur-md border-white/5 hover:border-white/10 hover:bg-white/10'
              }`}
            >
              {/* 배경 격자 패턴 */}
              {isJoseon ? (
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(201,168,76,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(201,168,76,0.03)_1px,transparent_1px)] bg-[size:16px_24px] pointer-events-none" />
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff04_1px,transparent_1px)] bg-[size:12px_12px] pointer-events-none" />
              )}

              <div className="relative z-10 flex justify-between items-center text-[10px] font-semibold uppercase font-sans tracking-widest"
                style={{ color: active ? era.color : 'rgba(255,255,255,0.4)' }}>
                <span>{era.sub}</span>
                <span className="px-2 py-0.5 rounded text-[8px] border"
                  style={{ borderColor: `${era.color}40`, background: `${era.color}10` }}>
                  {era.badge}
                </span>
              </div>

              {/* 문 아이콘 */}
              <div className="relative z-10 my-4 flex justify-center items-center flex-1">
                {isJoseon ? (
                  <div className={`w-24 h-36 border-4 rounded-t-lg flex flex-col items-center justify-center relative transition-all duration-500 ${
                    active ? 'border-[#C9A84C] bg-[#291e10]/60' : 'border-[#C9A84C]/30 bg-[#16130d]'
                  }`}>
                    <div className="absolute inset-x-2 inset-y-2 border border-[#C9A84C]/20 flex flex-wrap gap-1 p-1">
                      {[...Array(12)].map((_, i) => (
                        <div key={i} className="w-[18%] h-[20%] border border-[#C9A84C]/15" />
                      ))}
                    </div>
                    <div className="w-3.5 h-3.5 rounded-full bg-[#C9A84C]/80 border border-black/40 z-20" />
                  </div>
                ) : (
                  <div className={`w-24 h-36 border-4 rounded-md flex flex-col items-center justify-center relative transition-all duration-500 ${
                    active ? 'border-zinc-300 bg-zinc-900/60' : 'border-zinc-700 bg-zinc-950'
                  }`}>
                    <div className="absolute top-3 w-10 h-0.5 bg-zinc-700/50 rounded-full" />
                    <div className="w-7 h-7 rounded bg-black/60 border border-zinc-700 flex flex-col justify-center items-center gap-0.5">
                      <div className="w-1 bg-zinc-300 h-1 rounded-full animate-pulse" />
                      <div className="text-[5px] font-mono font-bold text-zinc-400">SECURE</div>
                    </div>
                    <div className="absolute bottom-3 w-2 h-12 bg-zinc-700/50 rounded" />
                  </div>
                )}
              </div>

              <div className="relative z-10 space-y-1">
                <h3 className="text-sm font-bold tracking-widest font-serif transition-colors"
                  style={{ color: active ? era.color : 'white' }}>
                  {era.label}
                </h3>
                <p className="text-[10px] text-white/50 leading-relaxed font-sans font-light">
                  {era.desc}
                </p>
              </div>

              {active && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full animate-ping"
                  style={{ background: era.color }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
