'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { MessageSquare, Plus, Clock, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Chat {
  id: string
  title: string
  updatedAt: string
  messages: Array<{ content: string }>
}

export function ChatSidebar({ currentChatId }: { currentChatId?: string }) {
  const { data: session } = useSession()
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!session) return
    setLoading(true)
    fetch('/api/chat/history')
      .then((r) => r.json())
      .then((d) => setChats(d.chats ?? []))
      .finally(() => setLoading(false))
  }, [session])

  if (!session) {
    return (
      <div className="flex flex-col gap-4 p-4 h-full">
        <Link href="/chat" className="btn-primary text-sm text-center w-full">
          <Plus className="w-4 h-4" />
          Nouveau chat
        </Link>
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
          <MessageSquare className="w-7 h-7 text-zinc-300" />
          <p className="text-xs text-zinc-400 leading-relaxed">
            Connectez-vous pour sauvegarder vos conversations
          </p>
          <Link href="/login" className="btn-secondary text-xs py-2 px-3">
            Se connecter
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3">
        <Link href="/chat" className="btn-secondary text-sm w-full flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" />
          Nouveau chat
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-zinc-400 text-sm">
            Chargement…
          </div>
        ) : chats.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Clock className="w-6 h-6 text-zinc-300" />
            <p className="text-xs text-zinc-400">Aucune conversation</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {chats.map((chat) => (
              <Link
                key={chat.id}
                href={`/chat/${chat.id}`}
                className={cn(
                  'flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all group',
                  chat.id === currentChatId
                    ? 'bg-brand-50 border border-brand-200 text-brand-700'
                    : 'hover:bg-zinc-100 text-zinc-700'
                )}
              >
                <MessageSquare className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs truncate font-medium">{chat.title}</p>
                  <p className="text-xs text-zinc-400 truncate">
                    {chat.messages[0]?.content?.slice(0, 38)}
                  </p>
                </div>
                <ChevronRight className="w-3 h-3 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
