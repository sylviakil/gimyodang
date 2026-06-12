'use client';
import { useState, useCallback } from 'react';
import { Settings, X, RotateCcw, Plus, Trash2 } from 'lucide-react';
import {
  useSettings,
  GradientStop, CustomGradient, FontFamily, FontSize,
  FONT_FAMILY_OPTIONS, FONT_SIZE_OPTIONS,
  FONT_FAMILY_MAP, FONT_SIZE_MAP,
  buildCssGradient, DEFAULTS,
} from '@/contexts/SettingsContext';

// ── 유틸 ─────────────────────────────────────────────────
function uid() { return Math.random().toString(36).slice(2, 8); }

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[9px] uppercase tracking-[0.35em] font-sans font-bold mb-1.5"
      style={{ color: 'rgba(255,255,255,0.28)' }}>
      {children}
    </p>
  );
}

function Divider() {
  return <div className="border-t border-white/[0.07] my-4" />;
}

// ── 컬러 피커 인풋 ───────────────────────────────────────
function ColorSwatch({
  color, onChange, size = 'md',
}: {
  color: string; onChange: (c: string) => void; size?: 'sm' | 'md';
}) {
  const dim = size === 'sm' ? 'w-6 h-6' : 'w-8 h-8';
  return (
    <label className={`${dim} rounded-lg border border-white/15 overflow-hidden relative cursor-pointer shrink-0 shadow-inner`}>
      <div className="absolute inset-0" style={{ background: color }} />
      <input
        type="color" value={color}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
      />
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

  const updateStop = (id: string, patch: Partial<GradientStop>) =>
    onChange({ ...gradient, stops: gradient.stops.map((s) => s.id === id ? { ...s, ...patch } : s) });

  const addStop = () => {
    if (gradient.stops.length >= 6) return;
    const positions = sorted.map((s) => s.position);
    let newPos = 50;
    for (let i = 0; i < positions.length - 1; i++) {
      const mid = Math.round((positions[i] + positions[i + 1]) / 2);
      if (!positions.includes(mid)) { newPos = mid; break; }
    }
    onChange({ ...gradient, stops: [...gradient.stops, { id: uid(), color: '#1a2a42', position: newPos }] });
  };

  const removeStop = (id: string) => {
    if (gradient.stops.length <= 2) return;
    onChange({ ...gradient, stops: gradient.stops.filter((s) => s.id !== id) });
  };

  return (
    <div className="space-y-3">

      {/* ① 미리보기 */}
      <div className="relative w-full h-12 rounded-xl border border-white/10 overflow-visible"
        style={{ background: css }}>
        {sorted.map((s) => (
          <div key={s.id}
            className="absolute -bottom-2 flex flex-col items-center"
            style={{ left: `${s.position}%`, transform: 'translateX(-50%)' }}>
            <div className="w-[1.5px] h-12 opacity-25 bg-white" />
            <div className="w-3.5 h-3.5 rounded-full border-2 border-white/60 shadow"
              style={{ background: s.color }} />
          </div>
        ))}
      </div>
      <div className="h-2" />

      {/* ② 타입 */}
      <div className="grid grid-cols-3 gap-1.5">
        {(['linear', 'radial', 'conic'] as const).map((t) => (
          <button key={t}
            onClick={() => onChange({ ...gradient, type: t })}
            className="py-1.5 rounded-lg text-[9px] uppercase tracking-wider font-sans cursor-pointer transition-all"
            style={{
              background: gradient.type === t ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${gradient.type === t ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.07)'}`,
              color: gradient.type === t ? '#fff' : 'rgba(255,255,255,0.3)',
            }}>
            {t === 'linear' ? '선형' : t === 'radial' ? '원형' : '방사형'}
          </button>
        ))}
      </div>

      {/* ③ 각도 (radial 제외) */}
      {gradient.type !== 'radial' && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] text-white/25 font-sans uppercase tracking-wider">각도</span>
            <span className="text-[9px] font-mono" style={{ color: accentColor }}>{gradient.angle}°</span>
          </div>
          <div className="flex items-center gap-2.5">
            {/* 미니 다이얼 */}
            <div className="w-7 h-7 rounded-full border border-white/12 bg-white/[0.04] relative shrink-0 flex items-center justify-center">
              <div className="absolute w-[12px] h-[1.5px] rounded origin-left"
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

      {/* ④ 색상 스톱 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] text-white/25 font-sans uppercase tracking-wider">
            색상 스톱 <span style={{ color: accentColor }}>({gradient.stops.length}/6)</span>
          </span>
          <button onClick={addStop} disabled={gradient.stops.length >= 6}
            className="flex items-center gap-0.5 text-[9px] font-sans transition-colors cursor-pointer disabled:opacity-20"
            style={{ color: accentColor }}>
            <Plus className="w-3 h-3" />추가
          </button>
        </div>

        <div className="space-y-2">
          {sorted.map((stop) => (
            <div key={stop.id} className="flex items-center gap-2">
              <ColorSwatch color={stop.color} onChange={(c) => updateStop(stop.id, { color: c })} />

              <input type="range" min={0} max={100} step={1}
                value={stop.position}
                onChange={(e) => updateStop(stop.id, { position: Number(e.target.value) })}
                className="flex-1 h-[3px] rounded-full appearance-none cursor-pointer"
                style={{ accentColor: stop.color }} />

              {/* hex 직접 입력 */}
              <input type="text" value={stop.color} maxLength={7}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^#[0-9a-fA-F]{0,6}$/.test(v)) updateStop(stop.id, { color: v });
                }}
                className="w-[4.5rem] text-[9px] font-mono px-1.5 py-1 rounded-lg focus:outline-none"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: stop.color,
                }} />

              <span className="text-[9px] font-mono text-white/25 w-6 text-right">{stop.position}%</span>

              <button onClick={() => removeStop(stop.id)} disabled={gradient.stops.length <= 2}
                className="text-white/20 hover:text-red-400 disabled:opacity-10 transition-colors cursor-pointer shrink-0">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ⑤ 생성된 CSS */}
      <div>
        <Label>생성된 CSS</Label>
        <div className="rounded-lg px-3 py-2 text-[8px] font-mono leading-relaxed break-all select-all"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.3)' }}>
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
  const { settings, update, reset } = useSettings();
  const [open, setOpen] = useState(false);
  const [tab, setTab]   = useState<'bg' | 'font' | 'etc'>('bg');
  const accent = settings.accentColor;

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
              {/* 강조색 */}
              <div>
                <Label>강조 색상 (버튼·테두리·아이콘)</Label>
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

              {/* 헤딩 */}
              <FontZoneEditor
                label="헤딩 (타이틀 · 연화 발화)"
                accentColor={accent}
                showGradientToggle
                zone={settings.heading}
                onChange={(patch) => update({ heading: { ...settings.heading, ...patch } as typeof settings.heading })}
              />

              {/* 본문 */}
              <FontZoneEditor
                label="본문 (대화 · 서사 텍스트)"
                accentColor={accent}
                zone={settings.body}
                onChange={(patch) => update({ body: { ...settings.body, ...patch } as typeof settings.body })}
              />

              {/* UI */}
              <FontZoneEditor
                label="UI (버튼 · 라벨 · 네비)"
                accentColor={accent}
                zone={settings.ui}
                onChange={(patch) => update({ ui: { ...settings.ui, ...patch } as typeof settings.ui })}
              />
            </div>
          )}

          {/* ── 기타 탭 ── */}
          {tab === 'etc' && (
            <div className="space-y-4">
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
