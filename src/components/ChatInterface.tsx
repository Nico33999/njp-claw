'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  Send, Bot, User, Copy, Check, Trash2, PlusCircle,
  AlertCircle, Lock, Zap, Lightbulb, Code2, Settings,
  Download, BookOpen, Globe, FileText, Mail, Pencil,
  BarChart, Wand2, RefreshCw, Eye, EyeOff
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { LivePreview } from './LivePreview'

// ... (keep all existing code until the return statement)

// In the return, add split view for preview

export function ChatInterface({ initialChatId, defaultMode, agentId, agentName, agentEmoji, agentColor, initialMessage }: ChatProps) {
  // ... existing state and logic

  const [showPreview, setShowPreview] = useState(true)
  const [previewCode, setPreviewCode] = useState('')
  const [previewLang, setPreviewLang] = useState('html')

  // Auto-extract code from last assistant message for preview
  useEffect(() => {
    const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant')
    if (lastAssistant) {
      const codeMatch = lastAssistant.content.match(/```(jsx|tsx|html|react)?\n([\s\S]*?)```/)
      if (codeMatch) {
        setPreviewCode(codeMatch[2].trim())
        setPreviewLang(codeMatch[1] || 'html')
      }
    }
  }, [messages])

  // ... rest of existing code

  return (
    <div className="flex flex-col h-full bg-[#0e1128]">
      {/* Top bar - add preview toggle */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 flex-shrink-0">
        {/* ... existing top bar content ... */}
        <div className="flex items-center gap-2">
          {/* Existing buttons */}
          <button 
            onClick={() => setShowPreview(!showPreview)}
            className={cn('p-1.5 rounded-lg text-xs transition-colors flex items-center gap-1.5',
              showPreview ? 'bg-brand-600/30 text-brand-300' : 'text-white/30 hover:text-white/70 hover:bg-white/5')}
          >
            {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {showPreview ? 'Masquer Preview' : 'Live Preview'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Chat area */}
        <div className={cn('flex flex-col flex-1 min-w-0', showPreview && 'lg:w-1/2 border-r border-white/5')}>
          {/* Messages area - existing */}
          <div className="flex-1 overflow-y-auto">
            {/* ... existing messages rendering ... */}
          </div>

          {/* Input area - existing */}
          <div className="flex-shrink-0 px-4 pb-4 pt-2">
            {/* ... existing input form ... */}
          </div>
        </div>

        {/* Live Preview Panel (Floot-like) */}
        {showPreview && (
          <div className="hidden lg:flex flex-col w-1/2 min-w-[400px] bg-[#0a0d1f]">
            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-brand-400" />
                <span className="font-semibold text-sm">Live Preview</span>
                <span className="text-[10px] px-2 py-0.5 bg-brand-500/20 text-brand-300 rounded">Floot-style</span>
              </div>
              <button 
                onClick={() => {
                  // Re-trigger preview from last code
                  const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant')
                  if (lastAssistant) {
                    const codeMatch = lastAssistant.content.match(/```(jsx|tsx|html|react)?\n([\s\S]*?)```/)
                    if (codeMatch) {
                      setPreviewCode(codeMatch[2].trim())
                    }
                  }
                }}
                className="text-xs text-white/40 hover:text-white/70 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Rafraîchir
              </button>
            </div>
            
            <div className="flex-1 p-3 overflow-hidden">
              <LivePreview code={previewCode} language={previewLang} />
            </div>
            
            <div className="px-4 py-2 text-[10px] text-white/30 border-t border-white/5">
              Le preview se met à jour automatiquement quand l\'IA génère du code. Pour un preview React complet, exportez le projet.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
