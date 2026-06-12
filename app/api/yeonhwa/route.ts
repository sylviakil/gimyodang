import { NextRequest, NextResponse } from 'next/server';
import { callYeonhwa, GeminiMessage, TurnType } from '@/lib/gemini';
import { EraType, PersonaState } from '@/types';

function buildPersonaContext(persona?: PersonaState): string {
  if (!persona) return '';
  const genderLabel =
    persona.gender === 'yin' ? '여성 [음(陰)의 기령]' : '남성 [양(陽)의 기령]';
  const ageMap: Record<string, string> = {
    youth:  '10대 청춘',
    adult:  '20-30대 한량',
    middle: '40-50대 가솔',
    elder:  '60대 이상 불로',
  };
  const ageLabel = ageMap[persona.ageGroup] ?? '20-30대';

  return `[기묘당 방문 손님 정체성]
- 이름/아명: ${persona.name || '익명의 손님'}
- 신분·직군: ${persona.job || '알 수 없음'}
- 성별 기색: ${genderLabel}
- 연령 주기: ${ageLabel}

연화는 위 정보를 바탕으로:
1. 손님의 신분·직군에 맞는 시대적 언어와 말투를 구사하시오.
2. 이름 '${persona.name || '손님'}'을 자연스럽게 호칭에 활용하시오.
3. 손님의 몰입감을 극대화하는 개성 있는 호칭(사대부 나리, 그대 등)을 사용하시오.`;
}

export async function POST(req: NextRequest) {
  try {
    const { messages, era, turn, persona, desireCard } = await req.json();

    if (!era || !turn) {
      return NextResponse.json({ error: '필수 파라미터 누락 (era, turn)' }, { status: 400 });
    }

    // 히스토리를 Gemini 형식으로 변환
    const geminiMessages: GeminiMessage[] = [];

    if (desireCard) {
      // 첫 턴: 욕망 카드 정보 포함
      geminiMessages.push({
        role: 'user',
        parts: [{
          text: `[손님이 선택한 욕망 카드: "${desireCard.label}" (코드: ${desireCard.code})]
${messages?.[messages.length - 1]?.text || ''}`,
        }],
      });
    } else if (Array.isArray(messages) && messages.length > 0) {
      for (const msg of messages) {
        geminiMessages.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }],
        });
      }
    }

    const personaContext = buildPersonaContext(persona);
    const text = await callYeonhwa(geminiMessages, era as EraType, turn as TurnType, personaContext);

    // JSON 파싱
    let parsed: Record<string, unknown>;
    try {
      const cleaned = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: '연화의 응답을 해석하지 못했습니다.' }, { status: 500 });
    }

    return NextResponse.json(parsed);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : '알 수 없는 오류';
    console.error('Yeonhwa API 오류:', message);
    return NextResponse.json({ error: `연화가 응답하지 않습니다: ${message}` }, { status: 500 });
  }
}
