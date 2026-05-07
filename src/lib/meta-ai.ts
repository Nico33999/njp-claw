export type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string }

export interface MetaAIResponse {
  message: string
  done: boolean
}

const META_AI_ENDPOINT = 'https://www.meta.ai/api/graphql'

// Uses Meta AI's public web API (no key required for basic access)
export async function chatWithMetaAI(
  messages: ChatMessage[],
  model = 'meta-llama/Llama-3.1-8B-Instruct'
): Promise<string> {
  // Build conversation context
  const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')
  if (!lastUserMsg) throw new Error('No user message found')

  const systemPrompt = messages.find((m) => m.role === 'system')?.content ?? ''
  const history = messages.filter((m) => m.role !== 'system').slice(0, -1)

  const historyText = history
    .map((m) => `${m.role === 'user' ? 'Utilisateur' : 'Assistant'}: ${m.content}`)
    .join('\n')

  const fullPrompt = [
    systemPrompt ? `[Contexte système]\n${systemPrompt}\n` : '',
    historyText ? `[Historique]\n${historyText}\n` : '',
    `[Question]\n${lastUserMsg.content}`,
  ]
    .filter(Boolean)
    .join('\n')

  try {
    // Try the meta-ai-api package approach first
    const response = await callMetaAIWeb(fullPrompt)
    return response
  } catch {
    // Fallback: use a local Llama endpoint or return a helpful message
    return await callFallbackLLM(messages, model)
  }
}

async function callMetaAIWeb(prompt: string): Promise<string> {
  const payload = {
    access_token: null,
    doc_id: '7783822248360042',
    variables: JSON.stringify({
      message: {
        sensitive_data_fields: [],
        text: prompt,
      },
      externalConversationId: crypto.randomUUID(),
      offlineThreading_id: Date.now().toString(),
      rendering_context: 'messenger',
    }),
  }

  const formBody = Object.entries(payload)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v ?? '')}`)
    .join('&')

  const res = await fetch(META_AI_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      Origin: 'https://www.meta.ai',
      Referer: 'https://www.meta.ai/',
    },
    body: formBody,
    signal: AbortSignal.timeout(30000),
  })

  if (!res.ok) throw new Error(`Meta AI API error: ${res.status}`)

  const text = await res.text()
  // Parse streaming response
  const lines = text.split('\n').filter((l) => l.trim())
  let fullMessage = ''

  for (const line of lines) {
    try {
      const json = JSON.parse(line)
      const msg = json?.data?.node?.bot_response_message?.composed_text?.content?.[0]?.text
      if (msg) fullMessage = msg
    } catch {
      // Skip non-JSON lines
    }
  }

  if (!fullMessage) throw new Error('Empty response from Meta AI')
  return fullMessage
}

// Fallback using Together AI / Groq / local Ollama if configured
async function callFallbackLLM(messages: ChatMessage[], model: string): Promise<string> {
  const ollamaUrl = process.env.OLLAMA_URL ?? 'http://localhost:11434'
  const ollamaModel = process.env.OLLAMA_MODEL ?? 'llama3.1'

  try {
    const res = await fetch(`${ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: ollamaModel,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        stream: false,
      }),
      signal: AbortSignal.timeout(60000),
    })

    if (res.ok) {
      const json = await res.json()
      return json.message?.content ?? 'Pas de réponse disponible.'
    }
  } catch {
    // Ollama not available
  }

  // Last resort: Together AI (free tier available)
  const togetherKey = process.env.TOGETHER_API_KEY
  if (togetherKey) {
    const res = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${togetherKey}`,
      },
      body: JSON.stringify({
        model,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        max_tokens: 1024,
        temperature: 0.7,
      }),
      signal: AbortSignal.timeout(30000),
    })

    if (res.ok) {
      const json = await res.json()
      return json.choices?.[0]?.message?.content ?? 'Pas de réponse.'
    }
  }

  throw new Error('Aucun backend LLM disponible.')
}

// Streaming version for SSE
export async function* streamMetaAI(
  messages: ChatMessage[],
  model = 'meta-llama/Llama-3.1-8B-Instruct'
): AsyncGenerator<string> {
  const ollamaUrl = process.env.OLLAMA_URL ?? 'http://localhost:11434'
  const ollamaModel = process.env.OLLAMA_MODEL ?? 'llama3.1'

  try {
    const res = await fetch(`${ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: ollamaModel,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        stream: true,
      }),
      signal: AbortSignal.timeout(120000),
    })

    if (res.ok && res.body) {
      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(Boolean)
        for (const line of lines) {
          try {
            const json = JSON.parse(line)
            if (json.message?.content) yield json.message.content
          } catch {
            // skip
          }
        }
      }
      return
    }
  } catch {
    // Fall through to non-streaming
  }

  // Non-streaming fallback
  const response = await chatWithMetaAI(messages, model)
  yield response
}
