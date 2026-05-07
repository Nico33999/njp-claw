'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { AVAILABLE_TOOLS } from '@/lib/agent-tools'
import { ArrowLeft, MessageSquare, Trash2, Edit3, Globe, Lock, Save, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Agent {
  id: string
  name: string
  description: string
  emoji: string
  color: string
  category: string
  systemPrompt: string
  tools: string
  isPublic: boolean
  isSystem: boolean
  usageCount: number
  userId: string | null
  _count?: { chats: number }
}

export default function AgentManagePage({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [agent, setAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saved, setSaved] = useState(false)

  // Edit form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [systemPrompt, setSystemPrompt] = useState('')
  const [selectedTools, setSelectedTools] = useState<string[]>([])
  const [isPublic, setIsPublic] = useState(false)

  const userId = (session?.user as any)?.id

  useEffect(() => {
    fetch(`/api/agents/${params.id}`)
      .then((r) => r.json())
      .then((d) => {
        setAgent(d.agent)
        if (d.agent) {
          setName(d.agent.name)
          setDescription(d.agent.description)
          setSystemPrompt(d.agent.systemPrompt)
          setSelectedTools(JSON.parse(d.agent.tools ?? '[]'))
          setIsPublic(d.agent.isPublic)
        }
      })
      .finally(() => setLoading(false))
  }, [params.id])

  const isOwner = agent?.userId === userId && !agent?.isSystem

  const handleSave = async () => {
    setSaving(true)
    const res = await fetch(`/api/agents/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, systemPrompt, tools: selectedTools, isPublic }),
    })
    if (res.ok) {
      const data = await res.json()
      setAgent(data.agent)
      setEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!confirm(`Supprimer l'agent "${agent?.name}" ?`)) return
    setDeleting(true)
    await fetch(`/api/agents/${params.id}`, { method: 'DELETE' })
    router.push('/agents')
  }

  const toggleTool = (t: string) =>
    setSelectedTools((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t])

  if (loading) return (
    <div className="min-h-screen bg-[#0e1128] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
    </div>
  )

  if (!agent) return (
    <div className="min-h-screen bg-[#0e1128] flex flex-col items-center justify-center gap-4">
      <p className="text-white/50">Agent introuvable</p>
      <Link href="/agents" className="btn-primary text-sm">Retour aux agents</Link>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0e1128]">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex items-center gap-3">
            <Link href="/agents" className="p-2 rounded-xl glass hover:bg-white/10 text-white/50 hover:text-white transition-all">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center text-xl`}>
              {agent.emoji}
            </div>
            <div>
              <h1 className="font-bold text-white">{agent.name}</h1>
              <p className="text-xs text-white/40">{agent.category} · {agent._count?.chats ?? 0} conversations</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Link href={`/agents/${agent.id}/chat`} className="btn-primary flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Utiliser l'agent
            </Link>
            {isOwner && (
              <>
                <button onClick={() => setEditing(!editing)}
                  className={cn('btn-secondary flex items-center gap-2', editing && 'border-brand-500/30 text-brand-400')}>
                  <Edit3 className="w-4 h-4" />
                  {editing ? 'Annuler' : 'Modifier'}
                </button>
                <button onClick={handleDelete} disabled={deleting}
                  className="p-3 rounded-xl glass hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* Info cards */}
          {!editing && (
            <div className="space-y-4">
              <div className="card">
                <p className="text-xs text-white/40 mb-1">Description</p>
                <p className="text-sm text-white/80">{agent.description || '—'}</p>
              </div>
              <div className="card">
                <p className="text-xs text-white/40 mb-2">Instructions</p>
                <pre className="text-xs text-white/60 font-mono whitespace-pre-wrap leading-relaxed">{agent.systemPrompt}</pre>
              </div>
              {JSON.parse(agent.tools ?? '[]').length > 0 && (
                <div className="card">
                  <p className="text-xs text-white/40 mb-2">Outils activés</p>
                  <div className="flex flex-wrap gap-2">
                    {(JSON.parse(agent.tools ?? '[]') as string[]).map((t) => {
                      const tool = AVAILABLE_TOOLS.find((x) => x.name === t)
                      return tool ? (
                        <span key={t} className="glass px-2 py-1 rounded-lg text-xs text-white/70 flex items-center gap-1">
                          {tool.icon} {tool.label}
                        </span>
                      ) : null
                    })}
                  </div>
                </div>
              )}
              <div className="card flex items-center gap-2">
                {agent.isPublic || agent.isSystem
                  ? <><Globe className="w-4 h-4 text-emerald-400" /><span className="text-sm text-white/70">Visible publiquement</span></>
                  : <><Lock className="w-4 h-4 text-white/30" /><span className="text-sm text-white/50">Privé (vous seul)</span></>
                }
              </div>
            </div>
          )}

          {/* Edit form */}
          {editing && isOwner && (
            <div className="glass-strong rounded-2xl p-6 border border-white/10 space-y-5">
              <h2 className="font-bold text-white">Modifier l'agent</h2>

              <div>
                <label className="block text-sm text-white/60 mb-1.5">Nom</label>
                <input value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500/50" />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1.5">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} resize-none
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500/50 resize-none" />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1.5">Instructions</label>
                <textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} rows={8}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500/50 resize-none font-mono" />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">Outils</label>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_TOOLS.map((tool) => (
                    <button key={tool.name} onClick={() => toggleTool(tool.name)}
                      className={cn('glass rounded-xl p-2.5 text-left transition-all',
                        selectedTools.includes(tool.name) ? 'border-brand-500/40 bg-brand-600/10' : 'hover:bg-white/8')}>
                      <div className="flex items-center gap-2">
                        <span>{tool.icon}</span>
                        <span className="text-xs font-medium text-white">{tool.label}</span>
                        {selectedTools.includes(tool.name) && <Check className="w-3 h-3 text-brand-400 ml-auto" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 glass rounded-xl">
                <span className="text-sm text-white/70">Partager publiquement</span>
                <button onClick={() => setIsPublic(!isPublic)}
                  className={cn('w-11 h-6 rounded-full transition-all relative', isPublic ? 'bg-brand-600' : 'bg-white/10')}>
                  <div className={cn('w-4 h-4 rounded-full bg-white absolute top-1 transition-all', isPublic ? 'left-6' : 'left-1')} />
                </button>
              </div>

              <button onClick={handleSave} disabled={saving}
                className="btn-primary w-full flex items-center justify-center gap-2">
                {saved ? <><Check className="w-4 h-4" />Sauvegardé !</> : saving ? 'Sauvegarde…' : <><Save className="w-4 h-4" />Sauvegarder</>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
