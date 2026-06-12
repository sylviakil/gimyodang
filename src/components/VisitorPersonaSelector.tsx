/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { EraType } from '../types';
import { 
  PersonaState, 
  JOSEON_PERSONAS, 
  MODERN_PERSONAS, 
  GENDER_OPTIONS, 
  AGE_OPTIONS,
  PersonaItem,
  PersonaCategory
} from '../data/personas';
import { 
  User, 
  Users, 
  Sparkle, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  PenTool, 
  Info,
  Compass,
  Infinity as InfinityIcon,
  Atom,
  Eye,
  ScanFace
} from 'lucide-react';

interface VisitorPersonaSelectorProps {
  era: EraType;
  onSelect: (persona: PersonaState) => void;
  onBack: () => void;
  initialPersona?: PersonaState;
}

export default function VisitorPersonaSelector({ era, onSelect, onBack, initialPersona }: VisitorPersonaSelectorProps) {
  // Determine categories depending on Chosen Era
  const categories: PersonaCategory[] = era === 'joseon' 
    ? JOSEON_PERSONAS 
    : MODERN_PERSONAS;

  const eraTitle = era === 'joseon' 
    ? '조선시공 (朝鮮)' 
    : '현대시공 (現代)';

  // Initial local state setup
  const [selectedCat, setSelectedCat] = useState<string>(
    initialPersona?.category || categories[0]?.id || ''
  );
  const [selectedJob, setSelectedJob] = useState<string>(
    initialPersona?.job || ''
  );
  const [isCustomJob, setIsCustomJob] = useState<boolean>(
    initialPersona?.category === 'custom' || (!categories.some(c => c.items.some(i => i.label === initialPersona?.job)) && !!initialPersona?.job)
  );
  const [customJobInput, setCustomJobInput] = useState<string>(
    initialPersona?.category === 'custom' || (!categories.some(c => c.items.some(i => i.label === initialPersona?.job)) && !!initialPersona?.job) 
      ? initialPersona?.job || '' 
      : ''
  );
  const [gender, setGender] = useState<'yin' | 'yang'>(
    ((initialPersona?.gender as string) === 'neutral' ? 'yin' : initialPersona?.gender) || 'yin'
  );
  const [ageGroup, setAgeGroup] = useState<'adult' | 'middle' | 'elder' | 'senior'>(
    ((initialPersona?.ageGroup as string) === 'eternal' || (initialPersona?.ageGroup as string) === 'youth' ? 'adult' : initialPersona?.ageGroup) || 'adult'
  );
  const [nameInput, setNameInput] = useState<string>(
    initialPersona?.name || ''
  );
  const [showDemoModal, setShowDemoModal] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Pick helper context description
  const currentCatObj = categories.find(c => c.id === selectedCat);

  // Dynamic Theme Colors configuration
  const getThemeColors = () => {
    if (era === 'joseon') {
      return {
        accentText: 'text-[#C5A037]',
        textHighlight: 'text-[#C5A059]',
        accentTextHover: 'hover:text-[#d6b26d]',
        borderColor: 'border-[#C5A059]',
        borderColorMuted: 'border-[#C5A059]/30',
        borderColorHeavy: 'border-[#C5A059]/60',
        bgColorMuted: 'bg-[#C5A059]/10',
        accentBg: 'bg-[#C5A059]',
        accentBgHover: 'hover:bg-[#d6b26d]',
        selectedBorder: 'border-[#C5A059] shadow-[0_0_15px_rgba(197,160,89,0.3)]',
        selectedBorderBold: 'border-2 border-[#C5A059] shadow-[0_0_20px_rgba(197,160,89,0.25)]',
        accentPill: 'bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/30',
        badgeTitle: '계층 지침: 조선 명부',
        glow: 'shadow-[0_0_15px_rgba(197,160,89,0.15)]',
        rawHex: '#C5A059',
      };
    } else {
      return {
        accentText: 'text-zinc-400',
        textHighlight: 'text-white',
        accentTextHover: 'hover:text-white',
        borderColor: 'border-white/40',
        borderColorMuted: 'border-white/10',
        borderColorHeavy: 'border-white/60',
        bgColorMuted: 'bg-white/10',
        accentBg: 'bg-white',
        accentBgHover: 'hover:bg-zinc-200',
        selectedBorder: 'border-white/60 shadow-[0_0_15px_rgba(255,255,255,0.15)]',
        selectedBorderBold: 'border-2 border-white/60 shadow-[0_0_20px_rgba(255,255,255,0.12)]',
        accentPill: 'bg-white/10 text-zinc-300 border border-white/15',
        badgeTitle: '계층 지침: 현대 명부',
        glow: 'shadow-[0_0_15px_rgba(255,255,255,0.08)]',
        rawHex: '#D4D4D8',
      };
    }
  };

  const colors = getThemeColors();

  // Click on a predefined job
  const handleSelectPredefinedJob = (item: PersonaItem) => {
    setIsCustomJob(false);
    setSelectedJob(item.label);
    setErrorMsg(null);
  };

  // Click on custom job option
  const handleSelectCustomJob = () => {
    setIsCustomJob(true);
    setSelectedJob(customJobInput || '이방인');
    setErrorMsg(null);
  };

  const handleCustomJobTextChange = (text: string) => {
    setCustomJobInput(text);
    setSelectedJob(text || '자유인');
  };

  // Form submission / Validation
  const handleProceed = () => {
    const finalJob = isCustomJob ? customJobInput.trim() : selectedJob;

    if (!finalJob) {
      setErrorMsg('그대의 소임이나 방문자의 신분/직권을 선택하거나 기입해 주십시오.');
      return;
    }

    if (!nameInput.trim()) {
      setErrorMsg('수결 명부에 남길 서명(성명 혹은 별칭)을 적어주십시오.');
      return;
    }

    onSelect({
      category: isCustomJob ? 'custom' : selectedCat,
      job: finalJob,
      gender,
      ageGroup,
      name: nameInput.trim()
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2 font-serif text-left">
      {/* Header section with theme alignment */}
      <div className="text-center space-y-2 mb-6">
        <label className={`text-[10px] uppercase tracking-[0.4em] ${colors.textHighlight} block font-sans font-bold`}>
          [ 제 3 장 ] 기묘당 수결 명부: 손님 수경 분과 (VISITOR ARCHER TYPE SELECTION)
        </label>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <h2 className="text-xl md:text-2xl text-white font-bold tracking-tight">
            {eraTitle} 속 그대의 정체성은 무엇입니까?
          </h2>
          <button
            onClick={onBack}
            type="button"
            className="py-1 px-2.5 bg-white/[0.03] hover:bg-white/[0.08] text-white/50 hover:text-white border border-white/5 hover:border-white/12 rounded-lg text-[10.5px] transition-all flex items-center gap-1 focus:outline-none cursor-pointer font-sans"
          >
            <ArrowLeft className={`w-3 h-3 ${colors.textHighlight}`} />
            <span>시대 재선택</span>
          </button>
        </div>
        <p className="text-[11px] text-white/50 max-w-xl mx-auto font-sans leading-relaxed">
          대속 처방을 수결하기 전 그대의 운명 궤적을 명부에 담습니다. 시대에 맞는 신분 혹은 직업과 상세 설정을 기고해 주셔야 영사된 마법이 정확히 연주됩니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Deep Class / Category selector and detailed job grids (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main big category tabs */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-1 rounded-xl flex flex-wrap gap-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCat(cat.id);
                  setIsCustomJob(false);
                  setSelectedJob('');
                  setErrorMsg(null);
                }}
                className={`flex-1 min-w-[120px] px-3 py-2.5 text-center rounded-lg transition-all focus:outline-none cursor-pointer ${
                  selectedCat === cat.id && !isCustomJob
                    ? `bg-transparent border ${colors.borderColor} ${colors.textHighlight} font-bold font-sans text-xs ${colors.glow}`
                    : 'bg-transparent text-white/50 hover:text-white hover:bg-white/[0.02] font-sans text-[11px]'
                }`}
              >
                {cat.label}
              </button>
            ))}
            
            {/* Custom job tab */}
            <button
              onClick={() => {
                setSelectedCat('custom');
                handleSelectCustomJob();
              }}
              className={`flex-1 min-w-[120px] px-3 py-2.5 text-center rounded-lg transition-all focus:outline-none cursor-pointer ${
                isCustomJob
                  ? `bg-transparent border ${colors.borderColor} ${colors.textHighlight} font-bold font-sans text-xs ${colors.glow}`
                  : 'bg-transparent text-white/50 hover:text-white hover:bg-white/[0.02] font-sans text-[11px]'
              }`}
            >
              직접 수결 (기타)
            </button>
          </div>

          {/* Subtext describing the active category */}
          {!isCustomJob && currentCatObj && (
            <div className={`bg-white/5 backdrop-blur-sm border-l-2 ${colors.borderColor} p-3 rounded-r-lg`}>
              <p className={`text-[10px] uppercase ${colors.textHighlight} tracking-wider font-sans font-bold flex items-center gap-1.5`}>
                <Info className="w-3 h-3" />
                <span>계층 지침: {currentCatObj.label}</span>
              </p>
              <p className="text-xs text-white/60 mt-1 font-serif leading-relaxed italic">
                "{currentCatObj.description}"
              </p>
            </div>
          )}

          {/* Job Selection Deck */}
          {!isCustomJob ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentCatObj?.items.map((item) => {
                const isSelected = selectedJob === item.label;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectPredefinedJob(item)}
                    className={`p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden flex flex-col justify-between min-h-[110px] cursor-pointer group ${
                      isSelected
                        ? `bg-transparent ${colors.borderColor} ${colors.glow}`
                        : 'bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <h4 className={`text-sm font-bold text-white group-hover:${colors.textHighlight} transition-colors font-serif`}>
                        {item.label}
                      </h4>
                      <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed font-serif font-light">
                        {item.description}
                      </p>
                    </div>
                    {isSelected && (
                      <div className={`absolute top-2 right-2 w-4 h-4 rounded-full ${colors.accentBg} flex items-center justify-center`}>
                        <Check className="w-2.5 h-2.5 text-black stroke-[3px]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            /* Custom Job typing terminal */
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-xl space-y-4 shadow-xl">
              <div className="flex items-center gap-2 mb-1">
                <PenTool className={`w-4 h-4 ${colors.textHighlight}`} />
                <h3 className={`text-xs uppercase tracking-widest font-sans font-bold ${colors.textHighlight}`}>
                  자유 인물 수결 단상 (Custom Profile Creator)
                </h3>
              </div>
              <p className="text-[11px] text-white/50 leading-relaxed font-sans">
                정의된 20개 분류 외에 직접 {eraTitle}에서의 역할이나 소임, 기행적 직업을 적어주십시오. 예검대 '마주', '해적단원', '은하 사냥꾼', '정치인' 등이 가능합니다.
              </p>
              
              <div className="space-y-1">
                <label className="text-[9.5px] uppercase text-white/40 font-sans tracking-widest block font-bold">
                  나의 신분/소임 자유 묘사 (My Custom Vocation)
                </label>
                <input
                  type="text"
                  maxLength={18}
                  placeholder="예: 저주의 굿을 푸는 낙방 기생 / 사이버 암살 청부업자"
                  value={customJobInput}
                  onChange={(e) => handleCustomJobTextChange(e.target.value)}
                  className={`w-full px-4 py-3 bg-white/[0.04] backdrop-blur-md border border-white/10 rounded-lg text-xs font-serif text-white placeholder-white/20 focus:outline-none focus:${colors.borderColorHeavy} transition-all font-light`}
                />
              </div>
            </div>
          )}

          {/* Demographics details settings (Gender, Age, Name Input) */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-xl space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <ScanFace className={`w-4 h-4 ${colors.textHighlight}`} />
                <h3 className={`text-xs uppercase tracking-widest font-sans font-bold ${colors.textHighlight}`}>
                  수결 조제 상세 조율 (DEMOGRAPHICS RITUAL)
                </h3>
              </div>
              <span className={`text-[9px] ${colors.accentText} uppercase tracking-widest font-sans`}>[ 명인 실증 ]</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Gender Dropdown Selector */}
              <div className="space-y-2">
                <label className={`text-[10px] uppercase ${colors.textHighlight} block font-sans tracking-widest font-bold`}>
                  가. 성별 선택 (Select Gender)
                </label>
                <div className="relative">
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'yin' | 'yang')}
                    className={`w-full px-4 py-3 bg-white/[0.04] backdrop-blur-md border border-white/10 rounded-lg text-xs font-serif text-white focus:outline-none focus:border-${colors.rawHex} focus:${colors.borderColor} focus:ring-1 focus:ring-${colors.rawHex} cursor-pointer appearance-none pr-10`}
                  >
                    {GENDER_OPTIONS.map((g) => (
                      <option key={g.id} value={g.id} className="bg-[#121214] text-white">
                        {g.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-3.5 pointer-events-none text-white/40">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Age Selection Group Dropdown Selector */}
              <div className="space-y-2">
                <label className={`text-[10px] uppercase ${colors.textHighlight} block font-sans tracking-widest font-bold`}>
                  나. 연령 선택 (Select Age Group)
                </label>
                <div className="relative">
                  <select
                    value={ageGroup}
                    onChange={(e) => setAgeGroup(e.target.value as 'adult' | 'middle' | 'elder' | 'senior')}
                    className={`w-full px-4 py-3 bg-white/[0.04] backdrop-blur-md border border-white/10 rounded-lg text-xs font-serif text-white focus:outline-none focus:border-${colors.rawHex} focus:${colors.borderColor} focus:ring-1 focus:ring-${colors.rawHex} cursor-pointer appearance-none pr-10`}
                  >
                    {AGE_OPTIONS.map((a) => (
                      <option key={a.id} value={a.id} className="bg-[#121214] text-white">
                        {a.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-3.5 pointer-events-none text-white/40">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Manual Written Signature Name input */}
            <div className="bg-white/5 backdrop-blur-sm p-4 border border-white/10 rounded-xl space-y-3 shadow-lg">
              <div className="flex justify-between items-center">
                <label className="text-[10.5px] uppercase tracking-wide text-white/70 block font-sans font-bold">
                  다. 서명단 수결 등록 (Assign Name/Callsign)
                </label>
                <span className="text-[8px] text-white/30 uppercase tracking-widest font-sans">[ 마법 수결 자물쇠 ]</span>
              </div>
              <p className="text-[10px] text-white/40 leading-relaxed font-sans">
                기묘당 명부에 새겨져 평생 대속자들의 명예를 안고 갈 이름을 기고하십시오. 실명 대신 애칭, 혹은 별칭('춘풍', '지옥의방랑수', 'A-312' 등)도 좋습니다.
              </p>
              
              <div className="relative">
                <input
                  type="text"
                  maxLength={12}
                  placeholder="서명을 가만 적으십시오..."
                  value={nameInput}
                  onChange={(e) => {
                    setNameInput(e.target.value);
                    setErrorMsg(null);
                  }}
                  className={`w-full pl-10 pr-4 py-3 bg-[#120d18] border border-white/10 rounded-lg text-sm text-white placeholder-white/20 focus:outline-none focus:${colors.borderColor} font-serif font-bold tracking-widest transition-all`}
                />
                <PenTool className="absolute left-3.5 top-3.5 w-4 h-4 text-white/35" />
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: Elegant Parchment/Ritual Metadata Card (4 cols) */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
          
          <div className={`bg-white/5 backdrop-blur-md border ${colors.borderColorMuted} p-6 rounded-2xl relative overflow-hidden shadow-2xl`}>
            {/* Elegant glowing background layer */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[${colors.rawHex}]/5 to-transparent pointer-events-none`} />
            <div className={`absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-[${colors.rawHex}]/30 to-transparent`} />
            
            <h3 className={`text-xs tracking-[0.4em] ${colors.textHighlight} uppercase border-b border-white/5 pb-2.5 mb-4 text-center font-bold`}>
              기묘당 수결 확인판
            </h3>

            {/* Ledger visual container */}
            <div className="space-y-4 font-serif">
              <div className="flex justify-between items-center text-[10px] border-b border-white/5 pb-2 text-white/40">
                <span>시간 문맥</span>
                <span className={`${colors.textHighlight} font-bold font-sans`}>{eraTitle}</span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-white/30 block font-sans">정해진 본질 (신분/소임)</span>
                {selectedJob ? (
                  <p className="text-sm text-white font-bold tracking-wider leading-relaxed bg-white/[0.02] border border-white/5 px-2.5 py-1 rounded">
                    {selectedJob}
                  </p>
                ) : (
                  <p className="text-xs text-white/20 italic">신분 혹은 소임 미결정</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-white/[0.01] border border-white/5 p-2 rounded">
                  <span className="text-[9px] text-white/30 block mb-0.5 font-sans">성별</span>
                  <span className="text-white font-bold">
                    {gender === 'yin' && '여성'}
                    {gender === 'yang' && '남성'}
                  </span>
                </div>
                <div className="bg-white/[0.01] border border-white/5 p-2 rounded">
                  <span className="text-[9px] text-white/30 block mb-0.5 font-sans">연령</span>
                  <span className="text-white font-bold">
                    {ageGroup === 'adult' && '20-30대'}
                    {ageGroup === 'middle' && '40-50대'}
                    {ageGroup === 'elder' && '60대'}
                    {ageGroup === 'senior' && '70대 이상'}
                  </span>
                </div>
              </div>

              <div className="space-y-1 border-t border-white/5 pt-3">
                <span className="text-[10px] text-white/30 block font-sans">수결 서명낙인</span>
                {nameInput.trim() ? (
                  <p className={`text-base ${colors.textHighlight} font-bold italic tracking-widest pl-2 font-serif border-l-2 ${colors.borderColor} py-0.5`}>
                    "{nameInput.trim()}"
                  </p>
                ) : (
                  <p className="text-xs text-white/20 italic pl-2 border-l-2 border-white/10 py-0.5">서명 대기 중</p>
                )}
              </div>
            </div>

            {/* Error Indicator */}
            {errorMsg && (
              <div className="mt-4 p-3 bg-red-950/20 border border-red-500/25 rounded-md text-red-300 text-[10px] leading-relaxed font-sans">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 pt-4 border-t border-white/5 space-y-2 font-sans">
              <button
                onClick={handleProceed}
                className={`w-full py-3 ${colors.accentBg} ${era === 'modern' ? 'text-black' : era === 'joseon' ? 'text-black' : 'text-white'} font-bold text-xs rounded-xl ${colors.accentBgHover} transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer focus:outline-none`}
              >
                <span>이 정체성으로 자시 명부 수결하기</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* Aesthetic validation note */}
          <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl text-[10.5px] leading-relaxed text-white/40 font-sans">
            <span className={`${colors.textHighlight} font-bold block mb-1`}>💡 기묘당 묵비규정</span>
            방문하는 계층과 정체성에 따라 기묘당 조제 기전의 화법이 달라지며, 이는 대속 처방전의 단과자 형체 및 부작 효과에도 지대한 마법적 파장을 자아냅니다.
          </div>

        </div>

      </div>

    </div>
  );
}
