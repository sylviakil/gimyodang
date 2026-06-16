'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import { Settings, X, RotateCcw, Trash2 } from 'lucide-react';
import {
  useSettings,
  GradientStop, CustomGradient, FontFamily, FontSize, PageKey,
  FONT_FAMILY_OPTIONS, FONT_SIZE_OPTIONS,
  FONT_FAMILY_MAP, FONT_SIZE_MAP,
  buildCssGradient, DEFAULTS, PAGE_KEYS, PAGE_LABELS,
} from '@/contexts/SettingsContext';

// ── 유틸 ─────────────────────────────────────────────────
function uid() { return Math.random().toString(36).slice(2, 8); }

function Divider() {
  return <div className="border-t border-white/[0.07] my-3" />;
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[9px] uppercase tracking-[0.35em] font-sans font-bold mb-1.5"
      style={{ color: 'rgba(255,255,255,0.28)' }}>
      {children}
    </p>
  );
}

// ── 컬러 스와치 ──────────────────────────────────────────
function ColorSwatch({
  color, onChange, size = 'md',
}: {
  color: string; onChange: (c: string) => void; size?: 'sm' | 'md';
}) {
  const dim = size === 'sm' ? 'w-6 h-6' : 'w-8 h-8';
  return (
    <label className={`${dim} rounded-lg border border-white/15 overflow-hidden relative cursor-pointer shrink-0 shadow-inner`}>
      <div className="absolute inset-0" style={{ background: color }} />
      <input type="color" value={color} onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
    </label>
  );
}

// ── 그라데이션 빌더 ──────────────────────────────────────
function GradientBuilder({
  gradient, onChange, accentColor,
}: {
  gradient: CustomGradient;
  onChange: (g: CustomGradient) => void;
  accentColor: string;
}) {
  const css = buildCssGradient(gradient);
  const sorted = [...gradient.stops].sort((a, b) => a.position - b.position);
  const [selectedId, setSelectedId] = useState<string>(gradient.stops[0]?.id ?? '');
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const selectedStop = gradient.stops.find((s) => s.id === selectedId) ?? sorted[0];

  const updateStop = (id: string, patch: Partial<GradientStop>) =>
    onChange({ ...gradient, stops: gradient.stops.map((s) => s.id === id ? { ...s, ...patch } : s) });

  const removeStop = (id: string) => {
    if (gradient.stops.length <= 2) return;
    const remaining = gradient.stops.filter((s) => s.id !== id);
    onChange({ ...gradient, stops: remaining });
    setSelectedId(remaining[0].id);
  };

  // 마커 드래그 시작
  const handleMarkerMouseDown = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedId(id);
    setDraggingId(id);

    const onMove = (me: MouseEvent) => {
      const rect = barRef.current?.getBoundingClientRect();
      if (!rect) return;
      const pos = Math.min(100, Math.max(0, Math.round(((me.clientX - rect.left) / rect.width) * 100)));
      onChange({
        ...gradient,
        stops: gradient.stops.map((s) => s.id === id ? { ...s, position: pos } : s),
      });
    };
    const onUp = () => {
      setDraggingId(null);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  // 그라데이션 바 클릭 → 새 스톱 추가 (드래그 중엔 무시)
  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (draggingId || gradient.stops.length >= 6) return;
    const rect = barRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pos = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const nearColor = sorted.reduce((prev, cur) =>
      Math.abs(cur.position - pos) < Math.abs(prev.position - pos) ? cur : prev
    ).color;
    const newStop: GradientStop = { id: uid(), color: nearColor, position: pos };
    onChange({ ...gradient, stops: [...gradient.stops, newStop] });
    setSelectedId(newStop.id);
  };

  return (
    <div className="space-y-3">

      {/* ① 컬러 피커 — 선택된 스톱의 색상 */}
      <div className="rounded-xl p-3 space-y-2.5"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center justify-between">
          <span className="text-[9px] uppercase tracking-[0.35em] font-sans font-bold"
            style={{ color: 'rgba(255,255,255,0.28)' }}>
            색상 선택
          </span>
          {selectedStop && (
            <span className="text-[9px] font-mono" style={{ color: accentColor }}>
              {selectedStop.position}% 스톱
            </span>
          )}
        </div>

        {selectedStop ? (
          <div className="flex items-center gap-3">
            {/* 큰 컬러 피커 */}
            <label className="w-12 h-12 rounded-xl border-2 border-white/20 overflow-hidden relative cursor-pointer shadow-lg shrink-0"
              style={{ background: selectedStop.color }}>
              <input type="color" value={selectedStop.color}
                onChange={(e) => updateStop(selectedStop.id, { color: e.target.value })}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
            </label>
            <div className="flex-1 space-y-1.5">
              {/* hex 입력 */}
              <input type="text" value={selectedStop.color} maxLength={7}
                onChange={(e) => {
                  if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value))
                    updateStop(selectedStop.id, { color: e.target.value });
                }}
                className="w-full text-[10px] font-mono px-2 py-1.5 rounded-lg focus:outline-none"
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: `1px solid ${accentColor}40`,
                  color: selectedStop.color,
                }} />
              {/* 위치 슬라이더 */}
              <div className="flex items-center gap-2">
                <input type="range" min={0} max={100} step={1}
                  value={selectedStop.position}
                  onChange={(e) => updateStop(selectedStop.id, { position: Number(e.target.value) })}
                  className="flex-1 h-[3px] rounded-full appearance-none cursor-pointer"
                  style={{ accentColor: selectedStop.color }} />
                <span className="text-[9px] font-mono text-white/30 w-7 text-right shrink-0">
                  {selectedStop.position}%
                </span>
              </div>
            </div>
            <button onClick={() => removeStop(selectedStop.id)}
              disabled={gradient.stops.length <= 2}
              className="p-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-20 shrink-0"
              style={{ color: 'rgba(255,100,100,0.5)' }}
              onMouseOver={(e) => (e.currentTarget.style.color = '#f87171')}
              onMouseOut={(e)  => (e.currentTarget.style.color = 'rgba(255,100,100,0.5)')}>
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <p className="text-[9px] text-white/20 font-sans">바에서 스톱을 선택하세요</p>
        )}
      </div>

      {/* ② 그라데이션 바 — 클릭으로 추가, 마커 클릭으로 선택 */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[9px] uppercase tracking-[0.35em] font-sans font-bold"
            style={{ color: 'rgba(255,255,255,0.28)' }}>
            그라데이션
          </span>
          <span className="text-[9px] font-sans" style={{ color: 'rgba(255,255,255,0.2)' }}>
            빈 곳 클릭 = 추가 <span style={{ color: accentColor }}>({gradient.stops.length}/6)</span>
          </span>
        </div>

        {/* 바 */}
        <div className="relative pb-5">
          <div
            ref={barRef}
            onClick={handleBarClick}
            className="w-full h-10 rounded-xl border border-white/10 cursor-crosshair"
            style={{ background: css, opacity: 0.5 }}
          />
          {/* 스톱 마커 */}
          {sorted.map((s) => (
            <div
              key={s.id}
              onMouseDown={(e) => handleMarkerMouseDown(e, s.id)}
              className="absolute bottom-0 flex flex-col items-center select-none"
              style={{
                left: `${s.position}%`,
                transform: 'translateX(-50%)',
                cursor: draggingId === s.id ? 'grabbing' : 'grab',
                zIndex: selectedId === s.id ? 10 : 1,
              }}>
              {/* 수직선 */}
              <div className="w-px h-4 transition-colors"
                style={{
                  background: selectedId === s.id ? accentColor : 'rgba(255,255,255,0.3)',
                  opacity: selectedId === s.id ? 1 : 0.5,
                }} />
              {/* 마커 원 */}
              <div className="w-4 h-4 rounded-full border-2 shadow-lg transition-transform"
                style={{
                  background: s.color,
                  borderColor: selectedId === s.id ? accentColor : 'rgba(255,255,255,0.5)',
                  transform: selectedId === s.id ? 'scale(1.3)' : 'scale(1)',
                }} />
            </div>
          ))}
        </div>
      </div>

      <Divider />

      {/* ③ 각도 조절 (radial 제외) */}
      {gradient.type !== 'radial' && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase tracking-[0.35em] font-sans font-bold"
              style={{ color: 'rgba(255,255,255,0.28)' }}>각도</span>
            <span className="text-[9px] font-mono" style={{ color: accentColor }}>{gradient.angle}°</span>
          </div>
          <div className="flex items-center gap-2.5">
            {/* 다이얼 */}
            <div className="w-8 h-8 rounded-full border border-white/12 bg-white/[0.04] relative shrink-0 flex items-center justify-center">
              <div className="absolute w-[13px] h-[1.5px] rounded origin-left"
                style={{
                  background: accentColor,
                  left: '50%', top: '50%',
                  transform: `translateY(-50%) rotate(${gradient.angle}deg)`,
                }} />
              <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
            </div>
            <input type="range" min={0} max={360} step={5}
              value={gradient.angle}
              onChange={(e) => onChange({ ...gradient, angle: Number(e.target.value) })}
              className="flex-1 h-[3px] rounded-full appearance-none cursor-pointer"
              style={{ accentColor }} />
          </div>
        </div>
      )}

      {/* ④ 타입 선택 */}
      <div className="grid grid-cols-3 gap-1.5">
        {(['linear', 'radial', 'conic'] as const).map((t) => (
          <button key={t}
            onClick={() => onChange({ ...gradient, type: t })}
            className="py-2 rounded-xl text-[9px] font-sans cursor-pointer transition-all"
            style={{
              background: gradient.type === t ? `${accentColor}18` : 'rgba(255,255,255,0.03)',
              border: `1px solid ${gradient.type === t ? accentColor + '55' : 'rgba(255,255,255,0.07)'}`,
              color: gradient.type === t ? accentColor : 'rgba(255,255,255,0.3)',
            }}>
            {t === 'linear' ? '선형' : t === 'radial' ? '원형' : '방사형'}
          </button>
        ))}
      </div>

      {/* ⑤ 생성된 CSS */}
      <div className="space-y-1">
        <span className="text-[9px] uppercase tracking-[0.35em] font-sans font-bold"
          style={{ color: 'rgba(255,255,255,0.28)' }}>생성된 CSS</span>
        <div className="rounded-xl px-3 py-2.5 text-[8px] font-mono leading-relaxed break-all select-all"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            color: 'rgba(255,255,255,0.28)',
          }}>
          {css}
        </div>
      </div>
    </div>
  );
}

// ── 폰트 영역 편집기 ─────────────────────────────────────
function FontZoneEditor({
  label,
  zone,
  accentColor,
  showGradientToggle,
  onChange,
}: {
  label: string;
  accentColor: string;
  showGradientToggle?: boolean;
  zone: {
    family: FontFamily; size: FontSize; color?: string;
    colorStart?: string; colorEnd?: string; useGradient?: boolean;
  };
  onChange: (patch: Partial<typeof zone>) => void;
}) {
  const preview = zone.family ? FONT_FAMILY_MAP[zone.family] : undefined;

  return (
    <div className="rounded-xl p-3 space-y-2.5"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>

      {/* 영역 타이틀 미리보기 */}
      <div className="flex items-center justify-between">
        <span className="text-[9px] uppercase tracking-widest font-sans" style={{ color: accentColor }}>
          {label}
        </span>
        <span className="text-xs" style={{
          fontFamily: preview,
          ...(showGradientToggle && zone.useGradient && zone.colorStart && zone.colorEnd ? {
            background: `linear-gradient(90deg, ${zone.colorStart}, ${zone.colorEnd})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          } : { color: zone.color || '#fff' }),
        }}>
          기묘당 奇妙堂
        </span>
      </div>

      {/* 폰트 종류 */}
      <div className="grid grid-cols-4 gap-1">
        {FONT_FAMILY_OPTIONS.map((opt) => (
          <button key={opt.value}
            onClick={() => onChange({ family: opt.value })}
            className="py-1 rounded text-[8px] font-sans cursor-pointer transition-all truncate"
            style={{
              background: zone.family === opt.value ? `${accentColor}20` : 'rgba(255,255,255,0.04)',
              border: `1px solid ${zone.family === opt.value ? accentColor + '60' : 'rgba(255,255,255,0.08)'}`,
              color: zone.family === opt.value ? accentColor : 'rgba(255,255,255,0.35)',
              fontFamily: FONT_FAMILY_MAP[opt.value],
            }}>
            {opt.label}
          </button>
        ))}
      </div>

      {/* 폰트 크기 */}
      <div className="flex items-center gap-1.5">
        <span className="text-[8px] text-white/25 font-sans shrink-0">크기</span>
        <div className="flex gap-1">
          {FONT_SIZE_OPTIONS.map((opt) => (
            <button key={opt.value}
              onClick={() => onChange({ size: opt.value })}
              className="w-7 h-5 rounded text-[8px] font-mono cursor-pointer transition-all"
              style={{
                background: zone.size === opt.value ? `${accentColor}20` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${zone.size === opt.value ? accentColor + '60' : 'rgba(255,255,255,0.08)'}`,
                color: zone.size === opt.value ? accentColor : 'rgba(255,255,255,0.3)',
              }}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 색상 */}
      {showGradientToggle ? (
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[8px] text-white/25 font-sans">그라데이션</span>
            <button
              onClick={() => onChange({ useGradient: !zone.useGradient })}
              className="relative w-8 h-4 rounded-full transition-all cursor-pointer"
              style={{ background: zone.useGradient ? `${accentColor}80` : 'rgba(255,255,255,0.1)' }}>
              <div className="absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all"
                style={{ left: zone.useGradient ? '18px' : '2px' }} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <ColorSwatch size="sm" color={zone.colorStart || '#ffffff'}
              onChange={(c) => onChange({ colorStart: c })} />
            <div className="flex-1 h-[2px] rounded"
              style={{ background: `linear-gradient(90deg, ${zone.colorStart}, ${zone.colorEnd})` }} />
            <ColorSwatch size="sm" color={zone.colorEnd || '#ffffff'}
              onChange={(c) => onChange({ colorEnd: c })} />
            <span className="text-[8px] text-white/20 font-sans">시작 → 끝</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-[8px] text-white/25 font-sans shrink-0">색상</span>
          <ColorSwatch size="sm" color={zone.color || '#ffffff'} onChange={(c) => onChange({ color: c })} />
          <input type="text" value={zone.color || ''} maxLength={7}
            onChange={(e) => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) onChange({ color: e.target.value }); }}
            className="flex-1 text-[9px] font-mono px-1.5 py-1 rounded focus:outline-none"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: zone.color || '#fff',
            }} />
        </div>
      )}
    </div>
  );
}

// ── 메인 AdminPanel ──────────────────────────────────────
export default function AdminPanel() {
  const { settings, update, updatePageFont, reset, activePage, setActivePage } = useSettings();
  const [open, setOpen] = useState(false);
  const [tab, setTab]   = useState<'bg' | 'font' | 'etc'>('bg');
  const accent = settings.accentColor;
  // 폰트/색상 탭에서 편집 중인 페이지 — 기본은 지금 보고 있는 페이지, 칩으로 다른 페이지도 편집 가능
  const [editingPage, setEditingPage] = useState<PageKey>(activePage);
  useEffect(() => { setEditingPage(activePage); }, [activePage]);
  const editingFonts = settings.pageFonts[editingPage] ?? DEFAULTS.pageFonts[editingPage];

  const handleGradient = useCallback(
    (g: CustomGradient) => update({ gradient: g }),
    [update],
  );

  return (
    <>
      {/* 플로팅 버튼 */}
      <button
        onClick={() => setOpen((v) => !v)}
        title="관리자 설정"
        className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 cursor-pointer"
        style={{
          background: 'linear-gradient(135deg,rgba(14,22,40,0.95),rgba(6,10,20,0.98))',
          border: `1.5px solid ${accent}50`,
          boxShadow: `0 0 20px ${accent}22`,
        }}>
        <Settings className="w-4 h-4 transition-transform duration-500"
          style={{ color: accent, transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }} />
      </button>

      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}

      {/* 패널 */}
      <div
        className={`fixed bottom-20 right-6 z-50 w-80 rounded-2xl shadow-2xl flex flex-col transition-all duration-300 origin-bottom-right ${
          open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
        }`}
        style={{
          background: 'linear-gradient(160deg,rgba(12,18,34,0.98) 0%,rgba(6,10,20,0.99) 100%)',
          border: `1px solid ${accent}22`,
          backdropFilter: 'blur(28px)',
          maxHeight: 'calc(100vh - 100px)',
        }}>

        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 py-3 border-b shrink-0"
          style={{ borderColor: `${accent}15` }}>
          <div className="flex items-center gap-2">
            <Settings className="w-3.5 h-3.5" style={{ color: accent }} />
            <span className="text-xs font-sans font-bold text-white/75 tracking-wider">관리자 설정</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={reset} title="전체 초기화"
              className="p-1.5 rounded hover:bg-white/10 transition-colors cursor-pointer text-white/25 hover:text-white/60">
              <RotateCcw className="w-3 h-3" />
            </button>
            <button onClick={() => setOpen(false)}
              className="p-1.5 rounded hover:bg-white/10 transition-colors cursor-pointer text-white/25 hover:text-white/60">
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* 탭 */}
        <div className="flex shrink-0 border-b" style={{ borderColor: `${accent}10` }}>
          {([{ id: 'bg', label: '배경' }, { id: 'font', label: '폰트/색상' }, { id: 'etc', label: '기타' }] as const).map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex-1 py-2 text-[9px] font-sans uppercase tracking-widest cursor-pointer transition-all"
              style={{
                color:        tab === t.id ? accent : 'rgba(255,255,255,0.22)',
                borderBottom: tab === t.id ? `1.5px solid ${accent}` : '1.5px solid transparent',
                background:   tab === t.id ? `${accent}08`           : 'transparent',
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* 스크롤 콘텐츠 */}
        <div className="overflow-y-auto flex-1 px-4 py-4 space-y-4">

          {/* ── 배경 탭 ── */}
          {tab === 'bg' && (
            <GradientBuilder
              gradient={settings.gradient}
              onChange={handleGradient}
              accentColor={accent}
            />
          )}

          {/* ── 폰트/색상 탭 ── */}
          {tab === 'font' && (
            <div className="space-y-3">
              {/* 강조색 — 전체 공통 */}
              <div>
                <Label>강조 색상 (전체 공통 · 버튼·테두리·아이콘)</Label>
                <div className="flex items-center gap-2">
                  <ColorSwatch color={settings.accentColor}
                    onChange={(c) => update({ accentColor: c })} />
                  <input type="text" value={settings.accentColor} maxLength={7}
                    onChange={(e) => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) update({ accentColor: e.target.value }); }}
                    className="flex-1 text-[9px] font-mono px-2 py-1.5 rounded-lg focus:outline-none"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: settings.accentColor,
                    }} />
                  {/* 빠른 선택 */}
                  {['#C9A84C','#5a8fc0','#c07080','#5a9a80','#9ba8b5'].map((c) => (
                    <button key={c} onClick={() => update({ accentColor: c })}
                      className="w-5 h-5 rounded-full border cursor-pointer transition-all"
                      style={{
                        background: c,
                        borderColor: settings.accentColor === c ? '#fff' : 'transparent',
                        transform: settings.accentColor === c ? 'scale(1.2)' : 'scale(1)',
                      }} />
                  ))}
                </div>
              </div>

              <Divider />

              {/* 페이지 선택 — 이 아래 설정은 선택된 페이지에만 적용됨 */}
              <div>
                <Label>편집할 페이지 선택</Label>
                <p className="text-[8px] text-white/25 font-sans mb-2 leading-relaxed">
                  아래 헤딩·본문·UI 설정은 선택한 페이지에만 적용됩니다. 페이지마다 독립적으로 다르게 꾸밀 수 있습니다.
                  {editingPage === activePage && (
                    <span style={{ color: accent }}> (지금 보고 있는 페이지가 자동 선택됨)</span>
                  )}
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {PAGE_KEYS.map((key) => (
                    <button key={key}
                      onClick={() => setEditingPage(key)}
                      className="py-1.5 rounded-lg text-[9px] font-sans cursor-pointer transition-all truncate flex items-center justify-center gap-1"
                      style={{
                        background: editingPage === key ? `${accent}20` : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${editingPage === key ? accent + '60' : 'rgba(255,255,255,0.08)'}`,
                        color: editingPage === key ? accent : 'rgba(255,255,255,0.35)',
                      }}>
                      {key === activePage && <span className="w-1 h-1 rounded-full" style={{ background: accent }} />}
                      {PAGE_LABELS[key]}
                    </button>
                  ))}
                </div>
              </div>

              <Divider />

              {/* 헤딩 */}
              <FontZoneEditor
                label={`헤딩 — ${PAGE_LABELS[editingPage]}의 큰 제목`}
                accentColor={accent}
                showGradientToggle
                zone={editingFonts.heading}
                onChange={(patch) => updatePageFont(editingPage, 'heading', patch)}
              />

              {/* 본문 */}
              <FontZoneEditor
                label={`본문 — ${PAGE_LABELS[editingPage]}의 대화·서사 텍스트`}
                accentColor={accent}
                zone={editingFonts.body}
                onChange={(patch) => updatePageFont(editingPage, 'body', patch)}
              />

              {/* UI */}
              <FontZoneEditor
                label={`UI — ${PAGE_LABELS[editingPage]}의 버튼·라벨·네비`}
                accentColor={accent}
                zone={editingFonts.ui}
                onChange={(patch) => updatePageFont(editingPage, 'ui', patch)}
              />
            </div>
          )}

          {/* ── 기타 탭 ── */}
          {tab === 'etc' && (
            <div className="space-y-4">
              <div className="rounded-xl p-3 space-y-2.5"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <Label>"기묘당에 들어서다" 버튼</Label>

                {/* 미리보기 */}
                <div className="flex items-center justify-center py-2 rounded-lg"
                  style={{ background: 'rgba(0,0,0,0.25)' }}>
                  <span className="px-4 py-1.5 rounded text-black text-[10px] font-bold tracking-widest uppercase"
                    style={{ background: settings.enterButtonColor, opacity: settings.enterButtonOpacity }}>
                    기묘당에 들어서다
                  </span>
                </div>

                {/* 색상 피커 */}
                <div className="flex items-center gap-2">
                  <span className="text-[8px] text-white/25 font-sans shrink-0">색상</span>
                  <ColorSwatch size="sm" color={settings.enterButtonColor}
                    onChange={(c) => update({ enterButtonColor: c })} />
                  <input type="text" value={settings.enterButtonColor} maxLength={7}
                    onChange={(e) => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) update({ enterButtonColor: e.target.value }); }}
                    className="flex-1 text-[9px] font-mono px-2 py-1 rounded-lg focus:outline-none"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: settings.enterButtonColor,
                    }} />
                </div>

                {/* 투명도 */}
                <div className="flex items-center gap-3">
                  <span className="text-[8px] text-white/25 font-sans shrink-0">투명도</span>
                  <input type="range" min={10} max={100} step={5}
                    value={Math.round(settings.enterButtonOpacity * 100)}
                    onChange={(e) => update({ enterButtonOpacity: Number(e.target.value) / 100 })}
                    className="flex-1 h-[3px] rounded-full appearance-none cursor-pointer"
                    style={{ accentColor: accent }} />
                  <span className="text-[10px] font-mono w-9 text-right" style={{ color: accent }}>
                    {Math.round(settings.enterButtonOpacity * 100)}%
                  </span>
                </div>
              </div>

              <div>
                <Label>카드/패널 불투명도</Label>
                <div className="flex items-center gap-3">
                  <input type="range" min={20} max={90} step={5}
                    value={Math.round(settings.cardOpacity * 100)}
                    onChange={(e) => update({ cardOpacity: Number(e.target.value) / 100 })}
                    className="flex-1 h-[3px] rounded-full appearance-none cursor-pointer"
                    style={{ accentColor: accent }} />
                  <span className="text-[10px] font-mono w-8 text-right" style={{ color: accent }}>
                    {Math.round(settings.cardOpacity * 100)}%
                  </span>
                </div>
              </div>
              <div>
                <Label>꽃잎 파티클 수</Label>
                <div className="flex items-center gap-3">
                  <input type="range" min={0} max={24} step={4}
                    value={settings.particleCount}
                    onChange={(e) => update({ particleCount: Number(e.target.value) })}
                    className="flex-1 h-[3px] rounded-full appearance-none cursor-pointer"
                    style={{ accentColor: accent }} />
                  <span className="text-[10px] font-mono w-8 text-right" style={{ color: accent }}>
                    {settings.particleCount}개
                  </span>
                </div>
              </div>
              <div>
                <Label>애니메이션 속도</Label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['slow', 'normal', 'fast'] as const).map((s) => (
                    <button key={s}
                      onClick={() => update({ animationSpeed: s })}
                      className="py-1.5 rounded-lg text-[9px] font-sans cursor-pointer transition-all uppercase tracking-wider"
                      style={{
                        background: settings.animationSpeed === s ? `${accent}20` : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${settings.animationSpeed === s ? accent + '55' : 'rgba(255,255,255,0.08)'}`,
                        color: settings.animationSpeed === s ? accent : 'rgba(255,255,255,0.35)',
                      }}>
                      {s === 'slow' ? '느리게' : s === 'normal' ? '보통' : '빠르게'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="px-4 py-2.5 border-t shrink-0 flex items-center justify-between"
          style={{ borderColor: `${accent}10` }}>
          <span className="text-[7px] font-sans uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
            기묘당 관리 설정 v3.0
          </span>
          <button onClick={reset}
            className="text-[8px] font-sans uppercase tracking-widest transition-colors cursor-pointer"
            style={{ color: 'rgba(255,255,255,0.2)' }}
            onMouseOver={(e) => (e.currentTarget.style.color = accent)}
            onMouseOut={(e)  => (e.currentTarget.style.color = 'rgba(255,255,255,0.2)')}>
            전체 초기화
          </button>
        </div>
      </div>
    </>
  );
}
