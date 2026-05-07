export type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string }

// Model mapping: plan key → Groq model id
const GROQ_MODELS: Record<string, string> = {
  FREE: 'llama-3.1-8b-instant',
  PRO: 'llama-3.1-70b-versatile',
  ULTIMATE: 'llama-3.1-70b-versatile', // 405B not on Groq, 70B is the best available
}

export async function chatWithMetaAI(
  messages: ChatMessage[],
  model = 'meta-llama/Llama-3.1-8B-Instruct'
): Promise<string> {
  // Determine which plan tier from the model string
  const planKey = model.includes('405B') ? 'ULTIMATE' : model.includes('70B') ? 'PRO' : 'FREE'

  const errors: string[] = []

  // ── 1. Groq (gratuit, Llama 3.1, recommandé) ──────────────────
  const groqKey = process.env.GROQ_API_KEY
  if (groqKey) {
    try {
      const groqModel = GROQ_MODELS[planKey] ?? GROQ_MODELS.FREE
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: groqModel,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          max_tokens: 2048,
          temperature: 0.7,
        }),
        signal: AbortSignal.timeout(30000),
      })
      if (res.ok) {
        const json = await res.json()
        const content = json.choices?.[0]?.message?.content
        if (content) return content
      } else {
        errors.push(`Groq: ${res.status} ${await res.text()}`)
      }
    } catch (e: any) {
      errors.push(`Groq: ${e.message}`)
    }
  }

  // ── 2. Together AI ─────────────────────────────────────────────
  const togetherKey = process.env.TOGETHER_API_KEY
  if (togetherKey) {
    try {
      const res = await fetch('https://api.together.xyz/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${togetherKey}`,
        },
        body: JSON.stringify({
          model,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          max_tokens: 2048,
          temperature: 0.7,
        }),
        signal: AbortSignal.timeout(30000),
      })
      if (res.ok) {
        const json = await res.json()
        const content = json.choices?.[0]?.message?.content
        if (content) return content
      } else {
        errors.push(`Together: ${res.status}`)
      }
    } catch (e: any) {
      errors.push(`Together: ${e.message}`)
    }
  }

  // ── 3. Ollama local ────────────────────────────────────────────
  const ollamaUrl = process.env.OLLAMA_URL
  if (ollamaUrl) {
    try {
      const res = await fetch(`${ollamaUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: process.env.OLLAMA_MODEL ?? 'llama3.1',
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          stream: false,
        }),
        signal: AbortSignal.timeout(60000),
      })
      if (res.ok) {
        const json = await res.json()
        const content = json.message?.content
        if (content) return content
      } else {
        errors.push(`Ollama: ${res.status}`)
      }
    } catch (e: any) {
      errors.push(`Ollama: ${e.message}`)
    }
  }

  // ── Aucun backend disponible ───────────────────────────────────
  console.error('[meta-ai] All backends failed:', errors)
  throw new Error(
    errors.length
      ? `Backends IA indisponibles (${errors.join(' | ')}). Configurez GROQ_API_KEY dans Vercel.`
      : 'Aucune clé API IA configurée. Ajoutez GROQ_API_KEY dans les variables Vercel.'
  )
}

// Streaming via Groq
export async function* streamMetaAI(
  messages: ChatMessage[],
  model = 'meta-llama/Llama-3.1-8B-Instruct'
): AsyncGenerator<string> {
  const planKey = model.includes('405B') ? 'ULTIMATE' : model.includes('70B') ? 'PRO' : 'FREE'
  const groqKey = process.env.GROQ_API_KEY

  if (groqKey) {
    try {
      const groqModel = GROQ_MODELS[planKey] ?? GROQ_MODELS.FREE
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: groqModel,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          max_tokens: 2048,
          temperature: 0.7,
          stream: true,
        }),
        signal: AbortSignal.timeout(60000),
      })

      if (res.ok && res.body) {
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            const trimmed = line.replace(/^data: /, '').trim()
            if (!trimmed || trimmed === '[DONE]') continue
            try {
              const json = JSON.parse(trimmed)
              const chunk = json.choices?.[0]?.delta?.content
              if (chunk) yield chunk
            } catch {
              // skip
            }
          }
        }
        return
      }
    } catch {
      // fall through to non-streaming
    }
  }

  // Non-streaming fallback
  const response = await chatWithMetaAI(messages, model)
  yield response
}
