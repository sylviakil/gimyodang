'use client';
import { RefreshCw, Filter } from 'lucide-react';

interface GalleryFilterProps {
  filterEra: string;
  filterDesire: string;
  onEraChange: (v: string) => void;
  onDesireChange: (v: string) => void;
  onRefresh: () => void;
}

export default function GalleryFilter({
  filterEra,
  filterDesire,
  onEraChange,
  onDesireChange,
  onRefresh,
}: GalleryFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 bg-white/5 backdrop-blur-md p-2 rounded-lg border border-white/10 text-xs text-white shadow-xl">
      <div className="flex items-center gap-1.5 text-[#C9A84C] px-2 font-bold font-sans">
        <Filter className="w-3.5 h-3.5" />
        <span>필터</span>
      </div>

      <select
        value={filterEra}
        onChange={(e) => onEraChange(e.target.value)}
        className="bg-zinc-900/80 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#C9A84C] font-sans"
      >
        <option value="all">시대 전체</option>
        <option value="joseon">조선 (朝鮮)</option>
        <option value="modern">현대 (現代)</option>
      </select>

      <select
        value={filterDesire}
        onChange={(e) => onDesireChange(e.target.value)}
        className="bg-zinc-900/80 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#C9A84C] font-sans"
      >
        <option value="all">욕망 전체</option>
        <option value="①">① 지움 (망각)</option>
        <option value="②">② 강함 (권력)</option>
        <option value="③">③ 연결 (사랑)</option>
        <option value="④">④ 복수 (응징)</option>
        <option value="⑤">⑤ 진실 (앎)</option>
        <option value="⑥">⑥ 회귀 (탈환)</option>
        <option value="⑦">⑦ 해방 (탈출)</option>
      </select>

      <button
        onClick={onRefresh}
        className="p-1.5 hover:bg-white/5 rounded transition-all text-white/40 hover:text-white cursor-pointer"
        title="다시 갱신"
      >
        <RefreshCw className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
