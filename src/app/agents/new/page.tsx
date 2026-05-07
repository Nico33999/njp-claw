'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { AVAILABLE_TOOLS } from '@/lib/agent-tools'
import { ArrowLeft, Bot, Sparkles, Wand2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const COLORS = [
  'from-brand-600 to-accent-500',
  'from-violet-600 to-blue-600',
  'from-emerald-600 to-teal-600',
  'from-rose-600 to-pink-600',
  'from-amber-600 to-orange-600',
  'from-cyan-600 to-blue-600',
  'from-green-600 to-emerald-600',
  'from-slate-600 to-gray-700',
  'from-purple-600 to-pink-600',
  'from-red-600 to-rose-600',
]

const EMOJIS = ['🤖','💻','🎓','✍️','📊','💪','⚖️','🎨','🔬','🎯','🌍','💡','🔐','📱','🎵','🍳','✈️','🏋️','📚','🧠']

const CATEGORIES = ['Général','Développement','Éducation','Rédaction','Business','Bien-être','Juridique','Créativité','Finance','Marketing']

const PROMPT_STARTERS = [
  { label: 'Assistant', prompt: `Tu es [NOM], un assistant IA spécialisé en [DOMAINE].\nTu aides les utilisateurs avec [TÂCHES PRINCIPALES].\nTu réponds en français, de manière [STYLE: professionnel/amical/technique].\nTu structures toujours tes réponses avec des titres et listes quand c'est utile.` },
  { label: 'Expert', prompt: `Tu es [NOM], un expert senior en [DOMAINE] avec [X] ans d'expérience.\nTu fournis des réponses précises, détaillées et basées sur les meilleures pratiques.\nTu identifies les problèmes, proposes des solutions concrètes et expliques tes choix.\nFormat : structuré, avec exemples concrets et références quand pertinent.` },
  { label: 'Coach', prompt: `Tu es [NOM], un coach bienveillant et motivant spécialisé en [DOMAINE].\nTu aides les utilisateurs à [OBJECTIF] en les guidant étape par étape.\nTu es encourageant, positif et tu adaptes tes conseils au niveau de chaque personne.\nTu termines toujours par des actions concrètes et réalisables.` },
  { label: 'Créatif', prompt: `Tu es [NOM], un créatif imaginatif et original spécialisé en [DOMAINE].\nTu génères des idées innovantes, inattendues et inspirantes.\nTu proposes toujours plusieurs pistes créatives différentes, jamais une seule option.\nTu t'adaptes au style et aux préférences de l'utilisateur.` },
]

export default function NewAgentPage() {
  const router = useRouter()
  const { data: session } = useSession()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [emoji, setEmoji] = useState('🤖')
  const [color, setColor] = useState(COLORS[0])
  const [category, setCategory] = useState('Général')
  const [systemPrompt, setSystemPrompt] = useState('')
  const [selectedTools, setSelectedTools] = useState<string[]>([])
  const [isPublic, setIsPublic] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)

  const toggleTool = (t: string) =>
    setSelectedTools((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t])

  const handleSubmit = async () => {
    if (!name.trim() || !systemPrompt.trim()) {
      setError('Le nom et les instructions sont requis.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, emoji, color, category, systemPrompt, tools: selectedTools, isPublic }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push(`/agents/${data.agent.id}/chat`)
    } catch (e: any) {
      setError(e.message ?? 'Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  const toolsByCategory = AVAILABLE_TOOLS.reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = []
    acc[t.category].push(t)
    return acc
  }, {} as Record<string, typeof AVAILABLE_TOOLS>)

  return (
    <div className="min-h-screen bg-[#0e1128]">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <Link href="/agents" className="p-2 rounded-xl glass hover:bg-white/10 text-white/50 hover:text-white transition-all">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">Créer un agent IA</h1>
              <p className="text-white/40 text-sm">Personnalisez votre assistant en 3 étapes</p>
            </div>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2 mb-8">
            {[{ n: 1, label: 'Identité' }, { n: 2, label: 'Instructions' }, { n: 3, label: 'Outils' }].map(({ n, label }) => (
              <div key={n} className="flex items-center gap-2 flex-1">
                <button onClick={() => step > n && setStep(n)}
                  className={cn('w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                    step === n ? 'bg-brand-600 text-white' :
                    step > n ? 'bg-emerald-600 text-white cursor-pointer' :
                    'bg-white/10 text-white/30')}>
                  {step > n ? <Check className="w-3.5 h-3.5" /> : n}
                </button>
                <span className={cn('text-xs font-medium hidden sm:block', step >= n ? 'text-white/80' : 'text-white/30')}>{label}</span>
                {n < 3 && <div className={cn('flex-1 h-px', step > n ? 'bg-emerald-600/50' : 'bg-white/10')} />}
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400 mb-6">{error}</div>
          )}

          {/* Step 1: Identité */}
          {step === 1 && (
            <div className="glass-strong rounded-2xl p-6 border border-white/10 space-y-6">
              <h2 className="font-bold text-white flex items-center gap-2"><Bot className="w-4 h-4 text-brand-400" />Identité de l'agent</h2>

              {/* Preview */}
              <div className="flex items-center gap-4 p-4 glass rounded-xl">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-3xl shadow-lg`}>{emoji}</div>
                <div>
                  <p className="font-bold text-white">{name || 'Nom de l\'agent'}</p>
                  <p className="text-xs text-white/40">{description || 'Description de l\'agent…'}</p>
                  <p className="text-xs text-brand-400 mt-1">{category}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm text-white/60 mb-1.5">Nom de l'agent *</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="ex: Expert Marketing"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-brand-500/50 text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-white/60 mb-1.5">Description courte</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                    placeholder="Décrivez ce que fait cet agent en 1-2 phrases…" rows={2}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-brand-500/50 text-sm resize-none" />
                </div>
              </div>

              {/* Emoji */}
              <div>
                <label className="block text-sm text-white/60 mb-2">Emoji</label>
                <div className="flex flex-wrap gap-2">
                  {EMOJIS.map((e) => (
                    <button key={e} onClick={() => setEmoji(e)}
                      className={cn('w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all',
                        emoji === e ? 'bg-brand-600 scale-110' : 'glass hover:bg-white/10')}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm text-white/60 mb-2">Couleur</label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((c) => (
                    <button key={c} onClick={() => setColor(c)}
                      className={cn(`w-8 h-8 rounded-lg bg-gradient-to-br ${c} transition-all`,
                        color === c ? 'ring-2 ring-white scale-110' : 'hover:scale-105')}>
                      {color === c && <Check className="w-4 h-4 text-white mx-auto" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm text-white/60 mb-2">Catégorie</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button key={c} onClick={() => setCategory(c)}
                      className={cn('px-3 py-1.5 rounded-xl text-xs font-medium transition-all',
                        category === c ? 'bg-brand-600 text-white' : 'glass text-white/60 hover:text-white hover:bg-white/10')}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={() => setStep(2)} disabled={!name.trim()}
                className="btn-primary w-full">Suivant →</button>
            </div>
          )}

          {/* Step 2: Instructions */}
          {step === 2 && (
            <div className="glass-strong rounded-2xl p-6 border border-white/10 space-y-6">
              <h2 className="font-bold text-white flex items-center gap-2"><Wand2 className="w-4 h-4 text-brand-400" />Instructions de l'agent</h2>
              <p className="text-sm text-white/50">Ces instructions définissent le comportement, le style et les capacités de votre agent.</p>

              {/* Starters */}
              <div>
                <p className="text-xs text-white/40 mb-2">Partir d'un modèle :</p>
                <div className="flex flex-wrap gap-2">
                  {PROMPT_STARTERS.map((s) => (
                    <button key={s.label} onClick={() => setSystemPrompt(s.prompt)}
                      className="glass hover:bg-white/10 rounded-xl px-3 py-1.5 text-xs text-white/70 hover:text-white transition-all">
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1.5">Instructions système *</label>
                <textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Tu es [NOM], un expert en [DOMAINE]. Tu aides les utilisateurs avec [TÂCHES]…"
                  rows={10}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-brand-500/50 text-sm resize-none font-mono" />
                <p className="text-xs text-white/30 mt-1">{systemPrompt.length} caractères</p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1">← Retour</button>
                <button onClick={() => setStep(3)} disabled={!systemPrompt.trim()}
                  className="btn-primary flex-1">Suivant →</button>
              </div>
            </div>
          )}

          {/* Step 3: Outils + Publication */}
          {step === 3 && (
            <div className="glass-strong rounded-2xl p-6 border border-white/10 space-y-6">
              <h2 className="font-bold text-white flex items-center gap-2"><Sparkles className="w-4 h-4 text-brand-400" />Outils & Publication</h2>

              {/* Tools */}
              <div>
                <p className="text-sm text-white/60 mb-3">Activez les outils dont votre agent a besoin :</p>
                <div className="space-y-4">
                  {Object.entries(toolsByCategory).map(([cat, tools]) => (
                    <div key={cat}>
                      <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-2">{cat}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {tools.map((tool) => (
                          <button key={tool.name} onClick={() => toggleTool(tool.name)}
                            className={cn('glass rounded-xl p-3 text-left transition-all group',
                              selectedTools.includes(tool.name) ? 'border-brand-500/40 bg-brand-600/10' : 'hover:bg-white/8 border-transparent')}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">{tool.icon}</span>
                              <span className="text-xs font-medium text-white">{tool.label}</span>
                              {selectedTools.includes(tool.name) && <Check className="w-3 h-3 text-brand-400 ml-auto" />}
                            </div>
                            <p className="text-xs text-white/40 leading-tight">{tool.description}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visibility */}
              {session && (
                <div className="flex items-center justify-between p-4 glass rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-white">Partager publiquement</p>
                    <p className="text-xs text-white/40">Visible dans la bibliothèque par tous les utilisateurs</p>
                  </div>
                  <button onClick={() => setIsPublic(!isPublic)}
                    className={cn('w-12 h-6 rounded-full transition-all relative',
                      isPublic ? 'bg-brand-600' : 'bg-white/10')}>
                    <div className={cn('w-4 h-4 rounded-full bg-white absolute top-1 transition-all',
                      isPublic ? 'left-7' : 'left-1')} />
                  </button>
                </div>
              )}

              {!session && (
                <div className="p-4 glass rounded-xl border border-white/10">
                  <p className="text-sm text-white/60">
                    <Link href="/login" className="text-brand-400 hover:underline">Connectez-vous</Link> pour sauvegarder et partager vos agents.
                    Sans compte, l'agent sera disponible uniquement pour cette session.
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-secondary flex-1">← Retour</button>
                <button onClick={handleSubmit} disabled={loading}
                  className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {loading ? 'Création…' : (
                    <><Bot className="w-4 h-4" />Créer et utiliser</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
