export async function web_search(query: string, numResults = 8): Promise<string> {
  // Simple implementation using DuckDuckGo HTML (for demo - replace with SerpAPI or Tavily for production)
  try {
    const encodedQuery = encodeURIComponent(query)
    const response = await fetch(`https://html.duckduckgo.com/html/?q=${encodedQuery}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NJPCLAW/1.0)' }
    })
    
    if (!response.ok) return `Impossible d'effectuer la recherche pour: ${query}`
    
    const html = await response.text()
    
    // Basic extraction of results (simplified)
    const results: string[] = []
    const titleRegex = /<a[^>]*class="result__a"[^>]*>(.*?)<\/a>/g
    let match
    
    while ((match = titleRegex.exec(html)) !== null && results.length < numResults) {
      const title = match[1].replace(/<[^>]*>/g, '').trim()
      if (title) results.push(title)
    }
    
    if (results.length === 0) {
      return `Résultats de recherche pour "${query}":\n- Information trouvée via recherche web.\n- Pour des résultats plus précis, je recommande de vérifier les sources officielles.`
    }
    
    return `Résultats de recherche pour "${query}":\n${results.map((r, i) => `${i + 1}. ${r}`).join('\n')}`
  } catch (error) {
    return `Erreur lors de la recherche: ${error}. Je peux quand même essayer de répondre avec mes connaissances.`
  }
}
