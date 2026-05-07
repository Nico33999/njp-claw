import { ChatInterface } from '@/components/ChatInterface'
import { ChatSidebar } from '@/components/ChatSidebar'
import Link from 'next/link'

export const metadata = { title: 'Chat — NJP CLAW' }

export default function ChatPage({ searchParams }: { searchParams: { mode?: string } }) {
  const mode = searchParams.mode === 'expert' ? 'expert' : 'novice'

  return (
    <div className="flex h-screen bg-[#0e1128] overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/5 bg-white/[0.02] flex-shrink-0">
        <div className="h-14 flex items-center px-4 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
              <span className="text-white font-black text-xs">NJP</span>
            </div>
            <span className="font-bold text-white text-sm">
              NJP <span className="text-brand-400">CLAW</span>
            </span>
          </Link>
        </div>
        <div className="flex-1 overflow-hidden">
          <ChatSidebar />
        </div>
      </aside>

      {/* Main chat */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between px-4 h-14 border-b border-white/5 flex-shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
              <span className="text-white font-black text-xs">NJP</span>
            </div>
            <span className="font-bold text-white text-sm">NJP <span className="text-brand-400">CLAW</span></span>
          </Link>
          <Link href="/pricing" className="text-xs text-white/40 hover:text-white">Tarifs</Link>
        </div>

        <div className="flex-1 overflow-hidden">
          <ChatInterface defaultMode={mode as any} />
        </div>
      </div>
    </div>
  )
}
