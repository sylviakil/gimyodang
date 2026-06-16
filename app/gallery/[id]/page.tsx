import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { Story } from '@/types';
import { generateCardConfig } from '@/lib/cardVisual';
import { ArrowLeft, Archive, Heart, Clock } from 'lucide-react';
import PageKeySync from '@/components/ui/PageKeySync';

async function getStory(id: string): Promise<Story | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes('your_')) return null;

  const supabase = createClient(url, key);
  const { data } = await supabase
    .from('stories')
    .select('*')
    .eq('id', id)
    .eq('is_public', true)
    .single();
  return data ?? null;
}

const ERA_LABEL: Record<string, string> = { joseon: '조선 한양', modern: '현대 서울' };
const DESIRE_LABEL: Record<string, string> = {
  '①': '지움/사라짐', '②': '강함/소유', '③': '연결/사랑',
  '④': '복수', '⑤': '진실/비밀', '⑥': '회귀/귀환', '⑦': '해방/놓아줌',
};
const TONE_LABEL: Record<string, string> = { warm: '온기', cold: '냉기', open: '열림' };

export default async function StoryDetailPage({ params }: { params: { id: string } }) {
  const story = await getStory(params.id);
  if (!story) notFound();

  const cfg = story.card_visual_config ?? generateCardConfig(
    story.desire_type, story.era, story.ending_tone ?? 'open'
  );

  const createdAt = story.created_at
    ? new Date(story.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  return (
    <div className="relative min-h-screen bg-transparent text-[#E5E5E5] font-serif">
      <PageKeySync page="story" />
      {/* 배경 */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 30% 40%, ${cfg.bgColor}30 0%, transparent 60%)` }} />
      </div>

      {/* 네비 */}
      <nav className="fixed top-0 left-0 right-0 z-30 flex justify-between items-center px-6 md:px-12 h-16 bg-transparent">
        <Link href="/?intro=1" className="flex items-center gap-3 hover:opacity-80 transition-all">
          <div className="w-7 h-7 bg-[#C9A84C] rotate-45 flex items-center justify-center">
            <div className="w-3.5 h-3.5 bg-black rotate-[-45deg] flex items-center justify-center font-serif text-[8px] text-[#C9A84C] font-bold">奇</div>
          </div>
          <span className="text-base font-serif italic tracking-tight text-white">Gimyodang <span className="text-xs text-[#C9A84C] font-light not-italic">奇妙堂</span></span>
        </Link>

        {/* 현재 페이지명 */}
        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
          <span className="text-[9px] uppercase tracking-[0.4em] font-sans text-white/20">story</span>
          <span className="text-xs font-serif text-white/55 mt-0.5">한 편의 이야기</span>
        </div>

        <Link href="/gallery" className="text-[10px] uppercase tracking-[0.2em] text-white/40 hover:text-[#C9A84C] transition-colors font-sans flex items-center gap-1.5">
          <Archive className="w-3.5 h-3.5" /> 갤러리로 돌아가기
        </Link>
      </nav>

      <main className="relative z-10 pt-24 pb-16 px-4 md:px-8 max-w-3xl mx-auto">
        {/* 뒤로 */}
        <Link href="/gallery" className="inline-flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors font-sans mb-8">
          <ArrowLeft className="w-3.5 h-3.5" /> 갤러리
        </Link>

        {/* 처방 카드 비주얼 헤더 */}
        <div
          className="rounded-2xl p-6 mb-8 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${cfg.bgColor}80, ${cfg.bgColor}40)`,
            borderWidth: 2,
            borderStyle: cfg.borderStyle,
            borderColor: cfg.borderColor,
          }}
        >
          <div className="relative z-10 space-y-3">
            <div className="flex flex-wrap gap-2">
              <span className="text-[8px] uppercase tracking-[0.4em] text-white/50 font-sans bg-white/5 px-2 py-1 rounded">
                {ERA_LABEL[story.era] ?? story.era}
              </span>
              <span className="text-[8px] uppercase tracking-[0.3em] text-white/50 font-sans bg-white/5 px-2 py-1 rounded">
                욕망: {DESIRE_LABEL[story.desire_type] ?? story.desire_type}
              </span>
              <span className="text-[8px] uppercase tracking-[0.3em] font-sans px-2 py-1 rounded"
                style={{ color: cfg.borderColor, background: `${cfg.borderColor}20` }}>
                결말: {TONE_LABEL[story.ending_tone ?? ''] ?? story.ending_tone}
              </span>
            </div>
            <h1 className="text-2xl" style={{ fontFamily: 'var(--font-heading)', background: 'linear-gradient(90deg, var(--color-heading-from), var(--color-heading-to))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{story.confection_name}</h1>
            <p className="text-xs text-white/50 font-sans">
              원형: <span className="text-[#C9A84C]">{story.confection_original}</span>
            </p>
          </div>
        </div>

        {/* 손님 정보 */}
        <section className="mb-8 bg-white/[0.03] border border-white/10 rounded-xl p-5 space-y-2">
          <p className="text-[9px] uppercase tracking-[0.4em] text-[#C9A84C] font-sans font-bold mb-3">손님 정보</p>
          <div className="grid grid-cols-2 gap-3 text-xs font-sans">
            <div><span className="text-white/30">이름</span><br /><span className="text-white">{story.guest_name}</span></div>
            {story.guest_status && <div><span className="text-white/30">신분</span><br /><span className="text-white">{story.guest_status}</span></div>}
            <div><span className="text-white/30">욕망</span><br /><span className="text-white">{story.desire_content}</span></div>
          </div>
        </section>

        {/* 과자 레시피 */}
        <section className="mb-8 bg-white/[0.03] border border-[#C9A84C]/20 rounded-xl p-5 space-y-4">
          <p className="text-[9px] uppercase tracking-[0.4em] text-[#C9A84C] font-sans font-bold">처방 레시피</p>
          <div className="space-y-2 text-sm font-sans">
            <div><span className="text-white/30 text-xs">재료</span>
              <p className="text-white mt-1 leading-relaxed">{story.confection_ingredients}</p>
            </div>
            <div className="border-t border-white/5 pt-2">
              <span className="text-white/30 text-xs">효능</span>
              <p className="text-white mt-1 leading-relaxed">{story.confection_effect}</p>
            </div>
          </div>
          {/* 대가 */}
          <div className="bg-red-950/40 border border-red-500/20 rounded-lg p-4">
            <p className="text-[9px] uppercase tracking-[0.4em] text-red-400 font-sans font-bold mb-2">대가 (治痛藥)</p>
            <p className="text-sm text-red-200 font-serif leading-relaxed italic">"{story.confection_price}"</p>
          </div>
        </section>

        {/* 결말 */}
        <section className="mb-8 bg-white/[0.03] border border-white/10 rounded-xl p-5">
          <p className="text-[9px] uppercase tracking-[0.4em] text-[#C9A84C] font-sans font-bold mb-3">결말</p>
          <blockquote className="font-serif text-sm text-white/90 leading-loose italic border-l-2 border-[#C9A84C]/30 pl-4">
            "{story.ending_content}"
          </blockquote>
        </section>

        {/* 하단 메타 */}
        <div className="flex items-center justify-between text-xs text-white/20 font-sans">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {createdAt}
          </div>
          <div className="flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5" />
            <span>{story.likes_count ?? 0}</span>
          </div>
        </div>

        <div className="mt-8 flex gap-3 justify-center">
          <Link href="/visit" className="px-6 py-2.5 rounded-lg bg-[#C9A84C] text-black font-bold text-xs hover:bg-[#d6b26d] transition-all">
            나도 조제 받으러 가기 →
          </Link>
          <Link href="/gallery" className="px-6 py-2.5 rounded-lg border border-white/10 text-white/60 hover:bg-white/5 text-xs font-sans transition-all">
            ← 갤러리
          </Link>
        </div>
      </main>
    </div>
  );
}

export const dynamic = 'force-dynamic';
