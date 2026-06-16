'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AtmosphereEffect from '@/components/ui/AtmosphereEffect';
import IntroSequence from '@/components/intro/IntroSequence';
import EraSelection from '@/components/intro/EraSelection';
import CandleFlicker from '@/components/ui/CandleFlicker';
import { EraType } from '@/types';
import { Archive, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useSettings } from '@/contexts/SettingsContext';

type Stage = 'intro' | 'era' | 'ready';

function HomeContent() {

  const router = useRouter();
  const searchParams = useSearchParams();
  const [stage, setStage] = useState<Stage>('intro');
  const [era, setEra] = useState<EraType | null>(null);
  const { setActivePage } = useSettings();

  // 관리자 패널이 현재 보고 있는 단계의 폰트/색상을 편집하도록 동기화
  useEffect(() => {
    setActivePage(stage === 'intro' ? 'intro' : stage === 'era' ? 'door' : 'enter');
  }, [stage, setActivePage]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // ?intro=1 이면 localStorage 초기화 후 인트로 강제 재생
    if (searchParams.get('intro') === '1') {
      localStorage.removeItem('gimyo_visited');
      setStage('intro');
      return;
    }
    // 재방문자는 인트로 스킵
    if (localStorage.getItem('gimyo_visited')) {
      setStage('era');
    }
  }, [searchParams]);

  // 인트로 stage에서 html 스크롤 완전 차단
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (stage === 'intro') {
      document.documentElement.classList.add('no-scroll');
    } else {
      document.documentElement.classList.remove('no-scroll');
    }
    return () => { document.documentElement.classList.remove('no-scroll'); };
  }, [stage]);

  const handleIntroEnter = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gimyo_visited', '1');
    }
    setStage('era');
  };

  const handleEraSelect = (e: EraType) => {
    setEra(e);
    setStage('ready');
  };

  const handleEnter = () => {
    if (era) router.push(`/visit?era=${era}`);
  };

  return (
    <div className={`relative bg-transparent text-[#E5E5E5] font-serif flex flex-col ${stage === 'intro' ? 'h-screen max-h-screen overflow-hidden' : 'min-h-screen'}`}>

      <AtmosphereEffect />

      {/* 상단 네비 */}
      <nav className="fixed top-0 left-0 right-0 z-30 flex justify-between items-center px-6 md:px-12 h-16 bg-transparent">
        <button
          onClick={() => {
            if (typeof window !== 'undefined') localStorage.removeItem('gimyo_visited');
            setStage('intro');
            setEra(null);
          }}
          className="flex items-center gap-3 hover:opacity-80 transition-all focus:outline-none"
        >
          <div className="w-7 h-7 bg-[#C9A84C] rotate-45 flex items-center justify-center">
            <div className="w-3.5 h-3.5 bg-black rotate-[-45deg] flex items-center justify-center font-serif text-[8px] text-[#C9A84C] font-bold">奇</div>
          </div>
          <span className="text-base font-serif italic tracking-tight text-white">
            Gimyodang <span className="text-xs text-[#C9A84C] font-light not-italic">奇妙堂</span>
          </span>
        </button>

        {/* 현재 페이지명 */}
        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
          <span className="text-[9px] uppercase tracking-[0.4em] font-sans text-white/20">
            {stage === 'intro' ? 'intro' : stage === 'era' ? 'door' : 'enter'}
          </span>
          <span className="text-xs mt-0.5" style={{ fontFamily: 'var(--font-ui)', color: 'var(--color-ui)' }}>
            {stage === 'intro' ? '문 앞' : stage === 'era' ? '길목' : '기묘당 문'}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/gallery" className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] text-white/40 hover:text-[#C9A84C] transition-colors font-sans">
            <Archive className="w-3.5 h-3.5" />
            <span>궤짝 갤러리</span>
          </Link>
          <Link href="/create" className="text-[10px] uppercase tracking-[0.25em] text-white/40 hover:text-[#C9A84C] transition-colors font-sans">
            이야기 창작
          </Link>
        </div>
      </nav>

      {/* 메인 콘텐츠 */}
      <main className="relative z-10 flex-1 pt-16">

        {/* 인트로 영상 */}
        {stage === 'intro' && (
          <IntroSequence onEnter={handleIntroEnter} />
        )}

        {/* 시대 선택 */}
        {stage === 'era' && (
          <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-4xl">
              <EraSelection selectedEra={era} onSelect={handleEraSelect} />
            </div>
          </div>
        )}

        {/* 진입 준비 */}
        {stage === 'ready' && era && (
          <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-8">
            <div className="max-w-md mx-auto text-center space-y-8 animate-fade-in">
              <CandleFlicker size="lg" className="mx-auto" />

              <div className="space-y-3">
                <p className="text-[10px] uppercase tracking-[0.5em] text-[#C9A84C] font-sans font-bold">
                  {era === 'joseon' ? '조선 한양 자시' : '현대 서울 강남 뒷골목'}
                </p>
                <h1 className="text-3xl text-white leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                  기묘당의 문이<br />
                  <span style={{ color: 'var(--color-heading-from)' }}>열려 있습니다</span>
                </h1>
                <p className="text-sm text-white/50 font-sans leading-relaxed">
                  {era === 'joseon'
                    ? '"늦은 밤 발걸음이시군요. 무엇이 이 누추한 곳까지 이끌었는지요."'
                    : '"오셨군요. 여기까지 찾아온 이유는 발이 아니라 마음이 알 것입니다."'
                  }
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleEnter}
                  className="w-full py-4 rounded-lg bg-[#C9A84C] text-black font-bold text-sm hover:bg-[#d6b26d] transition-all hover:scale-[1.01] inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  들어서다
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setStage('era')}
                  className="text-xs text-white/30 hover:text-white/60 transition-colors font-sans cursor-pointer"
                >
                  ← 시대 다시 선택
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-transparent" />}>
      <HomeContent />
    </Suspense>
  );
}
