'use client'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Navbar } from '@/components/Navbar'
import { CheckCircle, X, Zap, Star, Crown, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const plans = [
  {
    key: 'FREE',
    name: 'Gratuit',
    price: 0,
    period: '',
    icon: <Zap className="w-5 h-5" />,
    color: 'from-emerald-600 to-teal-600',
    badge: 'badge-free',
    badgeText: 'GRATUIT',
    engine: 'Moteur NJP Standard',
    description: 'Parfait pour découvrir NJP CLAW sans engagement.',
    features: [
      { text: '5 messages/session sans compte', included: true },
      { text: '20 messages/jour avec compte gratuit', included: true },
      { text: 'Mode Novice & Expert', included: true },
      { text: 'Actions rapides (traduire, résumer…)', included: true },
      { text: 'Historique persistant', included: false },
      { text: 'Export des conversations', included: false },
      { text: 'Moteur Pro (8× plus puissant)', included: false },
      { text: 'Support prioritaire', included: false },
    ],
    cta: 'Commencer gratuitement',
    ctaLink: '/chat',
    highlight: false,
  },
  {
    key: 'PRO',
    name: 'Pro',
    price: 9.99,
    period: '/mois',
    icon: <Star className="w-5 h-5" />,
    color: 'from-brand-600 to-blue-600',
    badge: 'badge-pro',
    badgeText: 'PRO',
    engine: 'Moteur NJP Pro',
    description: 'Pour les utilisateurs réguliers qui veulent plus de puissance.',
    features: [
      { text: '500 messages/jour', included: true },
      { text: 'Moteur NJP Pro (8× plus puissant)', included: true },
      { text: 'Historique illimité', included: true },
      { text: 'Export Markdown & JSON', included: true },
      { text: 'Bibliothèque de prompts avancée', included: true },
      { text: 'Support email sous 24h', included: true },
      { text: 'Moteur NJP Ultimate', included: false },
      { text: 'Accès API personnel', included: false },
    ],
    cta: 'Choisir Pro',
    ctaLink: null,
    highlight: true,
  },
  {
    key: 'ULTIMATE',
    name: 'Ultimate',
    price: 29.99,
    period: '/mois',
    icon: <Crown className="w-5 h-5" />,
    color: 'from-amber-500 to-orange-600',
    badge: 'badge-ultimate',
    badgeText: 'ULTIMATE',
    engine: 'Moteur NJP Ultimate',
    description: 'Pour les professionnels qui ont besoin du meilleur.',
    features: [
      { text: 'Messages illimités', included: true },
      { text: 'Moteur NJP Ultimate (le plus puissant)', included: true },
      { text: 'Historique illimité', included: true },
      { text: 'Export multi-format', included: true },
      { text: 'Bibliothèque de prompts illimitée', included: true },
      { text: 'Support 24/7 prioritaire', included: true },
      { text: 'Accès API personnel', included: true },
      { text: 'Accès aux nouvelles fonctionnalités en avant-première', included: true },
    ],
    cta: 'Choisir Ultimate',
    ctaLink: null,
    highlight: false,
  },
]

export default function PricingPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState<string | null>(null)

  const handleUpgrade = async (planKey: string) => {
    if (!session) { window.location.href = `/login?redirect=/pricing`; return }
    setLoading(planKey)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch { alert('Erreur lors de la redirection vers le paiement.') }
    finally { setLoading(null) }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="pt-28 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-zinc-100 border border-zinc-200 px-4 py-2 rounded-full text-sm text-zinc-500 mb-6">
              <Zap className="w-4 h-4 text-brand-500" />
              Choisissez votre puissance
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-zinc-900 mb-4">
              Tarifs <span className="gradient-text">simples et transparents</span>
            </h1>
            <p className="text-zinc-500 text-lg max-w-xl mx-auto">
              Commencez gratuitement. Évoluez quand vous êtes prêt. Annulez à tout moment.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 items-start">
            {plans.map((plan) => (
              <div key={plan.key}
                className={`relative card flex flex-col gap-5 ${plan.highlight ? 'border-brand-300 shadow-lg shadow-brand-500/10 scale-[1.02]' : ''}`}>
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow">
                    LE PLUS POPULAIRE
                  </div>
                )}

                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center text-white shadow-sm`}>
                    {plan.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-900">{plan.name}</span>
                      <span className={plan.badge}>{plan.badgeText}</span>
                    </div>
                    <p className="text-xs text-zinc-400">{plan.engine}</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-black text-zinc-900">
                      {(plan as any).price === 0 ? 'Gratuit' : `${plan.price}€`}
                    </span>
                    {plan.period && <span className="text-zinc-400 mb-1">{plan.period}</span>}
                  </div>
                  <p className="text-sm text-zinc-500 mt-2">{plan.description}</p>
                </div>

                <ul className="space-y-2.5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f.text} className="flex items-start gap-2.5">
                      {f.included
                        ? <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        : <X className="w-4 h-4 text-zinc-300 flex-shrink-0 mt-0.5" />}
                      <span className={`text-sm ${f.included ? 'text-zinc-700' : 'text-zinc-400'}`}>{f.text}</span>
                    </li>
                  ))}
                </ul>

                {plan.ctaLink ? (
                  <Link href={plan.ctaLink}
                    className="btn-secondary text-sm text-center flex items-center justify-center gap-2">
                    {plan.cta} <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <button onClick={() => handleUpgrade(plan.key)} disabled={loading === plan.key}
                    className={`flex items-center justify-center gap-2 text-sm py-2.5 px-5 rounded-xl font-semibold transition-all disabled:opacity-60 ${
                      plan.highlight ? 'btn-primary' : 'btn-secondary'
                    }`}>
                    {loading === plan.key ? 'Redirection…' : plan.cta}
                    {loading !== plan.key && <ArrowRight className="w-4 h-4" />}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="mt-20 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-zinc-900 text-center mb-10">Questions fréquentes</h2>
            <div className="space-y-4">
              {[
                { q: "Puis-je utiliser NJP CLAW sans compte ?", a: "Oui ! 5 messages par session sans inscription. Créez un compte gratuit pour 20 messages/jour persistants." },
                { q: "Quelle est la différence entre Standard, Pro et Ultimate ?", a: "Chaque moteur est plus puissant que le précédent. Le moteur Pro offre des réponses bien meilleures sur des tâches complexes. Ultimate est notre moteur le plus avancé, idéal pour la recherche, l'analyse et la création professionnelle." },
                { q: "Puis-je annuler à tout moment ?", a: "Absolument. Aucun engagement, annulation en un clic depuis votre dashboard. Vous bénéficiez du plan jusqu'à la fin de la période payée." },
                { q: "Mes données sont-elles sécurisées ?", a: "Vos conversations sont chiffrées. Nous ne revendons pas vos données et ne les utilisons pas pour entraîner des modèles." },
              ].map((item) => (
                <div key={item.q} className="card">
                  <h3 className="font-semibold text-zinc-900 mb-2">{item.q}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
