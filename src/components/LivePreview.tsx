'use client';

import React, { useEffect, useState } from 'react';
import { Sandpack } from '@codesandbox/sandpack-react';

interface LivePreviewProps {
  code: string;
  language?: string;
}

export function LivePreview({ code, language = 'html' }: LivePreviewProps) {
  const [previewHtml, setPreviewHtml] = useState('');
  const [isReact, setIsReact] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!code || code.trim().length === 0) {
      setPreviewHtml('<div class="p-8 text-center text-gray-400">Le preview apparaîtra ici quand l\'IA générera du code...</div>');
      setIsReact(false);
      return;
    }

    const isReactCode = language === 'jsx' || language === 'tsx' || 
                        code.includes('import React') || 
                        code.includes('from "react"') ||
                        code.includes('export default function') ||
                        code.includes('const ') && code.includes('= () =>');

    setIsReact(isReactCode);

    if (!isReactCode) {
      // HTML + Tailwind preview (fast & direct)
      try {
        let html = code;
        
        // If it's just a component, wrap it in a full HTML page
        if (!code.includes('<!DOCTYPE') && !code.includes('<html')) {
          html = `
            <!DOCTYPE html>
            <html lang="fr">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <script src="https://cdn.tailwindcss.com"></script>
              <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
              <style>
                body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
                .preview-wrapper { max-width: 1200px; margin: 0 auto; }
              </style>
            </head>
            <body class="bg-zinc-950 text-white p-6">
              <div class="preview-wrapper">
                ${code}
              </div>
              <script>
                // Tailwind script
                function initializeTailwind() {
                  document.documentElement.style.setProperty('--accent', '#3b82f6');
                }
                window.onload = initializeTailwind;
              </script>
            </body>
            </html>
          `;
        }
        setPreviewHtml(html);
        setError('');
      } catch (e: any) {
        setError('Erreur preview HTML: ' + e.message);
      }
    }
  }, [code, language]);

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-red-950/50 text-red-400 p-6 rounded-xl">
        <div>
          <p className="font-medium mb-2">Erreur de preview</p>
          <p className="text-sm opacity-70">{error}</p>
        </div>
      </div>
    );
  }

  // React preview with Sandpack (best experience)
  if (isReact && code) {
    return (
      <div className="h-full w-full rounded-xl overflow-hidden border border-white/10 bg-[#0a0d1f]">
        <div className="bg-zinc-900 px-4 py-2 flex items-center justify-between text-xs border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="font-medium text-emerald-400">Live React Preview</span>
            <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded">Sandpack • Interactif</span>
          </div>
          <span className="text-white/40 text-[10px]">Floot-style</span>
        </div>
        
        <div className="h-[calc(100%-36px)]">
          <Sandpack
            template="react"
            theme="dark"
            options={{
              showNavigator: false,
              showTabs: false,
              showLineNumbers: true,
              showInlineErrors: true,
              wrapContent: true,
              editorHeight: '100%',
            }}
            files={{
              '/App.tsx': code,
              '/styles.css': `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
              
              :root {
                --font-sans: 'Inter', system-ui, sans-serif;
              }
              
              body {
                font-family: var(--font-sans);
              }
              
              .card {
                background: #18181b;
                border: 1px solid #27272a;
                border-radius: 12px;
              }`,
            }}
            customSetup={{
              dependencies: {
                "lucide-react": "latest",
                "framer-motion": "latest",
                "clsx": "latest",
                "tailwind-merge": "latest",
              },
            }}
          />
        </div>
      </div>
    );
  }

  // HTML preview
  return (
    <div className="h-full w-full bg-white rounded-xl overflow-hidden border border-white/10 shadow-inner flex flex-col">
      <div className="bg-zinc-900 px-4 py-2 flex items-center justify-between text-xs text-white/60 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span>Live HTML Preview</span>
        </div>
        <span className="text-[10px]">Tailwind • Instant</span>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <iframe
          srcDoc={previewHtml}
          className="w-full h-full border-0"
          title="Live Preview"
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      </div>
    </div>
  );
}
