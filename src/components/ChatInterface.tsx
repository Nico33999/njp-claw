'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  Send, Bot, User, Copy, Check, RefreshCw, Trash2,
  PlusCircle, AlertCircle, Lock, Zap, Lightbulb, Code2,
  ChevronDown, ChevronUp, Settings, Download, BookOpen,
  Sparkles, Wand2, Globe, FileText, Mail, Pencil, BarChart
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

type Message = { role: 'user' | 'assistant'; content: string; id: string }
type Mode = 'novice' | 'expert'

// ── Quick actions (Novice mode) ────────────────────────────────────
const QUICK_ACTIONS = [
  { icon: <Globe className="w-3.5 h-3.5" />, label: 'Traduire', prompt: 'Traduis ce texte en anglais :\n\n', color: 'text-emerald-400' },
  { icon: <FileText className="w-3.5 h-3.5" />, label: 'Résumer', prompt: 'Fais un résumé clair et concis de ce texte :\n\n', color: 'text-blue-400' },
  { icon: <Pencil className="w-3.5 h-3.5" />, label: 'Corriger', prompt: 'Corrige les fautes d\'orthographe et de grammaire de ce texte :\n\n', color: 'text-purple-400' },
  { icon: <Wand2 className="w-3.5 h-3.5" />, label: 'Reformuler', prompt: 'Reformule ce texte de manière plus professionnelle :\n\n', color: 'text-accent-400' },
  { icon: <Code2 className="w-3.5 h-3.5" />, label: 'Coder', prompt: 'Écris le code pour faire ceci :\n\n', color: 'text-brand-400' },
  { icon: <Mail className="w-3.5 h-3.5" />, label: 'Email', prompt: 'Rédige un email professionnel pour :\n\n', color: 'text-rose-400' },
  { icon: <BarChart className="w-3.5 h-3.5" />, label: 'Analyser', prompt: 'Analyse ce texte et donne-moi les points clés :\n\n', color: 'text-teal-400' },
  { icon: <Lightbulb className="w-3.5 h-3.5" />, label: 'Expliquer', prompt: 'Explique-moi simplement ce concept :\n\n', color: 'text-yellow-400' },
]

// ── Prompt templates (Expert mode) ────────────────────────────────
const PROMPT_TEMPLATES = [
  { category: 'Rédaction', name: 'Article de blog', prompt: 'Rédige un article de blog de 500 mots sur le sujet suivant, avec une introduction accrocheuse, 3 parties et une conclusion :\n\n' },
  { category: 'Rédaction', name: 'Présentation', prompt: 'Crée un plan de présentation de 10 slides sur ce sujet, avec titre, points clés et transitions :\n\n' },
  { category: 'Code', name: 'Revue de code', prompt: 'Analyse ce code, identifie les problèmes potentiels, les optimisations possibles et les bonnes pratiques manquantes :\n\n```\n\n```' },
  { category: 'Code', name: 'Débogage', prompt: 'J\'ai ce bug dans mon code. Identifie la cause et propose une solution :\n\nErreur :\n\nCode :\n```\n\n```' },
  { category: 'Analyse', name: 'Analyse SWOT', prompt: 'Réalise une analyse SWOT complète (Forces, Faiblesses, Opportunités, Menaces) pour :\n\n' },
  { category: 'Analyse', name: 'Comparaison', prompt: 'Compare ces deux options en détail sous forme de tableau avec critères, avantages et inconvénients :\n\nOption A :\nOption B :' },
  { category: 'Business', name: 'Email commercial', prompt: 'Rédige un email commercial percutant pour proposer ce service/produit à un client potentiel :\n\n' },
  { category: 'Business', name: 'Plan d\'action', prompt: 'Crée un plan d\'action détaillé avec étapes, priorités et délais pour atteindre cet objectif :\n\n' },
]

const SYSTEM_PROMPTS_PRESETS = [
  { name: 'Assistant général', prompt: 'Tu es un assistant IA utile, précis et concis. Tu réponds toujours en français sauf si demandé autrement.' },
  { name: 'Expert technique', prompt: 'Tu es un expert technique senior. Tes réponses sont précises, techniques et orientées solutions. Tu fournis du code fonctionnel et expliques les choix architecturaux.' },
  { name: 'Professeur', prompt: 'Tu es un professeur pédagogue. Tu expliques les concepts de manière simple, avec des exemples concrets et des analogies. Tu adaptes ton niveau à celui de l\'élève.' },
  { name: 'Rédacteur créatif', prompt: 'Tu es un rédacteur créatif professionnel. Tes textes sont engageants, bien structurés et adaptés au public cible. Tu soignes le style et la fluidité.' },
  { name: 'Analyste business', prompt: 'Tu es un analyste business expérimenté. Tu fournis des analyses structurées, des recommandations actionnables et des insights basés sur les données.' },
]

function getOrCreateGuestId(): string {
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
    <div className={cn('flex gap-3 group', isUser ? 'flex-row-reverse' : 'flex-row')}>
      <div className={cn('w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center',
        isUser ? 'bg-brand-600 text-white' : 'bg-gradient-to-br from-brand-700 to-accent-600 text-white')}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
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
        <button onClick={() => { onCopy(msg.content); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
          className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs text-white/40 hover:text-white/70 px-1">
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copié' : 'Copier'}
        </button>
      </div>
    </div>
  )
}

// ── Novice suggestions ─────────────────────────────────────────────
const NOVICE_SUGGESTIONS = [
  { emoji: '✍️', text: 'Rédige un email professionnel' },
  { emoji: '🧠', text: 'Explique-moi l\'intelligence artificielle' },
  { emoji: '📝', text: 'Corrige ce texte pour moi' },
  { emoji: '💡', text: 'Donne-moi des idées de noms pour mon projet' },
  { emoji: '🌍', text: 'Traduis ce texte en anglais' },
  { emoji: '📊', text: 'Comment créer un tableau Excel ?' },
]

export function ChatInterface({ initialChatId, defaultMode }: { initialChatId?: string; defaultMode?: Mode }) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [chatId, setChatId] = useState<string | undefined>(initialChatId)
  const [limitError, setLimitError] = useState<{ message: string; upgrade: boolean; register?: boolean } | null>(null)
  const [guestLeft, setGuestLeft] = useState<number | null>(null)

  // Mode state
  const [mode, setMode] = useState<Mode>(defaultMode ?? 'novice')
  const [showTemplates, setShowTemplates] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // Expert mode settings
  const [systemPrompt, setSystemPrompt] = useState('')
  const [temperature, setTemperature] = useState(0.7)
  const [selectedPreset, setSelectedPreset] = useState('')

  const endRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const guestId = getOrCreateGuestId()
  const GUEST_LIMIT = 5

  useEffect(() => {
    const saved = getMode()
    if (!defaultMode) setMode(saved)
  }, [defaultMode])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (!session) {
      const used = parseInt(localStorage.getItem('njp-guest-used') ?? '0', 10)
      setGuestLeft(Math.max(0, GUEST_LIMIT - used))
    }
  }, [session])

  const switchMode = (m: Mode) => {
    setMode(m)
    localStorage.setItem('njp-mode', m)
  }

  const handleSubmit = useCallback(async (e?: React.FormEvent, overrideInput?: string) => {
    e?.preventDefault()
    const text = (overrideInput ?? input).trim()
    if (!text || loading) return

    const userMsg: Message = { role: 'user', content: text, id: crypto.randomUUID() }
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
          systemPrompt: mode === 'expert' && systemPrompt ? systemPrompt : undefined,
          temperature: mode === 'expert' ? temperature : 0.7,
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
      setMessages((prev) => [...prev, { role: 'assistant', content: data.message, id: crypto.randomUUID() }])

      if (!session) {
        const used = parseInt(localStorage.getItem('njp-guest-used') ?? '0', 10) + 1
        localStorage.setItem('njp-guest-used', String(used))
        setGuestLeft(Math.max(0, GUEST_LIMIT - used))
      }
    } catch (err: any) {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: `Désolé, une erreur est survenue : ${err.message}`,
        id: crypto.randomUUID(),
      }])
    } finally {
      setLoading(false)
    }
  }, [input, loading, messages, chatId, guestId, session, mode, systemPrompt, temperature])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px'
  }

  const clearChat = () => {
    setMessages([]); setChatId(undefined); setLimitError(null)
    if (!session) { localStorage.removeItem('njp-guest-used'); setGuestLeft(GUEST_LIMIT) }
  }

  const copyToClipboard = (text: string) => navigator.clipboard.writeText(text)

  const exportConversation = () => {
    const md = messages.map((m) => `**${m.role === 'user' ? 'Vous' : 'NJP CLAW'}:**\n\n${m.content}`).join('\n\n---\n\n')
    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'conversation-njp-claw.md'; a.click()
    URL.revokeObjectURL(url)
  }

  const applyTemplate = (prompt: string) => {
    setInput(prompt)
    setShowTemplates(false)
    textareaRef.current?.focus()
  }

  const applyQuickAction = (prompt: string) => {
    setInput(prompt)
    textareaRef.current?.focus()
  }

  const applyPreset = (preset: typeof SYSTEM_PROMPTS_PRESETS[0]) => {
    setSystemPrompt(preset.prompt)
    setSelectedPreset(preset.name)
  }

  const planLabel = (session?.user as any)?.plan === 'PRO' ? 'NJP Pro'
    : (session?.user as any)?.plan === 'ULTIMATE' ? 'NJP Ultimate'
    : 'NJP Standard'

  return (
    <div className="flex flex-col h-full">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          {/* Mode toggle */}
          <div className="flex items-center glass rounded-xl p-0.5 gap-0.5">
            <button onClick={() => switchMode('novice')}
              className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                mode === 'novice' ? 'bg-emerald-600 text-white shadow' : 'text-white/50 hover:text-white/80')}>
              <Lightbulb className="w-3 h-3" />
              Novice
            </button>
            <button onClick={() => switchMode('expert')}
              className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                mode === 'expert' ? 'bg-brand-600 text-white shadow' : 'text-white/50 hover:text-white/80')}>
              <Code2 className="w-3 h-3" />
              Expert
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-white/40">{planLabel}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {!session && guestLeft !== null && (
            <span className="text-xs text-white/30 mr-2">
              {guestLeft} msg{guestLeft !== 1 ? 's' : ''} restant{guestLeft !== 1 ? 's' : ''}
            </span>
          )}

          {/* Expert: template library */}
          {mode === 'expert' && (
            <button onClick={() => { setShowTemplates(!showTemplates); setShowSettings(false) }}
              className={cn('p-1.5 rounded-lg transition-colors text-xs flex items-center gap-1',
                showTemplates ? 'bg-brand-600/30 text-brand-300' : 'hover:bg-white/10 text-white/40 hover:text-white/70')}>
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Templates</span>
            </button>
          )}

          {/* Expert: settings */}
          {mode === 'expert' && (
            <button onClick={() => { setShowSettings(!showSettings); setShowTemplates(false) }}
              className={cn('p-1.5 rounded-lg transition-colors text-xs flex items-center gap-1',
                showSettings ? 'bg-brand-600/30 text-brand-300' : 'hover:bg-white/10 text-white/40 hover:text-white/70')}>
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Paramètres</span>
            </button>
          )}

          {messages.length > 0 && mode === 'expert' && (
            <button onClick={exportConversation}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/40 hover:text-white/70">
              <Download className="w-3.5 h-3.5" />
            </button>
          )}

          {messages.length > 0 && (
            <button onClick={clearChat}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/40 hover:text-white/70">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <Link href="/chat" onClick={clearChat}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/40 hover:text-white/70">
            <PlusCircle className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ── Expert: Template library panel ── */}
      {mode === 'expert' && showTemplates && (
        <div className="border-b border-white/5 px-4 py-3 bg-white/[0.02] animate-fade-in">
          <p className="text-xs font-semibold text-white/50 mb-2">Bibliothèque de prompts</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(
              PROMPT_TEMPLATES.reduce((acc, t) => {
                if (!acc[t.category]) acc[t.category] = []
                acc[t.category].push(t)
                return acc
              }, {} as Record<string, typeof PROMPT_TEMPLATES>)
            ).map(([cat, templates]) => (
              <div key={cat} className="flex flex-col gap-1">
                <p className="text-xs text-white/30 font-medium">{cat}</p>
                {templates.map((t) => (
                  <button key={t.name} onClick={() => applyTemplate(t.prompt)}
                    className="glass hover:bg-white/10 rounded-lg px-3 py-1.5 text-xs text-white/70 hover:text-white text-left transition-all whitespace-nowrap">
                    {t.name}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Expert: Settings panel ── */}
      {mode === 'expert' && showSettings && (
        <div className="border-b border-white/5 px-4 py-4 bg-white/[0.02] animate-fade-in space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-white/50">Prompt système</p>
              <div className="flex gap-1">
                {SYSTEM_PROMPTS_PRESETS.map((p) => (
                  <button key={p.name} onClick={() => applyPreset(p)}
                    className={cn('text-xs px-2 py-0.5 rounded-lg transition-all',
                      selectedPreset === p.name ? 'bg-brand-600 text-white' : 'glass hover:bg-white/10 text-white/50 hover:text-white')}>
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Définissez le comportement de l'IA (ex: Tu es un expert en marketing…)"
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs placeholder-white/30 focus:outline-none focus:border-brand-500/50 resize-none"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-white/50">Créativité</p>
              <span className="text-xs text-brand-400 font-mono">{temperature.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/30">Précis</span>
              <input type="range" min="0" max="1" step="0.1" value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="flex-1 accent-brand-500 h-1.5 rounded-full" />
              <span className="text-xs text-white/30">Créatif</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Messages area ── */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-6 py-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-600 to-accent-500 flex items-center justify-center shadow-lg glow-brand">
              {mode === 'novice' ? <Lightbulb className="w-8 h-8 text-white" /> : <Code2 className="w-8 h-8 text-white" />}
            </div>

            {mode === 'novice' ? (
              <>
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Bonjour ! Comment puis-je vous aider ?</h2>
                  <p className="text-white/40 text-sm">Choisissez une action rapide ou posez votre question.</p>
                </div>

                {/* Quick actions */}
                <div className="flex flex-wrap justify-center gap-2 w-full max-w-lg">
                  {QUICK_ACTIONS.map((a) => (
                    <button key={a.label} onClick={() => applyQuickAction(a.prompt)}
                      className="glass hover:bg-white/10 rounded-xl px-3 py-2 flex items-center gap-2 text-sm text-white/70 hover:text-white transition-all group">
                      <span className={cn('transition-transform group-hover:scale-110', a.color)}>{a.icon}</span>
                      {a.label}
                    </button>
                  ))}
                </div>

                {/* Suggestions */}
                <div className="w-full max-w-lg">
                  <p className="text-xs text-white/30 mb-2">Ou essayez :</p>
                  <div className="grid grid-cols-2 gap-2">
                    {NOVICE_SUGGESTIONS.map((s) => (
                      <button key={s.text} onClick={() => { setInput(s.text); textareaRef.current?.focus() }}
                        className="glass hover:bg-white/10 rounded-xl px-3 py-2.5 text-xs text-white/70 hover:text-white text-left transition-all flex items-center gap-2">
                        <span>{s.emoji}</span>
                        {s.text}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Mode Expert activé</h2>
                  <p className="text-white/40 text-sm max-w-sm">
                    Configurez le prompt système, ajustez la créativité et utilisez la bibliothèque de templates.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowSettings(true)}
                    className="glass hover:bg-white/10 rounded-xl px-4 py-2.5 text-sm text-white/70 hover:text-white flex items-center gap-2 transition-all">
                    <Settings className="w-4 h-4" />
                    Configurer
                  </button>
                  <button onClick={() => setShowTemplates(true)}
                    className="glass hover:bg-white/10 rounded-xl px-4 py-2.5 text-sm text-white/70 hover:text-white flex items-center gap-2 transition-all">
                    <BookOpen className="w-4 h-4" />
                    Templates
                  </button>
                </div>
                {systemPrompt && (
                  <div className="glass rounded-xl p-3 max-w-sm w-full">
                    <p className="text-xs text-white/40 mb-1">Prompt système actif :</p>
                    <p className="text-xs text-white/70 line-clamp-2">{systemPrompt}</p>
                  </div>
                )}
              </>
            )}
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
            <div className="chat-bubble-ai"><TypingDots /></div>
          </div>
        )}

        {limitError && (
          <div className="glass border border-red-500/20 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">{limitError.message}</span>
            </div>
            <div className="flex gap-2 flex-wrap">
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

      {/* ── Input area ── */}
      <div className="px-4 pb-4 pt-2">
        {/* Novice: quick actions strip above input */}
        {mode === 'novice' && messages.length > 0 && (
          <div className="flex gap-1.5 mb-2 overflow-x-auto pb-1 scrollbar-none">
            {QUICK_ACTIONS.map((a) => (
              <button key={a.label} onClick={() => applyQuickAction(a.prompt)}
                className="glass hover:bg-white/10 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-all whitespace-nowrap flex-shrink-0">
                <span className={a.color}>{a.icon}</span>
                {a.label}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="glass-strong rounded-2xl p-3 flex items-end gap-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={mode === 'novice'
              ? 'Posez votre question…'
              : 'Rédigez votre prompt… (Entrée pour envoyer, Shift+Entrée pour sauter une ligne)'}
            rows={1}
            className="flex-1 bg-transparent resize-none text-white placeholder-white/30 text-sm focus:outline-none leading-relaxed py-1 max-h-[200px]"
            disabled={loading || limitError !== null}
          />
          <button type="submit" disabled={loading || !input.trim() || limitError !== null}
            className={cn('flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all',
              input.trim() && !loading && !limitError
                ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg hover:shadow-brand-600/40 hover:scale-105'
                : 'bg-white/5 text-white/20 cursor-not-allowed')}>
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
        <p className="text-center text-xs text-white/20 mt-2">
          NJP CLAW peut faire des erreurs. Vérifiez les informations importantes.
        </p>
      </div>
    </div>
  )
}
