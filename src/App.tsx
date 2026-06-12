/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Flame, 
  Heart, 
  Sword, 
  Eye, 
  Undo2, 
  Wind, 
  ArrowRight, 
  ArrowLeft,
  RefreshCw, 
  Clock, 
  AlertCircle, 
  Lock, 
  Unlock, 
  Archive, 
  LogOut,  
  Sparkle, 
  Filter, 
  CheckCircle2, 
  Volume2, 
  ThumbsUp, 
  X,
  Play,
  HeartHandshake,
  Cookie,
  FileText,
  Image
} from 'lucide-react';
import { EraType, DesireCard, Prescription, Flashback, ChatMessage } from './types';
import AtmosphereEffect from './components/AtmosphereEffect';
import { supabase, simulatedSupabase, isSupabaseConfigured } from './lib/supabase';
import { DESIRE_CARDS } from './data/desires';

// Import Visitor Personas types & components
import { PersonaState } from './data/personas';
import VisitorPersonaSelector from './components/VisitorPersonaSelector';

// Import extracted scene assets
import PrologueVideo from './components/PrologueVideo';
import EraDoors from './components/EraDoors';

export default function App() {
  // Navigation: 'prescribe' (active wizard steps) or 'cabinet' (public gallery)
  const [activeTab, setActiveTab] = useState<'prescribe' | 'cabinet'>('cabinet');

  // Visitor persona details state
  const [persona, setPersona] = useState<PersonaState>({
    category: '',
    job: '',
    gender: 'yin',
    ageGroup: 'adult',
    name: ''
  });

  // Interactive 5 scenes walkthrough inside "운명 조제방"
  const [sceneStep, setSceneStep] = useState<number>(1);

  // Gallery Guest alert trigger
  const [showGalleryAlert, setShowGalleryAlert] = useState(false);
  const [galleryActiveHeartAlert, setGalleryActiveHeartAlert] = useState<string | null>(null);

  // Simulated Likes mappings
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [simulatedLikesCounts, setSimulatedLikesCounts] = useState<Record<string, number>>({});

  // Supabase auth states
  const [user, setUser] = useState<{ email: string; id: string } | null>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);

  // Chat/Ritual state
  const [era, setEra] = useState<EraType | null>(null);
  const [selectedDesire, setSelectedDesire] = useState<DesireCard | null>(null);
  const [currentTurn, setCurrentTurn] = useState<number | 'ending'>(1);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Specific response structures received from server state
  const [latestFlashback, setLatestFlashback] = useState<Flashback | null>(null);
  const [latestPrescription, setLatestPrescription] = useState<Prescription | null>(null);
  const [latestEnding, setLatestEnding] = useState<{
    text: string;
    tone: 'warm' | 'cold' | 'open';
    last_image: string;
  } | null>(null);

  // Gallery Cabinet State
  const [cabinetPrescriptions, setCabinetPrescriptions] = useState<any[]>([]);
  const [cabinetLoading, setCabinetLoading] = useState(false);
  const [filterEra, setFilterEra] = useState<string>('all');
  const [filterDesire, setFilterDesire] = useState<string>('all');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'failed'>('idle');

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Check current session on mount (Simulated or Real Supabase)
  useEffect(() => {
    const initAuth = async () => {
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser({ email: session.user.email || '', id: session.user.id });
        }
      } else {
        const simUser = simulatedSupabase.getCurrentUser();
        if (simUser) {
          setUser(simUser);
        }
      }
    };
    initAuth();
  }, []);

  // Fetch prescriptions whenever tab switches to Cabinet
  useEffect(() => {
    if (activeTab === 'cabinet') {
      fetchCabinetData();
      // If user is not logged in, trigger gallery guide alert modal / popup
      if (!user) {
        setShowGalleryAlert(true);
      }
    } else {
      setShowGalleryAlert(false);
    }
  }, [activeTab, user]);

  // Auto-scroll chat history when messages or loaders alter
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, loading]);

  // Fetch Cabinet records (either Supabase or Simulated storage fallback)
  const fetchCabinetData = async () => {
    setCabinetLoading(true);
    try {
      let dataList: any[] = [];
      if (supabase) {
        const { data, error } = await supabase
          .from('gimyodang_prescriptions')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        dataList = data || [];
      } else {
        const { data } = await simulatedSupabase.getPrescriptions();
        dataList = data || [];
      }
      setCabinetPrescriptions(dataList);

      // Setup initial random mock likes count for items
      const newMockLikes: Record<string, number> = {};
      dataList.forEach(item => {
        if (!simulatedLikesCounts[item.id]) {
          newMockLikes[item.id] = Math.floor(Math.sin(item.id.charCodeAt(0) || 12) * 20) + 32;
        }
      });
      setSimulatedLikesCounts(prev => ({ ...newMockLikes, ...prev }));
    } catch (err: any) {
      console.warn('Failed to connect to Supabase database, falling back to simulated storage:', err);
      const { data } = await simulatedSupabase.getPrescriptions();
      setCabinetPrescriptions(data || []);
    } finally {
      setCabinetLoading(false);
    }
  };

  // Inline simulation / supabase session helper
  const handleAuth = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!authEmail || !authPassword) {
      setAuthError('식별 부호와 암호를 기입해 주십시오.');
      return;
    }
    setLoading(true);
    setAuthError(null);
    setAuthSuccessMsg(null);

    try {
      if (supabase) {
        if (authMode === 'signin') {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: authEmail,
            password: authPassword,
          });
          if (error) throw error;
          if (data.user) {
            setUser({ email: data.user.email || '', id: data.user.id });
            setAuthSuccessMsg('결계가 무사히 퇴치되었습니다. 조제를 계속하십시오!');
          }
        } else {
          const { data, error } = await supabase.auth.signUp({
            email: authEmail,
            password: authPassword,
          });
          if (error) throw error;
          if (data.user) {
            setUser({ email: data.user.email || '', id: data.user.id });
            setAuthSuccessMsg('새로운 마음 계약이 수결되었습니다. 환영합니다!');
          }
        }
      } else {
        // Local simulation fallback
        if (authMode === 'signin') {
          const loggedUser = await simulatedSupabase.signIn(authEmail, authPassword);
          setUser(loggedUser);
          setAuthSuccessMsg('결계가 성공적으로 해제되었습니다.');
        } else {
          const newUser = await simulatedSupabase.signUp(authEmail, authPassword);
          setUser(newUser);
          setAuthSuccessMsg('참신한 마음의 각인이 체결되었습니다.');
        }
      }
    } catch (err: any) {
      setAuthError(err.message || '인증 결합에 장애가 생겼습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const handleSignOut = async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut();
      } else {
        await simulatedSupabase.signOut();
      }
    } catch (err) {
      console.error(err);
    }
    setUser(null);
    setEra(null);
    setSelectedDesire(null);
    setPersona({
      category: '',
      job: '',
      gender: 'yin',
      ageGroup: 'adult',
      name: ''
    });
    setChatHistory([]);
    setLatestFlashback(null);
    setLatestPrescription(null);
    setLatestEnding(null);
    setCurrentTurn(1);
    setSaveStatus('idle');
    setSceneStep(1); // Return to prologue
  };

  // Save prescription
  const handleSavePrescription = async () => {
    if (!latestPrescription) return;
    setSaveStatus('saving');
    
    const recordPayload = {
      original: latestPrescription.original,
      name: latestPrescription.name,
      visual: latestPrescription.visual,
      ingredients: latestPrescription.ingredients,
      effect: latestPrescription.effect,
      price: latestPrescription.price,
      desire_code: latestPrescription.desire_code,
      price_code: latestPrescription.price_code,
      scale: latestPrescription.scale,
      era_profile: era || 'unspecified',
      user_email: user?.email || 'someone@gimyodang.com'
    };

    try {
      if (supabase) {
        const { error } = await supabase
          .from('gimyodang_prescriptions')
          .insert([recordPayload]);
        
        if (error) {
          console.warn('Fallback to local simulation');
          await simulatedSupabase.savePrescription(latestPrescription);
        }
      } else {
        await simulatedSupabase.savePrescription(latestPrescription);
      }
      setSaveStatus('saved');
      fetchCabinetData();
    } catch (err) {
      console.error(err);
      await simulatedSupabase.savePrescription(latestPrescription);
      setSaveStatus('saved');
    }
  };

  // Initial greeting triggers on desire card selection
  const startRitual = async (selectedEra: EraType, card: DesireCard) => {
    setEra(selectedEra);
    setSelectedDesire(card);
    setLoading(true);
    setApiError(null);
    setLatestFlashback(null);
    setLatestPrescription(null);
    setLatestEnding(null);
    setSaveStatus('idle');
    setCurrentTurn(1);

    // Set interactive step index directly to Step 5 (Chat Terminal)
    setSceneStep(5);

    try {
      const response = await fetch('/api/gimyodang/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          era: selectedEra,
          turn: 1,
          history: [],
          desireCard: card,
          userMessage: `[신도 아명: ${persona.name || '방랑인'}] 자리에 가만 앉아 조제방 사념 연기를 두 눈에 가늠합니다.`,
          persona
        })
      });

      const data = await response.json();
      
      if (data.error) {
        setApiError(data.error);
        setLoading(false);
        return;
      }

      const greetingSpeech = data.yeonhwa_speech || '낮고 그윽한 눈빛이 당신을 맞이합니다.';

      setChatHistory([
        {
          id: 'g-1',
          role: 'yeonhwa',
          text: greetingSpeech,
          timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      
      setCurrentTurn(2); // Waiting for guest turn reply response
    } catch (err: any) {
      setApiError('기묘당과의 사동 연계가 원활하지 않습니다. API 키 구성을 확인해 보십시오.');
    } finally {
      setLoading(false);
    }
  };

  // Submit reply message to Yeonhwa
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading || !era || !selectedDesire) return;

    // Check if user is logged in. Submitting a message requires login!
    if (!user) {
      setApiError('대화를 이어가시려면 먼저 우측 혹은 하단 양식에서 결계를 해제(로그인)해 주셔야 합니다.');
      return;
    }

    const userText = inputText;
    setInputText('');
    setLoading(true);
    setApiError(null);

    const userMessageObj: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...chatHistory, userMessageObj];
    setChatHistory(newHistory);

    try {
      const apiHistory = newHistory.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        text: m.text
      }));

      const response = await fetch('/api/gimyodang/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          era,
          turn: currentTurn,
          history: apiHistory.slice(0, -1),
          userMessage: userText,
          persona
        })
      });

      const data = await response.json();

      if (data.error) {
        setApiError(data.error);
        return;
      }

      if (currentTurn === 2) {
        if (data.flashback) {
          setLatestFlashback(data.flashback);
        }
        
        const speech = data.yeonhwa_question || '그 마음 조각을 가만 살펴보니 언제 시작된 것인가요...';
        
        setChatHistory(prev => [...prev, {
          id: `g-${Date.now()}`,
          role: 'yeonhwa',
          text: speech,
          flashback: data.flashback,
          timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
        }]);

        setCurrentTurn(3);
      } 
      else if (currentTurn === 3) {
        const speech = data.yeonhwa_speech || '연화가 말없이 조청을 저으며 부엌 가마를 부채질합니다...';
        
        setChatHistory(prev => [...prev, {
          id: `g-${Date.now()}`,
          role: 'yeonhwa',
          text: speech,
          timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
        }]);

        setCurrentTurn(4);
      } 
      else if (currentTurn === 4) {
        if (data.prescription) {
          setLatestPrescription(data.prescription);
        }
        
        const speech = data.yeonhwa_speech || '기어코 빚어진 과자 처방 사본을 눈앞에 내어놓습니다.';
        
        setChatHistory(prev => [...prev, {
          id: `g-${Date.now()}`,
          role: 'yeonhwa',
          text: speech,
          prescription: data.prescription,
          timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
        }]);
      }

    } catch (err: any) {
      setApiError('사념 조청물이 과열되어 기전이 흩어졌습니다. 다시 단어를 적어 보십시오.');
    } finally {
      setLoading(false);
    }
  };

  // Accept prescription
  const handleAcceptPrescription = async () => {
    if (!era || !selectedDesire || !latestPrescription) return;
    setLoading(true);
    setApiError(null);

    try {
      const apiHistory = chatHistory.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        text: m.text
      }));

      const response = await fetch('/api/gimyodang/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          era,
          turn: 'ending',
          history: apiHistory,
          userMessage: '처방을 전적으로 믿고 단과자를 한 입 조심스럽게 베어 먹습니다.',
          persona
        })
      });

      const data = await response.json();

      if (data.error) {
        setApiError(data.error);
        return;
      }

      if (data.ending) {
        setLatestEnding(data.ending);
        setCurrentTurn('ending');
        setSceneStep(5); // Keep on Step 5 to read the dramatic retribution first on the right
        
        setChatHistory(prev => [...prev, {
          id: `g-ending-${Date.now()}`,
          role: 'yeonhwa',
          text: data.ending.text,
          timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
        }]);
      }

    } catch (err: any) {
      setApiError('대속의 조인을 처리하는 데 혼선이 빚어졌습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Decline prescription
  const handleDeclinePrescription = () => {
    setLatestEnding({
      text: '당신은 처방 봉지를 내려놓고 기묘당의 문고리를 비틀어 마침내 현실로 돌아왔습니다. 등 뒤에서 육중하게 닫히는 서늘한 소리와 함께 공기마저 아릿하게 흩뿌려진 조청 냄새가 소멸합니다. 하지만 지우려 했던 거뭇한 집착은 여전히 당신 사념 속에 단단하게 고착되어 있습니다.',
      tone: 'open',
      last_image: '서늘한 현대 서울의 아스팔트 바닥 위, 차갑게 명멸하는 가로등 불빛이 부유하는 장면.'
    });
    setCurrentTurn('ending');
    setSceneStep(5); // Keep on Step 5 to read the dramatic retribution first on the right
  };

  // Like click logic in Cabinet
  const handleToggleLike = (id: string) => {
    if (!user) {
      // Prompt modal specifically explaining Guest limitations!
      setGalleryActiveHeartAlert(id);
      return;
    }

    const alreadyLiked = likedIds.includes(id);
    if (alreadyLiked) {
      setLikedIds(prev => prev.filter(x => x !== id));
      setSimulatedLikesCounts(prev => ({
        ...prev,
        [id]: Math.max(0, (prev[id] || 0) - 1)
      }));
    } else {
      setLikedIds(prev => [...prev, id]);
      setSimulatedLikesCounts(prev => ({
        ...prev,
        [id]: (prev[id] || 0) + 1
      }));
    }
  };

  const getDesireIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles': return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'Flame': return <Flame className="w-4 h-4 text-amber-500" />;
      case 'Heart': return <Heart className="w-4 h-4 text-red-400" />;
      case 'Sword': return <Sword className="w-4 h-4 text-rose-500" />;
      case 'Eye': return <Eye className="w-4 h-4 text-purple-400" />;
      case 'Undo2': return <Undo2 className="w-4 h-4 text-amber-500" />;
      case 'Wind': return <Wind className="w-4 h-4 text-[#8b5cf6]" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  // Filter local recipes
  const filteredCabinet = cabinetPrescriptions.filter(item => {
    const pres = item.prescription || item;
    const matchEra = filterEra === 'all' || item.era_profile === filterEra;
    const matchDesire = filterDesire === 'all' || pres.desire_code === filterDesire;
    return matchEra && matchDesire;
  });

  // Calculate customized theme aesthetics for Scene 4 Conversation Column
  const getEraThemeStyles = () => {
    if (era === 'joseon') {
      return {
        box: 'bg-[#15110a]/40 backdrop-blur-md border-2 border-[#C5A059]/50 shadow-[0_0_25px_rgba(197,160,89,0.25)]',
        header: 'bg-[#291e10]/60 border-b border-[#C5A059]/30 text-[#F3CE82] font-serif',
        pill: 'bg-[#C5A059]/10 border border-[#C5A059]/30 text-[#C5A059]',
        indicator: 'bg-[#C5A059]',
        bg: 'bg-transparent',
        userBubble: 'bg-[#3b2b1b]/60 backdrop-blur-sm text-[#fbf1dc] border-[#C5A059]/40 shadow-[0_4px_12px_rgba(197,160,89,0.1)]',
        yeonhwaBubble: 'bg-[#1a140d]/60 backdrop-blur-sm border border-[#C5A059]/20 text-[#fbf1dc]',
        input: 'bg-white/5 border-[#C5A059]/30 text-[#fbf1dc] focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]/30 placeholder-[#C5A059]/30',
        accent: 'text-[#C5A059]',
        button: 'bg-[#C5A059] text-black hover:bg-[#d6b26d]'
      };
    } else {
      return {
        box: 'bg-white/10 backdrop-blur-md border-2 border-white/60 shadow-[0_0_25px_rgba(255,255,255,0.12)]',
        header: 'bg-white/10 border-b border-white/20 text-zinc-100 font-sans uppercase font-bold',
        pill: 'bg-white/15 border border-white/25 text-zinc-300',
        indicator: 'bg-zinc-300',
        bg: 'bg-transparent',
        userBubble: 'bg-white/15 backdrop-blur-sm text-zinc-100 border-white/20 shadow-md',
        yeonhwaBubble: 'bg-white/5 backdrop-blur-sm border border-white/10 text-zinc-300',
        input: 'bg-white/5 border-white/20 text-zinc-100 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-400 placeholder-[#a1a1aa]',
        accent: 'text-zinc-300',
        button: 'bg-white text-black hover:bg-zinc-200'
      };
    }
  };

  const themeStyles = getEraThemeStyles();

  return (
    <div className="relative min-h-screen bg-gradient-to-tr from-[#310c4d] via-[#103b45] to-[#122c42] text-[#E5E5E5] font-sans flex flex-col md:overflow-hidden select-none">
      <AtmosphereEffect />

      {/* Modern High-End Top Navigation Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-30 flex justify-between items-center px-6 md:px-16 h-20 bg-transparent border-none">
        <button 
          onClick={() => {
            setActiveTab('prescribe');
            setSceneStep(1);
          }}
          className="flex items-center gap-4 hover:opacity-85 transition-all text-left focus:outline-none cursor-pointer group"
          title="기묘당 메인 애니메이션 (Scene 1) 전환"
        >
          <div className="w-8 h-8 bg-[#C5A059] rotate-45 flex items-center justify-center shadow-[0_0_15px_rgba(197,160,89,0.2)] group-hover:scale-105 transition-transform">
            <div className="w-4 h-4 bg-black rotate-[-45deg] flex items-center justify-center font-serif text-[9px] text-[#C5A059] font-bold">奇</div>
          </div>
          <div className="text-xl font-serif italic tracking-tighter text-white uppercase flex items-center gap-2">
            <span>Gimyodang</span>
            <span className="text-xs bg-[#4B2138] px-2 py-0.5 rounded text-[#FADCD5] border border-[#6D3C52]/30 font-serif font-light">奇妙堂</span>
          </div>
        </button>

        {/* Tab Selection Navigation - Hidden on Step 1 Landing page */}
        {!(activeTab === 'prescribe' && sceneStep === 1) && (
          <div className="flex gap-4 md:gap-10 text-[11px] uppercase tracking-[0.25em] font-medium text-white/40">
            <button 
              onClick={() => setActiveTab('cabinet')}
              className={`flex items-center gap-1.5 transition-colors focus:outline-none ${activeTab === 'cabinet' ? 'text-[#C5A059]' : 'hover:text-white'}`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>궤짝 갤러리</span>
            </button>
          </div>
        )}

        {/* User Identity / Authentication State Icon */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden lg:inline text-[9px] text-[#C5A059] tracking-wider font-mono bg-[#C5A059]/5 px-2.5 py-1 rounded border border-[#C5A059]/20">
                {user.email} (입장됨)
              </span>
              <button 
                onClick={handleSignOut}
                className="w-8 h-8 border border-white/10 rounded-full flex items-center justify-center cursor-pointer hover:border-red-500/40 hover:bg-red-950/20 transition-all text-white/60 hover:text-red-400 focus:outline-none"
                title="결계 퇴장 (Sign Out)"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => {
                setActiveTab('prescribe');
                // Target Step 5 directly which shows auth gate beautifully
                setSceneStep(5);
              }}
              className="px-3.5 py-1.5 border border-red-500/30 text-red-300 rounded-full flex items-center gap-2 text-[10px] uppercase font-bold tracking-wider hover:border-red-500 bg-red-950/10 transition-all animate-pulse focus:outline-none"
            >
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
              <span>미입장 (로그인 필요)</span>
            </button>
          )}
        </div>
      </nav>

      {/* Main Container Area */}
      <main className="relative z-10 flex-1 flex flex-col w-full px-4 md:px-16 pt-24 pb-6 overflow-hidden max-h-screen">
        
        {/* TAB 1: CABINET PUBLIC GALLERY VIEW */}
        {activeTab === 'cabinet' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Guest Welcome Header alert message popped automatically */}
            {showGalleryAlert && (
              <div className="mb-4 bg-amber-950/30 border border-amber-500/20 rounded-lg p-3 px-4 flex justify-between items-center text-xs text-amber-200 font-sans tracking-wide">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  <p>
                    <strong>💡 공감 안내:</strong> 비로그인 상태이셔도 방명록(처방) 감상은 가능합니다. 마음에 스미는 처방에 <strong>좋아요(하트)</strong>를 나누시려면 로그인 후 참여해 주십시오.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      setActiveTab('prescribe');
                      setSceneStep(5);
                    }}
                    className="px-2.5 py-1 bg-amber-500 text-black text-[10px] font-bold rounded hover:bg-amber-400 transition-colors cursor-pointer"
                  >
                    로그인 통로 이동
                  </button>
                  <button onClick={() => setShowGalleryAlert(false)} className="text-white/40 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6 border-b border-white/5 pb-4">
              <div>
                <div className="text-[#C5A059] text-[10px] uppercase tracking-[0.5em] mb-2 flex items-center gap-4 font-sans font-bold">
                  <span className="h-[1px] w-8 bg-[#C5A059]"></span> Archive Ledger
                </div>
                <h1 className="text-3xl md:text-5xl font-serif text-white tracking-tight">
                  기묘당 처방 <span className="italic text-[#C5A059]">궤짝 갤러리</span>
                </h1>
                <p className="text-xs text-white/50 max-w-xl font-light leading-relaxed font-serif mt-1">
                  이전 집착과 마음의 통증을 대가 삼아 구워냈던 기묘당 손님들의 비공 처방전과 처절한 결과가 기록된 비밀 궤짝 서랍장입니다.
                </p>
              </div>

              {/* Advanced Filter Utilities */}
              <div className="flex flex-wrap items-center gap-3 bg-white/5 backdrop-blur-md p-2 rounded-lg border border-white/10 text-xs text-white shadow-xl">
                <div className="flex items-center gap-1 text-[#C5A059] px-2 font-bold font-sans">
                  <Filter className="w-3.5 h-3.5" />
                  <span>필터:</span>
                </div>
                
                <select 
                  value={filterEra} 
                  onChange={(e) => setFilterEra(e.target.value)}
                  className="bg-zinc-900/80 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#C5A059] font-sans"
                >
                  <option value="all">시대 전체 (All Eras)</option>
                  <option value="joseon">조선 (朝鮮)</option>
                  <option value="modern">현대 (現代)</option>
                  <option value="unspecified">미지 (未知)</option>
                </select>

                <select 
                  value={filterDesire} 
                  onChange={(e) => setFilterDesire(e.target.value)}
                  className="bg-zinc-900/80 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#C5A059] font-sans"
                >
                  <option value="all">욕망 코드 전체</option>
                  <option value="①">① 지움 (망각)</option>
                  <option value="②">② 강함 (권력)</option>
                  <option value="③">③ 연결 (사랑)</option>
                  <option value="④">④ 복수 (응징)</option>
                  <option value="⑤">⑤ 진실 (앎)</option>
                  <option value="⑥">⑥ 회귀 (탈환)</option>
                  <option value="⑦">⑦ 해방 (탈출)</option>
                </select>

                <button 
                  onClick={fetchCabinetData} 
                  className="p-1.5 hover:bg-white/5 rounded transition-all text-white/40 hover:text-white cursor-pointer"
                  title="다시 갱신"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List Cabinet prescriptions */}
            <div className="flex-1 overflow-y-auto pr-2">
              {cabinetLoading ? (
                <div className="h-64 flex flex-col items-center justify-center space-y-4 font-serif">
                  <div className="w-8 h-8 rounded-full border-t-2 border-l-2 border-[#C5A059] animate-spin"></div>
                  <p className="italic text-[#C5A059] text-xs">서고 깊스기 잠긴 서류 궤짝을 불어내고 있습니다...</p>
                </div>
              ) : filteredCabinet.length === 0 ? (
                <div className="h-64 border border-dashed border-white/5 rounded-lg flex flex-col items-center justify-center text-center p-8 opacity-60">
                  <Archive className="w-10 h-10 text-white/20 mb-3" />
                  <h3 className="font-serif text-sm font-semibold text-white">표된 조건의 처방 기록이 비어있습니다</h3>
                  <p className="text-xs text-white/40 max-w-xs mt-1 leading-relaxed font-sans">
                    등록된 기록이 없거나 영정 필터에 알맞는 역서가 없습니다. 먼저 마음 조제실로 들어가 서명을 빚으십시오.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
                  {filteredCabinet.map((item) => {
                    const pres = item.prescription || item;
                    const dateStr = new Date(item.created_at).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    });
                    
                    const isLikedByMe = likedIds.includes(item.id);
                    const likesCount = simulatedLikesCounts[item.id] || 12;

                    return (
                      <div 
                        key={item.id} 
                        className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-5 flex flex-col justify-between hover:border-[#C5A059]/60 transition-all duration-300 relative group overflow-hidden shadow-2xl"
                      >
                        {/* Interactive heart clicking alert bubble (For Guest only) */}
                        {galleryActiveHeartAlert === item.id && (
                          <div className="absolute inset-0 bg-black/80 backdrop-blur z-20 flex flex-col justify-center items-center p-4 text-center">
                            <span className="w-10 h-10 rounded-full bg-red-950/20 border border-red-500/20 flex items-center justify-center mb-2.5">
                              <Lock className="w-4 h-4 text-red-400" />
                            </span>
                            <h4 className="text-xs font-bold text-white tracking-wider mb-2">공감은 기묘당 손님만 가능합니다</h4>
                            <p className="text-[10px] text-white/60 leading-relaxed max-w-[200px] mb-3">
                              로그인(혼 계약)하지 않으시면 마음을 보태는 좋아요를 활성할 수 없습니다.
                            </p>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => setGalleryActiveHeartAlert(null)}
                                className="px-2.5 py-1 bg-white/5 text-white/70 hover:bg-white/10 rounded text-[9px]"
                              >
                                계속 구경
                              </button>
                              <button 
                                onClick={() => {
                                  setActiveTab('prescribe');
                                  setSceneStep(5);
                                }}
                                className="px-2.5 py-1 bg-[#C5A059] text-black font-semibold rounded text-[9px]"
                              >
                                로그인 화면
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Decorative golden corner light */}
                        <div className="absolute top-0 right-0 w-16 h-[1px] bg-gradient-to-r from-transparent to-[#C5A059]/20" />
                        <div className="absolute top-0 right-0 h-16 w-[1px] bg-gradient-to-b from-transparent to-[#C5A059]/20" />

                        <div>
                          {/* Top Tag and Date */}
                          <div className="flex justify-between items-center text-[10px] uppercase tracking-wider font-mono text-white/40 border-b border-white/5 pb-2.5 mb-4">
                            <span className="bg-white/[0.04] px-2 py-0.5 rounded text-[#C5A059] font-serif border border-white/5">
                              {item.era_profile === 'joseon' ? '조선 한양' : item.era_profile === 'modern' ? '강남 도시' : '시공간 경계'}
                            </span>
                            <span>{dateStr}</span>
                          </div>

                          {/* Sweet confectionery name & visual details */}
                          <div className="mb-4">
                            <h3 className="text-xl font-serif text-white font-bold leading-tight group-hover:text-[#C5A059] transition-colors flex items-center justify-between">
                              <span>{pres.name}</span>
                              <span className="text-[10px] text-white/40 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded font-sans uppercase font-normal">{pres.original}</span>
                            </h3>
                            <p className="text-xs text-white/60 font-serif italic mt-2 leading-relaxed">
                              "{pres.visual}"
                            </p>
                          </div>

                          {/* Secret Ingredients & Magical outcomes */}
                          <div className="space-y-2.5 border-t border-white/5 pt-3.5 text-xs">
                            <div>
                              <span className="text-[#C5A059] font-semibold block font-sans text-[10px] uppercase tracking-wider">주요 사념 재료:</span>
                              <p className="text-white/80 font-serif mt-0.5">{pres.ingredients}</p>
                            </div>
                            <div>
                              <span className="text-[#C5A059] font-semibold block font-sans text-[10px] uppercase tracking-wider">조제적 순용 효능:</span>
                              <p className="text-white/80 font-serif mt-0.5">{pres.effect}</p>
                            </div>
                            <div className="bg-red-950/20 backdrop-blur-sm border border-red-500/15 p-2.5 rounded text-red-200 font-serif">
                              <span className="text-red-400 font-semibold block font-sans text-[10px] uppercase tracking-widest">치밀한 역설적 권용 대가:</span>
                              <p className="mt-0.5 leading-relaxed text-xs">{pres.price}</p>
                            </div>
                          </div>
                        </div>

                        {/* Card metadata tags footer */}
                        <div className="mt-5 pt-3 border-t border-white/5 flex justify-between items-center text-[10px] uppercase font-mono text-white/30">
                          <span>대조인: {item.user_email?.split('@')[0]}@**</span>
                          <div className="flex items-center gap-3">
                            {/* Like / Heart Action button mapped with responsive animation */}
                            <button
                              onClick={() => handleToggleLike(item.id)}
                              className={`flex items-center gap-1 py-1 px-2 rounded-full cursor-pointer transition-all duration-300 focus:outline-none ${
                                isLikedByMe 
                                  ? 'bg-red-500/10 text-red-400 border border-red-500/30' 
                                  : 'bg-white/5 text-white/40 border border-white/5 hover:bg-white/10 hover:text-white'
                              }`}
                            >
                              <Heart className={`w-3.5 h-3.5 transition-transform ${isLikedByMe ? 'fill-red-400 scale-110 animate-[bounce_0.6s_ease-out_1]' : 'group-hover:scale-110'}`} />
                              <span className="font-mono text-[9px] font-semibold">{likesCount}</span>
                            </button>

                            <span className="bg-white/5 px-2 py-0.5 rounded" title="대가지불 형식">구조: {pres.price_code || 'A'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ACTIVE PRESCRIPTION ROOM FLOW */}
        {activeTab === 'prescribe' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* 5-Scene Magical View Theater Progress Stepper Placeholder (Disabled as requested) */}
            {false && (
              <div className="mb-5 bg-[#101012] border border-white/5 p-4 rounded-xl shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-3 select-none">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C5A059]/40 to-transparent" />
                
                <div className="text-left">
                  <span className="text-[8px] uppercase tracking-[0.5em] text-[#C5A059] block font-bold">Gimyodang Cosmic Pipeline</span>
                  <h3 className="text-xs font-serif text-white font-bold flex items-center gap-1.5 mt-0.5">
                    <span>6장면 주술 극장 (Animation Board)</span>
                    <span className="text-[9px] bg-[#C5A059]/10 border border-[#C5A059]/30 text-[#C5A059] px-2 py-0.2 rounded font-sans italic">Inactive placeholder</span>
                  </h3>
                </div>

                {/* 6 scenes buttons acting as beautiful timeline blocks */}
                <div className="flex flex-wrap gap-1.5 md:gap-2">
                  {[
                    { id: 1, label: '제 1 장: 프롤로그', desc: '설명 무비' },
                    { id: 2, label: '제 2 장: 시공대문', desc: '시대 주소지' },
                    { id: 3, label: '제 3 장: 신도서명', desc: '아명 및 수결' },
                    { id: 4, label: '제 4 장: 집착사념', desc: '매식 카드' },
                    { id: 5, label: '제 5 장: 시공심문', desc: '연화 대화창' },
                    { id: 6, label: '제 6 장: 최후처방', desc: '대속 종결서' }
                  ].map((item) => {
                    const isActive = sceneStep === item.id;
                    const isFinished = sceneStep > item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          // Allow visiting former setup scenes easily to verify color adjustments contextually
                          if (item.id <= 4 || (item.id === 5 && era && selectedDesire) || (item.id === 6 && latestEnding)) {
                            setSceneStep(item.id);
                          }
                        }}
                        disabled={item.id === 6 ? !latestEnding : (item.id === 5 ? (!era || !selectedDesire) : false)}
                        className={`px-3 py-1 text-left rounded border-2 transition-all duration-300 relative focus:outline-none disabled:opacity-30 disabled:cursor-not-allowed ${
                          isActive 
                            ? 'bg-transparent border-[#C5A059] text-[#C5A059] shadow-[0_0_15px_rgba(197,160,89,0.35)]' 
                            : isFinished
                            ? 'bg-white/10 border-white/20 text-white/90 backdrop-blur-sm'
                            : 'bg-white/5 backdrop-blur-sm border-white/10 hover:border-white/20 text-white/50'
                        }`}
                      >
                        <div className="text-[9px] font-bold font-serif leading-tight">{item.label}</div>
                        <div className="text-[7px] font-sans opacity-60 leading-none">{item.desc}</div>
                        {isActive && (
                          <div className="absolute top-0.5 right-1 w-1 h-1 bg-[#C5A059] rounded-full animate-ping" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SCENE STEP 1: CINEMATIC NARRATION PROLOGUE MOVIE */}
            {sceneStep === 1 && (
              <div className="flex-1 overflow-y-auto">
                <PrologueVideo onEnter={() => setSceneStep(2)} />
              </div>
            )}

            {/* SCENE STEP 2: CHOICE OF THE THREE ERA DOOR IMAGES */}
            {sceneStep === 2 && (
              <div className="flex-1 overflow-y-auto">
                <EraDoors 
                  selectedEra={era} 
                  onSelectEra={(e) => setEra(e)}
                  onNext={() => {
                    // Pre-fill initial joseon if they just clicked next
                    if (!era) setEra('joseon');
                    setSceneStep(3);
                  }}
                />
              </div>
            )}

            {/* SCENE STEP 3: CUSTOM VISITOR PERSONA (KIMYODANG REGISTER) */}
            {sceneStep === 3 && (
              <div className="flex-1 overflow-y-auto">
                <VisitorPersonaSelector 
                  era={era || 'joseon'}
                  initialPersona={persona}
                  onSelect={(selected) => {
                    setPersona(selected);
                    setSceneStep(4);
                  }}
                  onBack={() => setSceneStep(2)}
                />
              </div>
            )}

            {/* SCENE STEP 4: SELECT DESIRE CARD */}
            {sceneStep === 4 && (
              <div className="flex-1 overflow-y-auto">
                <div className="col-span-12 flex flex-col gap-6 max-w-4xl mx-auto py-2 font-serif text-center">
                  
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-[0.4em] text-[#C5A059] block font-sans font-bold">
                      [ 제 4 장 ] 영혼을 옥죌 주술 욕망 카드 (CHOOSE THE TARGET ATTACHMENT)
                    </label>
                    <p className="text-[11px] text-white/50 max-w-md mx-auto font-sans leading-relaxed">
                      그대가 직면한 응어리는 삶의 어떠한 자락에 속합니까? 처방을 원하시는 주술 욕망 타깃 카드를 가만 부르십시오.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6 max-w-4xl mx-auto">
                    {DESIRE_CARDS.map((card) => {
                      const isSelected = selectedDesire?.id === card.id;
                      return (
                        <button
                          key={card.id}
                          onClick={() => startRitual(era || 'joseon', card)}
                          className={`p-5 flex flex-col justify-between text-left border-2 rounded-xl transition-all min-h-[180px] relative overflow-hidden group cursor-pointer ${
                            isSelected
                              ? 'bg-transparent border-[#C5A059] shadow-[0_0_25px_rgba(197,160,89,0.35)] scale-[1.02]'
                              : 'bg-white/5 backdrop-blur-sm border-white/10 hover:border-[#C5A059]/60 hover:bg-white/10 hover:scale-[1.01]'
                          }`}
                        >
                          <div className="text-[11px] text-[#C5A059] font-mono tracking-wider mb-2">
                            제 {card.code} 장
                          </div>
                          
                          <div className="flex-1 flex flex-col justify-end space-y-2">
                            <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-[#C5A059]/10 group-hover:border-[#C5A059]/30 transition-colors">
                              {getDesireIcon(card.icon)}
                            </div>
                            <h4 className="text-sm font-bold text-white font-serif leading-tight">
                              {card.label}
                            </h4>
                            <p className="text-[10px] text-white/50 leading-relaxed font-serif block line-clamp-2 h-10 font-light">
                              {card.description}
                            </p>
                          </div>

                          {isSelected && (
                            <div className="absolute top-2 right-3 w-2 h-2 rounded-full bg-[#C5A059] animate-ping" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-6">
                    <button
                      onClick={() => setSceneStep(3)}
                      className="px-8 py-3 rounded bg-[#C5A059] text-black hover:bg-[#d6b26d] font-bold font-sans text-xs tracking-widest transition-all duration-300 shadow-xl inline-flex items-center gap-2.5 cursor-pointer focus:outline-none"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>신도 명부 작성(수결)으로 가기</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SCENE STEP 5: CONVERSATION MODULE GIME-TERMINAL (Color Themed based on Chosen Era!) */}
            {sceneStep === 5 && era && selectedDesire && (
              <div className="flex-1 flex flex-col md:grid md:grid-cols-12 md:max-h-[calc(100vh-160px)] md:overflow-hidden gap-6">
                
                {/* Left Column: Color-Theme Varied Traditional Chat Console */}
                <section className={`col-span-12 md:col-span-7 h-[550px] md:h-[630px] flex flex-col rounded-xl overflow-hidden ${themeStyles.box} transition-all duration-500`}>
                  
                  {/* Decorative themed card header */}
                  <div className={`px-5 py-3.5 flex justify-between items-center ${themeStyles.header}`}>
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2.5 h-2.5 rounded-full ${themeStyles.indicator} animate-pulse`} />
                      <span className="text-[11px] uppercase tracking-widest font-sans font-black flex items-center gap-1.5">
                        <span>
                          {era === 'joseon' ? '조선 한양 자시 밀사 (朝鮮)' : era === 'modern' ? '강남 빌딩 시크 콘크리트' : '시공 비지정 경계 동경실'}
                        </span>
                        <span className="text-[9px] font-light bg-black/40 px-2 py-0.5 rounded border border-white/5 leading-none">
                          {era === 'joseon' ? 'GOLD VIBE' : era === 'modern' ? 'DARK VIBE' : 'PURPLE VIBE'}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-white/40 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>단계: {currentTurn === 'ending' ? '완결' : `${currentTurn} / 5`}</span>
                    </div>
                  </div>

                  {/* Scrolled dialogue messages list */}
                  <div className={`flex-1 overflow-y-auto p-4 space-y-4 font-serif text-sm tracking-wide leading-relaxed ${themeStyles.bg}`}>
                    {chatHistory.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[85%] rounded-lg px-4 py-3 border ${
                          msg.role === 'user' 
                            ? themeStyles.userBubble 
                            : themeStyles.yeonhwaBubble
                        }`}>
                          {msg.role === 'yeonhwa' && (
                            <div className="text-[9px] font-bold text-[#C5A059] uppercase tracking-widest mb-1 select-none font-sans flex items-center gap-1">
                              <span>연화 蓮花</span>
                              <span className="text-[8px] text-white/20">•</span>
                              <span className="text-[8px] text-white/40">조제방 주술안</span>
                            </div>
                          )}
                          
                          <p className="leading-relaxed text-sm whitespace-pre-wrap">{msg.text}</p>
                          
                          {/* Rich Nested Flashback */}
                          {msg.flashback && (
                            <div className="mt-4 border border-[#C5A059]/30 bg-white/5 backdrop-blur-sm p-3.5 rounded-lg text-left overflow-hidden relative">
                              <div className="absolute top-0 right-0 w-16 h-16 bg-[#C5A059]/5 rounded-bl-full pointer-events-none" />
                              <div className="text-[10px] text-[#C5A059] tracking-widest font-sans mb-2 border-b border-white/5 pb-1 uppercase font-bold">
                                손님의 마음 구도 (동경 속 영사 형상)
                              </div>
                              <p className="font-serif italic text-xs text-white/70 leading-relaxed">
                                "{msg.flashback.text}"
                              </p>
                              <div className="mt-2.5 flex flex-wrap gap-1.5 font-sans">
                                {msg.flashback.tags.map(tag => (
                                  <span key={tag} className="text-[9px] bg-white/5 border border-white/10 text-white/70 px-2 py-0.5 rounded">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Rich Nested Interactive prescription confectionery */}
                          {msg.prescription && (
                            <div className="mt-4 border-2 border-dashed border-[#C5A059]/40 bg-white/5 backdrop-blur-md p-4 rounded-lg text-left shadow-2xl">
                              <div className="flex justify-between items-center border-b border-[#C5A059]/20 pb-2 mb-3">
                                <h4 className="text-base font-bold text-[#C5A059] font-serif">{msg.prescription.name}</h4>
                                <span className="text-[9px] uppercase font-sans border border-[#C5A059]/30 px-2 py-0.5 text-[#C5A059] rounded bg-[#C5A059]/5">
                                  {msg.prescription.original}
                                </span>
                              </div>
                              <div className="space-y-2.5 text-xs font-serif leading-relaxed">
                                <p className="text-white/80"><strong className="text-[#C5A059] font-sans text-[10px] uppercase tracking-wider block">과자의 시각적 형상: </strong> {msg.prescription.visual}</p>
                                <p className="text-white/80"><strong className="text-[#C5A059] font-sans text-[10px] uppercase tracking-wider block">주요 비첩 재료: </strong> {msg.prescription.ingredients}</p>
                                <p className="text-white/90"><strong className="text-[#C5A059] font-sans text-[10px] uppercase tracking-wider block">순용 효능: </strong> {msg.prescription.effect}</p>
                                <div className="bg-red-950/20 backdrop-blur-sm p-3 rounded-md border border-red-500/15 text-red-200 mt-2">
                                  <strong className="text-red-400 font-sans text-[10px] uppercase tracking-widest block mb-0.5">⚠️ 처절한 역설적 후유 대가: </strong>
                                  {msg.prescription.price}
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="text-[8px] text-white/30 text-right mt-1.5 font-mono">
                            {msg.timestamp}
                          </div>
                        </div>
                      </div>
                    ))}

                    {loading && (
                      <div className="flex justify-start">
                        <div className="bg-white/5 border border-white/5 rounded-lg px-4 py-3 text-white/60 flex items-center gap-3">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C5A059] opacity-75 animate-bounce"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C5A059]"></span>
                          </span>
                          <span className="font-serif italic text-xs animate-pulse text-amber-100">연화가 다선 위에서 가만 촛불을 죽이며 대가 조청 그릇을 뒤적입니다...</span>
                        </div>
                      </div>
                    )}

                    {apiError && (
                      <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-200 text-xs rounded-lg flex items-start gap-2.5 font-sans">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold mb-0.5 text-red-300">결계 불순물 감지</p>
                          <p className="leading-relaxed opacity-90">{apiError}</p>
                        </div>
                      </div>
                    )}

                    <div ref={chatEndRef} />
                  </div>

                  {/* Input form area masked by Authentication flow if user is anonymous */}
                  <div className="border-t border-white/5 p-3 bg-white/[0.02] backdrop-blur-sm">
                    {currentTurn === 'ending' ? (
                      <div className="p-4 text-center border border-white/5 bg-white/[0.02] rounded-lg">
                        <p className="text-xs italic text-white/40 mb-3 font-serif">동경의 사념 개합이 종료되었습니다. 대속의 고리를 확인하시오.</p>
                        <button
                          onClick={() => {
                            setEra(null);
                            setSelectedDesire(null);
                            setChatHistory([]);
                            setLatestFlashback(null);
                            setLatestPrescription(null);
                            setLatestEnding(null);
                            setCurrentTurn(1);
                            setSaveStatus('idle');
                            setSceneStep(1); // Return to prologue
                          }}
                          className="px-6 py-2 rounded bg-[#C5A059] text-black font-semibold font-serif hover:bg-[#d6b26d] transition-all text-xs focus:outline-none cursor-pointer"
                        >
                          새로운 비방 처방 조작 (프롤로그부터 시작)
                        </button>
                      </div>
                    ) : latestPrescription && currentTurn === 4 ? (
                      /* Deciding Confectionery Prescription Gate */
                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg flex flex-col gap-3">
                        <p className="text-xs text-center text-white/80 font-serif leading-relaxed">
                          "식 가마 뚜껑이 열려 단과자 처방이 조제되었습니다. 대가를 마땅히 받아들이고 대속하시겠습니까?"
                        </p>
                        <div className="grid grid-cols-2 gap-3 font-sans">
                          <button
                            onClick={handleDeclinePrescription}
                            className="py-2 rounded border border-white/10 text-white/70 hover:bg-white/5 text-xs transition-all cursor-pointer"
                          >
                            거두고 물러나기 (Decline)
                          </button>
                          <button
                            onClick={handleAcceptPrescription}
                            className="py-2 rounded bg-[#C5A059] text-black hover:bg-[#d4b06d] text-xs font-serif font-bold transition-all shadow-lg cursor-pointer"
                          >
                            과자를 삼키고 수락함 (Accept)
                          </button>
                        </div>
                      </div>
                    ) : !user ? (
                      /* INLINE AUTHENTICATION GATE: "로그인이 되어있지 않아도 여기까지는 접근이 가능하며, 이 이후 대화에는 로그인이 필요하다." */
                      <div className={`p-4 bg-white/5 backdrop-blur-md border border-${era === 'joseon' ? '[#C5A037]' : era === 'modern' ? 'zinc-300' : '[#af4085]'}/40 rounded-lg relative overflow-hidden text-center space-y-3 font-sans`}>
                        <div className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-${era === 'joseon' ? '[#C5A059]' : era === 'modern' ? 'white' : '[#af4085]'} to-transparent`} />
                        
                        <div className={`flex items-center justify-center gap-1.5 text-${era === 'joseon' ? '[#C5A059]' : era === 'modern' ? 'zinc-300' : '[#f4a1ce]'} text-xs font-bold leading-none select-none`}>
                          <Lock className="w-3.5 h-3.5" />
                          <span>은밀한 심문 지속을 위해 기묘당 결계 입장 필요</span>
                        </div>

                        <p className="text-[11px] text-white/70 leading-relaxed font-serif max-w-md mx-auto">
                          "연화의 첫 인사를 엿보는 문턱까지는 무사히 당도하셨으나, 그대가 원하는 비첩을 굽고 사념을 풀어나가려면 <strong>고유한 혼 계약(로그인 및 이메일 서명)</strong>이 뒤따라야 합니다."
                        </p>

                        <div className="max-w-xs mx-auto space-y-2 text-left font-sans">
                          <div>
                            <input
                              type="email"
                              value={authEmail}
                              onChange={(e) => setAuthEmail(e.target.value)}
                              placeholder="이메일 계정 입력"
                              className={`w-full bg-white/[0.04] backdrop-blur-sm border border-white/10 rounded px-2.5 py-1.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-${era === 'joseon' ? '[#C5A059]' : era === 'modern' ? 'white' : '[#af4085]'} font-mono`}
                            />
                          </div>
                          <div>
                            <input
                              type="password"
                              value={authPassword}
                              onChange={(e) => setAuthPassword(e.target.value)}
                              placeholder="비밀통로 코드 비밀번호"
                              className={`w-full bg-white/[0.04] backdrop-blur-sm border border-white/10 rounded px-2.5 py-1.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-${era === 'joseon' ? '[#C5A059]' : era === 'modern' ? 'white' : '[#af4085]'} font-mono`}
                            />
                          </div>

                          {authError && (
                            <p className="text-[10px] text-red-400 font-sans">⚠️ {authError}</p>
                          )}
                          {authSuccessMsg && (
                            <p className="text-[10px] text-emerald-400 font-sans">✓ {authSuccessMsg}</p>
                          )}

                          <div className="grid grid-cols-2 gap-2 pt-1 font-sans">
                            <button
                              onClick={() => {
                                setAuthMode('signin');
                                handleAuth();
                              }}
                              className="py-2 bg-[#C5A059] text-black font-bold font-serif rounded hover:bg-[#d6b26d] text-[10px] uppercase transition-all cursor-pointer"
                            >
                              로그인 입장
                            </button>
                            <button
                              onClick={() => {
                                setAuthMode('signup');
                                handleAuth();
                              }}
                              className="py-2 bg-white/5 border border-white/10 text-white/80 font-bold rounded hover:bg-white/10 text-[10px] uppercase transition-all cursor-pointer"
                            >
                              신규 계약가입
                            </button>
                          </div>
                        </div>

                        <div className="text-[9px] text-white/30 uppercase font-mono border-t border-white/5 pt-2.5">
                          보안 연합: {isSupabaseConfigured ? 'Supabase Secure DB Active' : 'Simulated Session Container'}
                        </div>
                      </div>
                    ) : (
                      /* Authenticated typical messaging form */
                      <form onSubmit={handleSendMessage} className="flex gap-2">
                        <input
                          type="text"
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          disabled={loading}
                          placeholder={
                            currentTurn === 2 
                              ? "그대 마음에 걸린 서러운 집착을 고백해 보시오 (예: 과거 10년의 인연...)" 
                              : "연화의 물음에 대답을 이어가 보시오..."
                          }
                          className={`flex-1 border rounded-lg px-3 py-2 text-xs focus:outline-none transition-all duration-300 ${themeStyles.input}`}
                        />
                        <button
                          type="submit"
                          disabled={loading || !inputText.trim()}
                          className={`p-2 rounded-lg disabled:opacity-40 disabled:pointer-events-none transition-all duration-300 cursor-pointer focus:outline-none ${themeStyles.button}`}
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </form>
                    )}
                  </div>
                </section>

                {/* Right Column: Mirror Reflection, Live Saving State OR Final Retribution Story when finished */}
                <section className="col-span-12 md:col-span-5 h-[550px] md:h-[630px] flex flex-col gap-5 overflow-y-auto pr-1">
                  
                  {latestEnding ? (
                    /* RENDER RETRIBUTION CLIMAX STORY IN THE SAME WINDOW ON THE RIGHT! */
                    <div className="bg-red-950/25 backdrop-blur-md border-2 border-red-500/35 p-5 rounded-xl shadow-2xl flex-1 flex flex-col justify-between relative overflow-hidden animate-[fadeIn_0.4s_ease-out]">
                      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#b33a55]/50 to-transparent" />
                      
                      <div className="space-y-4">
                        <div className="text-left space-y-1.5 pb-2.5 border-b border-white/5">
                          <span className="text-[9px] uppercase tracking-[0.4em] text-[#ff4d73] font-sans font-bold block">
                            기묘당 대속 계약서 (DESTINY BOND COMPLETION)
                          </span>
                          <h2 className="text-base font-bold font-serif text-white tracking-wide">
                            수결된 운명 대속 결과
                          </h2>
                        </div>

                        <div>
                          <span className="text-[8px] font-sans tracking-[0.3em] text-white/40 font-bold block uppercase mb-1">
                            대속 성숙문 (Maturation Story Climax)
                          </span>
                          <p className="leading-relaxed text-xs text-white/90 italic bg-white/[0.01] p-3 border border-white/5 rounded whitespace-pre-wrap font-light">
                            "{latestEnding.text}"
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[8px] font-sans tracking-[0.3em] text-white/40 font-bold block uppercase">
                            최종 완결 뇌리 영상 (Climax Image Visualized)
                          </span>
                          <div className="w-full h-32 bg-gradient-to-br from-[#ff4d73]/5 via-[#231118] to-black border border-[#ff4d73]/15 rounded-lg flex flex-col items-center justify-center p-3 text-center">
                            <Image className="w-5 h-5 text-[#ff4d73]/60 mb-1.5 animate-pulse" />
                            <h5 className="text-[10px] font-serif font-bold text-white mb-0.5">
                              {latestEnding.last_image || "대속의 무대"}
                            </h5>
                            <p className="text-[7.5px] text-white/30 font-sans">
                              [ENDING_CLIMAX_SCENE_PORTAL]
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-white/5">
                        <button
                          onClick={() => setSceneStep(6)}
                          className="w-full py-2.5 bg-[#C5A059] hover:bg-[#d4b06d] text-black font-sans font-bold text-xs tracking-widest rounded-lg transition-all cursor-pointer shadow-lg uppercase text-center flex items-center justify-center gap-1.5"
                        >
                          <span>다음장 상세 처방전 보증하기</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* DEFAULT: SHOW SELECTED DESIRE DETAILS AND PORTAL CLUES */
                    <>
                      {/* Selected desire cards spec view */}
                      <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-lg shadow-xl relative overflow-hidden flex flex-col select-none">
                        <div className="absolute top-2 right-2 text-5xl text-white/[0.02] font-bold font-serif select-none pointer-events-none">
                          {selectedDesire.code}
                        </div>
                        
                        <h3 className="text-[10px] font-sans tracking-[0.3em] text-[#C5A059] uppercase border-b border-white/5 pb-2 mb-3 font-semibold">
                          선택한 무대 마음구도 (DESIRE SPEC)
                        </h3>

                        <div className="flex items-center gap-3.5 mb-3">
                          <div className="w-10 h-10 bg-white/5 rounded-full border border-white/10 flex items-center justify-center">
                            {getDesireIcon(selectedDesire.icon)}
                          </div>
                          <div>
                            <span className="text-[9px] text-[#C5A059] tracking-widest block font-sans">제 {selectedDesire.code} 수</span>
                            <h2 className="text-sm font-bold font-serif text-white">{selectedDesire.label}</h2>
                          </div>
                        </div>
                        
                        <p className="text-xs text-white/60 leading-relaxed font-serif italic font-light">
                          "{selectedDesire.description}"
                        </p>
                      </div>

                      {/* Optical reflection mirror flashback */}
                      {latestFlashback && (
                        <div className="bg-white/5 backdrop-blur-md border border-[#C5A059]/30 p-5 rounded-lg shadow-xl flex-1 flex flex-col justify-between relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#C5A059]/5 to-transparent pointer-events-none" />
                          
                          <div>
                            <h3 className="text-[10px] font-sans tracking-[0.4em] text-[#C5A059] uppercase border-b border-white/5 pb-2 mb-3 font-semibold">
                              기묘당 청동경 (Mirror Reflection)
                            </h3>
                            
                            <p className="font-serif italic text-sm text-white/95 leading-relaxed relative z-10 py-2 font-light">
                               "{latestFlashback.text}"
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-white/5">
                            <span className="text-[9px] uppercase tracking-wide text-white/40 block mb-1.5 font-sans">
                              영사된 마력의 부작 고리
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {latestFlashback.tags.map(tag => (
                                <div key={tag} className="text-[11px] border border-white/10 px-2.5 py-1 bg-white/[0.02] rounded text-white/80 flex items-center gap-1.5">
                                  <span className="w-1 rounded-full h-1 bg-[#C5A059]" />
                                  <span>{tag}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Frame placeholder if no chat reflection formulized */}
                      {!latestFlashback && (
                        <div className="border border-dashed border-white/10 p-8 rounded-lg flex-1 flex flex-col items-center justify-center text-center opacity-60">
                          <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center mb-4">
                            <Sparkle className="w-4 h-4 text-[#C5A059] animate-spin" />
                          </div>
                          <h4 className="text-[10px] uppercase tracking-widest text-[#C5A059] font-sans font-bold mb-1">
                            동경 거울 대기 상태
                          </h4>
                          <p className="font-serif text-xs text-white/40 max-w-xs leading-relaxed font-light">
                            조제 대화가 무르익고 마음 복수와 망각이 수놓아질 때 청동 거울(동경)이 현실 속 이면의 부작 상해 형상을 비춥니다.
                          </p>
                        </div>
                      )}
                    </>
                  )}

                </section>
              </div>
            )}

            {/* SCENE STEP 6: FINAL PRESCRIPTION SAVING AND ACCEPTED ENDING SUMMARY SCREEN */}
            {sceneStep === 6 && latestEnding && (
              <div className="flex-1 overflow-y-auto max-w-2xl mx-auto py-4 w-full px-4 animate-[fadeIn_0.5s_ease-out]">
                
                {/* SINGLE COLUMN: THE SECRET APOTHECARY RECIPE & CONFECTIONERY FORMULA (ONLY DISCOVER WHAT WAS EATEN!) */}
                <div className="bg-white/5 backdrop-blur-md border-2 border-[#C5A059]/60 p-6 md:p-8 rounded-xl shadow-2xl space-y-6 relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#C5A059]/60 to-transparent" />
                  
                  <div className="space-y-5">
                    <div className="text-center space-y-2 pb-4 border-b border-[#C5A059]/10">
                      <span className="text-[10px] uppercase tracking-[0.4em] text-[#C5A059] font-sans font-bold block">
                        기묘당 秘傳 단과자 처방전 (SECRET APOTHECARY FORMULA RECIPE)
                      </span>
                      <h2 className="text-2xl md:text-3xl font-serif text-white font-bold leading-tight flex items-center justify-center gap-3">
                        <span className="text-[#F3CE82]">
                          {latestPrescription ? latestPrescription.name : '비방 단과자 처방'}
                        </span>
                        {latestPrescription && (
                          <span className="text-xs border border-[#C5A059]/30 px-2.5 py-0.5 text-[#C5A059] rounded bg-[#C5A059]/5 uppercase tracking-wide font-sans">
                            {latestPrescription.original}
                          </span>
                        )}
                      </h2>
                    </div>

                    {latestPrescription ? (
                      <div className="space-y-5">
                        
                        {/* Recipe Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          
                          {/* ILLUSTRATION SLOT 1: INGREDIENTS MAPPING IMAGE */}
                          <div className="space-y-1.5">
                            <span className="text-[9px] font-sans tracking-widest text-[#C5A059] font-bold block uppercase">
                              ① 처방 비첩 재료 도해 (INGREDIENTS MAP)
                            </span>
                            <div className="w-full aspect-[4/3] bg-black/60 border border-white/5 hover:border-[#C5A059]/20 rounded-lg flex flex-col items-center justify-center p-3 relative overflow-hidden text-center transition-colors">
                              <div className="absolute top-1.5 right-1.5 text-[8px] font-mono uppercase tracking-widest text-white/20">
                                INGREDIENTS_MAP.PNG
                              </div>
                              <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-[#C5A059] mb-1.5">
                                <Sparkles className="w-4 h-4" />
                              </div>
                              <p className="text-xs text-[#F3CE82] font-serif leading-tight mb-0.5">
                                비첩 재료 조합구
                              </p>
                              <p className="text-[9px] text-white/30 font-sans leading-none block px-1 line-clamp-1">
                                {latestPrescription.ingredients}
                              </p>
                            </div>
                          </div>

                          {/* ILLUSTRATION SLOT 2: FINAL APOTHECARY PRODUCT IMAGE */}
                          <div className="space-y-1.5">
                            <span className="text-[9px] font-sans tracking-widest text-[#C5A059] font-bold block uppercase">
                              ② 처방 단과자 인화 (CONFECTIONERY PORTRAIT)
                            </span>
                            <div className="w-full aspect-[4/3] bg-black/60 border border-[#C5A059]/20 rounded-lg flex flex-col items-center justify-center p-3 relative overflow-hidden text-center transition-all bg-gradient-to-b from-[#C5A059]/5 via-transparent to-black">
                              <div className="absolute top-1.5 right-1.5 text-[8px] font-mono uppercase tracking-widest text-[#C5A059]/30">
                                CONFECTIONERY_VIEW.PNG
                              </div>
                              <div className="w-9 h-9 rounded-full bg-[#C5A059]/10 flex items-center justify-center border border-[#C5A059]/30 text-[#C5A059] mb-1.5">
                                <Cookie className="w-4 h-4" />
                              </div>
                              <p className="text-xs text-lime-100 font-serif leading-tight mb-0.5 font-bold">
                                {latestPrescription.name} 형상
                              </p>
                              <p className="text-[9px] text-white/30 font-sans leading-none block px-1 line-clamp-1">
                                {latestPrescription.visual}
                              </p>
                            </div>
                          </div>
                          
                        </div>

                        {/* Recipe text guides */}
                        <div className="space-y-4 leading-relaxed text-xs">
                          
                          <div>
                            <strong className="text-[#C5A059]/90 font-sans text-[10px] uppercase tracking-wider block mb-1">
                              [주문 조제 기령 요약]
                            </strong>
                            <p className="text-white/85 bg-white/[0.01] p-3 border border-white/5 rounded italic font-serif text-sm">
                              "{latestPrescription.visual}"
                            </p>
                          </div>

                          <div className="grid grid-cols-1 gap-3">
                            <div className="p-3 bg-black/30 border border-[#C5A059]/10 rounded font-serif">
                              <strong className="text-[#C5A059] font-sans text-[9px] uppercase tracking-wider block mb-1 font-bold">
                                주요 처방 가과 재료 구성
                              </strong>
                              <p className="text-white/80 text-xs">{latestPrescription.ingredients}</p>
                            </div>
                            
                            <div className="p-3 bg-[#0c120d]/80 border border-emerald-950 rounded font-serif">
                              <strong className="text-emerald-400 font-sans text-[9px] uppercase tracking-wider block mb-1 font-bold">
                                순용(順用) 주술 효법
                              </strong>
                              <p className="text-emerald-100/90 leading-normal text-xs">{latestPrescription.effect}</p>
                            </div>

                            <div className="p-3 bg-[#18090b] border border-red-500/15 rounded text-red-200 font-serif">
                              <strong className="text-red-400 font-sans text-[9px] uppercase tracking-widest block mb-1 font-bold">
                                ⚠️ 처절한 역설적 후유 대가 (RETRIBUTION PRICE)
                              </strong>
                              <p className="opacity-95 leading-normal text-xs">{latestPrescription.price}</p>
                            </div>
                          </div>

                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-white/40 italic text-center">처방전 조제 기록을 탐색하는 중에 결함이 생겼습니다.</p>
                    )}

                  </div>

                  {/* THREE DYNAMIC TRIGGER BUTTONS: SAVE, BACK TO DIALOGUE, BACK TO PROLOGUE */}
                  <div className="pt-6 mt-4 border-t border-white/5 space-y-3 font-sans">
                    
                    {saveStatus === 'saved' ? (
                      <div className="text-center py-3 bg-emerald-950/20 border border-emerald-500/25 text-emerald-300 text-xs rounded-lg flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div>
                          <p className="font-bold">✓ 마음 처방전 각인 완수 (Committed)</p>
                          <p className="text-[10px] text-emerald-400/60 mt-0.5">이 밀법이 무구한 보관 철제 궤짝 갤러리에 잠금 각인되었습니다.</p>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={handleSavePrescription}
                        disabled={saveStatus === 'saving'}
                        className="w-full py-3 bg-[#C5A059] text-black font-serif font-bold text-xs rounded-lg hover:bg-[#d4b06d] transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer focus:outline-none disabled:opacity-45"
                      >
                        {saveStatus === 'saving' && <div className="w-3.5 h-3.5 rounded-full border-t-2 border-slate-950 animate-spin"></div>}
                        <span>기묘당 장부 궤짝에 이 비방 처방서 보정(각인)하기 (Reinforce / Save to Cabinet)</span>
                      </button>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <button
                        onClick={() => setSceneStep(5)}
                        className="py-2.5 border border-[#C5A059]/20 hover:border-[#C5A059]/40 rounded text-xs text-[#C5A059] hover:bg-[#C5A059]/5 transition-all cursor-pointer focus:outline-none font-medium flex items-center justify-center gap-1.5"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>다시 연화 대화창 돌아가기</span>
                      </button>

                      <button
                        onClick={() => {
                          setEra(null);
                          setSelectedDesire(null);
                          setChatHistory([]);
                          setLatestFlashback(null);
                          setLatestPrescription(null);
                          setLatestEnding(null);
                          setCurrentTurn(1);
                          setSaveStatus('idle');
                          setSceneStep(1); // Return to prologue movie
                        }}
                        className="py-2.5 border border-white/10 rounded text-xs text-white/50 hover:text-white hover:bg-white/5 transition-all cursor-pointer focus:outline-none font-medium text-center"
                      >
                        신규 대속 마련 (프롤로그 이동)
                      </button>
                    </div>

                  </div>

                </div>

              </div>
            )}

          </div>
        )}

      </main>

      {/* Traditional high contrast fine-grain footer */}
      <footer className="relative z-20 px-6 py-4 bg-transparent flex flex-col sm:flex-row justify-between items-center text-[9px] uppercase tracking-[0.4em] text-white/30 font-sans gap-2 select-none">
        <div>
          기묘당 &copy; MMXXVI Gimyodang. All Sacred Contracts Reserved.
        </div>
        <div className="flex items-center gap-2">
          <span>인연 다도 실시간 감응 네트워크 상태</span>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]"></div>
        </div>
      </footer>
    </div>
  );
}
