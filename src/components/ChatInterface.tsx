// In the useEffect that extracts preview code, improve it:

useEffect(() => {
  const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant')
  if (lastAssistant?.content) {
    // Better regex for code blocks
    const codeMatch = lastAssistant.content.match(/```(html|jsx|tsx|javascript|js)?\s*\n?([\s\S]*?)```/i)
    
    if (codeMatch) {
      const lang = (codeMatch[1] || 'html').toLowerCase()
      const extractedCode = codeMatch[2].trim()
      
      setPreviewCode(extractedCode)
      setPreviewLang(lang === 'javascript' || lang === 'js' ? 'html' : lang)
      
      // Auto-show preview when code is detected
      if (!showPreview) {
        setShowPreview(true)
      }
    }
  }
}, [messages])

// Also improve the top bar to always show the preview toggle when in builder mode or when previewCode exists
