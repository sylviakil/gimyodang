'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// ── 타입 ─────────────────────────────────────────────────
export type FontFamily = 'myeongjo' | 'gothic' | 'garamond' | 'mono';
export type FontSize   = 'sm' | 'md' | 'lg' | 'xl';

export interface GradientStop {
  id: string;
  color: string;
  position: number; // 0–100
}

export interface CustomGradient {
  type: 'linear' | 'radial' | 'conic';
  angle: number;   // linear/conic 전용 (deg)
  stops: GradientStop[];
}

/** 폰트 영역 3종 */
export interface FontConfig {
  family: FontFamily;
  size: FontSize;
  color: string;          // 본문·UI는 단색
}

/** 헤딩은 그라데이션 텍스트 지원 */
export interface HeadingConfig {
  family: FontFamily;
  size: FontSize;
  colorStart: string;
  colorEnd: string;
  useGradient: boolean;
}

export interface SiteSettings {
  // 배경
  gradient: CustomGradient;
  // 폰트 3영역
  heading: HeadingConfig;   // h1~h3, 연화 발화, 타이틀
  body: FontConfig;         // 일반 본문 텍스트
  ui: FontConfig;           // 버튼, 라벨, 네비, 뱃지
  // 강조색 (버튼·테두리·아이콘)
  accentColor: string;
  // 기타
  cardOpacity: number;
  particleCount: number;
  animationSpeed: 'slow' | 'normal' | 'fast';
}

// ── 기본값 ──────────────────────────────────────────────
export const DEFAULTS: SiteSettings = {
  gradient: {
    type: 'linear',
    angle: 160,
    stops: [
      { id: 'a', color: '#02040a', position: 0   },
      { id: 'b', color: '#0d1628', position: 40  },
      { id: 'c', color: '#1a2a42', position: 70  },
      { id: 'd', color: '#02040a', position: 100 },
    ],
  },
  heading: {
    family: 'myeongjo',
    size: 'xl',
    colorStart: '#C9A84C',
    colorEnd: '#e8c97a',
    useGradient: true,
  },
  body: {
    family: 'myeongjo',
    size: 'md',
    color: '#E0D8CC',
  },
  ui: {
    family: 'gothic',
    size: 'sm',
    color: '#A0A8B0',
  },
  accentColor: '#C9A84C',
  cardOpacity: 0.5,
  particleCount: 12,
  animationSpeed: 'normal',
};

// ── 상수 ────────────────────────────────────────────────
export const FONT_FAMILY_MAP: Record<FontFamily, string> = {
  myeongjo: "'Nanum Myeongjo', Georgia, serif",
  gothic:   "'Nanum Gothic', sans-serif",
  garamond: "Garamond, 'EB Garamond', Georgia, serif",
  mono:     "'Courier New', Courier, monospace",
};

export const FONT_SIZE_MAP: Record<FontSize, string> = {
  sm: '12px',
  md: '14px',
  lg: '16px',
  xl: '18px',
};

export const FONT_FAMILY_OPTIONS: { value: FontFamily; label: string }[] = [
  { value: 'myeongjo', label: '나눔명조' },
  { value: 'gothic',   label: '나눔고딕' },
  { value: 'garamond', label: '개러몬드' },
  { value: 'mono',     label: '모노' },
];

export const FONT_SIZE_OPTIONS: { value: FontSize; label: string }[] = [
  { value: 'sm', label: '12' },
  { value: 'md', label: '14' },
  { value: 'lg', label: '16' },
  { value: 'xl', label: '18' },
];

// ── 그라데이션 CSS 생성 ──────────────────────────────────
export function buildCssGradient(g: CustomGradient): string {
  const sorted = [...g.stops].sort((a, b) => a.position - b.position);
  const stops  = sorted.map((s) => `${s.color} ${s.position}%`).join(', ');
  if (g.type === 'linear') return `linear-gradient(${g.angle}deg, ${stops})`;
  if (g.type === 'conic')  return `conic-gradient(from ${g.angle}deg at center, ${stops})`;
  return `radial-gradient(ellipse at center, ${stops})`;
}

/** 헤딩 텍스트 그라데이션 CSS (인라인 style 적용용) */
export function buildHeadingStyle(h: HeadingConfig): React.CSSProperties {
  if (!h.useGradient) {
    return { color: h.colorStart, fontFamily: FONT_FAMILY_MAP[h.family], fontSize: FONT_SIZE_MAP[h.size] };
  }
  return {
    background: `linear-gradient(90deg, ${h.colorStart}, ${h.colorEnd})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontFamily: FONT_FAMILY_MAP[h.family],
    fontSize: FONT_SIZE_MAP[h.size],
  };
}

// ── Context ──────────────────────────────────────────────
interface SettingsCtx {
  settings: SiteSettings;
  update: (patch: Partial<SiteSettings>) => void;
  reset: () => void;
}

const Ctx = createContext<SettingsCtx>({
  settings: DEFAULTS,
  update: () => {},
  reset: () => {},
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULTS);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('gimyo_settings_v3');
      if (saved) setSettings({ ...DEFAULTS, ...JSON.parse(saved) });
    } catch {}
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    // 강조색
    root.style.setProperty('--accent',       settings.accentColor);
    root.style.setProperty('--card-opacity', String(settings.cardOpacity));

    // 본문 폰트 → body
    document.body.style.fontFamily = FONT_FAMILY_MAP[settings.body.family];
    document.body.style.fontSize   = FONT_SIZE_MAP[settings.body.size];
    document.body.style.color      = settings.body.color;

    // CSS 변수로 폰트 3영역 전달
    root.style.setProperty('--font-heading',       FONT_FAMILY_MAP[settings.heading.family]);
    root.style.setProperty('--font-size-heading',  FONT_SIZE_MAP[settings.heading.size]);
    root.style.setProperty('--font-body',          FONT_FAMILY_MAP[settings.body.family]);
    root.style.setProperty('--font-size-body',     FONT_SIZE_MAP[settings.body.size]);
    root.style.setProperty('--font-ui',            FONT_FAMILY_MAP[settings.ui.family]);
    root.style.setProperty('--font-size-ui',       FONT_SIZE_MAP[settings.ui.size]);
    root.style.setProperty('--color-body',         settings.body.color);
    root.style.setProperty('--color-ui',           settings.ui.color);
    root.style.setProperty('--color-heading-from', settings.heading.colorStart);
    root.style.setProperty('--color-heading-to',   settings.heading.colorEnd);

    // 배경
    document.body.style.background           = buildCssGradient(settings.gradient);
    document.body.style.backgroundAttachment = 'fixed';
  }, [settings]);

  const update = (patch: Partial<SiteSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      try { localStorage.setItem('gimyo_settings_v3', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const reset = () => {
    setSettings(DEFAULTS);
    try { localStorage.removeItem('gimyo_settings_v3'); } catch {}
  };

  return <Ctx.Provider value={{ settings, update, reset }}>{children}</Ctx.Provider>;
}

export const useSettings = () => useContext(Ctx);
