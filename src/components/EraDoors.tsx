/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EraType } from '../types';
import { ShieldAlert, Compass, Calendar, Sparkles, HelpCircle } from 'lucide-react';

interface EraDoorsProps {
  selectedEra: EraType | null;
  onSelectEra: (era: EraType) => void;
  onNext: () => void;
}

export default function EraDoors({ selectedEra, onSelectEra, onNext }: EraDoorsProps) {
  const [hoveredEra, setHoveredEra] = React.useState<EraType | null>(null);
  const activeEra = hoveredEra || selectedEra;

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2 font-serif text-center">
      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-[0.4em] text-[#C5A059] block font-sans font-bold">
          [ 제 2 장 ] 기묘당이 현용할 시공의 대문 (SELECT THE TEMPLE GATEWAY)
        </label>
        <p className="text-[11px] text-white/50 max-w-lg mx-auto font-sans leading-relaxed">
          어느 시간의 자락에서 기묘당의 단과자를 매식 받겠습니까? 고르신 시대의 흔적에 따라 기묘당 대화창의 분위기와 주술 양태(색조)가 개별 전조됩니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto pt-2">
        
        {/* DOORS 1: JOSEON Traditional Flower Door */}
        <button
          onClick={() => {
            onSelectEra('joseon');
            onNext();
          }}
          onMouseEnter={() => setHoveredEra('joseon')}
          onMouseLeave={() => setHoveredEra(null)}
          className={`group relative p-6 rounded-xl border text-left flex flex-col justify-between aspect-[3/4.2] transition-all duration-500 overflow-hidden outline-none ${
            activeEra === 'joseon'
              ? 'bg-[#18130b]/40 backdrop-blur-md border-[#C5A059] shadow-[0_0_25px_rgba(197,160,89,0.3)] scale-[1.02]'
              : 'bg-white/5 backdrop-blur-md border-white/5 hover:border-white/10 hover:bg-white/10'
          }`}
        >
          {/* Traditional lattice paper door decor overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(197,160,89,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(197,160,89,0.03)_1px,transparent_1px)] bg-[size:16px_24px] pointer-events-none" />
          
          <div className="relative z-10 flex justify-between items-center text-[10px] text-[#C5A037] font-semibold uppercase font-sans tracking-widest">
            <span>제 1 관문 (朝鮮)</span>
            <span className="bg-[#C5A059]/10 border border-[#C5A059]/30 px-2 py-0.5 rounded text-[8px]">금색조 (골드)</span>
          </div>

          {/* Majestic traditional wood-carved door icon/shape */}
          <div className="relative z-10 my-6 flex justify-center items-center flex-1">
            <div className={`w-28 h-40 border-4 ${activeEra === 'joseon' ? 'border-[#C5A059] bg-[#291e10]/60' : 'border-[#C5A059]/30 bg-[#16130d]'} rounded-t-lg flex flex-col items-center justify-center relative transition-all duration-500`}>
              {/* Wooden lattices grids */}
              <div className="absolute inset-x-2 inset-y-2 border border-[#C5A059]/20 flex flex-wrap gap-1 p-1">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="w-[18%] h-[20%] border border-[#C5A059]/15" />
                ))}
              </div>
              <div className="w-4 h-4 rounded-full bg-[#C5A059]/80 border border-black/40 z-20 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-black rounded-full" />
              </div>
            </div>
          </div>

          <div className="relative z-10 space-y-1.5">
            <h3 className="text-sm font-bold text-white tracking-widest text-[#F3CE82] group-hover:text-[#C5A059] transition-colors font-serif">
              조선 한양 자시의 꽃살문
            </h3>
            <p className="text-[10px] text-white/50 leading-relaxed font-sans font-light">
              문틈 사이 촛불 희미한 자시(밤 11시), 거친 격자꽃 무늬 종이문 너머로 그윽련 조청 연기가 내려앉습니다.
            </p>
          </div>
        </button>

        {/* DOORS 2: MODERN Concrete Steel Door */}
        <button
          onClick={() => {
            onSelectEra('modern');
            onNext();
          }}
          onMouseEnter={() => setHoveredEra('modern')}
          onMouseLeave={() => setHoveredEra(null)}
          className={`group relative p-6 rounded-xl border text-left flex flex-col justify-between aspect-[3/4.2] transition-all duration-500 overflow-hidden outline-none ${
            activeEra === 'modern'
              ? 'bg-white/15 backdrop-blur-md border-zinc-100 shadow-[0_0_30px_rgba(255,255,255,0.25)] scale-[1.02]'
              : 'bg-white/5 backdrop-blur-md border-white/5 hover:border-white/10 hover:bg-white/10'
          }`}
        >
          {/* Modern minimalist metallic code pattern decor overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff04_1px,transparent_1px)] bg-[size:12px_12px] pointer-events-none" />

          <div className="relative z-10 flex justify-between items-center text-[10px] text-zinc-400 font-semibold uppercase font-sans tracking-widest">
            <span>제 2 관문 (現代)</span>
            <span className="bg-white/10 border border-white/20 px-2 py-0.5 rounded text-[8px]">은색조 (실버)</span>
          </div>

          {/* Futuristic modern high security metal door icon/shape */}
          <div className="relative z-10 my-6 flex justify-center items-center flex-1">
            <div className={`w-28 h-40 border-4 ${activeEra === 'modern' ? 'border-zinc-300 bg-zinc-900/60' : 'border-zinc-800 bg-zinc-950'} rounded-md flex flex-col items-center justify-center relative transition-all duration-500`}>
              {/* Industrial code block */}
              <div className="absolute top-4 w-12 h-1 bg-zinc-700/50 rounded-full" />
              <div className="w-8 h-8 rounded bg-black/60 border border-zinc-700 flex flex-col justify-center items-center gap-0.5">
                <div className="w-1 bg-zinc-300 h-1 rounded-full animate-pulse" />
                <div className="text-[6px] font-mono font-bold text-zinc-400">SECURE</div>
              </div>
              <div className="absolute bottom-4 w-2 h-14 bg-zinc-700/50 rounded" />
            </div>
          </div>

          <div className="relative z-10 space-y-1.5">
            <h3 className="text-sm font-bold text-white tracking-widest group-hover:text-zinc-200 transition-colors font-serif">
              도시 빌딩 그늘의 강철문
            </h3>
            <p className="text-[10px] text-white/50 leading-relaxed font-sans font-light">
              화려한 스크린과 스마트폰이 무용해지는 골목길 사각지대, 탄 조청 냄새가 섞인 이색적이고 시크한 은빛 셔터문이 무겁게 놓여있습니다.
            </p>
          </div>
        </button>

      </div>
    </div>
  );
}
