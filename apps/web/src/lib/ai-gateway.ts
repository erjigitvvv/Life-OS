/**
 * LifeOS Multi-Provider AI Gateway
 *
 * Implements High-Availability Multi-Provider Routing:
 * 1. Groq LLaMA/Qwen (Ultra-low latency <400ms inference) with key failover
 * 2. Google Gemini 2.5 Flash (Generative Language API v1beta)
 * 3. Anthropic Claude 3.5 Sonnet
 * 4. Deterministic Uzbek Cognitive Synthesis Fallback
 */

export interface AiCompletionOptions {
  systemPrompt?: string;
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AiCompletionResult {
  text: string;
  provider: 'groq' | 'gemini' | 'anthropic' | 'local';
  model: string;
  latencyMs: number;
}

const GROQ_PRIMARY_KEY = process.env.GROQ_API_KEY || '';
const GROQ_BACKUP_KEY = process.env.GROQ_API_KEY_BACKUP || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';

/**
 * Execute chat completion through the high-availability AI pipeline
 */
export async function completeWithAi(options: AiCompletionOptions): Promise<AiCompletionResult> {
  const startTime = Date.now();
  const { systemPrompt = '', userPrompt, maxTokens = 600, temperature = 0.7 } = options;

  // 1. Try Groq (Primary Key)
  if (GROQ_PRIMARY_KEY) {
    try {
      const res = await callGroq(GROQ_PRIMARY_KEY, systemPrompt, userPrompt, maxTokens, temperature);
      if (res) {
        return {
          text: res,
          provider: 'groq',
          model: 'qwen/qwen3.8-27b',
          latencyMs: Date.now() - startTime,
        };
      }
    } catch (e) {
      console.warn('[AI Gateway] Groq Primary failed, trying backup key...', e);
    }
  }

  // 2. Try Groq (Backup Key)
  if (GROQ_BACKUP_KEY) {
    try {
      const res = await callGroq(GROQ_BACKUP_KEY, systemPrompt, userPrompt, maxTokens, temperature);
      if (res) {
        return {
          text: res,
          provider: 'groq',
          model: 'qwen/qwen3.8-27b',
          latencyMs: Date.now() - startTime,
        };
      }
    } catch (e) {
      console.warn('[AI Gateway] Groq Backup failed, trying Gemini...', e);
    }
  }

  // 3. Try Gemini 2.5 Flash
  if (GEMINI_API_KEY) {
    try {
      const res = await callGemini(GEMINI_API_KEY, systemPrompt, userPrompt, maxTokens, temperature);
      if (res) {
        return {
          text: res,
          provider: 'gemini',
          model: 'gemini-2.5-flash',
          latencyMs: Date.now() - startTime,
        };
      }
    } catch (e) {
      console.warn('[AI Gateway] Gemini failed, trying Anthropic...', e);
    }
  }

  // 4. Try Anthropic Claude
  if (ANTHROPIC_API_KEY) {
    try {
      const res = await callAnthropic(ANTHROPIC_API_KEY, systemPrompt, userPrompt, maxTokens);
      if (res) {
        return {
          text: res,
          provider: 'anthropic',
          model: 'claude-3-5-sonnet',
          latencyMs: Date.now() - startTime,
        };
      }
    } catch (e) {
      console.warn('[AI Gateway] Anthropic failed, falling back to local...', e);
    }
  }

  // 5. Local Deterministic Synthesis Fallback
  return {
    text: generateFallbackReply(userPrompt),
    provider: 'local',
    model: 'deterministic-uzbek-v1',
    latencyMs: Date.now() - startTime,
  };
}

// Groq caller
async function callGroq(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number,
  temperature: number
): Promise<string | null> {
  const messages: any[] = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: userPrompt });

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'qwen/qwen3.8-27b',
      messages,
      max_tokens: maxTokens,
      temperature,
    }),
  });

  if (!res.ok) {
    throw new Error(`Groq status ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || null;
}

// Gemini 2.5 Flash caller
async function callGemini(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number,
  temperature: number
): Promise<string | null> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const contents: any[] = [];
  const combinedPrompt = systemPrompt ? `${systemPrompt}\n\nFoydalanuvchi murojaati: ${userPrompt}` : userPrompt;
  contents.push({ parts: [{ text: combinedPrompt }] });

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature,
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Gemini status ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

// Anthropic caller
async function callAnthropic(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number
): Promise<string | null> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!res.ok) {
    throw new Error(`Anthropic status ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  return data.content?.[0]?.text || null;
}

// Fallback generator
function generateFallbackReply(userPrompt: string): string {
  const lower = userPrompt.toLowerCase();
  if (lower.includes('tong') || lower.includes('ertalab')) {
    return "Xayrli tong, Mirhamid! 🌅 Bugungi kun ulkan marralarga poydevor bo'lsin. Eng muhim 3 ta vazifangizni belgilab, ertalabki odatlarni to'ldirishga tayyormisiz?";
  }
  if (lower.includes('tushlik') || lower.includes('peshin')) {
    return "Xayrli kun! ☀️ Kuningizning yarmi ortda qoldi. Bir stakan toza suv ichib, ikkinchi yarim kunga yangi kuch bilan kirishing!";
  }
  if (lower.includes('kechki') || lower.includes('oqshom')) {
    return "Xayrli oqshom! 🌙 Bugun qanday yutuqlarga erishdingiz? Odatlar zanjirini uzib qo'ymaslik uchun bugungi natijalarni Life-OS ga qayd eting.";
  }
  return "Assalomu alaykum! Life-OS intizom murabbiyi siz bilan birga. Har bir harakat sizni maqsadingizga yaqinlashtiradi. Davom eting! 🔥";
}
