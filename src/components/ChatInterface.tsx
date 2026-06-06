'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  Send, Bot, User, Copy, Check, Trash2, PlusCircle,
  AlertCircle, Lock, Zap, Lightbulb, Code2, Settings,
  Download, BookOpen, Globe, FileText, Mail, Pencil,
  BarChart, Wand2, RefreshCw, Hammer, ChevronRight,
  Cpu, MonitorPlay
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { LivePreview } from './LivePreview'

type Message = { role: 'user' | 'assistant'; content: string; id: string; streaming?: boolean }
type Mode = 'novice' | 'expert' | 'builder'

const QUICK_ACTIONS = [
  { icon: <Globe className="w-3.5 h-3.5" />,    label: 'Traduire',   prompt: 'Traduis ce texte en anglais :\n\n',                color: 'text-emerald-600' },
  { icon: <FileText className="w-3.5 h-3.5" />, label: 'Résumer',    prompt: 'Fais un résumé clair et concis :\n\n',             color: 'text-blue-600' },
  { icon: <Pencil className="w-3.5 h-3.5" />,   label: 'Corriger',   prompt: "Corrige les fautes d'orthographe :\n\n",           color: 'text-violet-600' },
  { icon: <Wand2 className="w-3.5 h-3.5" />,    label: 'Reformuler', prompt: 'Reformule de manière professionnelle :\n\n',        color: 'text-orange-500' },
  { icon: <Code2 className="w-3.5 h-3.5" />,    label: 'Coder',      prompt: 'Écris le code pour :\n\n',                         color: 'text-brand-600' },
  { icon: <Mail className="w-3.5 h-3.5" />,     label: 'Email',      prompt: 'Rédige un email professionnel pour :\n\n',         color: 'text-rose-500' },
  { icon: <BarChart className="w-3.5 h-3.5" />, label: 'Analyser',   prompt: 'Analyse et donne les points clés de :\n\n',        color: 'text-teal-600' },
  { icon: <Lightbulb className="w-3.5 h-3.5" />,label: 'Expliquer',  prompt: 'Explique-moi simplement :\n\n',                    color: 'text-yellow-500' },
]

const BUILDER_ACTIONS = [
  { icon: '🌐', label: 'Landing page',    prompt: 'Crée une landing page moderne et professionnelle pour une startup tech. Design épuré, hero section avec CTA, fonctionnalités, témoignages et footer.' },
  { icon: '🔐', label: 'Page de login',   prompt: 'Crée une page de connexion moderne avec email/mot de passe, bouton "Se souvenir de moi", lien "Mot de passe oublié" et design épuré.' },
  { icon: '📊', label: 'Dashboard',       prompt: 'Crée un dashboard admin avec des cartes de statistiques, un graphique en barres (en CSS), une liste d\'utilisateurs et une navigation latérale.' },
  { icon: '🛒', label: 'E-commerce',      prompt: 'Crée une page de boutique e-commerce avec une grille de produits, des filtres sur le côté, un panier dans la navbar et un design moderne.' },
  { icon: '📱', label: 'App mobile UI',   prompt: 'Crée une maquette d\'application mobile (style iOS) pour une app de to-do list. Design minimaliste, bouton d\'ajout, liste des tâches avec checkboxes.' },
  { icon: '💼', label: 'Portfolio',       prompt: 'Crée un portfolio personnel élégant avec une section hero, projets en grille avec hover effects, compétences et section contact.' },
]

const PROMPT_TEMPLATES = [
  { category: 'Rédaction', name: 'Article de blog',  prompt: 'Rédige un article de blog de 500 mots sur :\n\n' },
  { category: 'Rédaction', name: 'Présentation',     prompt: 'Crée un plan de présentation de 10 slides sur :\n\n' },
  { category: 'Code',      name: 'Revue de code',    prompt: 'Analyse ce code et identifie les problèmes :\n\n```\n\n```' },
  { category: 'Code',      name: 'Débogage',         prompt: "Identifie la cause de ce bug et propose une solution :\n\nErreur :\n\nCode :\n```\n\n```" },
  { category: 'Analyse',   name: 'Analyse SWOT',     prompt: 'Réalise une analyse SWOT complète pour :\n\n' },
  { category: 'Business',  name: 'Email commercial', prompt: 'Rédige un email commercial percutant pour ce service :\n\n' },
]

const SYSTEM_PROMPTS_PRESETS = [
  { name: 'Général',    prompt: 'Tu es un assistant IA utile, précis et concis. Tu réponds toujours en français sauf si demandé autrement.' },
  { name: 'Technique',  prompt: "Tu es un expert technique senior. Tes réponses sont précises, orientées solutions. Tu fournis du code fonctionnel." },
  { name: 'Professeur', prompt: "Tu es un professeur pédagogue. Tu expliques simplement avec des exemples. Tu termines par un résumé en 3 points clés." },
  { name: 'Créatif',    prompt: "Tu es un rédacteur créatif professionnel. Tes textes sont engageants et bien structurés. Tu proposes toujours plusieurs variantes." },
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
function getStoredMode(): Mode {
  if (typeof window === 'undefined') return 'novice'
  return (localStorage.getItem('njp-mode') as Mode) ?? 'novice'
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <div key={i} className="typing-dot w-1.5 h-1.5 rounded-full bg-zinc-400"
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
      <div className={cn(
        'w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 text-white',
        isUser ? 'bg-brand-600' : 'bg-zinc-800'
      )}>
        {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
      </div>
      <div className={cn('flex flex-col gap-1', isUser ? 'items-end max-w-[78%]' : 'max-w-[86%] min-w-0')}>
        <div className={cn(isUser ? 'chat-bubble-user' : 'chat-bubble-ai')}>
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
          ) : (
            <div className="prose-njp text-sm min-w-0">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
              {msg.streaming && <span className="inline-block w-0.5 h-3.5 bg-brand-500 ml-0.5 animate-pulse align-middle" />}
            </div>
          )}
        </div>
        {!msg.streaming && (
          <button onClick={() => { onCopy(msg.content); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
            className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 px-1">
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
  const [showPreview, setShowPreview] = useState(true)
  const endRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const guestId = getOrCreateGuestId()
  const GUEST_LIMIT = 5
  const didAutoSend = useRef(false)

  useEffect(() => { if (!defaultMode) setMode(getStoredMode()) }, [defaultMode])
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])
  useEffect(() => {
    if (!session) {
      const used = parseInt(localStorage.getItem('njp-guest-used') ?? '0', 10)
      setGuestLeft(Math.max(0, GUEST_LIMIT - used))
    }
  }, [session])

  useEffect(() => {
    const t = setTimeout(() => textareaRef.current?.focus(), 100)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (initialMessage && !didAutoSend.current) {
      didAutoSend.current = true
      sendMessage(initialMessage)
    }
  }, [initialMessage])

  const switchMode = (m: Mode) => {
    setMode(m)
    localStorage.setItem('njp-mode', m)
    if (m === 'builder') setShowPreview(true)
  }

  const isStreaming = messages.some((m) => m.streaming)

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
          mode: agentId ? undefined : mode,
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
            if (parseErr.message !== 'Unexpected end of JSON input') throw parseErr
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
  const isBuilder = mode === 'builder' && !isAgentMode
  const hasCode = isBuilder && messages.some((m) => m.role === 'assistant' && m.content.includes('```'))

  const MODES = [
    { id: 'novice',  label: 'Novice',   icon: <Lightbulb className="w-3 h-3" />,  color: 'bg-emerald-600' },
    { id: 'expert',  label: 'Expert',   icon: <Code2 className="w-3 h-3" />,       color: 'bg-zinc-800' },
    { id: 'builder', label: 'Builder',  icon: <Hammer className="w-3 h-3" />,      color: 'bg-violet-600' },
  ]

  return (
    <div className="flex flex-col h-full bg-white">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-200 bg-white flex-shrink-0">
        <div className="flex items-center gap-2">
          {isAgentMode ? (
            <div className="flex items-center gap-2 bg-zinc-100 border border-zinc-200 px-3 py-1.5 rounded-xl">
              <div className={`w-5 h-5 rounded-lg bg-gradient-to-br ${agentColor ?? 'from-brand-600 to-accent-500'} flex items-center justify-center text-xs`}>
                {agentEmoji ?? '🤖'}
              </div>
              <span className="text-xs font-semibold text-zinc-800">{agentName ?? 'Agent'}</span>
            </div>
          ) : (
            <div className="flex bg-zinc-100 rounded-xl p-0.5 gap-0.5">
              {MODES.map((m) => (
                <button key={m.id} onClick={() => switchMode(m.id as Mode)}
                  className={cn(
                    'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
                    mode === m.id ? `${m.color} text-white shadow-sm` : 'text-zinc-500 hover:text-zinc-800'
                  )}>
                  {m.icon}{m.label}
                </button>
              ))}
            </div>
          )}
          <div className="hidden sm:flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs text-zinc-400">{planLabel}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {!session && guestLeft !== null && (
            <span className="text-xs text-zinc-400 mr-1">{guestLeft}/{GUEST_LIMIT}</span>
          )}
          {isBuilder && messages.length > 0 && (
            <button onClick={() => setShowPreview(!showPreview)}
              className={cn('p-1.5 rounded-lg text-xs transition-colors', showPreview
                ? 'bg-violet-100 text-violet-700'
                : 'text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100')}>
              <MonitorPlay className="w-3.5 h-3.5" />
            </button>
          )}
          {mode === 'expert' && !isAgentMode && (
            <>
              <button onClick={() => { setShowTemplates(!showTemplates); setShowSettings(false) }}
                className={cn('p-1.5 rounded-lg transition-colors',
                  showTemplates ? 'bg-brand-100 text-brand-700' : 'text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100')}>
                <BookOpen className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => { setShowSettings(!showSettings); setShowTemplates(false) }}
                className={cn('p-1.5 rounded-lg transition-colors',
                  showSettings ? 'bg-brand-100 text-brand-700' : 'text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100')}>
                <Settings className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          {messages.length > 0 && mode === 'expert' && (
            <button onClick={exportConversation} className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors">
              <Download className="w-3.5 h-3.5" />
            </button>
          )}
          {messages.length > 0 && (
            <button onClick={clearChat} className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <Link href="/chat" onClick={clearChat}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors">
            <PlusCircle className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ── Expert panels ── */}
      {mode === 'expert' && showTemplates && !isAgentMode && (
        <div className="border-b border-zinc-200 px-4 py-3 bg-zinc-50 animate-fade-in flex-shrink-0">
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {Object.entries(
              PROMPT_TEMPLATES.reduce((a, t) => ({ ...a, [t.category]: [...(a[t.category] ?? []), t] }), {} as Record<string, typeof PROMPT_TEMPLATES>)
            ).map(([cat, templates]) => (
              <div key={cat} className="flex flex-wrap gap-1.5 items-center">
                <span className="text-xs text-zinc-400 mr-1">{cat}</span>
                {templates.map((t) => (
                  <button key={t.name} onClick={() => { setInput(t.prompt); setShowTemplates(false); textareaRef.current?.focus() }}
                    className="bg-white border border-zinc-200 hover:border-brand-300 rounded-lg px-2.5 py-1 text-xs text-zinc-600 hover:text-brand-700 transition-all whitespace-nowrap">
                    {t.name}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {mode === 'expert' && showSettings && !isAgentMode && (
        <div className="border-b border-zinc-200 px-4 py-3 bg-zinc-50 animate-fade-in space-y-3 flex-shrink-0">
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-xs text-zinc-400 mr-1">Preset :</span>
            {SYSTEM_PROMPTS_PRESETS.map((p) => (
              <button key={p.name} onClick={() => { setSystemPrompt(p.prompt); setSelectedPreset(p.name) }}
                className={cn('text-xs px-2.5 py-1 rounded-lg transition-all border',
                  selectedPreset === p.name
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'bg-white border-zinc-200 text-zinc-600 hover:border-brand-300 hover:text-brand-700')}>
                {p.name}
              </button>
            ))}
          </div>
          <textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="Définissez le comportement de l'IA…"
            rows={2}
            className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-zinc-800 text-xs placeholder-zinc-400 focus:outline-none focus:border-brand-400 resize-none" />
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-400">Précis</span>
            <input type="range" min="0" max="1" step="0.1" value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="flex-1 h-1 accent-brand-600" />
            <span className="text-xs text-zinc-400">Créatif</span>
            <span className="text-xs font-mono text-brand-600 w-6">{temperature.toFixed(1)}</span>
          </div>
        </div>
      )}

      {/* ── Main content: chat (+ optional preview for builder) ── */}
      <div className="flex flex-1 overflow-hidden min-h-0">

        {/* Chat pane */}
        <div className={cn('flex flex-col overflow-hidden', isBuilder && showPreview ? 'w-[42%] border-r border-zinc-200' : 'w-full')}>
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">

              {/* ── Empty state ── */}
              {messages.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center min-h-[50vh] gap-5 text-center">
                  {isAgentMode ? (
                    <>
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${agentColor ?? 'from-brand-600 to-accent-500'} flex items-center justify-center text-3xl shadow-lg`}>
                        {agentEmoji ?? '🤖'}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-zinc-900 mb-1">{agentName}</h2>
                        <p className="text-zinc-400 text-sm">Posez votre première question.</p>
                      </div>
                    </>
                  ) : mode === 'builder' ? (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center">
                        <Hammer className="w-6 h-6 text-violet-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-zinc-900 mb-1">NJP Builder</h2>
                        <p className="text-zinc-400 text-sm max-w-xs">Décrivez ce que vous voulez créer — le code et l'aperçu apparaissent en direct.</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
                        {BUILDER_ACTIONS.map((a) => (
                          <button key={a.label}
                            onClick={() => { setInput(a.prompt); textareaRef.current?.focus() }}
                            className="bg-white border border-zinc-200 hover:border-violet-300 hover:bg-violet-50 rounded-xl px-3 py-2.5 text-xs text-zinc-700 hover:text-violet-700 text-left flex items-center gap-2 transition-all">
                            <span className="text-base">{a.icon}</span>{a.label}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : mode === 'novice' ? (
                    <>
                      <div>
                        <h2 className="text-2xl font-bold text-zinc-900 mb-1">Bonjour, comment puis-je vous aider ?</h2>
                        <p className="text-zinc-400 text-sm">Posez une question ou choisissez une action ci-dessous.</p>
                      </div>
                      <div className="flex flex-wrap justify-center gap-2 max-w-md">
                        {QUICK_ACTIONS.map((a) => (
                          <button key={a.label} onClick={() => { setInput(a.prompt); textareaRef.current?.focus() }}
                            className="bg-white border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 rounded-xl px-3 py-2 flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 transition-all">
                            <span className={a.color}>{a.icon}</span>{a.label}
                          </button>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-2 w-full max-w-md">
                        {NOVICE_SUGGESTIONS.map((s) => (
                          <button key={s.text} onClick={() => { setInput(s.text); textareaRef.current?.focus() }}
                            className="bg-white border border-zinc-200 hover:border-zinc-300 rounded-xl px-3 py-2.5 text-xs text-zinc-600 hover:text-zinc-900 text-left flex items-center gap-2 transition-all">
                            <span>{s.emoji}</span>{s.text}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <h2 className="text-xl font-bold text-zinc-900 mb-1">Mode Expert</h2>
                        <p className="text-zinc-400 text-sm max-w-sm">Configurez le prompt système, ajustez la créativité, utilisez les templates.</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setShowSettings(true)}
                          className="bg-white border border-zinc-200 hover:bg-zinc-50 rounded-xl px-4 py-2 text-sm text-zinc-600 hover:text-zinc-900 flex items-center gap-2 transition-all">
                          <Settings className="w-4 h-4" />Configurer
                        </button>
                        <button onClick={() => setShowTemplates(true)}
                          className="bg-white border border-zinc-200 hover:bg-zinc-50 rounded-xl px-4 py-2 text-sm text-zinc-600 hover:text-zinc-900 flex items-center gap-2 transition-all">
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
                  <div className="w-7 h-7 rounded-full flex-shrink-0 bg-zinc-800 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="chat-bubble-ai"><TypingDots /></div>
                </div>
              )}

              {limitError && (
                <div className="border border-red-200 bg-red-50 rounded-2xl p-4 flex flex-col gap-3 animate-fade-in">
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{limitError.message}</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {limitError.register && (
                      <Link href="/register" className="btn-primary text-sm py-2 px-4">
                        <Zap className="w-3.5 h-3.5" />Créer un compte gratuit
                      </Link>
                    )}
                    {limitError.upgrade && (
                      <Link href="/pricing" className="btn-accent text-sm py-2 px-4">
                        <Lock className="w-3.5 h-3.5" />Passer à Pro
                      </Link>
                    )}
                  </div>
                </div>
              )}

              <div ref={endRef} className="h-2" />
            </div>
          </div>

          {/* ── Input area ── */}
          <div className="flex-shrink-0 px-4 pb-4 pt-2 bg-white border-t border-zinc-100">
            {mode === 'novice' && messages.length > 0 && !isAgentMode && (
              <div className="flex gap-1.5 mb-2 overflow-x-auto pb-1 scrollbar-none">
                {QUICK_ACTIONS.map((a) => (
                  <button key={a.label} onClick={() => { setInput(a.prompt); textareaRef.current?.focus() }}
                    className="bg-white border border-zinc-200 hover:bg-zinc-50 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-800 transition-all whitespace-nowrap flex-shrink-0">
                    <span className={a.color}>{a.icon}</span>{a.label}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className={cn(
                'rounded-2xl px-4 py-3 flex items-end gap-3 bg-white border transition-all',
                'focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100',
                isBuilder ? 'border-violet-200 focus-within:border-violet-400 focus-within:ring-violet-100' : 'border-zinc-300'
              )}>
                <textarea ref={textareaRef} value={input} onChange={handleTextareaChange} onKeyDown={handleKeyDown}
                  placeholder={
                    isAgentMode
                      ? `Parlez à ${agentName ?? 'l\'agent'}…`
                      : mode === 'builder'
                        ? 'Décrivez le site ou l\'interface à créer…'
                        : mode === 'novice'
                          ? 'Posez votre question…'
                          : 'Rédigez votre prompt… (Entrée pour envoyer)'
                  }
                  rows={1}
                  className="flex-1 bg-transparent resize-none text-zinc-900 placeholder-zinc-400 text-sm focus:outline-none leading-relaxed py-0.5 max-h-[180px]"
                  disabled={loading || limitError !== null}
                />
                <button type="submit" disabled={loading || !input.trim() || limitError !== null}
                  className={cn(
                    'flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all',
                    input.trim() && !loading && !limitError
                      ? isBuilder
                        ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-sm hover:scale-105'
                        : 'bg-brand-600 hover:bg-brand-500 text-white shadow-sm hover:scale-105'
                      : 'bg-zinc-100 text-zinc-300 cursor-not-allowed'
                  )}>
                  {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                </button>
              </div>
            </form>
            <p className="text-center text-xs text-zinc-300 mt-1.5">
              Entrée pour envoyer · Shift+Entrée pour sauter une ligne
            </p>
          </div>
        </div>

        {/* ── Live Preview pane (builder mode) ── */}
        {isBuilder && showPreview && (
          <div className="flex-1 overflow-hidden bg-zinc-50">
            <LivePreview messages={messages} streaming={isStreaming} />
          </div>
        )}
      </div>
    </div>
  )
}
