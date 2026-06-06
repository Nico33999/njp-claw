'use client';

import React, { useEffect, useState } from 'react';

interface LivePreviewProps {
  code: string;
  language?: string;
}

export function LivePreview({ code, language = 'html' }: LivePreviewProps) {
  const [previewHtml, setPreviewHtml] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!code) {
      setPreviewHtml('<div class="p-8 text-center text-gray-400">Le preview apparaîtra ici quand l\'IA générera du code...</div>');
      return;
    }

    try {
      if (language === 'html' || code.includes('<html') || code.includes('<!DOCTYPE')) {
        // Direct HTML preview
        setPreviewHtml(code);
      } else if (language === 'jsx' || language === 'tsx' || code.includes('import React') || code.includes('export default')) {
        // For React code, create a simple HTML wrapper with Tailwind
        const wrappedHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdn.tailwindcss.com"></script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; }
              .preview-container { max-width: 100%; margin: 0 auto; }
            </style>
          </head>
          <body class="bg-gray-50 p-4">
            <div class="preview-container">
              <div id="root"></div>
            </div>
            <script>
              // Simple React-like rendering for demo
              // In production, use Sandpack or iframe with compiled code
              const root = document.getElementById('root');
              root.innerHTML = 
                <div class="p-8 bg-white rounded-xl shadow-sm border">
                  <div class="text-center">
                    <i class="fas fa-code text-4xl text-brand-500 mb-4"></i>
                    <h3 class="text-xl font-semibold mb-2">Preview React</h3>
                    <p class="text-gray-500 text-sm mb-4">Le code React est généré. Pour un preview complet, utilisez le mode Export ou intégrez Sandpack.</p>
                    <pre class="text-left bg-gray-900 text-green-400 p-4 rounded text-xs overflow-auto max-h-96"><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
                  </div>
                </div>
              `;
            </script>
          </body>
          </html>
        `;
        setPreviewHtml(wrappedHtml);
      } else {
        // Fallback
        setPreviewHtml(`<pre class="p-4 bg-gray-900 text-green-400 rounded"><code>${code.replace(/</g, '&lt;')}</code></pre>`);
      }
      setError('');
    } catch (e: any) {
      setError('Erreur lors de la génération du preview: ' + e.message);
      setPreviewHtml('');
    }
  }, [code, language]);

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-red-50 text-red-600 p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-white rounded-xl overflow-hidden border border-white/10 shadow-inner">
      <div className="bg-gray-100 px-4 py-2 flex items-center justify-between text-xs text-gray-500 border-b">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live Preview</span>
        </div>
        <span className="text-[10px]">Floot-like • Auto-refresh</span>
      </div>
      <iframe
        srcDoc={previewHtml}
        className="w-full h-[calc(100%-40px)] border-0"
        title="Live Preview"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}
