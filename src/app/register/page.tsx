'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, CheckCircle, ArrowRight } from 'lucide-react'

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
    if (password.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères.'); return }
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

    const signInRes = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)
    if (signInRes?.error) router.push('/login')
    else router.push('/chat')
  }

  const perks = [
    '20 messages/jour gratuits',
    'Historique de conversations',
    'Modes Novice, Expert & Builder',
    'Mise à niveau vers Pro/Ultimate',
  ]

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-10 items-center">

        {/* Left */}
        <div className="hidden md:block">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-brand-500 flex items-center justify-center shadow-sm">
              <span className="text-white font-black text-xs">N</span>
            </div>
            <span className="font-bold text-xl text-zinc-900">NJP <span className="gradient-text">CLAW</span></span>
          </Link>
          <h1 className="text-3xl font-black text-zinc-900 mb-4">
            Rejoignez NJP CLAW<br />
            <span className="gradient-text">C'est gratuit !</span>
          </h1>
          <p className="text-zinc-500 mb-8 leading-relaxed">
            Créez votre compte en 30 secondes et accédez à l'IA avec 20 messages par jour, sans aucune limite de durée.
          </p>
          <ul className="space-y-3">
            {perks.map((p) => (
              <li key={p} className="flex items-center gap-3 text-zinc-700">
                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                {p}
              </li>
            ))}
          </ul>
        </div>

        {/* Form */}
        <div>
          <div className="text-center mb-6 md:hidden">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600 to-brand-500 flex items-center justify-center">
                <span className="text-white font-black text-xs">N</span>
              </div>
              <span className="font-bold text-zinc-900">NJP <span className="gradient-text">CLAW</span></span>
            </Link>
            <h1 className="text-xl font-bold text-zinc-900">Créer un compte</h1>
          </div>

          <div className="bg-white border border-zinc-200 rounded-2xl p-7 shadow-sm">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-700 font-medium mb-1.5">Nom (optionnel)</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Jean Dupont" className="input-field" />
              </div>
              <div>
                <label className="block text-sm text-zinc-700 font-medium mb-1.5">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  required placeholder="vous@exemple.com" className="input-field" />
              </div>
              <div>
                <label className="block text-sm text-zinc-700 font-medium mb-1.5">Mot de passe</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={password}
                    onChange={(e) => setPassword(e.target.value)} required minLength={6}
                    placeholder="Minimum 6 caractères" className="input-field pr-12" />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full mt-6">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                {loading ? 'Création en cours…' : 'Créer mon compte gratuit'}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-zinc-500">
              Déjà un compte ?{' '}
              <Link href="/login" className="text-brand-600 hover:text-brand-700 font-medium">
                Se connecter
              </Link>
            </p>
            <div className="mt-3 text-center">
              <Link href="/chat" className="text-xs text-zinc-400 hover:text-zinc-600">
                Continuer sans compte →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
