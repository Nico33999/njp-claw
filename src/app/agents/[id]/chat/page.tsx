'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Settings } from 'lucide-react'
import { ChatInterface } from '@/components/ChatInterface'
import { ChatSidebar } from '@/components/ChatSidebar'

interface Agent {
  id: string
  name: string
  description: string
  emoji: string
  color: string
  category: string
  isSystem: boolean
  userId: string | null
}

export default function AgentChatPage({ params }: { params: { id: string } }) {
  const [agent, setAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/agents/${params.id}`)
      .then((r) => r.json())
      .then((d) => setAgent(d.agent))
      .finally(() => setLoading(false))
  }, [params.id])

  if (loading) {
    return (
      <div className="flex h-screen bg-[#0e1128] items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="flex h-screen bg-[#0e1128] items-center justify-center flex-col gap-4">
        <p className="text-white/50">Agent introuvable</p>
        <Link href="/agents" className="btn-primary text-sm">Retour aux agents</Link>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[#0e1128] overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/5 bg-white/[0.02] flex-shrink-0">
        <div className="h-14 flex items-center px-4 border-b border-white/5 gap-3">
          <Link href="/agents" className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${agent.color} flex items-center justify-center text-sm`}>
            {agent.emoji}
          </div>
          <span className="font-semibold text-white text-sm truncate">{agent.name}</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <ChatSidebar />
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between px-4 h-14 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Link href="/agents" className="p-1.5 rounded-lg hover:bg-white/10 text-white/50">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${agent.color} flex items-center justify-center text-sm`}>
              {agent.emoji}
            </div>
            <span className="font-semibold text-white text-sm">{agent.name}</span>
          </div>
          {!agent.isSystem && agent.userId && (
            <Link href={`/agents/${agent.id}`} className="p-1.5 text-white/40 hover:text-white">
              <Settings className="w-4 h-4" />
            </Link>
          )}
        </div>

        <div className="flex-1 overflow-hidden">
          <ChatInterface agentId={agent.id} agentName={agent.name} agentEmoji={agent.emoji} agentColor={agent.color} />
        </div>
      </div>
    </div>
  )
}
