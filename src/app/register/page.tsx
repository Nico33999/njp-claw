'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Bot, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Erreur lors de la création du compte.')
      setLoading(false)
      return
    }

    // Auto sign in
    const signInRes = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)

    if (signInRes?.error) {
      router.push('/login')
    } else {
      router.push('/chat')
    }
  }

  const perks = [
    '20 messages/jour gratuits',
    'Historique de conversations',
    'Accès sans pub',
    'Mise à niveau vers Pro/Ultimate',
  ]

  return (
    <div className="min-h-screen bg-[#0e1128] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left side */}
        <div className="hidden md:block">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-lg">
              <span className="text-white font-black">NJP</span>
            </div>
            <span className="font-bold text-xl text-white">NJP <span className="gradient-text">CLAW</span></span>
          </Link>

          <h1 className="text-3xl font-black text-white mb-4">
            Rejoignez NJP CLAW
            <br />
            <span className="gradient-text">C'est gratuit !</span>
          </h1>

          <p className="text-white/50 mb-8 leading-relaxed">
            Créez votre compte en 30 secondes et accédez à Meta AI avec 20 messages par jour, sans aucune limite de durée.
          </p>

          <ul className="space-y-3">
            {perks.map((p) => (
              <li key={p} className="flex items-center gap-3 text-white/70">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                {p}
              </li>
            ))}
          </ul>
        </div>

        {/* Form */}
        <div>
          <div className="text-center mb-6 md:hidden">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
                <span className="text-white font-black text-xs">NJP</span>
              </div>
              <span className="font-bold text-white">NJP <span className="gradient-text">CLAW</span></span>
            </Link>
            <h1 className="text-xl font-bold text-white">Créer un compte</h1>
          </div>

          <div className="glass-strong rounded-2xl p-8 border border-white/10">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400 mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Nom (optionnel)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jean Dupont"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="vous@exemple.com"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1.5">Mot de passe</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Minimum 6 caractères"
                    className="input-field pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-6">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
                {loading ? 'Création en cours...' : 'Créer mon compte gratuit'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-white/40">
              Déjà un compte ?{' '}
              <Link href="/login" className="text-brand-400 hover:text-brand-300 font-medium">
                Se connecter
              </Link>
            </div>

            <div className="mt-4 text-center">
              <Link href="/chat" className="text-xs text-white/30 hover:text-white/50">
                Continuer sans compte →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
