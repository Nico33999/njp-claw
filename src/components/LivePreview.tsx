'use client'
import { useMemo, useState, useRef, useEffect } from 'react'
import { Monitor, Code2, RefreshCw, ExternalLink, Copy, Check } from 'lucide-react'

interface LivePreviewProps {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
  streaming?: boolean
}

type Tab = 'preview' | 'code'

function extractLatestCode(messages: LivePreviewProps['messages']): { html: string; lang: string } | null {
  // Search from most recent assistant message backwards
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i]
    if (msg.role !== 'assistant') continue

    // Match ```html ... ``` first
    const htmlMatch = msg.content.match(/```html\s*\n([\s\S]*?)```/)
    if (htmlMatch) return { html: htmlMatch[1].trim(), lang: 'html' }

    // Then try tsx/jsx
    const reactMatch = msg.content.match(/```(?:tsx|jsx|react)\s*\n([\s\S]*?)```/)
    if (reactMatch) return { html: reactMatch[1].trim(), lang: 'react' }

    // Then plain css+html (no lang tag but looks like html)
    const unknownMatch = msg.content.match(/```\s*\n(<!DOCTYPE html[\s\S]*?)```/)
    if (unknownMatch) return { html: unknownMatch[1].trim(), lang: 'html' }
  }
  return null
}

function buildSrcdoc(htmlCode: string): string {
  // If it's already a full document, inject Tailwind if not present
  if (htmlCode.includes('<!DOCTYPE') || htmlCode.includes('<html')) {
    if (!htmlCode.includes('tailwindcss.com') && !htmlCode.includes('tailwind')) {
      return htmlCode.replace(
        '</head>',
        '<script src="https://cdn.tailwindcss.com"></script>\n</head>'
      )
    }
    return htmlCode
  }

  // Otherwise wrap in a full document
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<script src="https://cdn.tailwindcss.com"></script>
<style>
  body { margin: 0; padding: 0; font-family: system-ui, sans-serif; }
</style>
</head>
<body>
${htmlCode}
</body>
</html>`
}

export function LivePreview({ messages, streaming }: LivePreviewProps) {
  const [tab, setTab] = useState<Tab>('preview')
  const [refreshKey, setRefreshKey] = useState(0)
  const [copied, setCopied] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const extracted = useMemo(() => extractLatestCode(messages), [messages])
  const srcdoc = useMemo(() => extracted ? buildSrcdoc(extracted.html) : '', [extracted])

  // Auto-refresh iframe when content changes (not while streaming to avoid flicker)
  useEffect(() => {
    if (!streaming && extracted) {
      setRefreshKey((k) => k + 1)
    }
  }, [extracted?.html, streaming])

  const openInNewTab = () => {
    if (!srcdoc) return
    const blob = new Blob([srcdoc], { type: 'text/html' })
    window.open(URL.createObjectURL(blob), '_blank')
  }

  const copyCode = () => {
    if (!extracted) return
    navigator.clipboard.writeText(extracted.html)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!extracted && !streaming) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
        <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center">
          <Monitor className="w-6 h-6 text-zinc-400" />
        </div>
        <div>
          <p className="font-semibold text-zinc-700 mb-1">Live Preview</p>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Demandez à NJP Builder de créer un site ou une interface — le résultat apparaîtra ici en direct.
          </p>
        </div>
        <div className="flex flex-col gap-2 w-full max-w-xs text-left">
          {[
            'Crée un site landing page moderne',
            'Génère une page de connexion',
            'Fais un dashboard avec des stats',
          ].map((ex) => (
            <div key={ex} className="text-xs text-zinc-500 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2">
              "{ex}"
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-200 bg-white flex-shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setTab('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              tab === 'preview' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            Aperçu
          </button>
          <button
            onClick={() => setTab('code')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              tab === 'code' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Code
          </button>
        </div>
        <div className="flex items-center gap-1">
          {streaming && (
            <span className="flex items-center gap-1 text-xs text-brand-600 mr-1">
              <RefreshCw className="w-3 h-3 animate-spin" />
              En cours…
            </span>
          )}
          {tab === 'code' && extracted && (
            <button onClick={copyCode} className="btn-ghost text-xs py-1 px-2">
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copié' : 'Copier'}
            </button>
          )}
          <button onClick={() => setRefreshKey((k) => k + 1)} className="btn-ghost text-xs py-1 px-2" title="Rafraîchir">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button onClick={openInNewTab} className="btn-ghost text-xs py-1 px-2" title="Ouvrir dans un nouvel onglet">
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden bg-white">
        {tab === 'preview' ? (
          <iframe
            key={refreshKey}
            ref={iframeRef}
            srcDoc={srcdoc}
            className="preview-frame"
            sandbox="allow-scripts allow-same-origin"
            title="Live Preview"
          />
        ) : (
          <div className="h-full overflow-auto bg-zinc-950 p-4">
            <pre className="text-xs text-zinc-300 font-mono leading-relaxed whitespace-pre-wrap break-words">
              {extracted?.html ?? ''}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
