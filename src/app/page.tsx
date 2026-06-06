'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import {
  ArrowRight, Zap, CheckCircle,
  Code2, Lightbulb, MessageSquare, Hammer,
  Send, Cpu, MonitorPlay
} from 'lucide-react'

const SUGGESTIONS = [
  'Crée une landing page moderne',
  'Explique-moi le machine learning',
  'Rédige un email de relance client',
  'Fais un dashboard avec des stats',
  "Débogue ce code Python",
  'Génère 10 noms pour ma startup',
]

export default function HomePage() {
  const router = useRouter()
  const [input, setInput] = useState('')
  const [focused, setFocused] = useState(false)
  const [activeMode, setActiveMode] = useState<'chat' | 'builder'>('chat')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    const text = input.trim()
    if (!text) return
    const mode = activeMode === 'builder' ? 'builder' : 'novice'
    router.push(`/chat?q=${encodeURIComponent(text)}&mode=${mode}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px'
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── Hero ── */}
      <section className="flex flex-col items-center justify-center min-h-screen px-4 pt-16 bg-white">
        <div className="w-full max-w-2xl mx-auto text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-zinc-100 border border-zinc-200 px-4 py-2 rounded-full text-xs text-zinc-500 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Gratuit · Sans inscription · Modes Novice, Expert &amp; Builder
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-zinc-900 leading-tight mb-4 tracking-tight">
            NJP <span className="gradient-text">CLAW</span>
          </h1>
          <p className="text-lg text-zinc-500 mb-10 max-w-sm mx-auto leading-relaxed">
            Posez n'importe quelle question. Créez des sites web en direct.
          </p>

          {/* Mode switcher */}
          <div className="flex items-center justify-center gap-1 mb-5 bg-zinc-100 rounded-xl p-1 w-fit mx-auto">
            <button
              onClick={() => setActiveMode('chat')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeMode === 'chat' ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200' : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Assistant IA
            </button>
            <button
              onClick={() => setActiveMode('builder')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeMode === 'builder' ? 'bg-violet-600 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              <Hammer className="w-3.5 h-3.5" />
              Builder de sites
            </button>
          </div>

          {/* Main chatbox */}
          <form onSubmit={handleSubmit} className="relative w-full">
            <div className={`bg-white rounded-2xl border-2 transition-all duration-200 ${
              focused
                ? activeMode === 'builder'
                  ? 'border-violet-400 shadow-lg shadow-violet-500/10'
                  : 'border-brand-400 shadow-lg shadow-brand-500/10'
                : 'border-zinc-200 shadow-sm'
            }`}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder={
                  activeMode === 'builder'
                    ? "Décrivez le site ou l'interface à créer…"
                    : 'Posez votre question…'
                }
                rows={1}
                className="w-full bg-transparent px-5 pt-4 pb-12 text-zinc-900 placeholder-zinc-400 text-base focus:outline-none leading-relaxed resize-none max-h-[140px]"
              />
              <div className="absolute bottom-3 left-4 right-3 flex items-center justify-between">
                <span className="text-xs text-zinc-400">Entrée pour envoyer</span>
                <button type="submit" disabled={!input.trim()}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    input.trim()
                      ? activeMode === 'builder'
                        ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-sm hover:scale-105'
                        : 'bg-brand-600 hover:bg-brand-500 text-white shadow-sm hover:scale-105'
                      : 'bg-zinc-100 text-zinc-300 cursor-not-allowed'
                  }`}>
                  <Send className="w-3 h-3" />
                  {activeMode === 'builder' ? 'Construire' : 'Envoyer'}
                </button>
              </div>
            </div>
          </form>

          {/* Suggestions */}
          <div className="flex flex-wrap justify-center gap-2 mt-5">
            {SUGGESTIONS.map((s) => (
              <button key={s}
                onClick={() => router.push(`/chat?q=${encodeURIComponent(s)}&mode=${activeMode === 'builder' ? 'builder' : 'novice'}`)}
                className="bg-white border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 rounded-xl px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-800 transition-all">
                {s}
              </button>
            ))}
          </div>

          {/* Sub-links */}
          <div className="flex items-center justify-center gap-6 mt-8 text-sm">
            <Link href="/agents" className="text-zinc-400 hover:text-zinc-700 flex items-center gap-1.5 transition-colors">
              <Cpu className="w-3.5 h-3.5" />Agents spécialisés
            </Link>
            <Link href="/pricing" className="text-zinc-400 hover:text-zinc-700 flex items-center gap-1.5 transition-colors">
              <Zap className="w-3.5 h-3.5" />Voir les offres
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 px-4 bg-zinc-50 border-t border-zinc-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-zinc-900 mb-3">Trois modes, une seule plateforme</h2>
            <p className="text-zinc-500">De la question simple à la création de site web en direct.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 mb-12">
            {[
              {
                href: '/chat?mode=novice',
                icon: <Lightbulb className="w-5 h-5 text-white" />,
                bg: 'bg-emerald-500',
                title: 'Mode Novice',
                desc: 'Actions rapides en 1 clic, suggestions intelligentes, interface épurée.',
                cta: 'Essayer',
              },
              {
                href: '/chat?mode=expert',
                icon: <Code2 className="w-5 h-5 text-white" />,
                bg: 'bg-brand-600',
                title: 'Mode Expert',
                desc: 'Prompt système, température, bibliothèque de templates, export Markdown.',
                cta: 'Essayer',
              },
              {
                href: '/chat?mode=builder',
                icon: <Hammer className="w-5 h-5 text-white" />,
                bg: 'bg-violet-600',
                title: 'NJP Builder',
                desc: 'Créez des sites web complets avec Live Preview en temps réel. Décrivez, voyez, itérez.',
                cta: 'Créer un site',
              },
            ].map((f) => (
              <Link key={f.title} href={f.href} className="card group block">
                <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm`}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-zinc-900 mb-2">{f.title}</h3>
                <p className="text-sm text-zinc-500 mb-3 leading-relaxed">{f.desc}</p>
                <span className="text-xs text-brand-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                  {f.cta} <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            ))}
          </div>

          {/* Builder showcase */}
          <div className="card overflow-hidden p-0">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
                  <MonitorPlay className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <p className="font-semibold text-zinc-900 text-sm">Live Preview</p>
                  <p className="text-xs text-zinc-400">Le code s'affiche dans l'aperçu pendant que l'IA génère</p>
                </div>
              </div>
              <Link href="/chat?mode=builder" className="btn-primary py-1.5 px-4 text-sm">
                Essayer <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-100">
              <div className="p-5">
                <p className="text-xs font-medium text-zinc-400 mb-3 uppercase tracking-wide">Votre message</p>
                <div className="bg-brand-600 text-white rounded-xl rounded-tr-sm px-4 py-3 text-sm inline-block max-w-xs">
                  Crée une landing page moderne pour une app de productivité
                </div>
              </div>
              <div className="p-5 bg-zinc-50">
                <p className="text-xs font-medium text-zinc-400 mb-3 uppercase tracking-wide">Aperçu en direct</p>
                <div className="bg-white border border-zinc-200 rounded-xl p-4 text-xs font-mono text-zinc-500 leading-relaxed h-28 overflow-hidden">
                  <span className="text-zinc-400">&lt;!DOCTYPE html&gt;</span><br />
                  <span className="text-blue-600">&lt;html lang="fr"&gt;</span><br />
                  <span className="pl-4 text-zinc-500">&lt;head&gt;…&lt;/head&gt;</span><br />
                  <span className="pl-4 text-zinc-500">&lt;body class="bg-slate-50"&gt;</span><br />
                  <span className="pl-8 text-emerald-600">&lt;!-- hero section --&gt;</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Agents teaser ── */}
      <section className="py-16 px-4 bg-white border-t border-zinc-100">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 mb-1">Agents spécialisés</h2>
              <p className="text-zinc-500 text-sm">Des IA expertes dans leur domaine, prêtes à l'emploi.</p>
            </div>
            <Link href="/agents" className="text-sm text-brand-600 font-medium hover:text-brand-700 flex items-center gap-1">
              Voir tout <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { emoji: '💻', name: 'Expert Code', desc: 'Debug, review, architecture' },
              { emoji: '✍️', name: 'Rédacteur Pro', desc: 'Textes, emails, articles' },
              { emoji: '📊', name: 'Analyste Business', desc: 'Données, stratégie, KPIs' },
              { emoji: '🎨', name: 'Créatif', desc: 'Idées, brainstorm, copy' },
            ].map((a) => (
              <Link key={a.name} href="/agents" className="card group flex flex-col gap-2 p-4 hover:border-brand-200">
                <span className="text-2xl">{a.emoji}</span>
                <p className="font-semibold text-zinc-900 text-sm">{a.name}</p>
                <p className="text-xs text-zinc-400">{a.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing teaser ── */}
      <section className="py-16 px-4 bg-zinc-50 border-t border-zinc-100">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">Commencez gratuitement</h2>
          <p className="text-zinc-500 text-sm">Évoluez quand vous êtes prêt. Annulez à tout moment.</p>
        </div>
        <div className="max-w-3xl mx-auto grid md:grid-cols-3 gap-4">
          {[
            { name: 'Gratuit', price: '0€', badge: 'badge-free', engine: 'NJP Standard', perks: ['5 msg sans compte', '20 msg/jour avec compte', 'Modes Novice, Expert & Builder'], highlight: false },
            { name: 'Pro', price: '9,99€/mois', badge: 'badge-pro', engine: 'NJP Pro', perks: ['500 messages/jour', 'Moteur 8× plus puissant', 'Historique + Export'], highlight: true },
            { name: 'Ultimate', price: '29,99€/mois', badge: 'badge-ultimate', engine: 'NJP Ultimate', perks: ['Illimité', 'Moteur le plus puissant', 'API + Support 24/7'], highlight: false },
          ].map((p) => (
            <div key={p.name} className={`card flex flex-col gap-3 ${p.highlight ? 'border-brand-300 shadow-md' : ''}`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-900 text-sm">{p.name}</span>
                <span className={p.badge}>{p.name.toUpperCase()}</span>
              </div>
              <div>
                <p className="text-xl font-black text-zinc-900">{p.price}</p>
                <p className="text-xs text-zinc-400">{p.engine}</p>
              </div>
              <ul className="space-y-1.5 flex-1">
                {p.perks.map((pk) => (
                  <li key={pk} className="flex items-center gap-2 text-xs text-zinc-600">
                    <CheckCircle className="w-3 h-3 text-emerald-500 flex-shrink-0" />{pk}
                  </li>
                ))}
              </ul>
              <Link href={p.name === 'Gratuit' ? '/chat' : '/pricing'}
                className={`text-sm text-center py-2 rounded-xl transition-all border font-medium ${
                  p.highlight
                    ? 'bg-brand-600 text-white border-brand-600 hover:bg-brand-700'
                    : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                }`}>
                {p.name === 'Gratuit' ? 'Commencer' : 'Choisir'}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 py-8 px-4 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-brand-600 to-brand-500 flex items-center justify-center">
              <span className="text-white font-black text-xs">N</span>
            </div>
            <span className="font-bold text-zinc-900 text-sm">NJP CLAW</span>
          </div>
          <p className="text-xs text-zinc-400">© {new Date().getFullYear()} NJP CLAW. Tous droits réservés.</p>
          <div className="flex gap-5 text-xs text-zinc-400">
            <Link href="/agents" className="hover:text-zinc-700 transition-colors">Agents</Link>
            <Link href="/pricing" className="hover:text-zinc-700 transition-colors">Tarifs</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
