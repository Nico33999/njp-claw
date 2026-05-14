'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import {
  ArrowRight, Zap, Shield, Star, CheckCircle, Bot,
  Code2, Sparkles, BookOpen, Wand2, Send, Cpu,
  Lightbulb, MessageSquare
} from 'lucide-react'

const SUGGESTIONS = [
  'Écris un email pour demander une augmentation',
  'Explique-moi le machine learning simplement',
  'Rédige une description de poste pour un développeur React',
  'Crée un plan d\'entraînement pour débutant',
  "Débogue ce code Python",
  'Génère 10 idées de noms pour ma startup',
]

export default function HomePage() {
  const router = useRouter()
  const [input, setInput] = useState('')
  const [focused, setFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    const text = input.trim()
    if (!text) return
    router.push(`/chat?q=${encodeURIComponent(text)}`)
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
    <div className="min-h-screen bg-[#0e1128]">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-4 pt-16 overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-brand-600/8 rounded-full blur-3xl" />
        </div>

        <div className="relative w-full max-w-2xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-xs text-white/50 mb-8 border border-white/8">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Gratuit · Sans inscription · Modes Novice & Expert
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.1] mb-4">
            NJP <span className="gradient-text">CLAW</span>
          </h1>
          <p className="text-lg text-white/40 mb-10">
            Votre assistant IA. Posez n'importe quelle question, maintenant.
          </p>

          {/* ── Main chatbox ── */}
          <form onSubmit={handleSubmit} className="relative w-full">
            <div className={`glass-strong rounded-2xl border transition-all duration-200 ${
              focused ? 'border-brand-500/40 shadow-lg shadow-brand-500/10' : 'border-white/8'
            }`}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Posez votre question…"
                rows={1}
                className="w-full bg-transparent px-5 pt-4 pb-12 text-white placeholder-white/25 text-base focus:outline-none leading-relaxed resize-none max-h-[140px]"
              />
              {/* Bottom row */}
              <div className="absolute bottom-3 left-4 right-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-white/20">
                  <span>Entrée pour envoyer</span>
                </div>
                <button type="submit" disabled={!input.trim()}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    input.trim()
                      ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-md hover:scale-105'
                      : 'bg-white/5 text-white/15 cursor-not-allowed'
                  }`}>
                  <Send className="w-3 h-3" />
                  Envoyer
                </button>
              </div>
            </div>
          </form>

          {/* Suggestions */}
          <div className="flex flex-wrap justify-center gap-2 mt-5">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => router.push(`/chat?q=${encodeURIComponent(s)}`)}
                className="glass hover:bg-white/10 rounded-xl px-3 py-1.5 text-xs text-white/40 hover:text-white/80 transition-all text-left">
                {s}
              </button>
            ))}
          </div>

          {/* Sub-links */}
          <div className="flex items-center justify-center gap-6 mt-8 text-sm">
            <Link href="/agents" className="text-white/30 hover:text-white/70 flex items-center gap-1.5 transition-colors">
              <Cpu className="w-3.5 h-3.5" />Agents spécialisés
            </Link>
            <Link href="/pricing" className="text-white/30 hover:text-white/70 flex items-center gap-1.5 transition-colors">
              <Zap className="w-3.5 h-3.5" />Voir les offres
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features (sous le fold) ── */}
      <section className="py-24 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">Deux modes, une seule plateforme</h2>
            <p className="text-white/40">Débutant ou expert — l'IA s'adapte à votre niveau.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-16">
            <Link href="/chat?mode=novice" className="card hover:border-emerald-500/30 group block">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-white mb-2">Mode Novice</h3>
              <p className="text-sm text-white/50 mb-3">Actions rapides en 1 clic, suggestions intelligentes, interface épurée.</p>
              <span className="text-xs text-emerald-400 font-medium">Essayer →</span>
            </Link>
            <Link href="/chat?mode=expert" className="card hover:border-brand-500/30 group block">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-white mb-2">Mode Expert</h3>
              <p className="text-sm text-white/50 mb-3">Prompt système, température, bibliothèque de templates, export Markdown.</p>
              <span className="text-xs text-brand-400 font-medium">Essayer →</span>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: <Cpu className="w-5 h-5" />, title: '8 Agents spécialisés', desc: 'Expert Code, Rédacteur Pro, Coach, Analyste Business… Chacun optimisé pour son domaine.', color: 'from-violet-600 to-brand-600', link: '/agents' },
              { icon: <Wand2 className="w-5 h-5" />, title: 'Créez votre agent', desc: 'Définissez son persona, ses instructions, ses outils. Partagez-le avec la communauté.', color: 'from-accent-500 to-rose-600', link: '/agents/new' },
              { icon: <Shield className="w-5 h-5" />, title: 'Privé par défaut', desc: 'Vos conversations restent privées. Aucune revente de données.', color: 'from-teal-600 to-emerald-600', link: '/pricing' },
            ].map((f) => (
              <Link key={f.title} href={f.link} className="card hover:border-white/20 group block">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform`}>
                  {f.icon}
                </div>
                <h3 className="font-semibold text-white text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-white/45 leading-relaxed">{f.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing teaser ── */}
      <section className="py-16 px-4 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h2 className="text-2xl font-bold text-white mb-2">Commencez gratuitement</h2>
          <p className="text-white/40 text-sm">Évoluez quand vous êtes prêt. Annulez à tout moment.</p>
        </div>
        <div className="max-w-3xl mx-auto grid md:grid-cols-3 gap-4">
          {[
            { name: 'Gratuit', price: '0€', badge: 'badge-free', engine: 'NJP Standard', perks: ['5 msg sans compte', '20 msg/jour avec compte', 'Modes Novice & Expert'] },
            { name: 'Pro', price: '9,99€/mois', badge: 'badge-pro', engine: 'NJP Pro', perks: ['500 messages/jour', 'Moteur 8× plus puissant', 'Historique + Export'], highlight: true },
            { name: 'Ultimate', price: '29,99€/mois', badge: 'badge-ultimate', engine: 'NJP Ultimate', perks: ['Illimité', 'Moteur le plus puissant', 'API + Support 24/7'] },
          ].map((p) => (
            <div key={p.name} className={`card flex flex-col gap-3 ${(p as any).highlight ? 'border-brand-500/30 glow-brand' : ''}`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{p.name}</span>
                <span className={p.badge}>{p.name.toUpperCase()}</span>
              </div>
              <div>
                <p className="text-xl font-black text-white">{p.price}</p>
                <p className="text-xs text-white/30">{p.engine}</p>
              </div>
              <ul className="space-y-1.5 flex-1">
                {p.perks.map((pk) => (
                  <li key={pk} className="flex items-center gap-2 text-xs text-white/60">
                    <CheckCircle className="w-3 h-3 text-emerald-400 flex-shrink-0" />{pk}
                  </li>
                ))}
              </ul>
              <Link href={p.name === 'Gratuit' ? '/chat' : '/pricing'}
                className={`text-sm text-center py-2 rounded-xl transition-all ${(p as any).highlight ? 'btn-primary' : 'btn-secondary'}`}>
                {p.name === 'Gratuit' ? 'Commencer' : 'Choisir'}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/5 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
              <span className="text-white font-black text-xs">N</span>
            </div>
            <span className="font-bold text-white text-sm">NJP CLAW</span>
          </div>
          <p className="text-xs text-white/20">© {new Date().getFullYear()} NJP CLAW. Tous droits réservés.</p>
          <div className="flex gap-5 text-xs text-white/30">
            <Link href="/agents" className="hover:text-white transition-colors">Agents</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Tarifs</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
