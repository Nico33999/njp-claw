import { web_search } from './tools/web-search' // we'll create this

export type ChatMessage = { role: 'user' | 'assistant' | 'system' | 'tool'; content: string; tool_call_id?: string; name?: string }

export type ToolCall = {
  id: string
  type: 'function'
  function: { name: string; arguments: string }
}

// Available tools for the agent
const AVAILABLE_TOOLS = [
  {
    type: 'function' as const,
    function: {
      name: 'web_search',
      description: 'Recherche des informations précises et à jour sur internet. Utilise cette fonction quand tu as besoin d\'informations factuelles, actuelles ou de vérification.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'La requête de recherche précise' },
          num_results: { type: 'number', description: 'Nombre de résultats (max 10)' }
        },
        required: ['query']
      }
    }
  }
]

export async function chatWithMetaAI(
  messages: ChatMessage[],
  enableTools = true
): Promise<string> {
  const groqKey = process.env.GROQ_API_KEY
  if (!groqKey) throw new Error('GROQ_API_KEY manquante')

  const groqModel = 'llama-3.1-70b-versatile' // Best for tool calling

  const body: any = {
    model: groqModel,
    messages: messages.map(m => ({ role: m.role, content: m.content })),
    max_tokens: 4096,
    temperature: 0.7,
  }

  if (enableTools) {
    body.tools = AVAILABLE_TOOLS
    body.tool_choice = 'auto'
  }

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${groqKey}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) throw new Error(await res.text())

  const json = await res.json()
  const message = json.choices?.[0]?.message

  // Handle tool calls
  if (message?.tool_calls?.length > 0) {
    const toolCall = message.tool_calls[0]
    if (toolCall.function.name === 'web_search') {
      const args = JSON.parse(toolCall.function.arguments)
      const searchResults = await web_search(args.query, args.num_results || 8)
      
      // Add tool result and continue
      const newMessages = [
        ...messages,
        { role: 'assistant' as const, content: message.content || '', tool_calls: message.tool_calls },
        { role: 'tool' as const, content: searchResults, tool_call_id: toolCall.id, name: 'web_search' }
      ]
      return chatWithMetaAI(newMessages, false) // continue without tools to avoid loops
    }
  }

  return message?.content || 'Désolé, je n\'ai pas pu générer de réponse.'
}

// Streaming version with tool support (simplified for now)
export async function* streamMetaAI(messages: ChatMessage[]): AsyncGenerator<string> {
  // For simplicity, use non-streaming with tools first, then stream final answer
  const finalAnswer = await chatWithMetaAI(messages)
  yield finalAnswer
}
