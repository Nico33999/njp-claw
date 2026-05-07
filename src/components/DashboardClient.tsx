'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  MessageSquare, BarChart2, Zap, Crown, Star,
  User, Settings, ArrowRight, TrendingUp, Bot
} from 'lucide-react'
import { PLANS } from '@/lib/plans'
import { cn } from '@/lib/utils'

interface Props {
  user: {
    id: string
    name: string | null
    email: string
    plan: 'FREE' | 'PRO' | 'ULTIMATE'
    messagesUsed: number
    messagesLimit: number
    createdAt: string
  }
  stats: { chatCount: number; msgCount: number }
}

export function DashboardClient({ user, stats }: Props) {
  const router = useRouter()
  const [upgrading, setUpgrading] = useState<string | null>(null)

  const plan = PLANS[user.plan]
  const usagePercent =
    plan.messagesPerDay === -1
      ? 100
      : Math.min(100, Math.round((user.messagesUsed / plan.messagesPerDay) * 100))

  const planIcon =
    user.plan === 'ULTIMATE' ? <Crown className="w-5 h-5" /> :
    user.plan === 'PRO' ? <Star className="w-5 h-5" /> :
    <Zap className="w-5 h-5" />

  const planColor =
    user.plan === 'ULTIMATE' ? 'from-amber-500 to-orange-600' :
    user.plan === 'PRO' ? 'from-brand-600 to-blue-600' :
    'from-emerald-600 to-teal-600'

  const handleUpgrade = async (planKey: string) => {
    setUpgrading(planKey)
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: planKey }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else setUpgrading(null)
  }

  return (
    <div className="pt-24 pb-12 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Welcome */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Bonjour, {user.name ?? user.email.split('@')[0]} 👋
            </h1>
            <p className="text-white/40 text-sm mt-1">Voici un aperçu de votre compte NJP CLAW</p>
          </div>
          <Link href="/chat" className="btn-primary flex items-center gap-2">
            <Bot className="w-4 h-4" />
            Nouveau chat
          </Link>
        </div>

        {/* Stats cards */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: <MessageSquare className="w-5 h-5" />, label: 'Conversations', value: stats.chatCount, color: 'text-brand-400' },
            { icon: <BarChart2 className="w-5 h-5" />, label: 'Messages envoyés', value: stats.msgCount, color: 'text-emerald-400' },
            { icon: <TrendingUp className="w-5 h-5" />, label: 'Utilisés aujourd\'hui', value: user.messagesUsed, color: 'text-accent-400' },
          ].map((stat) => (
            <div key={stat.label} className="card">
              <div className={`${stat.color} mb-3`}>{stat.icon}</div>
              <p className="text-2xl font-black text-white">{stat.value}</p>
              <p className="text-sm text-white/40">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Plan & usage */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Current plan */}
          <div className="card">
            <h2 className="text-sm font-medium text-white/50 mb-4">Votre abonnement</h2>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r ${planColor} text-white text-sm font-bold mb-4`}>
              {planIcon}
              Plan {plan.name}
            </div>
            <p className="text-sm text-white/60 mb-4">
              Modèle actif : <span className="text-white font-medium">{plan.modelLabel}</span>
            </p>

            {/* Usage bar */}
            <div>
              <div className="flex justify-between text-xs text-white/40 mb-2">
                <span>Utilisation aujourd'hui</span>
                <span>
                  {plan.messagesPerDay === -1 ? '∞' : `${user.messagesUsed} / ${plan.messagesPerDay}`}
                </span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    usagePercent > 80 ? 'bg-red-500' : usagePercent > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                  )}
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Upgrade */}
          {user.plan !== 'ULTIMATE' && (
            <div className="card border-brand-500/20 bg-brand-600/5">
              <h2 className="text-sm font-medium text-white/50 mb-4">Passer à la vitesse supérieure</h2>
              <div className="space-y-3">
                {user.plan === 'FREE' && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-bold text-white">Plan Pro</p>
                        <p className="text-xs text-white/50">Llama 3.1 70B · 500 msg/jour</p>
                      </div>
                      <span className="text-lg font-black text-white">9,99€<span className="text-xs text-white/40">/mois</span></span>
                    </div>
                    <button
                      onClick={() => handleUpgrade('PRO')}
                      disabled={upgrading === 'PRO'}
                      className="btn-primary w-full text-sm flex items-center justify-center gap-2"
                    >
                      <Star className="w-4 h-4" />
                      {upgrading === 'PRO' ? 'Redirection...' : 'Passer à Pro'}
                    </button>
                  </div>
                )}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-bold text-white">Plan Ultimate</p>
                      <p className="text-xs text-white/50">Llama 3.1 405B · Illimité</p>
                    </div>
                    <span className="text-lg font-black text-white">29,99€<span className="text-xs text-white/40">/mois</span></span>
                  </div>
                  <button
                    onClick={() => handleUpgrade('ULTIMATE')}
                    disabled={upgrading === 'ULTIMATE'}
                    className="btn-accent w-full text-sm flex items-center justify-center gap-2"
                  >
                    <Crown className="w-4 h-4" />
                    {upgrading === 'ULTIMATE' ? 'Redirection...' : 'Passer à Ultimate'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick links */}
        <div>
          <h2 className="text-sm font-medium text-white/50 mb-4">Accès rapide</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <Link href="/chat" className="card hover:border-white/15 flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-brand-400" />
                <span className="text-white font-medium text-sm">Mes conversations</span>
              </div>
              <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
            </Link>
            <Link href="/pricing" className="card hover:border-white/15 flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-accent-400" />
                <span className="text-white font-medium text-sm">Gérer l'abonnement</span>
              </div>
              <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
