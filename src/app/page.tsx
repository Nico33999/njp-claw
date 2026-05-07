import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { ArrowRight, Zap, Shield, Globe, Star, CheckCircle, Bot, Cpu, MessageSquare } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0e1128]">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-brand-600/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-accent-500/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-white/70 mb-8 border border-white/10">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Propulsé par Meta AI · Llama 3.1 · Gratuit sans inscription
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight mb-6">
            L'IA qui vous
            <br />
            <span className="gradient-text">comprend vraiment</span>
          </h1>

          <p className="text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            NJP CLAW vous donne accès à Meta AI nativement — sans compte requis.
            Conversez, créez, apprenez. Passez à Pro pour décupler vos capacités.
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

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-16 text-center">
            {[
              { value: '405B', label: 'Paramètres (Ultimate)' },
              { value: '100%', label: 'Gratuit sans compte' },
              { value: '∞', label: 'Messages (Ultimate)' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-black gradient-text">{stat.value}</p>
                <p className="text-sm text-white/40 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              Une plateforme complète, intuitive, et puissante — peu importe votre niveau.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Globe className="w-6 h-6" />,
                title: 'Sans inscription',
                desc: 'Commencez à discuter immédiatement. Aucun compte requis pour les 5 premiers messages.',
                color: 'from-emerald-600 to-teal-600',
              },
              {
                icon: <Cpu className="w-6 h-6" />,
                title: 'Meta AI natif',
                desc: 'Accès direct aux modèles Llama 3.1 (8B, 70B, 405B) développés par Meta.',
                color: 'from-brand-600 to-blue-600',
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: 'Privé & Sécurisé',
                desc: 'Vos conversations restent privées. Nous ne revendons pas vos données.',
                color: 'from-purple-600 to-brand-600',
              },
              {
                icon: <MessageSquare className="w-6 h-6" />,
                title: 'Historique persistant',
                desc: 'Avec un compte, retrouvez toutes vos conversations passées à tout moment.',
                color: 'from-accent-500 to-rose-600',
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: 'Ultra rapide',
                desc: 'Réponses en streaming pour une expérience fluide et instantanée.',
                color: 'from-yellow-500 to-accent-500',
              },
              {
                icon: <Star className="w-6 h-6" />,
                title: 'Multi-format',
                desc: 'Rendu Markdown complet : code, tableaux, listes, formules et plus encore.',
                color: 'from-pink-600 to-purple-600',
              },
            ].map((f) => (
              <div key={f.title} className="card hover:border-white/15 group">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}
                >
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
                model: 'Llama 3.1 8B',
                perks: ['5 msg/session sans compte', '20 msg/jour avec compte', 'Modèle 8B'],
              },
              {
                name: 'Pro',
                price: '9,99€/mois',
                badge: 'badge-pro',
                badgeText: 'PRO',
                model: 'Llama 3.1 70B',
                perks: ['500 messages/jour', 'Modèle 70B', 'Historique illimité', 'Export'],
                highlight: true,
              },
              {
                name: 'Ultimate',
                price: '29,99€/mois',
                badge: 'badge-ultimate',
                badgeText: 'ULTIMATE',
                model: 'Llama 3.1 405B',
                perks: ['Messages illimités', 'Modèle 405B max', 'Accès API', 'Support 24/7'],
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`card flex flex-col gap-4 ${plan.highlight ? 'border-brand-500/30 glow-brand' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{plan.name}</span>
                  <span className={plan.badge}>{plan.badgeText}</span>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">{plan.price}</p>
                  <p className="text-xs text-white/40">{plan.model}</p>
                </div>
                <ul className="space-y-2 text-sm text-white/60">
                  {plan.perks.map((p) => (
                    <li key={p} className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.name === 'Gratuit' ? '/chat' : '/pricing'}
                  className={plan.highlight ? 'btn-primary text-sm text-center mt-auto' : 'btn-secondary text-sm text-center mt-auto'}
                >
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
              Prêt à discuter avec <span className="gradient-text">Meta AI</span> ?
            </h2>
            <p className="text-white/50 mb-8">
              Aucune carte de crédit. Aucune inscription. Juste l'IA.
            </p>
            <Link href="/chat" className="btn-primary text-lg px-10 py-4 inline-flex items-center gap-2">
              <Bot className="w-5 h-5" />
              Lancer NJP CLAW
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
              <span className="text-white font-black text-xs">NJP</span>
            </div>
            <span className="font-bold text-white">NJP CLAW</span>
          </div>
          <p className="text-sm text-white/30">
            © {new Date().getFullYear()} NJP CLAW. Propulsé par Meta AI.
          </p>
          <div className="flex gap-6 text-sm text-white/40">
            <Link href="/pricing" className="hover:text-white transition-colors">Tarifs</Link>
            <Link href="/chat" className="hover:text-white transition-colors">Chat</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
