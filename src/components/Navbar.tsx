'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Menu, X, Zap, LogOut, LayoutDashboard, ChevronDown, Lightbulb, Code2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Navbar() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const plan = (session?.user as any)?.plan ?? 'FREE'
  const planLabel = plan === 'ULTIMATE' ? 'Ultimate' : plan === 'PRO' ? 'Pro' : 'Gratuit'

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-lg group-hover:shadow-brand-500/40 transition-shadow">
              <span className="text-white font-black text-sm">NJP</span>
            </div>
            <span className="font-bold text-lg text-white tracking-tight">
              NJP <span className="gradient-text">CLAW</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/chat?mode=novice" className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors text-sm font-medium">
              <Lightbulb className="w-3.5 h-3.5 text-emerald-400" />
              Mode Novice
            </Link>
            <Link href="/chat?mode=expert" className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors text-sm font-medium">
              <Code2 className="w-3.5 h-3.5 text-brand-400" />
              Mode Expert
            </Link>
            <Link href="/pricing" className="text-white/70 hover:text-white transition-colors text-sm font-medium">
              Tarifs
            </Link>

            {session ? (
              <div className="relative">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 glass px-3 py-2 rounded-xl hover:bg-white/10 transition-all">
                  <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold">
                    {session.user?.name?.[0]?.toUpperCase() ?? session.user?.email?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm text-white/80">
                    {session.user?.name ?? session.user?.email?.split('@')[0]}
                  </span>
                  <span className={cn('badge-free', plan === 'PRO' && 'badge-pro', plan === 'ULTIMATE' && 'badge-ultimate')}>
                    {planLabel}
                  </span>
                  <ChevronDown className="w-3 h-3 text-white/50" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 glass-strong rounded-xl py-1 shadow-xl border border-white/10">
                    <Link href="/dashboard" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors">
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <button onClick={() => signOut({ callbackUrl: '/' })}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                      <LogOut className="w-4 h-4" />
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-white/70 hover:text-white text-sm font-medium transition-colors">
                  Connexion
                </Link>
                <Link href="/register" className="btn-primary py-2 px-4 text-sm">
                  <Zap className="w-3.5 h-3.5 inline mr-1" />
                  S'inscrire — Gratuit
                </Link>
              </div>
            )}
          </div>

          {/* Mobile button */}
          <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg glass">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden glass-strong border-t border-white/5">
          <div className="px-4 py-4 flex flex-col gap-3">
            <Link href="/chat?mode=novice" onClick={() => setOpen(false)} className="text-white/80 hover:text-white py-2 text-sm font-medium flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-emerald-400" /> Mode Novice
            </Link>
            <Link href="/chat?mode=expert" onClick={() => setOpen(false)} className="text-white/80 hover:text-white py-2 text-sm font-medium flex items-center gap-2">
              <Code2 className="w-4 h-4 text-brand-400" /> Mode Expert
            </Link>
            <Link href="/pricing" onClick={() => setOpen(false)} className="text-white/80 hover:text-white py-2 text-sm font-medium">
              Tarifs
            </Link>
            {session ? (
              <>
                <Link href="/dashboard" onClick={() => setOpen(false)} className="text-white/80 hover:text-white py-2 text-sm font-medium">Dashboard</Link>
                <button onClick={() => signOut({ callbackUrl: '/' })} className="text-red-400 py-2 text-sm font-medium text-left">Déconnexion</button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="text-white/80 hover:text-white py-2 text-sm font-medium">Connexion</Link>
                <Link href="/register" onClick={() => setOpen(false)} className="btn-primary text-center text-sm">S'inscrire gratuitement</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
