'use client'

import { ChatInterface } from '@/components/ChatInterface'
import { ChatSidebar } from '@/components/ChatSidebar'
import Link from 'next/link'

export default function ChatPage() {
  return (
    <div className="flex h-screen bg-white text-zinc-900 overflow-hidden">
      <ChatSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <ChatInterface />
      </div>
    </div>
  )
}
