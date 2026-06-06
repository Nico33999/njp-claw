'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Menu, X, Zap, LogOut, LayoutDashboard, ChevronDown, Lightbulb, Code2, Cpu, Hammer } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Navbar() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const plan = (session?.user as any)?.plan ?? 'FREE'
  const planLabel = plan === 'ULTIMATE' ? 'Ultimate' : plan === 'PRO' ? 'Pro' : 'Gratuit'

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15 py-3">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600 to-brand-500 flex items-center justify-center shadow-sm group-hover:shadow-brand-600/30 transition-shadow">
              <span className="text-white font-black text-xs">N</span>
            </div>
            <span className="font-bold text-lg text-zinc-900 tracking-tight">
              NJP <span className="gradient-text">CLAW</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/chat?mode=novice"
              className="flex items-center gap-1.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-all text-sm font-medium px-3 py-2 rounded-lg">
              <Lightbulb className="w-3.5 h-3.5 text-emerald-500" />
              Novice
            </Link>
            <Link href="/chat?mode=expert"
              className="flex items-center gap-1.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-all text-sm font-medium px-3 py-2 rounded-lg">
              <Code2 className="w-3.5 h-3.5 text-brand-500" />
              Expert
            </Link>
            <Link href="/chat?mode=builder"
              className="flex items-center gap-1.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-all text-sm font-medium px-3 py-2 rounded-lg">
              <Hammer className="w-3.5 h-3.5 text-violet-500" />
              Builder
            </Link>
            <Link href="/agents"
              className="flex items-center gap-1.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-all text-sm font-medium px-3 py-2 rounded-lg">
              <Cpu className="w-3.5 h-3.5 text-orange-500" />
              Agents
            </Link>
            <Link href="/pricing"
              className="text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-all text-sm font-medium px-3 py-2 rounded-lg">
              Tarifs
            </Link>
          </div>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <div className="relative">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 bg-white border border-zinc-200 px-3 py-2 rounded-xl hover:bg-zinc-50 transition-all">
                  <div className="w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold text-white">
                    {session.user?.name?.[0]?.toUpperCase() ?? session.user?.email?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm text-zinc-700">
                    {session.user?.name ?? session.user?.email?.split('@')[0]}
                  </span>
                  <span className={cn('badge-free', plan === 'PRO' && 'badge-pro', plan === 'ULTIMATE' && 'badge-ultimate')}>
                    {planLabel}
                  </span>
                  <ChevronDown className="w-3 h-3 text-zinc-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-zinc-200 rounded-xl py-1 shadow-lg">
                    <Link href="/dashboard" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors">
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <button onClick={() => signOut({ callbackUrl: '/' })}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      <LogOut className="w-4 h-4" />
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="text-zinc-600 hover:text-zinc-900 text-sm font-medium transition-colors px-3 py-2">
                  Connexion
                </Link>
                <Link href="/register" className="btn-primary py-2 px-4 text-sm">
                  <Zap className="w-3.5 h-3.5" />
                  S'inscrire — Gratuit
                </Link>
              </div>
            )}
          </div>

          {/* Mobile button */}
          <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg border border-zinc-200 hover:bg-zinc-50 transition-colors">
            {open ? <X className="w-5 h-5 text-zinc-700" /> : <Menu className="w-5 h-5 text-zinc-700" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-zinc-200">
          <div className="px-4 py-4 flex flex-col gap-1">
            {[
              { href: '/chat?mode=novice', label: 'Mode Novice', icon: <Lightbulb className="w-4 h-4 text-emerald-500" /> },
              { href: '/chat?mode=expert', label: 'Mode Expert', icon: <Code2 className="w-4 h-4 text-brand-500" /> },
              { href: '/chat?mode=builder', label: 'NJP Builder', icon: <Hammer className="w-4 h-4 text-violet-500" /> },
              { href: '/agents', label: 'Agents', icon: <Cpu className="w-4 h-4 text-orange-500" /> },
              { href: '/pricing', label: 'Tarifs', icon: null },
            ].map(({ href, label, icon }) => (
              <Link key={href} href={href} onClick={() => setOpen(false)}
                className="flex items-center gap-2 text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50 py-2.5 px-3 rounded-xl text-sm font-medium transition-colors">
                {icon}{label}
              </Link>
            ))}
            <div className="border-t border-zinc-100 my-1" />
            {session ? (
              <>
                <Link href="/dashboard" onClick={() => setOpen(false)}
                  className="text-zinc-700 hover:bg-zinc-50 py-2.5 px-3 rounded-xl text-sm font-medium">Dashboard</Link>
                <button onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-red-600 hover:bg-red-50 py-2.5 px-3 rounded-xl text-sm font-medium text-left">Déconnexion</button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)}
                  className="text-zinc-700 hover:bg-zinc-50 py-2.5 px-3 rounded-xl text-sm font-medium">Connexion</Link>
                <Link href="/register" onClick={() => setOpen(false)}
                  className="btn-primary text-center text-sm mt-1">S'inscrire gratuitement</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
