import { ChatInterface } from '@/components/ChatInterface'
import { ChatSidebar } from '@/components/ChatSidebar'
import Link from 'next/link'

export const metadata = { title: 'Chat — NJP CLAW' }

export default function ChatPage({ searchParams }: { searchParams: { mode?: string; q?: string } }) {
  const rawMode = searchParams.mode
  const mode = rawMode === 'expert' ? 'expert' : rawMode === 'builder' ? 'builder' : rawMode === 'novice' ? 'novice' : undefined
  const initialMessage = searchParams.q ? decodeURIComponent(searchParams.q) : undefined
  const isBuilder = mode === 'builder'

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar (hidden in builder mode to maximize preview space) */}
      {!isBuilder && (
        <aside className="hidden lg:flex flex-col w-56 border-r border-zinc-200 bg-zinc-50 flex-shrink-0">
          <div className="h-12 flex items-center px-4 border-b border-zinc-200">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-brand-600 to-brand-500 flex items-center justify-center">
                <span className="text-white font-black text-xs">N</span>
              </div>
              <span className="font-bold text-zinc-900 text-sm">NJP <span className="gradient-text">CLAW</span></span>
            </Link>
          </div>
          <div className="flex-1 overflow-hidden">
            <ChatSidebar />
          </div>
        </aside>
      )}

      {/* Chat */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile top bar */}
        <div className={`${isBuilder ? 'hidden' : 'lg:hidden'} flex items-center justify-between px-4 h-12 border-b border-zinc-200 flex-shrink-0 bg-white`}>
          <Link href="/" className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-brand-600 to-brand-500 flex items-center justify-center">
              <span className="text-white font-black text-xs">N</span>
            </div>
            <span className="font-bold text-zinc-900 text-sm">NJP <span className="gradient-text">CLAW</span></span>
          </Link>
          <div className="flex gap-3 text-xs text-zinc-400">
            <Link href="/agents" className="hover:text-zinc-700 transition-colors">Agents</Link>
            <Link href="/pricing" className="hover:text-zinc-700 transition-colors">Tarifs</Link>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <ChatInterface defaultMode={mode as any} initialMessage={initialMessage} />
        </div>
      </div>
    </div>
  )
}
