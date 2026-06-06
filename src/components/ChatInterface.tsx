'use client'
// ... keep imports

export function ChatInterface({ ...props }: ChatProps) {
  // ... existing logic

  return (
    <div className="flex flex-col h-full bg-white text-zinc-900">
      {/* Top bar - clean minimal */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-zinc-200 flex-shrink-0 bg-white">
        <div className="flex items-center gap-3">
          <div className="font-semibold text-xl tracking-tight">NJP CLAW</div>
          <div className="px-3 py-1 text-xs rounded-full bg-zinc-100 text-zinc-600">NJP Builder</div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Mode toggles, preview button, etc. - keep clean */}
          <button 
            onClick={() => setShowPreview(!showPreview)}
            className="px-4 py-1.5 text-sm rounded-xl border border-zinc-200 hover:bg-zinc-50 transition-colors flex items-center gap-2"
          >
            {showPreview ? 'Masquer Preview' : 'Afficher Preview'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Chat area - clean */}
        <div className={cn('flex flex-col flex-1 min-w-0', showPreview && 'border-r border-zinc-200')}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 bg-white">
            {/* messages rendering with clean bubbles */}
          </div>

          {/* Input - very clean */}
          <div className="flex-shrink-0 border-t border-zinc-200 px-6 py-4 bg-white">
            <div className="max-w-3xl mx-auto">
              <form onSubmit={handleSubmit} className="flex gap-3">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Décrivez ce que vous voulez construire..."
                  className="flex-1 px-5 py-3.5 rounded-2xl border border-zinc-200 text-base placeholder:text-zinc-400 focus:border-zinc-400"
                />
                <button 
                  type="submit"
                  className="px-8 py-3.5 bg-zinc-900 text-white rounded-2xl font-medium hover:bg-black transition-colors"
                >
                  Envoyer
                </button>
              </form>
              <div className="text-center text-[10px] text-zinc-400 mt-2">
                NJP Builder • Simple • Puissant • Performant
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview - clean white */}
        {showPreview && (
          <div className="hidden lg:flex flex-col w-1/2 min-w-[420px] bg-white preview-pane">
            <div className="px-6 py-3 border-b border-zinc-200 flex items-center justify-between">
              <div className="font-semibold text-sm tracking-tight">Live Preview</div>
              <div className="text-xs px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full">En temps réel</div>
            </div>
            <div className="flex-1 p-4 overflow-hidden">
              <LivePreview code={previewCode} language={previewLang} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
