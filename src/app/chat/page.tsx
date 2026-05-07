import { Navbar } from '@/components/Navbar'
import { ChatInterface } from '@/components/ChatInterface'
import { ChatSidebar } from '@/components/ChatSidebar'

export const metadata = {
  title: 'Chat — NJP CLAW',
}

export default function ChatPage() {
  return (
    <div className="flex h-screen bg-[#0e1128] overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/5 bg-white/[0.02]">
        <div className="h-16 flex items-center px-4 border-b border-white/5">
          <a href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
              <span className="text-white font-black text-xs">NJP</span>
            </div>
            <span className="font-bold text-white text-sm">NJP <span className="text-brand-400">CLAW</span></span>
          </a>
        </div>
        <div className="flex-1 overflow-hidden">
          <ChatSidebar />
        </div>
      </aside>

      {/* Main chat */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="md:hidden">
          <Navbar />
        </div>
        <div className="flex-1 overflow-hidden pt-0 md:pt-0">
          <ChatInterface />
        </div>
      </div>
    </div>
  )
}
