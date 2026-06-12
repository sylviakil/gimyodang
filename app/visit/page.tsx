'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRight, ArrowLeft, Clock, AlertCircle,
  Archive, RefreshCw, LogOut, CheckCircle2, Loader2,
} from 'lucide-react';
import AtmosphereEffect from '@/components/ui/AtmosphereEffect';
import DesireCards from '@/components/visit/DesireCards';
import FlashbackPanel from '@/components/visit/FlashbackPanel';
import RecipePanel from '@/components/visit/RecipePanel';
import PrescriptionCard from '@/components/visit/PrescriptionCard';
import Typewriter from '@/components/ui/Typewriter';
import { EraType, DesireCard, ChatMessage, Prescription, Flashback, PersonaState } from '@/types';
import { supabase } from '@/lib/supabase';
import { generateCardConfig } from '@/lib/cardVisual';

// ─── 페르소나 선택 미니 폼 ─────────────────────────────
import { JOSEON_PERSONAS, MODERN_PERSONAS } from '@/data/personas';

function PersonaForm({ era, onDone }: { era: EraType; onDone: (p: PersonaState) => void }) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'yin' | 'yang'>('yin');
  const [ageGroup, setAgeGroup] = useState<PersonaState['ageGroup']>('adult');
  const [job, setJob] = useState('');
  const cats = era === 'joseon' ? JOSEON_PERSONAS : MODERN_PERSONAS;

  return (
    <div className="max-w-lg mx-auto space-y-5 animate-fade-in">
      <div className="text-center space-y-1">
        <p className="text-[10px] uppercase tracking-[0.4em] text-[#C9A84C] font-sans font-bold">[ 제 3 장 ] 손님 수결</p>
        <p className="text-xs text-white/50 font-sans">연화에게 나아갈 당신의 정체를 각인하십시오.</p>
      </div>

      <div className="space-y-1.5">
        <label className="text-[9px] uppercase tracking-wider text-[#C9A84C] font-sans">이름 / 아명</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름을 적으시오"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#C9A84C] font-serif"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {(['yin', 'yang'] as const).map((g) => (
          <button key={g} onClick={() => setGender(g)}
            className={`py-2 rounded-lg border text-xs font-sans cursor-pointer transition-all ${gender === g ? 'border-[#C9A84C] text-[#C9A84C] bg-[#C9A84C]/10' : 'border-white/10 text-white/50'}`}>
            {g === 'yin' ? '여성 (陰)' : '남성 (陽)'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-2">
        {(['youth', 'adult', 'middle', 'elder'] as const).map((ag) => (
          <button key={ag} onClick={() => setAgeGroup(ag)}
            className={`py-1.5 rounded-lg border text-[9px] font-sans cursor-pointer transition-all ${ageGroup === ag ? 'border-[#C9A84C] text-[#C9A84C] bg-[#C9A84C]/10' : 'border-white/10 text-white/50'}`}>
            {ag === 'youth' ? '10대' : ag === 'adult' ? '20-30대' : ag === 'middle' ? '40-50대' : '60대+'}
          </button>
        ))}
      </div>

      <div className="space-y-1.5">
        <label className="text-[9px] uppercase tracking-wider text-[#C9A84C] font-sans">신분 / 직군 선택</label>
        <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
          {cats.map((cat) => (
            <div key={cat.id}>
              <p className="text-[8px] text-white/20 uppercase font-sans mb-1">{cat.label}</p>
              <div className="grid grid-cols-2 gap-1">
                {cat.items.map((item) => (
                  <button key={item.id} onClick={() => setJob(item.label)}
                    className={`text-left px-2 py-1 rounded border text-[9px] font-sans cursor-pointer transition-all ${job === item.label ? 'border-[#C9A84C] text-[#C9A84C]' : 'border-white/10 text-white/40 hover:border-white/20'}`}>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <input
          value={job}
          onChange={(e) => setJob(e.target.value)}
          placeholder="직접 입력 (자유 수결)"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#C9A84C] font-sans"
        />
      </div>

      <button
        onClick={() => onDone({ name: name || '익명의 손님', gender, ageGroup, job: job || '알 수 없음', category: '' })}
        className="w-full py-3 rounded-lg bg-[#C9A84C] text-black font-bold text-sm hover:bg-[#d6b26d] transition-all cursor-pointer"
      >
        수결하고 욕망 카드 선택 →
      </button>
    </div>
  );
}

// ─── 메인 visit 페이지 ────────────────────────────────
function VisitContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const eraParam = searchParams.get('era') as EraType | null;
  const era: EraType = eraParam === 'modern' ? 'modern' : 'joseon';

  type Step = 'persona' | 'desire' | 'chat';

  const [step, setStep] = useState<Step>('persona');
  const [persona, setPersona] = useState<PersonaState | null>(null);
  const [selectedCard, setSelectedCard] = useState<DesireCard | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [turn, setTurn] = useState<number | 'ending'>(1);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [flashback, setFlashback] = useState<Flashback | null>(null);
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [ending, setEnding] = useState<{ text: string; tone: 'warm' | 'cold' | 'open'; last_image: string } | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'failed'>('idle');
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const themeStyles = era === 'joseon' ? {
    box:          'bg-[#15110a]/50 backdrop-blur-md border-2 border-[#C9A84C]/50',
    header:       'bg-[#291e10]/60 border-b border-[#C9A84C]/30 text-[#F3CE82]',
    accent:       'text-[#C9A84C]',
    indicator:    'bg-[#C9A84C]',
    userBubble:   'bg-[#3b2b1b]/60 text-[#fbf1dc] border border-[#C9A84C]/30',
    yeonhwaBubble:'bg-[#1a140d]/60 border border-[#C9A84C]/20 text-[#fbf1dc]',
    input:        'bg-white/5 border-[#C9A84C]/30 text-[#fbf1dc] focus:border-[#C9A84C] placeholder-[#C9A84C]/30',
    button:       'bg-[#C9A84C] text-black hover:bg-[#d6b26d]',
  } : {
    box:          'bg-white/10 backdrop-blur-md border-2 border-white/40',
    header:       'bg-white/10 border-b border-white/20 text-zinc-100',
    accent:       'text-zinc-300',
    indicator:    'bg-zinc-300',
    userBubble:   'bg-white/15 text-zinc-100 border border-white/20',
    yeonhwaBubble:'bg-white/5 border border-white/10 text-zinc-300',
    input:        'bg-white/5 border-white/20 text-zinc-100 focus:border-zinc-300 placeholder-white/30',
    button:       'bg-white text-black hover:bg-zinc-200',
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, loading]);

  useEffect(() => {
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) setUser({ id: session.user.id, email: session.user.email ?? '' });
      });
    }
  }, []);

  // 욕망 카드 선택 → 턴 1 시작
  const startRitual = async (card: DesireCard) => {
    setSelectedCard(card);
    setStep('chat');
    setLoading(true);
    setApiError(null);

    try {
      const res = await fetch('/api/yeonhwa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          era, turn: 'turn1',
          messages: [],
          desireCard: card,
          persona,
        }),
      });
      const data = await res.json();
      if (data.error) { setApiError(data.error); return; }

      setChatHistory([{
        id: 'y-1', role: 'yeonhwa',
        text: data.yeonhwa_speech ?? '연화가 조용히 당신을 바라봅니다.',
        timestamp: now(),
      }]);
      setTurn(2);
    } catch {
      setApiError('연화와의 연결이 끊겼습니다. 잠시 후 다시 시도해 주십시오.');
    } finally {
      setLoading(false);
    }
  };

  // 메시지 전송 (턴 2-5)
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || typeof turn !== 'number') return;

    const userText = input;
    setInput('');
    setLoading(true);
    setApiError(null);

    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', text: userText, timestamp: now() };
    const newHistory = [...chatHistory, userMsg];
    setChatHistory(newHistory);

    try {
      const apiHistory = newHistory.map((m) => ({ role: m.role === 'user' ? 'user' : 'model', text: m.text }));
      const res = await fetch('/api/yeonhwa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ era, turn: `turn${turn}`, messages: apiHistory, persona }),
      });
      const data = await res.json();
      if (data.error) { setApiError(data.error); return; }

      if (turn === 2) {
        if (data.flashback) setFlashback(data.flashback);
        setChatHistory((prev) => [...prev, {
          id: `y-${Date.now()}`, role: 'yeonhwa',
          text: data.yeonhwa_question ?? '...', flashback: data.flashback, timestamp: now(),
        }]);
        setTurn(3);
      } else if (turn === 3) {
        const prep: ChatMessage = {
          id: `y-${Date.now()}`, role: 'yeonhwa', text: data.yeonhwa_speech ?? '...', timestamp: now(),
        };
        setChatHistory((prev) => [...prev, prep]);
        setTurn(4);
        // 턴 4 자동 발동 (처방 카드 생성)
        setTimeout(() => autoFireTurn4([...newHistory.map((m) => ({ role: m.role === 'user' ? 'user' : 'model', text: m.text })), { role: 'model', text: prep.text }]), 800);
        return;
      } else if (turn === 4) {
        if (data.prescription) setPrescription(data.prescription);
        setChatHistory((prev) => [...prev, {
          id: `y-${Date.now()}`, role: 'yeonhwa',
          text: data.yeonhwa_speech ?? '...', prescription: data.prescription, timestamp: now(),
        }]);
        // turn4 후에는 [받아들이다/더알고싶다/거절] 버튼 노출 (턴 변경 없음)
      }
    } catch {
      setApiError('사념 조청물이 과열되었습니다. 다시 시도해 주십시오.');
    } finally {
      setLoading(false);
    }
  };

  // 턴 4 자동 발동
  const autoFireTurn4 = async (apiHistory: { role: string; text: string }[]) => {
    setLoading(true);
    setApiError(null);
    try {
      const res = await fetch('/api/yeonhwa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ era, turn: 'turn4', messages: apiHistory, persona }),
      });
      const data = await res.json();
      if (data.error) { setApiError(data.error); return; }
      if (data.prescription) setPrescription(data.prescription);
      setChatHistory((prev) => [...prev, {
        id: `y-${Date.now()}`, role: 'yeonhwa',
        text: data.yeonhwa_speech ?? '처방을 받으십시오.',
        prescription: data.prescription, timestamp: now(),
      }]);
    } catch {
      setApiError('처방 생성 중 연결이 끊겼습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 심화 설명 (턴 5)
  const requestMore = async () => {
    if (!prescription) return;
    setLoading(true);
    setApiError(null);
    try {
      const apiHistory = chatHistory.map((m) => ({ role: m.role === 'user' ? 'user' : 'model', text: m.text }));
      const res = await fetch('/api/yeonhwa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          era, turn: 'turn5',
          messages: [...apiHistory, { role: 'user', text: '조금 더 설명해 주십시오.' }],
          persona,
        }),
      });
      const data = await res.json();
      if (data.error) { setApiError(data.error); return; }
      setChatHistory((prev) => [...prev, {
        id: `y-${Date.now()}`, role: 'yeonhwa', text: data.yeonhwa_speech ?? '...', timestamp: now(),
      }]);
      setTurn(5); // 턴 5 완료 — 이제 수락/거절만 가능
    } catch {
      setApiError('심화 설명 도중 연결이 끊겼습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 처방 수락 → 결말
  const acceptPrescription = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const apiHistory = chatHistory.map((m) => ({ role: m.role === 'user' ? 'user' : 'model', text: m.text }));
      const res = await fetch('/api/yeonhwa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          era, turn: 'ending',
          messages: [...apiHistory, { role: 'user', text: '처방을 전적으로 믿고 단과자를 한 입 베어 먹습니다.' }],
          persona,
        }),
      });
      const data = await res.json();
      if (data.error) { setApiError(data.error); return; }
      if (data.ending) {
        setEnding(data.ending);
        setTurn('ending');
        setChatHistory((prev) => [...prev, {
          id: `y-ending-${Date.now()}`, role: 'yeonhwa', text: data.ending.text, timestamp: now(),
        }]);
      }
    } catch {
      setApiError('결말 조인을 처리하는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 처방 거절
  const declinePrescription = () => {
    setEnding({
      text: '당신은 처방 봉지를 내려놓고 기묘당의 문고리를 비틀어 현실로 돌아왔습니다. 등 뒤로 육중하게 닫히는 소리와 함께 조청 냄새가 소멸합니다. 하지만 지우려 했던 집착은 여전히 당신 사념 속에 단단하게 고착되어 있습니다.',
      tone: 'open',
      last_image: '서늘한 골목 위 가로등이 명멸하는 장면.',
    });
    setTurn('ending');
  };

  // 이야기 저장
  const saveStory = async () => {
    if (!prescription || !ending || !selectedCard || !persona) return;
    setSaveStatus('saving');
    try {
      const cfg = generateCardConfig(prescription.desire_code, era, ending.tone);
      const res = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author_id: user?.id ?? null,
          guest_name: persona.name,
          guest_status: persona.job,
          era,
          desire_type: prescription.desire_code,
          desire_content: selectedCard.label,
          confection_original: prescription.original,
          confection_name: prescription.name,
          confection_ingredients: prescription.ingredients,
          confection_effect: prescription.effect,
          confection_price: prescription.price,
          ending_content: ending.text,
          ending_tone: ending.tone,
          card_visual_config: cfg,
        }),
      });
      const data = await res.json();
      setSaveStatus(data.error ? 'failed' : 'saved');
    } catch {
      setSaveStatus('failed');
    }
  };

  const resetAll = () => {
    setStep('persona'); setPersona(null); setSelectedCard(null);
    setChatHistory([]); setTurn(1); setInput(''); setLoading(false);
    setApiError(null); setFlashback(null); setPrescription(null);
    setEnding(null); setSaveStatus('idle');
  };

  // ── 렌더 ───────────────────────────────────────────────
  return (
    <div className="relative min-h-screen bg-[#0D0B08] text-[#E5E5E5] font-serif flex flex-col overflow-hidden">
      <AtmosphereEffect />

      {/* 네비 */}
      <nav className="fixed top-0 left-0 right-0 z-30 flex justify-between items-center px-6 md:px-12 h-16 bg-[#0D0B08]/80 backdrop-blur-sm border-b border-white/5">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-all">
          <div className="w-7 h-7 bg-[#C9A84C] rotate-45 flex items-center justify-center">
            <div className="w-3.5 h-3.5 bg-black rotate-[-45deg] flex items-center justify-center font-serif text-[8px] text-[#C9A84C] font-bold">奇</div>
          </div>
          <span className="text-base font-serif italic tracking-tight text-white">Gimyodang <span className="text-xs text-[#C9A84C] font-light not-italic">奇妙堂</span></span>
        </Link>
        <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.2em] font-sans">
          <Link href="/gallery" className="text-white/40 hover:text-[#C9A84C] transition-colors flex items-center gap-1">
            <Archive className="w-3.5 h-3.5" /><span>갤러리</span>
          </Link>
          {step !== 'persona' && (
            <button onClick={resetAll} className="text-white/30 hover:text-white/60 transition-colors flex items-center gap-1 cursor-pointer">
              <RefreshCw className="w-3.5 h-3.5" /><span>다시 시작</span>
            </button>
          )}
        </div>
      </nav>

      <main className="relative z-10 flex-1 pt-16 px-4 md:px-8 pb-6">

        {/* 페르소나 */}
        {step === 'persona' && (
          <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-8">
            <PersonaForm era={era} onDone={(p) => { setPersona(p); setStep('desire'); }} />
          </div>
        )}

        {/* 욕망 카드 */}
        {step === 'desire' && (
          <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-8">
            <div className="w-full max-w-4xl">
              <DesireCards selected={selectedCard} onSelect={startRitual} />
              <div className="text-center mt-6">
                <button onClick={() => setStep('persona')} className="text-xs text-white/30 hover:text-white/60 transition-colors font-sans flex items-center gap-1 mx-auto cursor-pointer">
                  <ArrowLeft className="w-3 h-3" /> 손님 설정으로
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 대화 */}
        {step === 'chat' && selectedCard && (
          <div className="max-w-5xl mx-auto pt-4 flex flex-col md:grid md:grid-cols-12 gap-5 md:max-h-[calc(100vh-100px)] md:overflow-hidden">

            {/* 좌측: 채팅 */}
            <section className={`col-span-12 md:col-span-7 flex flex-col h-[560px] rounded-xl overflow-hidden ${themeStyles.box} transition-all duration-500`}>
              <div className={`px-4 py-3 flex justify-between items-center ${themeStyles.header}`}>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${themeStyles.indicator} animate-pulse`} />
                  <span className="text-[10px] uppercase tracking-widest font-sans font-bold">
                    {era === 'joseon' ? '조선 한양 조제방' : '강남 도시 조제방'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-white/40 font-mono">
                  <Clock className="w-3 h-3" />
                  <span>턴 {turn === 'ending' ? '완결' : `${turn}/5`}</span>
                </div>
              </div>

              {/* 메시지 목록 */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
                {chatHistory.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-xl px-4 py-3 ${msg.role === 'user' ? themeStyles.userBubble : themeStyles.yeonhwaBubble}`}>
                      {msg.role === 'yeonhwa' && (
                        <div className="text-[8px] font-bold text-[#C9A84C] uppercase tracking-widest mb-1 font-sans">연화 蓮花</div>
                      )}
                      <Typewriter text={msg.text} speed={30} className="leading-relaxed font-serif" />
                      {msg.flashback && (
                        <div className="mt-3 border border-[#C9A84C]/30 bg-white/5 p-3 rounded-lg">
                          <p className="text-[9px] text-[#C9A84C] uppercase tracking-widest font-sans mb-1">회상</p>
                          <p className="italic text-[11px] text-white/70 leading-relaxed">"{msg.flashback.text}"</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {msg.flashback.tags.map((t) => (
                              <span key={t} className="text-[8px] bg-white/5 border border-white/10 text-white/50 px-1.5 py-0.5 rounded">#{t}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {msg.prescription && (
                        <div className="mt-3">
                          <PrescriptionCard
                            prescription={msg.prescription}
                            onAccept={acceptPrescription}
                            onDecline={declinePrescription}
                            onMore={turn !== 'ending' ? requestMore : undefined}
                            loading={loading}
                          />
                        </div>
                      )}
                      <div className="text-[8px] text-white/20 text-right mt-1 font-mono">{msg.timestamp}</div>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white/5 border border-white/5 rounded-xl px-4 py-3 flex items-center gap-2 text-white/50">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C9A84C]" />
                      <span className="font-serif italic text-xs">연화가 조청 그릇을 뒤적입니다...</span>
                    </div>
                  </div>
                )}

                {apiError && (
                  <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-200 text-xs rounded-xl flex items-start gap-2 font-sans">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>{apiError}</p>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* 입력 영역 */}
              <div className="border-t border-white/5 p-3 bg-white/[0.02]">
                {turn === 'ending' ? (
                  <div className="text-center space-y-2">
                    <p className="text-xs italic text-white/30 font-serif">사념 조제가 종료되었습니다.</p>
                    <button onClick={resetAll} className="px-6 py-2 rounded-lg bg-[#C9A84C] text-black font-bold text-xs hover:bg-[#d6b26d] transition-all cursor-pointer">
                      새로운 조제 시작
                    </button>
                  </div>
                ) : (prescription || turn === 4) ? (
                  <p className="text-center text-[10px] text-white/30 italic font-serif py-2">위 처방 카드에서 선택하십시오.</p>
                ) : turn === 3 ? (
                  <p className="text-center text-[10px] text-white/30 italic font-serif py-2">연화가 처방을 준비하고 있습니다...</p>
                ) : (
                  <form onSubmit={sendMessage} className="flex gap-2">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      disabled={loading}
                      placeholder={turn === 2 ? '그대 마음에 걸린 집착을 고백해 보시오...' : '연화의 물음에 답하시오...'}
                      className={`flex-1 border rounded-lg px-3 py-2 text-xs focus:outline-none transition-all ${themeStyles.input}`}
                    />
                    <button type="submit" disabled={loading || !input.trim()}
                      className={`p-2 rounded-lg disabled:opacity-40 transition-all cursor-pointer ${themeStyles.button}`}>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            </section>

            {/* 우측: 회상 / 레시피 / 결말 */}
            <section className="col-span-12 md:col-span-5 h-[400px] md:h-[560px] overflow-y-auto">
              {ending ? (
                <div className="bg-red-950/25 border-2 border-red-500/30 rounded-xl p-5 h-full flex flex-col animate-fade-in relative">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />
                  <p className="text-[9px] uppercase tracking-[0.4em] text-red-400 font-sans font-bold mb-2">대속 결과</p>
                  <blockquote className="font-serif italic text-sm text-white/90 leading-relaxed flex-1">
                    "{ending.text}"
                  </blockquote>
                  <p className="text-[10px] text-white/40 font-sans mt-3 border-t border-white/5 pt-3">
                    {ending.last_image}
                  </p>

                  {/* 저장 버튼 */}
                  {prescription && saveStatus !== 'saved' && (
                    <button
                      onClick={saveStory}
                      disabled={saveStatus === 'saving'}
                      className="mt-3 w-full py-2 rounded-lg bg-[#C9A84C]/20 border border-[#C9A84C]/40 text-[#C9A84C] text-xs font-sans hover:bg-[#C9A84C]/30 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {saveStatus === 'saving' ? <><Loader2 className="w-3 h-3 animate-spin" />저장 중...</> : '이야기를 궤짝에 봉인'}
                    </button>
                  )}
                  {saveStatus === 'saved' && (
                    <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-[#C9A84C] font-sans">
                      <CheckCircle2 className="w-4 h-4" /> 궤짝 갤러리에 봉인 완료
                    </div>
                  )}
                </div>
              ) : flashback && !prescription ? (
                <FlashbackPanel flashback={flashback} />
              ) : prescription ? (
                <div className="h-full flex flex-col gap-4">
                  {flashback && <FlashbackPanel flashback={flashback} />}
                </div>
              ) : typeof turn === 'number' && turn >= 3 ? (
                <RecipePanel desireCode={selectedCard?.code ?? '①'} />
              ) : (
                <div className="h-full flex items-center justify-center text-center p-6 text-white/20 border border-white/5 rounded-xl">
                  <div>
                    <p className="font-serif text-sm">연화가 당신의 말을 기다리고 있습니다.</p>
                    <p className="text-[10px] font-sans mt-2 uppercase tracking-wider">회상과 처방이 여기 나타납니다.</p>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default function VisitPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0D0B08] flex items-center justify-center text-[#C9A84C] font-serif">기묘당을 여는 중...</div>}>
      <VisitContent />
    </Suspense>
  );
}

function now() {
  return new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}
