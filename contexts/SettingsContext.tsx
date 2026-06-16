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

/** 페이지별 식별자 — 각 페이지가 독립된 폰트/색상 설정을 가진다 */
export type PageKey = 'intro' | 'door' | 'enter' | 'guest' | 'desire' | 'dialog' | 'recipe' | 'create' | 'gallery' | 'story';

export const PAGE_KEYS: PageKey[] = ['intro', 'door', 'enter', 'guest', 'desire', 'dialog', 'recipe', 'create', 'gallery', 'story'];

export const PAGE_LABELS: Record<PageKey, string> = {
  intro:   '문 앞 (인트로)',
  door:    '길목 (시대 선택)',
  enter:   '기묘당 문 (진입 준비)',
  guest:   '손님 수결',
  desire:  '욕망 고백',
  dialog:  '조제 대화',
  recipe:  '처방',
  create:  '이야기 창작',
  gallery: '궤짝 갤러리',
  story:   '이야기 상세',
};

/** 페이지 1개가 갖는 폰트 3영역 묶음 */
export interface PageFontSet {
  heading: HeadingConfig;   // h1~h3, 연화 발화, 타이틀
  body: FontConfig;         // 일반 본문 텍스트
  ui: FontConfig;           // 버튼, 라벨, 네비, 뱃지
}

export interface SiteSettings {
  // 배경
  gradient: CustomGradient;
  // 페이지별 폰트/색상 (10개 페이지 각각 독립)
  pageFonts: Record<PageKey, PageFontSet>;
  // 강조색 (버튼·테두리·아이콘)
  accentColor: string;
  // 인트로 "기묘당에 들어서다" 버튼
  enterButtonColor: string;
  enterButtonOpacity: number;
  // 기타
  cardOpacity: number;
  particleCount: number;
  animationSpeed: 'slow' | 'normal' | 'fast';
}

// ── 기본값 ──────────────────────────────────────────────
const DEFAULT_PAGE_FONT_SET: PageFontSet = {
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
};

function buildDefaultPageFonts(): Record<PageKey, PageFontSet> {
  const out = {} as Record<PageKey, PageFontSet>;
  for (const key of PAGE_KEYS) {
    out[key] = {
      heading: { ...DEFAULT_PAGE_FONT_SET.heading },
      body:    { ...DEFAULT_PAGE_FONT_SET.body },
      ui:      { ...DEFAULT_PAGE_FONT_SET.ui },
    };
  }
  return out;
}

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
  pageFonts: buildDefaultPageFonts(),
  accentColor: '#C9A84C',
  enterButtonColor: '#C9A84C',
  enterButtonOpacity: 1,
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
  updatePageFont: (page: PageKey, zone: 'heading' | 'body' | 'ui', patch: Record<string, unknown>) => void;
  reset: () => void;
  activePage: PageKey;
  setActivePage: (page: PageKey) => void;
}

const Ctx = createContext<SettingsCtx>({
  settings: DEFAULTS,
  update: () => {},
  updatePageFont: () => {},
  reset: () => {},
  activePage: 'intro',
  setActivePage: () => {},
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULTS);
  const [activePage, setActivePage] = useState<PageKey>('intro');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('gimyo_settings_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings({
          ...DEFAULTS,
          ...parsed,
          // 구버전 저장값 호환: pageFonts가 없으면 기본값으로 채움
          pageFonts: { ...DEFAULTS.pageFonts, ...(parsed.pageFonts ?? {}) },
        });
      }
    } catch {}
  }, []);

  // 현재 활성 페이지의 폰트셋 (없으면 기본값)
  const activeFonts = settings.pageFonts[activePage] ?? DEFAULT_PAGE_FONT_SET;

  useEffect(() => {
    const root = document.documentElement;

    // 강조색
    root.style.setProperty('--accent',       settings.accentColor);
    root.style.setProperty('--card-opacity', String(settings.cardOpacity));
    root.style.setProperty('--enter-btn-color',   settings.enterButtonColor);
    root.style.setProperty('--enter-btn-opacity', String(settings.enterButtonOpacity));

    // 본문 폰트 → body (현재 페이지 기준)
    document.body.style.fontFamily = FONT_FAMILY_MAP[activeFonts.body.family];
    document.body.style.fontSize   = FONT_SIZE_MAP[activeFonts.body.size];
    document.body.style.color      = activeFonts.body.color;

    // CSS 변수로 폰트 3영역 전달 (현재 페이지 기준 — 페이지 이동 시 자동 전환)
    root.style.setProperty('--font-heading',       FONT_FAMILY_MAP[activeFonts.heading.family]);
    root.style.setProperty('--font-size-heading',  FONT_SIZE_MAP[activeFonts.heading.size]);
    root.style.setProperty('--font-body',          FONT_FAMILY_MAP[activeFonts.body.family]);
    root.style.setProperty('--font-size-body',     FONT_SIZE_MAP[activeFonts.body.size]);
    root.style.setProperty('--font-ui',            FONT_FAMILY_MAP[activeFonts.ui.family]);
    root.style.setProperty('--font-size-ui',       FONT_SIZE_MAP[activeFonts.ui.size]);
    root.style.setProperty('--color-body',         activeFonts.body.color);
    root.style.setProperty('--color-ui',           activeFonts.ui.color);
    root.style.setProperty('--color-heading-from', activeFonts.heading.colorStart);
    root.style.setProperty('--color-heading-to',   activeFonts.heading.colorEnd);

    // 배경
    document.body.style.background           = buildCssGradient(settings.gradient);
    document.body.style.backgroundAttachment = 'fixed';
  }, [settings, activePage, activeFonts]);

  const updatePageFont: SettingsCtx['updatePageFont'] = (page, zone, patch) => {
    setSettings((prev) => {
      const prevSet = prev.pageFonts[page] ?? DEFAULT_PAGE_FONT_SET;
      const next: SiteSettings = {
        ...prev,
        pageFonts: {
          ...prev.pageFonts,
          [page]: { ...prevSet, [zone]: { ...prevSet[zone], ...patch } },
        },
      };
      try { localStorage.setItem('gimyo_settings_v3', JSON.stringify(next)); } catch {}
      return next;
    });
  };

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

  return (
    <Ctx.Provider value={{ settings, update, updatePageFont, reset, activePage, setActivePage }}>
      {children}
    </Ctx.Provider>
  );
}

export const useSettings = () => useContext(Ctx);
