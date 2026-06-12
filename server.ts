/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import { SYSTEM_PROMPT_CORE, ERA_GUIDES, TURN_FORMATS } from './server/systemPrompt';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Anthropic Client
let aiClient: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!aiClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('ANTHROPIC_API_KEY is not configured. Please add your Anthropic API Key to the .env file.');
    }
    aiClient = new Anthropic({ apiKey });
  }
  return aiClient;
}

// Gimyodang Chat completion proxy
app.post('/api/gimyodang/chat', async (req, res) => {
  try {
    const { era, turn, history, userMessage, desireCard, persona } = req.body;

    if (!era || !turn) {
      return res.status(400).json({ error: 'Missing background (era) or turn number.' });
    }

    // Build the system prompt using CORE + specified era + desired JSON format
    const eraText = ERA_GUIDES[era as keyof typeof ERA_GUIDES] || ERA_GUIDES.joseon;
    const formatKey = turn === 'ending' ? 'ending' : `turn${turn}`;
    const formatText = TURN_FORMATS[formatKey as keyof typeof TURN_FORMATS] || '';

    // If persona is provided, create a beautiful contextual guide for Yeonhwa to adapt her mood, age group, gender and name representation.
    let personaContext = '';
    if (persona) {
      const { name, job, gender, ageGroup } = persona;
      const genderLabel = gender === 'yin' ? '여성 [음(陰)의 기령]' : gender === 'yang' ? '남성 [양(陽)의 기령]' : '비바이너리 중성 [중림(中理)의 기령]';
      
      let ageLabel = '20-30대 한량';
      if (ageGroup === 'youth') ageLabel = '10대 청춘 영아';
      else if (ageGroup === 'middle') ageLabel = '40-50대 가솔';
      else if (ageGroup === 'elder') ageLabel = '60대 이상 불로/노화';
      else if (ageGroup === 'eternal') ageLabel = '영겁의 존재 (가늠 불가)';

      personaContext = `
[기묘당 방문 손님 정체성 가이드]
- 이승의 성명/아명: ${name || '익명의 손님'}
- 전생/현대/초자연적 지위 및 직군: ${job || '알 수 없음'}
- 성절의 기색(성별): ${genderLabel}
- 연령 주기(나이): ${ageLabel}

기묘당의 기전 '연화'는 상위 정보를 바탕으로 다음 사항을 엄격히 준수하여 대화를 수행하십시오:
1. 손님이 선택한 신분과 직무(예: '몰락한 사대부 선비', '번아웃 개발자' 혹은 '사건의 지평선 과학자')에 적합하게 격조 높은 시대적 언어와 말투(조선, 현대, 미지의SF스팀펑크)를 구사하십시오.
2. 성명/아명인 '${name || '손님'}'을 직접 언급하거나 연화의 특색 있는 호칭('사대부 나리', '그대', '미지의 방랑자여' 등)으로 구사해 주십시오.
3. 1~2인칭의 존칭과 친근함 사이에서 손님의 마법적 몰입감을 극대화하고 깊은 속죄의 기운을 다듬어 주십시오.
`;
    }

    const systemPrompt = `${SYSTEM_PROMPT_CORE}\n\n${eraText}\n\n${personaContext}\n\n${formatText}\n\n중요: 전송하는 최종 결과는 반드시 제공된 JSON 포맷을 정확히 따르고 추가 주석이나 불필요한 텍스트를 절대 붙이지 마십시오.`;

    // Construct history in Anthropic messages format
    const messages: Anthropic.MessageParam[] = [];

    if (history && history.length > 0) {
      for (const msg of history) {
        if (msg.role === 'user') {
          messages.push({ role: 'user', content: msg.text });
        } else {
          messages.push({ role: 'assistant', content: msg.text });
        }
      }
    }

    // Append current user message
    let currentInput = userMessage || '';
    if (turn === 1 && desireCard) {
      currentInput = `[선택한 욕망 카드: ${desireCard.code} - ${desireCard.label}] ${currentInput}`;
    } else if (turn === 'ending') {
      currentInput = `[처방 수락 여부: 수락함] 이제 이야기를 시적이고 마법같이 매듭지어주는 결말 서사를 적어주시오.`;
    }

    messages.push({ role: 'user', content: currentInput });

    // Call Claude API with retry
    const ai = getAnthropicClient();
    let replyText = '{}';
    let lastError: any = null;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`Attempting Claude API call (Attempt ${attempt}/3)`);

        const response = await ai.messages.create({
          model: 'claude-opus-4-8',
          max_tokens: 4096,
          system: systemPrompt,
          messages,
        });

        const textBlock = response.content.find((b) => b.type === 'text');
        replyText = textBlock?.type === 'text' ? textBlock.text : '{}';
        lastError = null;
        break;
      } catch (err: any) {
        lastError = err;
        console.warn(`Claude API call failed (attempt ${attempt}):`, err.message || err);
        if (err instanceof Anthropic.RateLimitError) {
          await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
        } else if (attempt < 3) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }

    if (lastError) {
      throw lastError;
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(replyText);
    } catch (parseErr) {
      console.warn('Claude response was not valid JSON, cleaning up:', replyText);
      const cleanJson = replyText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedResponse = JSON.parse(cleanJson);
    }

    return res.json(parsedResponse);

  } catch (error: any) {
    console.error('Error in Gimyodang API:', error);
    return res.status(500).json({
      error: error.message || 'Unknown server error',
    });
  }
});

// Configure Vite or Static files depending on environment
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Gimyodang server loaded on http://localhost:${PORT}`);
  });
}

startServer();
