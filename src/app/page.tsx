import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import {
  ArrowRight, Zap, Shield, Star, CheckCircle, Bot,
  MessageSquare, Lightbulb, Code2, Sparkles, BookOpen, Wand2
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0e1128]">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-brand-600/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-accent-500/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-white/70 mb-8 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-accent-400" />
            Assistant IA · Mode Novice &amp; Expert · Gratuit sans inscription
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight mb-6">
            L'IA qui s'adapte
            <br />
            <span className="gradient-text">à votre niveau</span>
          </h1>

          <p className="text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            NJP CLAW est votre assistant intelligent personnel. Débutant ou expert —
            choisissez l'interface qui vous convient et commencez à créer, apprendre et automatiser.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/chat" className="btn-primary text-base px-8 py-4 flex items-center gap-2">
              <Bot className="w-5 h-5" />
              Commencer gratuitement
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/pricing" className="btn-secondary text-base px-8 py-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent-400" />
              Voir les offres
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 mt-16 text-center">
            {[
              { value: '2 modes', label: 'Novice & Expert' },
              { value: '100%', label: 'Gratuit sans compte' },
              { value: '50+', label: "Actions rapides prêtes" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-black gradient-text">{stat.value}</p>
                <p className="text-sm text-white/40 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modes section */}
      <section className="py-20 px-4 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Deux modes, une seule plateforme</h2>
            <p className="text-white/50 max-w-xl mx-auto">Changez de mode en un clic selon votre besoin du moment.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Novice */}
            <div className="card border-emerald-500/20 bg-emerald-500/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Mode Novice</h3>
                  <p className="text-xs text-emerald-400">Simple · Guidé · Intuitif</p>
                </div>
              </div>
              <ul className="space-y-3 text-sm text-white/70">
                {[
                  'Actions rapides en 1 clic (traduire, résumer, corriger…)',
                  'Suggestions de questions intelligentes',
                  'Interface épurée sans options complexes',
                  'Réponses simplifiées et pédagogiques',
                  'Exemples et modèles prêts à utiliser',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/chat?mode=novice" className="btn-secondary text-sm text-center mt-6 w-full block">
                Essayer le mode Novice →
              </Link>
            </div>

            {/* Expert */}
            <div className="card border-brand-500/20 bg-brand-500/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 flex items-center justify-center text-white">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Mode Expert</h3>
                  <p className="text-xs text-brand-400">Avancé · Personnalisable · Puissant</p>
                </div>
              </div>
              <ul className="space-y-3 text-sm text-white/70">
                {[
                  'Prompt système personnalisable',
                  'Contrôle de la créativité (température)',
                  'Bibliothèque de prompts sauvegardés',
                  'Export Markdown / JSON',
                  'Paramètres avancés et raccourcis clavier',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/chat?mode=expert" className="btn-primary text-sm text-center mt-6 w-full block">
                Essayer le mode Expert →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Tout ce dont vous avez besoin</h2>
            <p className="text-white/50 max-w-xl mx-auto">Des outils puissants pour chaque situation.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Wand2 className="w-6 h-6" />,
                title: 'Actions rapides',
                desc: 'Traduire, résumer, corriger, reformuler, coder — en un seul clic.',
                color: 'from-emerald-600 to-teal-600',
              },
              {
                icon: <BookOpen className="w-6 h-6" />,
                title: 'Bibliothèque de prompts',
                desc: '50+ templates prêts : emails, présentations, analyses, code…',
                color: 'from-brand-600 to-blue-600',
              },
              {
                icon: <MessageSquare className="w-6 h-6" />,
                title: 'Conversations contextuelles',
                desc: 'L\'IA mémorise votre conversation et s\'adapte à vos réponses.',
                color: 'from-purple-600 to-brand-600',
              },
              {
                icon: <Code2 className="w-6 h-6" />,
                title: 'Rendu code avancé',
                desc: 'Syntaxe colorée, copie en un clic, support multi-langages.',
                color: 'from-accent-500 to-rose-600',
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: 'Privé par défaut',
                desc: 'Vos conversations ne sont pas revendues ni utilisées pour l\'entraînement.',
                color: 'from-teal-600 to-emerald-600',
              },
              {
                icon: <Sparkles className="w-6 h-6" />,
                title: 'Sans inscription',
                desc: 'Commencez immédiatement. Créez un compte pour sauvegarder votre historique.',
                color: 'from-yellow-500 to-accent-500',
              },
            ].map((f) => (
              <div key={f.title} className="card hover:border-white/15 group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans preview */}
      <section className="py-20 px-4 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Simple, Transparent, Puissant</h2>
          <p className="text-white/50 mb-12">Commencez gratuitement, évoluez quand vous êtes prêt.</p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Gratuit',
                price: '0€',
                badge: 'badge-free',
                badgeText: 'GRATUIT',
                engine: 'NJP Standard',
                perks: ['5 msg/session sans compte', '20 msg/jour avec compte', 'Modes Novice & Expert'],
              },
              {
                name: 'Pro',
                price: '9,99€/mois',
                badge: 'badge-pro',
                badgeText: 'PRO',
                engine: 'NJP Pro',
                perks: ['500 messages/jour', 'Moteur Pro (8× plus puissant)', 'Historique illimité', 'Export'],
                highlight: true,
              },
              {
                name: 'Ultimate',
                price: '29,99€/mois',
                badge: 'badge-ultimate',
                badgeText: 'ULTIMATE',
                engine: 'NJP Ultimate',
                perks: ['Messages illimités', 'Moteur le plus puissant', 'Accès API', 'Support 24/7'],
              },
            ].map((plan) => (
              <div key={plan.name} className={`card flex flex-col gap-4 ${plan.highlight ? 'border-brand-500/30 glow-brand' : ''}`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{plan.name}</span>
                  <span className={plan.badge}>{plan.badgeText}</span>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">{plan.price}</p>
                  <p className="text-xs text-white/40">{plan.engine}</p>
                </div>
                <ul className="space-y-2 text-sm text-white/60">
                  {plan.perks.map((p) => (
                    <li key={p} className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
                <Link href={plan.name === 'Gratuit' ? '/chat' : '/pricing'}
                  className={plan.highlight ? 'btn-primary text-sm text-center mt-auto' : 'btn-secondary text-sm text-center mt-auto'}>
                  {plan.name === 'Gratuit' ? 'Commencer' : 'Choisir ce plan'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass rounded-3xl p-10 border border-brand-500/20 glow-brand">
            <h2 className="text-4xl font-black text-white mb-4">
              Prêt à essayer <span className="gradient-text">NJP CLAW</span> ?
            </h2>
            <p className="text-white/50 mb-8">Aucune carte de crédit. Aucune inscription. Juste l'IA.</p>
            <Link href="/chat" className="btn-primary text-lg px-10 py-4 inline-flex items-center gap-2">
              <Bot className="w-5 h-5" />
              Lancer NJP CLAW
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
              <span className="text-white font-black text-xs">NJP</span>
            </div>
            <span className="font-bold text-white">NJP CLAW</span>
          </div>
          <p className="text-sm text-white/30">© {new Date().getFullYear()} NJP CLAW. Tous droits réservés.</p>
          <div className="flex gap-6 text-sm text-white/40">
            <Link href="/pricing" className="hover:text-white transition-colors">Tarifs</Link>
            <Link href="/chat" className="hover:text-white transition-colors">Chat</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
