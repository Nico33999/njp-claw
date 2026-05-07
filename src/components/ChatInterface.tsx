'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  Send, Bot, User, Copy, Check, RefreshCw, Trash2,
  PlusCircle, AlertCircle, Lock, Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

type Message = { role: 'user' | 'assistant'; content: string; id: string }

function getOrCreateGuestId(): string {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem('njp-guest-id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('njp-guest-id', id)
  }
  return id
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="typing-dot w-2 h-2 rounded-full bg-brand-400"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  )
}

function MessageBubble({ msg, onCopy }: { msg: Message; onCopy: (text: string) => void }) {
  const [copied, setCopied] = useState(false)
  const isUser = msg.role === 'user'

  const handleCopy = () => {
    onCopy(msg.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn('flex gap-3 group', isUser ? 'flex-row-reverse' : 'flex-row')}>
      {/* Avatar */}
      <div
        className={cn(
          'w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm',
          isUser
            ? 'bg-brand-600 text-white'
            : 'bg-gradient-to-br from-brand-700 to-accent-600 text-white'
        )}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Bubble */}
      <div className={cn('flex flex-col gap-1 max-w-[80%]', isUser && 'items-end')}>
        <div className={cn(isUser ? 'chat-bubble-user' : 'chat-bubble-ai')}>
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
          ) : (
            <div className="prose-njp text-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs text-white/40 hover:text-white/70 px-1"
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copié' : 'Copier'}
        </button>
      </div>
    </div>
  )
}

interface ChatInterfaceProps {
  initialChatId?: string
}

export function ChatInterface({ initialChatId }: ChatInterfaceProps) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [chatId, setChatId] = useState<string | undefined>(initialChatId)
  const [limitError, setLimitError] = useState<{ message: string; upgrade: boolean; register?: boolean } | null>(null)
  const [guestMessagesLeft, setGuestMessagesLeft] = useState<number | null>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const guestId = getOrCreateGuestId()

  const GUEST_LIMIT = 5

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (!session) {
      const used = parseInt(localStorage.getItem('njp-guest-used') ?? '0', 10)
      setGuestMessagesLeft(Math.max(0, GUEST_LIMIT - used))
    }
  }, [session])

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault()
      const text = input.trim()
      if (!text || loading) return

      const userMsg: Message = { role: 'user', content: text, id: crypto.randomUUID() }
      setMessages((prev) => [...prev, userMsg])
      setInput('')
      setLoading(true)
      setLimitError(null)

      // Adjust textarea height
      if (textareaRef.current) textareaRef.current.style.height = 'auto'

      const apiMessages = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }))

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: apiMessages,
            chatId,
            guestId: session ? undefined : guestId,
            stream: false,
          }),
        })

        const data = await res.json()

        if (!res.ok) {
          if (res.status === 429) {
            setLimitError({ message: data.error, upgrade: data.upgrade, register: data.register })
            setMessages((prev) => prev.slice(0, -1))
          } else {
            throw new Error(data.error ?? 'Erreur inconnue')
          }
          return
        }

        if (data.chatId) setChatId(data.chatId)

        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.message, id: crypto.randomUUID() },
        ])

        // Update guest counter
        if (!session) {
          const used = parseInt(localStorage.getItem('njp-guest-used') ?? '0', 10) + 1
          localStorage.setItem('njp-guest-used', String(used))
          setGuestMessagesLeft(Math.max(0, GUEST_LIMIT - used))
        }
      } catch (err: any) {
        const isConfigError = err.message?.includes('GROQ_API_KEY') || err.message?.includes('clé API')
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: isConfigError
              ? `**Configuration requise**\n\n${err.message}\n\nContactez l'administrateur de la plateforme.`
              : `Désolé, une erreur est survenue : ${err.message}. Veuillez réessayer.`,
            id: crypto.randomUUID(),
          },
        ])
      } finally {
        setLoading(false)
      }
    },
    [input, loading, messages, chatId, guestId, session]
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px'
  }

  const clearChat = () => {
    setMessages([])
    setChatId(undefined)
    setLimitError(null)
    if (!session) {
      localStorage.removeItem('njp-guest-used')
      setGuestMessagesLeft(GUEST_LIMIT)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const userPlan = (session?.user as any)?.plan ?? (session ? 'FREE' : 'GUEST')

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm text-white/60">
            {userPlan === 'GUEST' && 'Invité — '}
            {userPlan === 'FREE' && 'Llama 3.1 8B — '}
            {userPlan === 'PRO' && 'Llama 3.1 70B — '}
            {userPlan === 'ULTIMATE' && 'Llama 3.1 405B — '}
            <span className="text-emerald-400 font-medium">Meta AI</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          {!session && guestMessagesLeft !== null && (
            <span className="text-xs text-white/40">
              {guestMessagesLeft} message{guestMessagesLeft !== 1 ? 's' : ''} restant{guestMessagesLeft !== 1 ? 's' : ''}
            </span>
          )}
          {messages.length > 0 && (
            <button onClick={clearChat} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/40 hover:text-white/70">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <Link href="/chat" onClick={clearChat} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/40 hover:text-white/70">
            <PlusCircle className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-6 py-12">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-600 to-accent-500 flex items-center justify-center shadow-lg glow-brand">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">NJP CLAW est prêt</h2>
              <p className="text-white/50 text-sm max-w-sm">
                Posez-moi n'importe quelle question. Propulsé par Meta AI (Llama 3.1).
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full max-w-md">
              {[
                'Explique-moi l\'IA en 3 points',
                'Écris un email professionnel',
                'Résous ce problème de maths',
                'Rédige un post LinkedIn',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInput(suggestion)
                    textareaRef.current?.focus()
                  }}
                  className="glass hover:bg-white/10 rounded-xl px-3 py-2.5 text-xs text-white/70 hover:text-white text-left transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} onCopy={copyToClipboard} />
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full flex-shrink-0 bg-gradient-to-br from-brand-700 to-accent-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="chat-bubble-ai">
              <TypingDots />
            </div>
          </div>
        )}

        {limitError && (
          <div className="glass border border-red-500/20 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">{limitError.message}</span>
            </div>
            <div className="flex gap-2">
              {limitError.register && (
                <Link href="/register" className="btn-primary text-sm py-2 px-4">
                  <Zap className="w-3.5 h-3.5 inline mr-1" />
                  Créer un compte gratuit
                </Link>
              )}
              {limitError.upgrade && (
                <Link href="/pricing" className="btn-accent text-sm py-2 px-4">
                  <Lock className="w-3.5 h-3.5 inline mr-1" />
                  Passer à Pro
                </Link>
              )}
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Input area */}
      <div className="px-4 pb-4 pt-2">
        <form onSubmit={handleSubmit} className="glass-strong rounded-2xl p-3 flex items-end gap-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Posez votre question... (Entrée pour envoyer, Shift+Entrée pour nouvelle ligne)"
            rows={1}
            className="flex-1 bg-transparent resize-none text-white placeholder-white/30 text-sm focus:outline-none leading-relaxed py-1 max-h-[200px]"
            disabled={loading || (limitError !== null)}
          />
          <button
            type="submit"
            disabled={loading || !input.trim() || limitError !== null}
            className={cn(
              'flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all',
              input.trim() && !loading && !limitError
                ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg hover:shadow-brand-600/40 hover:scale-105'
                : 'bg-white/5 text-white/20 cursor-not-allowed'
            )}
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
        <p className="text-center text-xs text-white/20 mt-2">
          NJP CLAW peut faire des erreurs. Vérifiez les informations importantes.
        </p>
      </div>
    </div>
  )
}
