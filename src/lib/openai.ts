// ============================================================
// OpenAI API Client — Chat completions + insight generation
// ============================================================
// Reads VITE_OPENAI_API_KEY from env or localStorage.
// Falls back gracefully when no key is available.
// ============================================================

const OPENAI_API = 'https://api.openai.com/v1';

interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface ChatResponse {
    content: string;
    usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

function getApiKey(): string {
    return import.meta.env.VITE_OPENAI_API_KEY || localStorage.getItem('vcc-openai-key') || '';
}

function getModel(): string {
    return import.meta.env.VITE_OPENAI_MODEL || localStorage.getItem('vcc-openai-model') || 'gpt-4o-mini';
}

export function isOpenAIConfigured(): boolean {
    return !!getApiKey();
}

/**
 * Send a chat completion request
 */
export async function queryAI(messages: ChatMessage[]): Promise<ChatResponse> {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error('OpenAI API key not configured');

    const res = await fetch(`${OPENAI_API}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: getModel(),
            messages,
            temperature: 0.7,
            max_tokens: 1000,
        }),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`OpenAI API ${res.status}: ${err}`);
    }

    const data = await res.json();
    return {
        content: data.choices?.[0]?.message?.content || '',
        usage: data.usage,
    };
}

/**
 * Stream a chat completion response (for real-time typing effect)
 */
export async function streamAI(
    messages: ChatMessage[],
    onChunk: (text: string) => void,
    onComplete?: () => void,
): Promise<void> {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error('OpenAI API key not configured');

    const res = await fetch(`${OPENAI_API}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: getModel(),
            messages,
            temperature: 0.7,
            max_tokens: 1000,
            stream: true,
        }),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`OpenAI API ${res.status}: ${err}`);
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed === 'data: [DONE]') continue;
            if (!trimmed.startsWith('data: ')) continue;

            try {
                const json = JSON.parse(trimmed.slice(6));
                const delta = json.choices?.[0]?.delta?.content;
                if (delta) onChunk(delta);
            } catch {
                // Skip malformed chunks
            }
        }
    }

    onComplete?.();
}

/**
 * Generate venture insights from structured data
 */
export async function generateInsights(ventureData: {
    name: string;
    tasks: { total: number; done: number; blocked: number; inProgress: number };
    healthScore: number;
    milestones: Array<{ name: string; progress: number; target_date: string }>;
}): Promise<string> {
    const systemPrompt = `You are an AI business analyst for a multi-venture portfolio. 
Analyze the venture data and provide 2-3 actionable insights. Be concise and specific.
Format each insight as: [CATEGORY] Insight text
Categories: RISK, OPPORTUNITY, ACTION, TREND`;

    const userPrompt = `Venture: ${ventureData.name}
Tasks: ${ventureData.tasks.total} total, ${ventureData.tasks.done} done, ${ventureData.tasks.blocked} blocked, ${ventureData.tasks.inProgress} in progress
Health Score: ${ventureData.healthScore}/100
Milestones: ${ventureData.milestones.map(m => `${m.name} (${m.progress}%, due ${m.target_date})`).join('; ')}`;

    const response = await queryAI([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
    ]);
    return response.content;
}

/**
 * Validate an OpenAI API key
 */
export async function validateApiKey(key: string): Promise<{ valid: boolean; error?: string }> {
    try {
        const res = await fetch(`${OPENAI_API}/models`, {
            headers: { 'Authorization': `Bearer ${key}` },
        });
        if (res.ok) return { valid: true };
        return { valid: false, error: `HTTP ${res.status}` };
    } catch (err) {
        return { valid: false, error: (err as Error).message };
    }
}
