import { ChatInterface } from '@/components/ChatInterface'
import { ChatSidebar } from '@/components/ChatSidebar'
import Link from 'next/link'

export const metadata = { title: 'Chat — NJP CLAW' }

export default function ChatPage({ searchParams }: { searchParams: { mode?: string; q?: string } }) {
  const mode = searchParams.mode === 'expert' ? 'expert' : searchParams.mode === 'novice' ? 'novice' : undefined
  const initialMessage = searchParams.q ? decodeURIComponent(searchParams.q) : undefined

  return (
    <div className="flex h-screen bg-[#0e1128] overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 border-r border-white/5 bg-black/20 flex-shrink-0">
        <div className="h-12 flex items-center px-4 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-white font-black text-xs">N</span>
            </div>
            <span className="font-bold text-white text-sm">NJP <span className="text-brand-400">CLAW</span></span>
          </Link>
        </div>
        <div className="flex-1 overflow-hidden">
          <ChatSidebar />
        </div>
      </aside>

      {/* Chat */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between px-4 h-12 border-b border-white/5 flex-shrink-0">
          <Link href="/" className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
              <span className="text-white font-black text-xs">N</span>
            </div>
            <span className="font-bold text-white text-sm">NJP <span className="text-brand-400">CLAW</span></span>
          </Link>
          <div className="flex gap-3 text-xs text-white/30">
            <Link href="/agents" className="hover:text-white transition-colors">Agents</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Tarifs</Link>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <ChatInterface defaultMode={mode as any} initialMessage={initialMessage} />
        </div>
      </div>
    </div>
  )
}
