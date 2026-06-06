'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { Bot, Plus, Sparkles, Search, Filter, MessageSquare, Star, Lock, ChevronRight, Cpu } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Agent {
  id: string
  name: string
  description: string
  emoji: string
  color: string
  category: string
  isPublic: boolean
  isSystem: boolean
  usageCount: number
  userId: string | null
  _count?: { chats: number }
}

const CATEGORIES = ['Tous', 'Général', 'Développement', 'Éducation', 'Rédaction', 'Business', 'Bien-être', 'Juridique', 'Créativité']

export default function AgentsPage() {
  const { data: session } = useSession()
  const [agents, setAgents] = useState<Agent[]>([])
  const [myAgents, setMyAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'all' | 'mine'>('all')
  const [category, setCategory] = useState('Tous')
  const [search, setSearch] = useState('')
  const [seeding, setSeeding] = useState(false)

  const userId = (session?.user as any)?.id

  const fetchAgents = async (t: 'all' | 'mine' = tab) => {
    setLoading(true)
    try {
      const url = t === 'mine' ? '/api/agents?mine=true' : `/api/agents${category !== 'Tous' ? `?category=${category}` : ''}`
      const res = await fetch(url)
      const data = await res.json()
      if (t === 'mine') setMyAgents(data.agents ?? [])
      else setAgents(data.agents ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAgents('all') }, [category])
  useEffect(() => { if (session && tab === 'mine') fetchAgents('mine') }, [tab, session])

  const seedAgents = async () => {
    setSeeding(true)
    await fetch('/api/agents/seed', { method: 'POST' })
    await fetchAgents('all')
    setSeeding(false)
  }

  const displayed = (tab === 'mine' ? myAgents : agents).filter((a) =>
    !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase())
  )

  const systemAgents = displayed.filter((a) => a.isSystem)
  const communityAgents = displayed.filter((a) => !a.isSystem)

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600 to-accent-500 flex items-center justify-center">
                  <Cpu className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-zinc-900">Agents IA</h1>
              </div>
              <p className="text-zinc-500 text-sm">Choisissez un agent spécialisé ou créez le vôtre</p>
            </div>
            <div className="flex gap-3">
              {systemAgents.length === 0 && (
                <button onClick={seedAgents} disabled={seeding}
                  className="btn-secondary text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  {seeding ? 'Chargement...' : 'Charger les agents NJP'}
                </button>
              )}
              <Link href="/agents/new" className="btn-primary text-sm flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Créer un agent
              </Link>
            </div>
          </div>

          {/* Tabs + Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex items-center bg-zinc-100 rounded-xl p-0.5 gap-0.5">
              <button onClick={() => setTab('all')}
                className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  tab === 'all' ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200' : 'text-zinc-500 hover:text-zinc-800')}>
                <Sparkles className="w-3.5 h-3.5 inline mr-1.5" />
                Bibliothèque
              </button>
              {session && (
                <button onClick={() => setTab('mine')}
                  className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all',
                    tab === 'mine' ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200' : 'text-zinc-500 hover:text-zinc-800')}>
                  <Bot className="w-3.5 h-3.5 inline mr-1.5" />
                  Mes agents
                </button>
              )}
            </div>

            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un agent…"
                className="w-full bg-white border border-zinc-300 rounded-xl pl-9 pr-4 py-2.5 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-brand-400" />
            </div>
          </div>

          {/* Category filters */}
          {tab === 'all' && (
            <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
              {CATEGORIES.map((c) => (
                <button key={c} onClick={() => setCategory(c)}
                  className={cn('px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 border',
                    category === c
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:text-zinc-900')}>
                  {c}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="w-12 h-12 rounded-xl bg-zinc-100 mb-4" />
                  <div className="h-4 bg-zinc-100 rounded mb-2 w-3/4" />
                  <div className="h-3 bg-zinc-100 rounded mb-1" />
                  <div className="h-3 bg-zinc-100 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : displayed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Bot className="w-12 h-12 text-zinc-300" />
              <p className="text-zinc-400 text-sm">
                {tab === 'mine'
                  ? 'Vous n\'avez pas encore créé d\'agent.'
                  : 'Aucun agent trouvé. Cliquez sur "Charger les agents NJP".'}
              </p>
              <Link href="/agents/new" className="btn-primary text-sm">
                <Plus className="w-4 h-4 inline mr-1" />
                Créer un agent
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {systemAgents.length > 0 && (
                <div>
                  {tab === 'all' && <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">Agents NJP CLAW</h2>}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {systemAgents.map((agent) => <AgentCard key={agent.id} agent={agent} userId={userId} />)}
                  </div>
                </div>
              )}
              {communityAgents.length > 0 && (
                <div>
                  {tab === 'all' && <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">Agents communautaires</h2>}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {communityAgents.map((agent) => <AgentCard key={agent.id} agent={agent} userId={userId} />)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AgentCard({ agent, userId }: { agent: Agent; userId?: string }) {
  const isOwner = agent.userId === userId

  return (
    <div className="card group flex flex-col gap-4 relative">
      {agent.isSystem && (
        <div className="absolute top-3 right-3">
          <span className="badge-pro text-xs">NJP</span>
        </div>
      )}
      {isOwner && !agent.isSystem && (
        <div className="absolute top-3 right-3">
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-zinc-100 text-zinc-500 border border-zinc-200">Mien</span>
        </div>
      )}

      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center text-2xl shadow group-hover:scale-105 transition-transform`}>
        {agent.emoji}
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-bold text-zinc-900 text-sm">{agent.name}</h3>
          {!agent.isPublic && !agent.isSystem && (
            <Lock className="w-3 h-3 text-zinc-400 flex-shrink-0" />
          )}
        </div>
        <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">{agent.description}</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 bg-zinc-100 border border-zinc-200 rounded-lg px-2 py-0.5">{agent.category}</span>
          {agent.usageCount > 0 && (
            <span className="text-xs text-zinc-400 flex items-center gap-1">
              <MessageSquare className="w-2.5 h-2.5" />{agent.usageCount}
            </span>
          )}
        </div>

        <div className="flex gap-1">
          {isOwner && !agent.isSystem && (
            <Link href={`/agents/${agent.id}`}
              className="p-1.5 rounded-lg bg-zinc-100 border border-zinc-200 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900 transition-all text-xs">
              Gérer
            </Link>
          )}
          <Link href={`/agents/${agent.id}/chat`}
            className="flex items-center gap-1 btn-primary text-xs py-1.5 px-3">
            <MessageSquare className="w-3 h-3" />
            Utiliser
          </Link>
        </div>
      </div>
    </div>
  )
}
