'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  Send, Bot, User, Copy, Check, Trash2, PlusCircle,
  AlertCircle, Lock, Zap, Lightbulb, Code2, Settings,
  Download, BookOpen, Globe, FileText, Mail, Pencil,
  BarChart, Wand2, RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

type Message = { role: 'user' | 'assistant'; content: string; id: string; streaming?: boolean }
type Mode = 'novice' | 'expert'

const QUICK_ACTIONS = [
  { icon: <Globe className="w-3.5 h-3.5" />,    label: 'Traduire',   prompt: 'Traduis ce texte en anglais :\n\n',                             color: 'text-emerald-400' },
  { icon: <FileText className="w-3.5 h-3.5" />, label: 'Résumer',    prompt: 'Fais un résumé clair et concis de ce texte :\n\n',               color: 'text-blue-400' },
  { icon: <Pencil className="w-3.5 h-3.5" />,   label: 'Corriger',   prompt: "Corrige les fautes d'orthographe et de grammaire :\n\n",          color: 'text-purple-400' },
  { icon: <Wand2 className="w-3.5 h-3.5" />,    label: 'Reformuler', prompt: 'Reformule ce texte de manière plus professionnelle :\n\n',        color: 'text-accent-400' },
  { icon: <Code2 className="w-3.5 h-3.5" />,    label: 'Coder',      prompt: 'Écris le code pour faire ceci :\n\n',                             color: 'text-brand-400' },
  { icon: <Mail className="w-3.5 h-3.5" />,     label: 'Email',      prompt: 'Rédige un email professionnel pour :\n\n',                        color: 'text-rose-400' },
  { icon: <BarChart className="w-3.5 h-3.5" />, label: 'Analyser',   prompt: 'Analyse ce texte et donne-moi les points clés :\n\n',             color: 'text-teal-400' },
  { icon: <Lightbulb className="w-3.5 h-3.5" />,label: 'Expliquer',  prompt: 'Explique-moi simplement ce concept :\n\n',                        color: 'text-yellow-400' },
]

const PROMPT_TEMPLATES = [
  { category: 'Rédaction', name: 'Article de blog',  prompt: 'Rédige un article de blog de 500 mots sur :\n\n' },
  { category: 'Rédaction', name: 'Présentation',     prompt: 'Crée un plan de présentation de 10 slides sur :\n\n' },
  { category: 'Code',      name: 'Revue de code',    prompt: 'Analyse ce code et identifie les problèmes :\n\n```\n\n```' },
  { category: 'Code',      name: 'Débogage',         prompt: "J'ai ce bug. Identifie la cause et propose une solution :\n\nErreur :\n\nCode :\n```\n\n```" },
  { category: 'Analyse',   name: 'Analyse SWOT',     prompt: 'Réalise une analyse SWOT complète pour :\n\n' },
  { category: 'Analyse',   name: 'Comparaison',      prompt: 'Compare ces deux options avec un tableau :\n\nOption A :\nOption B :' },
  { category: 'Business',  name: 'Email commercial', prompt: 'Rédige un email commercial percutant pour ce service :\n\n' },
  { category: 'Business',  name: "Plan d'action",    prompt: "Crée un plan d'action détaillé pour atteindre cet objectif :\n\n" },
]

const SYSTEM_PROMPTS_PRESETS = [
  { name: 'Général',    prompt: 'Tu es un assistant IA utile, précis et concis. Tu réponds toujours en français sauf si demandé autrement.' },
  { name: 'Technique',  prompt: "Tu es un expert technique senior. Tes réponses sont précises, techniques et orientées solutions. Tu fournis du code fonctionnel." },
  { name: 'Professeur', prompt: "Tu es un professeur pédagogue. Tu expliques simplement avec des exemples concrets. Tu termines par un résumé en 3 points clés." },
  { name: 'Créatif',    prompt: "Tu es un rédacteur créatif professionnel. Tes textes sont engageants et bien structurés. Tu proposes toujours plusieurs variantes." },
  { name: 'Analyste',   prompt: 'Tu es un analyste business expérimenté. Tu fournis des analyses structurées et des recommandations actionnables.' },
]

const NOVICE_SUGGESTIONS = [
  { emoji: '✍️', text: 'Rédige un email professionnel' },
  { emoji: '🧠', text: "Explique-moi l'intelligence artificielle" },
  { emoji: '📝', text: 'Corrige ce texte pour moi' },
  { emoji: '💡', text: 'Donne-moi des idées de noms' },
  { emoji: '🌍', text: 'Traduis ce texte en anglais' },
  { emoji: '📊', text: 'Comment créer un tableau Excel ?' },
]

function getOrCreateGuestId() {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem('njp-guest-id')
  if (!id) { id = crypto.randomUUID(); localStorage.setItem('njp-guest-id', id) }
  return id
}
function getMode(): Mode {
  if (typeof window === 'undefined') return 'novice'
  return (localStorage.getItem('njp-mode') as Mode) ?? 'novice'
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-1">
      {[0, 1, 2].map((i) => (
        <div key={i} className="typing-dot w-2 h-2 rounded-full bg-brand-400"
          style={{ animationDelay: `${i * 0.2}s` }} />
      ))}
    </div>
  )
}

function MessageBubble({ msg, onCopy }: { msg: Message; onCopy: (t: string) => void }) {
  const [copied, setCopied] = useState(false)
  const isUser = msg.role === 'user'
  return (
    <div className={cn('flex gap-3 group animate-fade-in', isUser ? 'flex-row-reverse' : 'flex-row')}>
      <div className={cn('w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5',
        isUser ? 'bg-brand-600 text-white' : 'bg-gradient-to-br from-brand-700 to-accent-600 text-white')}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      <div className={cn('flex flex-col gap-1', isUser ? 'items-end max-w-[80%]' : 'max-w-[85%] min-w-0')}>
        <div className={cn(isUser ? 'chat-bubble-user' : 'chat-bubble-ai')}>
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
          ) : (
            <div className="prose-njp text-sm min-w-0">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
              {msg.streaming && <span className="inline-block w-0.5 h-4 bg-brand-400 ml-0.5 animate-pulse align-middle" />}
            </div>
          )}
        </div>
        {!msg.streaming && (
          <button onClick={() => { onCopy(msg.content); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
            className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs text-white/30 hover:text-white/60 px-1">
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copié' : 'Copier'}
          </button>
        )}
      </div>
    </div>
  )
}

interface ChatProps {
  initialChatId?: string
  defaultMode?: Mode
  agentId?: string
  agentName?: string
  agentEmoji?: string
  agentColor?: string
  initialMessage?: string
}

export function ChatInterface({ initialChatId, defaultMode, agentId, agentName, agentEmoji, agentColor, initialMessage }: ChatProps) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [chatId, setChatId] = useState<string | undefined>(initialChatId)
  const [limitError, setLimitError] = useState<{ message: string; upgrade: boolean; register?: boolean } | null>(null)
  const [guestLeft, setGuestLeft] = useState<number | null>(null)
  const [mode, setMode] = useState<Mode>(defaultMode ?? 'novice')
  const [showTemplates, setShowTemplates] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [systemPrompt, setSystemPrompt] = useState('')
  const [temperature, setTemperature] = useState(0.7)
  const [selectedPreset, setSelectedPreset] = useState('')
  const endRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const guestId = getOrCreateGuestId()
  const GUEST_LIMIT = 5
  const didAutoSend = useRef(false)

  useEffect(() => { if (!defaultMode) setMode(getMode()) }, [defaultMode])
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])
  useEffect(() => {
    if (!session) {
      const used = parseInt(localStorage.getItem('njp-guest-used') ?? '0', 10)
      setGuestLeft(Math.max(0, GUEST_LIMIT - used))
    }
  }, [session])

  // Auto-focus on mount
  useEffect(() => {
    const t = setTimeout(() => textareaRef.current?.focus(), 100)
    return () => clearTimeout(t)
  }, [])

  // Auto-send initialMessage (from landing page)
  useEffect(() => {
    if (initialMessage && !didAutoSend.current) {
      didAutoSend.current = true
      sendMessage(initialMessage)
    }
  }, [initialMessage])

  const switchMode = (m: Mode) => { setMode(m); localStorage.setItem('njp-mode', m) }

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return

    const userMsg: Message = { role: 'user', content: text, id: crypto.randomUUID() }
    const assistantId = crypto.randomUUID()

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)
    setLimitError(null)
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    const apiMessages = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }))

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          chatId,
          guestId: session ? undefined : guestId,
          agentId: agentId ?? undefined,
          systemPrompt: !agentId && mode === 'expert' && systemPrompt ? systemPrompt : undefined,
          temperature: mode === 'expert' ? temperature : 0.7,
          stream: true,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        if (res.status === 429) {
          setLimitError({ message: data.error, upgrade: data.upgrade, register: data.register })
          setMessages((prev) => prev.filter((m) => m.id !== userMsg.id))
          return
        }
        throw new Error(data.error ?? `Erreur ${res.status}`)
      }

      // ── SSE Streaming ──────────────────────────────────────────
      if (!res.body) throw new Error('Pas de stream')

      setMessages((prev) => [...prev, { role: 'assistant', content: '', id: assistantId, streaming: true }])

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          const trimmed = line.replace(/^data: /, '').trim()
          if (!trimmed) continue
          try {
            const json = JSON.parse(trimmed)
            if (json.error) throw new Error(json.error)
            if (json.chatId) setChatId(json.chatId)
            if (json.chunk) {
              fullContent += json.chunk
              setMessages((prev) =>
                prev.map((m) => m.id === assistantId ? { ...m, content: fullContent } : m)
              )
              endRef.current?.scrollIntoView({ behavior: 'smooth' })
            }
            if (json.done) {
              setMessages((prev) =>
                prev.map((m) => m.id === assistantId ? { ...m, streaming: false } : m)
              )
            }
          } catch (parseErr: any) {
            if (parseErr.message !== 'Unexpected end of JSON input') {
              throw parseErr
            }
          }
        }
      }

      if (!session) {
        const used = parseInt(localStorage.getItem('njp-guest-used') ?? '0', 10) + 1
        localStorage.setItem('njp-guest-used', String(used))
        setGuestLeft(Math.max(0, GUEST_LIMIT - used))
      }
    } catch (err: any) {
      setMessages((prev) => prev.filter((m) => m.id !== assistantId))
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: `Une erreur est survenue : ${err.message}`,
        id: crypto.randomUUID(),
      }])
    } finally {
      setLoading(false)
      setTimeout(() => textareaRef.current?.focus(), 50)
    }
  }, [loading, messages, chatId, guestId, session, mode, systemPrompt, temperature, agentId])

  const handleSubmit = (e?: React.FormEvent) => { e?.preventDefault(); sendMessage(input) }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 180) + 'px'
  }

  const clearChat = () => {
    setMessages([]); setChatId(undefined); setLimitError(null)
    if (!session) { localStorage.removeItem('njp-guest-used'); setGuestLeft(GUEST_LIMIT) }
    setTimeout(() => textareaRef.current?.focus(), 50)
  }

  const exportConversation = () => {
    const md = messages.map((m) =>
      `**${m.role === 'user' ? 'Vous' : 'NJP CLAW'}:**\n\n${m.content}`
    ).join('\n\n---\n\n')
    const blob = new Blob([md], { type: 'text/markdown' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'conversation-njp-claw.md'
    a.click()
  }

  const planLabel = (session?.user as any)?.plan === 'PRO' ? 'NJP Pro'
    : (session?.user as any)?.plan === 'ULTIMATE' ? 'NJP Ultimate'
    : 'NJP Standard'

  const isAgentMode = !!agentId

  return (
    <div className="flex flex-col h-full bg-[#0e1128]">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-2">
          {isAgentMode ? (
            <div className="flex items-center gap-2 glass px-3 py-1.5 rounded-xl">
              <div className={`w-5 h-5 rounded-lg bg-gradient-to-br ${agentColor ?? 'from-brand-600 to-accent-500'} flex items-center justify-center text-xs`}>
                {agentEmoji ?? '🤖'}
              </div>
              <span className="text-xs font-semibold text-white">{agentName ?? 'Agent'}</span>
            </div>
          ) : (
            <div className="flex glass rounded-xl p-0.5 gap-0.5">
              {[
                { id: 'novice', label: 'Novice', icon: <Lightbulb className="w-3 h-3" />, active: 'bg-emerald-600' },
                { id: 'expert', label: 'Expert', icon: <Code2 className="w-3 h-3" />, active: 'bg-brand-600' },
              ].map((m) => (
                <button key={m.id} onClick={() => switchMode(m.id as Mode)}
                  className={cn('flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
                    mode === m.id ? `${m.active} text-white` : 'text-white/40 hover:text-white/70')}>
                  {m.icon}{m.label}
                </button>
              ))}
            </div>
          )}
          <div className="hidden sm:flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-white/30">{planLabel}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {!session && guestLeft !== null && (
            <span className="text-xs text-white/25 mr-1">
              {guestLeft}/{GUEST_LIMIT}
            </span>
          )}
          {mode === 'expert' && !isAgentMode && (
            <>
              <button onClick={() => { setShowTemplates(!showTemplates); setShowSettings(false) }}
                className={cn('p-1.5 rounded-lg text-xs transition-colors',
                  showTemplates ? 'bg-brand-600/30 text-brand-300' : 'text-white/30 hover:text-white/70 hover:bg-white/5')}>
                <BookOpen className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => { setShowSettings(!showSettings); setShowTemplates(false) }}
                className={cn('p-1.5 rounded-lg text-xs transition-colors',
                  showSettings ? 'bg-brand-600/30 text-brand-300' : 'text-white/30 hover:text-white/70 hover:bg-white/5')}>
                <Settings className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          {messages.length > 0 && mode === 'expert' && (
            <button onClick={exportConversation}
              className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-colors">
              <Download className="w-3.5 h-3.5" />
            </button>
          )}
          {messages.length > 0 && (
            <button onClick={clearChat}
              className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <Link href="/chat" onClick={clearChat}
            className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-colors">
            <PlusCircle className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ── Expert panels ── */}
      {mode === 'expert' && showTemplates && !isAgentMode && (
        <div className="border-b border-white/5 px-4 py-3 bg-black/20 animate-fade-in flex-shrink-0">
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {Object.entries(PROMPT_TEMPLATES.reduce((a, t) => ({ ...a, [t.category]: [...(a[t.category] ?? []), t] }), {} as Record<string, typeof PROMPT_TEMPLATES>))
              .map(([cat, templates]) => (
                <div key={cat} className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-xs text-white/20 mr-1">{cat}</span>
                  {templates.map((t) => (
                    <button key={t.name} onClick={() => { setInput(t.prompt); setShowTemplates(false); textareaRef.current?.focus() }}
                      className="glass hover:bg-white/10 rounded-lg px-2.5 py-1 text-xs text-white/60 hover:text-white transition-all whitespace-nowrap">
                      {t.name}
                    </button>
                  ))}
                </div>
              ))}
          </div>
        </div>
      )}

      {mode === 'expert' && showSettings && !isAgentMode && (
        <div className="border-b border-white/5 px-4 py-3 bg-black/20 animate-fade-in space-y-3 flex-shrink-0">
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-xs text-white/30 mr-1">Preset :</span>
            {SYSTEM_PROMPTS_PRESETS.map((p) => (
              <button key={p.name} onClick={() => { setSystemPrompt(p.prompt); setSelectedPreset(p.name) }}
                className={cn('text-xs px-2.5 py-1 rounded-lg transition-all',
                  selectedPreset === p.name ? 'bg-brand-600 text-white' : 'glass hover:bg-white/10 text-white/50 hover:text-white')}>
                {p.name}
              </button>
            ))}
          </div>
          <textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="Définissez le comportement de l'IA…"
            rows={2}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs placeholder-white/20 focus:outline-none focus:border-brand-500/40 resize-none" />
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/30">Précis</span>
            <input type="range" min="0" max="1" step="0.1" value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="flex-1 h-1 accent-brand-500" />
            <span className="text-xs text-white/30">Créatif</span>
            <span className="text-xs font-mono text-brand-400 w-6">{temperature.toFixed(1)}</span>
          </div>
        </div>
      )}

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 text-center">
              {isAgentMode ? (
                <>
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${agentColor ?? 'from-brand-600 to-accent-500'} flex items-center justify-center text-3xl shadow-xl`}>
                    {agentEmoji ?? '🤖'}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">{agentName}</h2>
                    <p className="text-white/40 text-sm">Posez votre première question.</p>
                  </div>
                </>
              ) : mode === 'novice' ? (
                <>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Bonjour, comment puis-je vous aider ?</h2>
                    <p className="text-white/40 text-sm">Posez une question ou choisissez une action.</p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 max-w-md">
                    {QUICK_ACTIONS.map((a) => (
                      <button key={a.label} onClick={() => { setInput(a.prompt); textareaRef.current?.focus() }}
                        className="glass hover:bg-white/10 rounded-xl px-3 py-2 flex items-center gap-2 text-sm text-white/60 hover:text-white transition-all">
                        <span className={a.color}>{a.icon}</span>{a.label}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2 w-full max-w-md">
                    {NOVICE_SUGGESTIONS.map((s) => (
                      <button key={s.text} onClick={() => { setInput(s.text); textareaRef.current?.focus() }}
                        className="glass hover:bg-white/10 rounded-xl px-3 py-2.5 text-xs text-white/60 hover:text-white text-left flex items-center gap-2 transition-all">
                        <span>{s.emoji}</span>{s.text}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Mode Expert</h2>
                    <p className="text-white/40 text-sm max-w-sm">Configurez le prompt système, ajustez la créativité, utilisez les templates.</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setShowSettings(true)}
                      className="glass hover:bg-white/10 rounded-xl px-4 py-2.5 text-sm text-white/60 hover:text-white flex items-center gap-2 transition-all">
                      <Settings className="w-4 h-4" />Configurer
                    </button>
                    <button onClick={() => setShowTemplates(true)}
                      className="glass hover:bg-white/10 rounded-xl px-4 py-2.5 text-sm text-white/60 hover:text-white flex items-center gap-2 transition-all">
                      <BookOpen className="w-4 h-4" />Templates
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {messages.map((msg) => <MessageBubble key={msg.id} msg={msg} onCopy={(t) => navigator.clipboard.writeText(t)} />)}

          {loading && messages[messages.length - 1]?.role !== 'assistant' && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full flex-shrink-0 bg-gradient-to-br from-brand-700 to-accent-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="chat-bubble-ai"><TypingDots /></div>
            </div>
          )}

          {limitError && (
            <div className="glass border border-red-500/20 rounded-2xl p-4 flex flex-col gap-3 animate-fade-in">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{limitError.message}</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {limitError.register && (
                  <Link href="/register" className="btn-primary text-sm py-2 px-4">
                    <Zap className="w-3.5 h-3.5 inline mr-1" />Créer un compte gratuit
                  </Link>
                )}
                {limitError.upgrade && (
                  <Link href="/pricing" className="btn-accent text-sm py-2 px-4">
                    <Lock className="w-3.5 h-3.5 inline mr-1" />Passer à Pro
                  </Link>
                )}
              </div>
            </div>
          )}

          <div ref={endRef} className="h-4" />
        </div>
      </div>

      {/* ── Input ── */}
      <div className="flex-shrink-0 px-4 pb-4 pt-2">
        <div className="max-w-3xl mx-auto">
          {mode === 'novice' && messages.length > 0 && !isAgentMode && (
            <div className="flex gap-1.5 mb-2 overflow-x-auto pb-1 scrollbar-none">
              {QUICK_ACTIONS.map((a) => (
                <button key={a.label} onClick={() => { setInput(a.prompt); textareaRef.current?.focus() }}
                  className="glass hover:bg-white/10 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-all whitespace-nowrap flex-shrink-0">
                  <span className={a.color}>{a.icon}</span>{a.label}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="glass-strong rounded-2xl px-4 py-3 flex items-end gap-3 focus-within:border-brand-500/30 border border-white/8 transition-colors">
              <textarea ref={textareaRef} value={input} onChange={handleTextareaChange} onKeyDown={handleKeyDown}
                placeholder={isAgentMode
                  ? `Parlez à ${agentName ?? 'l\'agent'}…`
                  : mode === 'novice'
                    ? 'Posez votre question…'
                    : 'Rédigez votre prompt… (Entrée pour envoyer)'}
                rows={1}
                className="flex-1 bg-transparent resize-none text-white placeholder-white/25 text-sm focus:outline-none leading-relaxed py-0.5 max-h-[180px]"
                disabled={loading || limitError !== null}
              />
              <button type="submit" disabled={loading || !input.trim() || limitError !== null}
                className={cn('flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all',
                  input.trim() && !loading && !limitError
                    ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-md hover:scale-105'
                    : 'bg-white/5 text-white/15 cursor-not-allowed')}>
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              </button>
            </div>
          </form>
          <p className="text-center text-xs text-white/15 mt-2">
            Entrée pour envoyer · Shift+Entrée pour sauter une ligne
          </p>
        </div>
      </div>
    </div>
  )
}
