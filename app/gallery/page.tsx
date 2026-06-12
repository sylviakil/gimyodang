'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import AtmosphereEffect from '@/components/ui/AtmosphereEffect';
import StoryCard from '@/components/gallery/StoryCard';
import GalleryFilter from '@/components/gallery/GalleryFilter';
import { Story } from '@/types';
import { Archive, PenLine, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

export default function GalleryPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [era, setEra] = useState('');
  const [desire, setDesire] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const PER_PAGE = 12;

  const fetchStories = useCallback(async (reset = false) => {
    setLoading(true);
    setError(null);
    const currentPage = reset ? 1 : page;
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(PER_PAGE),
        ...(era && { era }),
        ...(desire && { desire_type: desire }),
      });
      const res = await fetch(`/api/stories?${params}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const list: Story[] = data.stories ?? [];
      setStories(reset ? list : (prev) => [...prev, ...list]);
      setHasMore(list.length === PER_PAGE);
      if (reset) setPage(1);
    } catch (e) {
      setError(e instanceof Error ? e.message : '이야기를 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [era, desire, page]);

  useEffect(() => {
    fetchStories(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [era, desire]);

  const loadMore = () => {
    setPage((p) => p + 1);
    fetchStories(false);
  };

  return (
    <div className="relative min-h-screen bg-transparent text-[#E5E5E5] font-serif overflow-hidden">
      <AtmosphereEffect />

      {/* 네비 */}
      <nav className="fixed top-0 left-0 right-0 z-30 flex justify-between items-center px-6 md:px-12 h-16 bg-transparent">
        <Link href="/?intro=1" className="flex items-center gap-3 hover:opacity-80 transition-all">
          <div className="w-7 h-7 bg-[#C9A84C] rotate-45 flex items-center justify-center">
            <div className="w-3.5 h-3.5 bg-black rotate-[-45deg] flex items-center justify-center font-serif text-[8px] text-[#C9A84C] font-bold">奇</div>
          </div>
          <span className="text-base font-serif italic tracking-tight text-white">Gimyodang <span className="text-xs text-[#C9A84C] font-light not-italic">奇妙堂</span></span>
        </Link>
        <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.2em] font-sans">
          <Link href="/visit" className="text-white/40 hover:text-[#C9A84C] transition-colors">손님 모드</Link>
          <Link href="/create" className="text-white/40 hover:text-[#C9A84C] transition-colors flex items-center gap-1">
            <PenLine className="w-3.5 h-3.5" /><span>이야기 창작</span>
          </Link>
        </div>
      </nav>

      <main className="relative z-10 pt-24 pb-16 px-4 md:px-8">
        {/* 헤더 */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 space-y-2">
            <div className="inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.5em] text-[#C9A84C] font-sans font-bold">
              <Archive className="w-3 h-3" />
              <span>궤짝 갤러리</span>
            </div>
            <h1 className="text-2xl font-serif text-white">기묘당 손님들의 이야기</h1>
            <p className="text-xs text-white/40 font-sans">욕망의 처방전. 대가 없는 이야기는 없습니다.</p>
          </div>

          {/* 필터 */}
          <div className="mb-6">
            <GalleryFilter
              filterEra={era}
              filterDesire={desire}
              onEraChange={(v) => { setEra(v); setPage(1); }}
              onDesireChange={(v) => { setDesire(v); setPage(1); }}
              onRefresh={() => fetchStories(true)}
            />
          </div>

          {/* 이야기 그리드 */}
          {loading && stories.length === 0 ? (
            <div className="flex items-center justify-center gap-2 text-white/40 py-24 font-sans text-sm">
              <Loader2 className="w-5 h-5 animate-spin text-[#C9A84C]" />
              궤짝을 열고 있습니다...
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 text-center py-24">
              <AlertCircle className="w-8 h-8 text-red-400/60" />
              <p className="text-red-300/70 text-sm font-sans">{error}</p>
              <button onClick={() => fetchStories(true)} className="text-xs text-[#C9A84C] hover:underline font-sans flex items-center gap-1 cursor-pointer">
                <RefreshCw className="w-3 h-3" /> 다시 시도
              </button>
            </div>
          ) : stories.length === 0 ? (
            <div className="text-center py-24 space-y-3">
              <p className="text-white/30 font-serif text-lg">궤짝이 비어 있습니다.</p>
              <p className="text-white/20 text-xs font-sans">아직 봉인된 이야기가 없습니다.</p>
              <Link href="/create" className="inline-block mt-4 px-6 py-2.5 rounded-lg bg-[#C9A84C] text-black text-xs font-bold hover:bg-[#d6b26d] transition-all">
                첫 이야기를 봉인하러 가기 →
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {stories.map((story) => (
                  <StoryCard key={story.id} story={story} />
                ))}
              </div>

              {hasMore && (
                <div className="mt-10 text-center">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="px-8 py-3 rounded-lg border border-[#C9A84C]/30 text-[#C9A84C] text-xs font-sans uppercase tracking-widest hover:bg-[#C9A84C]/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2 mx-auto"
                  >
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    궤짝 더 열기
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
