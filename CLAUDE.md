# 기묘당 (奇妙堂) — CLAUDE.md
> Claude Code 작업 지침서. 이 파일을 읽고 프로젝트 전체 맥락을 파악한 후 작업을 시작하라.

---

## 프로젝트 한 줄 정의

조선 단과자를 매개로 인간의 욕망을 거래하는 AI NPC '연화(蓮花)'와 대화하고,
새로운 손님 이야기를 창작·공유하는 **세계관 기반 UGC 창작 게임 웹사이트**.

---

## 기술 스택 (확정)

| 역할 | 기술 | 비고 |
|------|------|------|
| 프레임워크 | Next.js 14 (App Router) | |
| 스타일링 | Tailwind CSS | |
| 애니메이션 | Framer Motion + Canvas API | 파티클·타이핑 효과 |
| AI NPC (연화) | Gemini API — gemini-2.5-flash | Google AI Studio 키 사용 |
| 데이터베이스 | Supabase (PostgreSQL) | |
| 인증 | Supabase Auth | Google OAuth + 카카오 OAuth |
| 이미지 생성 | Phase 2 — Nano Banana (Gemini 2.5 Flash Image) | MVP는 CSS 카드 |
| 배포 | Vercel | |
| 언어 | 한국어 단일 언어 | |

---

## 디렉토리 구조

```
gimyodang/
├── CLAUDE.md                      ← 이 파일
├── .env.local                     ← API 키 (절대 커밋 금지)
├── app/
│   ├── layout.tsx
│   ├── page.tsx                   ← 랜딩 + 인트로
│   ├── visit/
│   │   └── page.tsx               ← 손님 모드 (연화 대화)
│   ├── create/
│   │   └── page.tsx               ← 창작 모드
│   ├── gallery/
│   │   ├── page.tsx               ← 갤러리
│   │   └── [id]/page.tsx          ← 이야기 상세
│   └── api/
│       ├── yeonhwa/route.ts       ← Gemini API 프록시 (핵심)
│       └── stories/route.ts       ← Supabase CRUD
├── components/
│   ├── intro/
│   │   ├── IntroSequence.tsx      ← 25초 인트로 애니메이션
│   │   └── EraSelection.tsx       ← 배경 선택 (조선/현대/미지)
│   ├── visit/
│   │   ├── DesireCards.tsx        ← 욕망 카드 6종 랜덤
│   │   ├── ChatTurn.tsx           ← 대화 턴 (타이핑 애니메이션)
│   │   ├── FlashbackPanel.tsx     ← 회상 창 (우측 패널)
│   │   ├── RecipePanel.tsx        ← 레시피·재료 시각화 (우측 패널)
│   │   └── PrescriptionCard.tsx   ← 처방 카드
│   ├── create/
│   │   ├── StepIndicator.tsx
│   │   ├── Step1Guest.tsx
│   │   ├── Step2Prescription.tsx
│   │   ├── Step3Ending.tsx
│   │   └── Step4Publish.tsx
│   ├── gallery/
│   │   ├── StoryCard.tsx          ← CSS 자동 생성 비주얼 카드
│   │   └── GalleryFilter.tsx
│   └── ui/
│       ├── CandleFlicker.tsx      ← 등불 애니메이션
│       ├── ParticleText.tsx       ← 파티클 → 글자 (Canvas API)
│       └── Typewriter.tsx         ← 타이핑 텍스트
├── lib/
│   ├── gemini.ts                  ← Gemini API 클라이언트
│   ├── supabase.ts                ← Supabase 클라이언트
│   ├── confections.json           ← 과자 15종 정적 데이터 (MVP)
│   ├── desireCards.ts             ← 욕망 카드 18종 풀
│   └── cardVisual.ts              ← 갤러리 카드 CSS 생성 로직
├── types/
│   └── index.ts                   ← 공통 타입 정의
└── public/
    └── fonts/
```

---

## 환경 변수 (.env.local)

```bash
# Gemini API (Google AI Studio)
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## Gemini API 연동 핵심 — lib/gemini.ts

```typescript
// lib/gemini.ts
const GEMINI_ENDPOINT =
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

export type Era = 'joseon' | 'modern' | 'unknown';
export type TurnType = 'turn1' | 'turn2' | 'turn3' | 'turn4' | 'turn5' | 'ending';

const MAX_TOKENS: Record<TurnType, number> = {
  turn1:  150,
  turn2:  250,
  turn3:  120,
  turn4:  400,
  turn5:  200,
  ending: 300,
};

export async function callYeonhwa(
  messages: { role: 'user' | 'model'; parts: { text: string }[] }[],
  era: Era,
  turn: TurnType
) {
  const systemPrompt = buildSystemPrompt(era);

  const res = await fetch(GEMINI_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: messages,
      generationConfig: {
        temperature: 0.85,
        maxOutputTokens: MAX_TOKENS[turn],
        // 턴 4(처방)는 JSON 강제
        ...(turn === 'turn4' && { responseMimeType: 'application/json' }),
      },
    }),
  });

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  return text;
}

function buildSystemPrompt(era: Era): string {
  return SYSTEM_CORE + '\n\n' + ERA_GUIDES[era];
}

// 시스템 프롬프트 전문은 기묘당_Gemini_SystemPrompt_v1.md 참조
const SYSTEM_CORE = `
당신은 기묘당(奇妙堂)의 주인 연화(蓮花)입니다.
[절대 불변 법칙]
1. 모든 처방에는 반드시 대가가 포함됩니다.
2. 과자는 욕망을 직접 충족시키지 않습니다.
3. 연화는 도덕 판단을 하지 않습니다.
4. 연화는 먼저 도움을 제안하지 않습니다.
5. 한 턴의 응답은 최대 3문장입니다.
6. 과자의 원형은 반드시 조선 전통 단과자여야 합니다.
[AI 수렴 방지]
- 처방에는 반드시 불편함이 있어야 합니다.
- 역설 없는 처방은 존재하지 않습니다.
- 대가를 직접 선언하지 않습니다. 감각과 암시로 표현합니다.
`.trim();

const ERA_GUIDES: Record<Era, string> = {
  joseon: `[배경: 조선] 말투: 고어체 절충 경어. 첫 인사: "늦은 밤 발걸음이시군요. 무엇이 이 누추한 곳까지 이끌었는지요."`,
  modern: `[배경: 현대] 말투: 현대어 + 간결 고어 혼용. 첫 인사: "오셨군요. 여기까지 찾아온 이유는 발이 아니라 마음이 알 것입니다."`,
  unknown: `[배경: 미지] 말투: 시적·초현실적. 주어 생략 가능. 첫 인사: "..." (침묵) "여기까지 오는 데 얼마나 걸렸나요."`,
};
```

---

## API 라우트 — app/api/yeonhwa/route.ts

```typescript
// app/api/yeonhwa/route.ts
// Gemini API 키를 클라이언트에 노출하지 않기 위한 서버 프록시
import { NextRequest, NextResponse } from 'next/server';
import { callYeonhwa, Era, TurnType } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  const { messages, era, turn } = await req.json();

  if (!messages || !era || !turn) {
    return NextResponse.json({ error: '필수 파라미터 누락' }, { status: 400 });
  }

  try {
    const response = await callYeonhwa(messages, era as Era, turn as TurnType);
    return NextResponse.json({ response });
  } catch (e) {
    console.error('Gemini API 오류:', e);
    return NextResponse.json({ error: '연화가 응답하지 않습니다' }, { status: 500 });
  }
}
```

---

## Supabase 스키마

```sql
-- 실행 순서대로 작성
-- 1. 이야기 테이블
CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_name TEXT NOT NULL,
  guest_status TEXT,
  era TEXT NOT NULL DEFAULT 'joseon'
    CHECK (era IN ('joseon', 'modern', 'unknown')),
  desire_type TEXT NOT NULL,
  desire_content TEXT NOT NULL,
  confection_original TEXT NOT NULL,
  confection_name TEXT NOT NULL,
  confection_ingredients TEXT NOT NULL,
  confection_effect TEXT NOT NULL,
  confection_price TEXT NOT NULL,   -- 대가: NOT NULL 강제 (불변 법칙)
  ending_content TEXT NOT NULL,
  ending_tone TEXT CHECK (ending_tone IN ('warm', 'cold', 'open')),
  card_visual_config JSONB,
  is_public BOOLEAN DEFAULT true,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 좋아요 테이블
CREATE TABLE likes (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, story_id)
);

-- 3. RLS 정책
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "공개 이야기 읽기" ON stories FOR SELECT USING (is_public = true);
CREATE POLICY "본인 이야기 작성" ON stories FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "본인 이야기 수정" ON stories FOR UPDATE USING (auth.uid() = author_id);
```

---

## 과자 정적 데이터 — lib/confections.json (MVP 15종)

```json
{
  "약과": {
    "category": "유밀과",
    "source": "음식디미방 1670",
    "ingredients": [
      { "name": "밀가루", "ohaeng": "土", "symbol": "중심·안정" },
      { "name": "참기름", "ohaeng": "金", "symbol": "정화·순수" },
      { "name": "꿀", "ohaeng": "土", "symbol": "욕망의 단맛" }
    ],
    "steps": ["밀가루와 참기름을 섞어 반죽한다", "꿀로 조청을 만들어 튀긴 후 입힌다"],
    "desire_tags": ["②강함", "③연결"],
    "historical_note": "왕실 잔치와 사대부 접대에 올린 고급 과자. 귀한 재료 때문에 약처럼 여겨졌다."
  },
  "올란": {
    "category": "정과",
    "source": "규합총서 1809",
    "ingredients": [
      { "name": "밤", "ohaeng": "土", "symbol": "귀환·중심" },
      { "name": "꿀", "ohaeng": "土", "symbol": "욕망의 단맛" },
      { "name": "계피", "ohaeng": "火", "symbol": "각성·시간" }
    ],
    "steps": ["밤을 쪄서 껍질을 벗기고 으깬다", "꿀과 계피를 섞어 반죽한다", "본래 밤 모양으로 다시 빚는다"],
    "desire_tags": ["⑥회귀"],
    "historical_note": "으깨어 다시 빚는 과정이 회귀와 재생을 상징한다."
  },
  "다식": {
    "category": "숙실과",
    "source": "규합총서 1809",
    "ingredients": [
      { "name": "송화가루", "ohaeng": "木", "symbol": "생명·시작" },
      { "name": "꿀", "ohaeng": "土", "symbol": "결속" }
    ],
    "steps": ["곡물·콩·약재 가루를 꿀로 반죽한다", "다식판에 찍어낸다"],
    "desire_tags": ["⑤진실", "②강함"],
    "historical_note": "문양에 따라 오행과 사주의 기운을 담는 처방 도구로 활용되었다."
  },
  "강정": {
    "category": "유밀과",
    "source": "음식디미방 1670",
    "ingredients": [
      { "name": "찹쌀", "ohaeng": "土", "symbol": "찰진 인연·결속" },
      { "name": "조청", "ohaeng": "土", "symbol": "욕망" },
      { "name": "생강", "ohaeng": "火", "symbol": "각성" }
    ],
    "steps": ["찹쌀을 막걸리로 반죽해 팔소를 넣고 기름에 지진다", "조청을 바르고 고물을 입힌다"],
    "desire_tags": ["①지움", "④복수"],
    "historical_note": "겉은 바삭하고 속은 쫄깃한 이중 구조가 감춰진 본질을 상징한다."
  },
  "인절미": {
    "category": "떡",
    "source": "시의전서 19세기",
    "ingredients": [
      { "name": "찹쌀", "ohaeng": "土", "symbol": "결속" },
      { "name": "콩고물", "ohaeng": "水", "symbol": "지혜·어둠" }
    ],
    "steps": ["찹쌀을 쪄서 절구에 친다", "콩고물을 묻혀 완성한다"],
    "desire_tags": ["③연결", "①지움"],
    "historical_note": "치는 과정이 욕망을 단단하게 다지는 행위를 상징한다."
  },
  "수정과": {
    "category": "음청류",
    "source": "규합총서 1809",
    "ingredients": [
      { "name": "생강", "ohaeng": "火", "symbol": "각성·진실" },
      { "name": "계피", "ohaeng": "火", "symbol": "시간·기억" },
      { "name": "곶감", "ohaeng": "金", "symbol": "수렴·완성" }
    ],
    "steps": ["생강과 계피를 끓인다", "식힌 후 곶감을 넣고 우린다"],
    "desire_tags": ["⑤진실", "⑥회귀"],
    "historical_note": "시의전서에 기록된 겨울 음료. 차가운 음료지만 몸을 덥히는 역설이 있다."
  },
  "식혜": {
    "category": "음청류",
    "source": "음식디미방 1670",
    "ingredients": [
      { "name": "엿기름", "ohaeng": "土", "symbol": "발효·변화" },
      { "name": "밥", "ohaeng": "土", "symbol": "일상·존재" }
    ],
    "steps": ["밥에 엿기름물을 부어 삭힌다", "밥알이 뜨면 완성"],
    "desire_tags": ["⑦해방", "①지움"],
    "historical_note": "삭히는 시간이 욕망을 천천히 녹이는 과정을 상징한다."
  },
  "전병": {
    "category": "병과",
    "source": "규합총서 1809",
    "ingredients": [
      { "name": "메밀가루", "ohaeng": "水", "symbol": "어둠·지혜" },
      { "name": "기름", "ohaeng": "金", "symbol": "정화" }
    ],
    "steps": ["메밀가루를 반죽해 얇게 편다", "기름에 지져낸다"],
    "desire_tags": ["⑦해방", "⑤진실"],
    "historical_note": "얇고 바삭한 질감이 현실과 환상의 경계를 상징한다."
  },
  "꿀떡": {
    "category": "떡",
    "source": "기묘당의 해석",
    "ingredients": [
      { "name": "찹쌀", "ohaeng": "土", "symbol": "결속" },
      { "name": "꿀", "ohaeng": "土", "symbol": "욕망의 과잉" }
    ],
    "steps": ["찹쌀 반죽 속에 꿀을 넣어 빚는다", "쪄서 완성한다"],
    "desire_tags": ["③연결", "②강함"],
    "historical_note": "기묘당의 해석: 너무 달면 오히려 쓰다."
  },
  "개성주악": {
    "category": "병과",
    "source": "규합총서 1809",
    "ingredients": [
      { "name": "찹쌀가루", "ohaeng": "土", "symbol": "내면" },
      { "name": "막걸리", "ohaeng": "木", "symbol": "발효·변화" }
    ],
    "steps": ["찹쌀가루를 막걸리로 반죽한다", "팔소를 넣고 기름에 지진다", "꿀이나 조청을 바른다"],
    "desire_tags": ["①지움", "③연결"],
    "historical_note": "겉과 속이 다른 구조가 감춰진 상처를 치유하는 데 쓰인다."
  },
  "빙반": {
    "category": "음청류",
    "source": "음식디미방 1670",
    "ingredients": [
      { "name": "얼음", "ohaeng": "水", "symbol": "감정의 냉각" },
      { "name": "꿀", "ohaeng": "土", "symbol": "단맛·위로" },
      { "name": "팥", "ohaeng": "火", "symbol": "분출·해소" }
    ],
    "steps": ["겨울에 보관한 얼음을 잘게 부순다", "꿀과 팥을 얹어 완성한다"],
    "desire_tags": ["④복수", "①지움"],
    "historical_note": "현대 팥빙수의 시초. 뜨거운 마음을 식히는 처방."
  },
  "약식": {
    "category": "병과",
    "source": "규합총서 1809",
    "ingredients": [
      { "name": "찹쌀", "ohaeng": "土", "symbol": "결속" },
      { "name": "대추", "ohaeng": "木", "symbol": "생명" },
      { "name": "밤", "ohaeng": "土", "symbol": "귀환" },
      { "name": "참기름", "ohaeng": "金", "symbol": "정화" }
    ],
    "steps": ["찹쌀을 불려 쪄낸다", "대추·밤·꿀·간장·참기름을 섞어 다시 찐다"],
    "desire_tags": ["②강함", "⑥회귀"],
    "historical_note": "신라에서 유래한 고급 제례 음식. 오행이 고루 담긴 균형의 처방."
  },
  "정과": {
    "category": "정과",
    "source": "음식디미방 1670",
    "ingredients": [
      { "name": "인삼", "ohaeng": "木", "symbol": "본질·생명" },
      { "name": "꿀", "ohaeng": "土", "symbol": "보존" }
    ],
    "steps": ["재료를 꿀에 조려 만든다"],
    "desire_tags": ["⑥회귀", "⑦해방"],
    "historical_note": "본질을 그대로 두고 형태만 변화시키는 지혜를 상징한다."
  },
  "엿": {
    "category": "당과류",
    "source": "시의전서 19세기",
    "ingredients": [
      { "name": "조청", "ohaeng": "土", "symbol": "욕망의 끈기" },
      { "name": "엿기름", "ohaeng": "土", "symbol": "변화" }
    ],
    "steps": ["곡물을 당화시켜 조청을 만든다", "끓이고 늘여 완성한다"],
    "desire_tags": ["③연결", "④복수"],
    "historical_note": "끊어지지 않는 성질이 집착과 연결을 상징한다."
  },
  "조란": {
    "category": "정과",
    "source": "규합총서 1809",
    "ingredients": [
      { "name": "대추", "ohaeng": "木", "symbol": "새 시작" },
      { "name": "꿀", "ohaeng": "土", "symbol": "보존" }
    ],
    "steps": ["대추를 쪄서 씨를 빼고 으깬다", "꿀로 반죽해 본래 모양으로 빚는다"],
    "desire_tags": ["⑥회귀", "①지움"],
    "historical_note": "으깼다가 다시 빚는 과정이 과거를 녹여 새로 출발하는 것을 상징한다."
  }
}
```

---

## 욕망 카드 풀 — lib/desireCards.ts

```typescript
// 18개 카드, 매 세션 랜덤 5개 노출
// 내부 코드(①~⑦)는 AI 프롬프트용, UI에는 표시 언어만 노출
export const DESIRE_CARDS = [
  { code: '①', label: '잊고 싶다' },
  { code: '①', label: '사라지고 싶다' },
  { code: '①', label: '멈추고 싶다' },
  { code: '②', label: '이기고 싶다' },
  { code: '②', label: '증명하고 싶다' },
  { code: '②', label: '소유하고 싶다' },
  { code: '③', label: '사랑받고 싶다' },
  { code: '③', label: '용서받고 싶다' },
  { code: '③', label: '연결되고 싶다' },
  { code: '④', label: '복수하고 싶다' },
  { code: '⑤', label: '알고 싶다' },
  { code: '⑤', label: '숨기고 싶다' },
  { code: '⑤', label: '믿고 싶다' },
  { code: '⑥', label: '되찾고 싶다' },
  { code: '⑥', label: '돌아가고 싶다' },
  { code: '⑥', label: '고치고 싶다' },
  { code: '⑦', label: '벗어나고 싶다' },
  { code: '⑦', label: '놓아주고 싶다' },
] as const;

export function getRandomCards(count = 5) {
  return [...DESIRE_CARDS]
    .sort(() => Math.random() - 0.5)
    .slice(0, count);
}
```

---

## 색상 팔레트 (Tailwind CSS 커스텀)

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        gimyo: {
          deep:    '#0D0B08',  // 밤 저자거리
          warm:    '#1A1510',  // 촛불 그을음
          surface: '#231E18',  // 한지 그림자
          paper:   '#F2E8D5',  // 빛바랜 한지
          gold:    '#C9A84C',  // 조청·황금
          celadon: '#7BA99A',  // 청자
          crimson: '#8B2635',  // 홍시·단청
        },
        // 배경별 강조색
        era: {
          joseon: '#C9A84C',   // 조청 금색
          modern: '#4A6580',   // 청회색
          unknown: '#7B5EA7',  // 보랏빛 공허
        },
        // 욕망별 카드 팔레트
        desire: {
          forgetting: '#3D4F6B',
          love:       '#8B3A4A',
          power:      '#5C4A1A',
          truth:      '#2A4A5C',
          revenge:    '#2C1A1A',
          return:     '#3A4A2A',
          freedom:    '#2A3A4A',
        }
      },
      fontFamily: {
        serif: ['Nanum Myeongjo', 'Georgia', 'serif'],
        sans:  ['Nanum Gothic', 'sans-serif'],
      }
    }
  }
}
```

---

## 갤러리 카드 CSS 자동 생성 로직

```typescript
// lib/cardVisual.ts
// 욕망·배경·결말 톤을 조합해 카드 비주얼 CSS를 자동 생성
export function generateCardConfig(
  desireCode: string,
  era: string,
  endingTone: string
) {
  const palette: Record<string, string> = {
    '①': '#3D4F6B', '②': '#5C4A1A', '③': '#8B3A4A',
    '④': '#2C1A1A', '⑤': '#2A4A5C', '⑥': '#3A4A2A', '⑦': '#2A3A4A',
  };
  const texture: Record<string, string> = {
    joseon:  'hanji',
    modern:  'concrete',
    unknown: 'void',
  };
  const border: Record<string, string> = {
    warm: '#C9A84C',   // 금선
    cold: '#9BA8B5',   // 은선
    open: 'transparent', // 점선
  };

  return {
    bgColor:      palette[desireCode] ?? '#2C1A1A',
    textureClass: texture[era] ?? 'hanji',
    borderColor:  border[endingTone] ?? '#C9A84C',
    borderStyle:  endingTone === 'open' ? 'dashed' : 'solid',
  };
}
```

---

## 손님 모드 턴 흐름

```
턴 1: 욕망 카드 선택 + 첫 고백
  → Gemini 호출: turn1 (150 토큰)
  → 화면: 연화 첫 반응

턴 2: 욕망 심화 질문 + 회상 창 생성
  → Gemini 호출: turn2 (250 토큰)
  → 화면 좌: 연화 질문 + 손님 입력창
  → 화면 우: 회상 서사 텍스트 (FlashbackPanel)

턴 3: 처방 준비 독백 + 레시피 시각화
  → Gemini 호출: turn3 (120 토큰)
  → 화면 좌: "잠시 기다리십시오" + 로딩 연출
  → 화면 우: confections.json에서 과자 조회 → RecipePanel

턴 4: 과자 처방 카드 (JSON 응답)
  → Gemini 호출: turn4 (400 토큰, JSON 강제)
  → PrescriptionCard 렌더링
  → 버튼: [받아들이다] [더 알고 싶다] [거절하다]

턴 5 (선택): 심화 설명
  → Gemini 호출: turn5 (200 토큰)

결말: 수락 시 서사 생성
  → Gemini 호출: ending (300 토큰)
  → 저장 → Supabase stories 테이블
```

---

## 인트로 애니메이션 씬 구조

```
씬 1 (0-4초):   암전 → 등불 점화 (CSS @keyframes candleFlicker)
씬 2 (4-9초):   "누군가 문을 두드린다" + 스킵 버튼 등장
씬 3 (9-14초):  과자 접시 슬라이드인
씬 4 (14-20초): "원하는 것을 얻으려면 / 치러야 할 것이 있다"
씬 5 (20-25초): [들어서다] / [건너뛰다] CTA

재방문: localStorage visited=true → 인트로 스킵 → 랜딩 직행
스킵: 씬 2부터 우측 하단 버튼 상시 노출
```

---

## 미지 배경 손님 신분

```typescript
// 미지 배경 선택 시 추가로 신분 선택
export const UNKNOWN_IDENTITIES = [
  { code: '存', label: '존재 (存)', desc: '유령, 인형, 그림자' },
  { code: '情', label: '감정 (情)', desc: '외로움, 분노, 슬픔' },
  { code: '憶', label: '기억 (憶)', desc: '마지막 말, 잊혀진 하루' },
] as const;
```

---

## 불변 법칙 — 개발 중 절대 타협 금지

1. **대가 필드는 NOT NULL** — DB 스키마에서 강제
2. **대가 없는 처방은 저장 불가** — Step 2 유효성 검사에서 차단
3. **결말이 무조건 해피엔딩이면 경고** — AI 게이트키퍼 응답 검증
4. **과자 원형은 조선 전통 단과자** — 시스템 프롬프트에 하드코딩
5. **Gemini API 키는 서버 사이드에서만 호출** — 클라이언트 노출 금지

---

## MVP 빌드 순서

```
1. next.js 프로젝트 초기화 + Tailwind 설정
2. lib/gemini.ts + app/api/yeonhwa/route.ts
3. Supabase 스키마 적용 + lib/supabase.ts
4. 인트로 애니메이션 (IntroSequence.tsx)
5. 배경 선택 (EraSelection.tsx)
6. 손님 모드 — 욕망 카드 (DesireCards.tsx)
7. 손님 모드 — 대화 턴 (ChatTurn.tsx + TypeWriter.tsx)
8. 손님 모드 — 회상 창 (FlashbackPanel.tsx)
9. 손님 모드 — 레시피 창 (RecipePanel.tsx)
10. 처방 카드 (PrescriptionCard.tsx)
11. 창작 모드 Step 1~4
12. 갤러리 + 카드 비주얼 (StoryCard.tsx)
13. 이야기 상세 페이지
14. 시드 데이터 20개 입력
15. Vercel 배포
```

---

## 참조 문서

- `기묘당_PRD_v2.1.md` — 전체 기획 문서
- `기묘당_Gemini_SystemPrompt_v1.md` — 연화 시스템 프롬프트 전문
- 와이어프레임: 화면 1(랜딩) ~ 화면 6(이야기 상세) 설계 완료

---

*CLAUDE.md v1.0 — 2026.06.02*
*Gemini API (gemini-2.5-flash) + Supabase + Next.js 14 + Vercel*
