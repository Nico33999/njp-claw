export type ToolName =
  | 'datetime'
  | 'calculator'
  | 'textStats'
  | 'passwordGen'
  | 'jsonFormat'
  | 'base64'
  | 'urlEncode'
  | 'colorConvert'
  | 'unitConvert'
  | 'webSearch'

export interface Tool {
  name: ToolName
  label: string
  description: string
  icon: string
  category: string
}

export const AVAILABLE_TOOLS: Tool[] = [
  { name: 'datetime',     label: 'Date & Heure',        description: "Fournit la date et l'heure actuelles à l'agent", icon: '🕐', category: 'Utilitaires' },
  { name: 'calculator',   label: 'Calculatrice',         description: "Permet à l'agent de faire des calculs précis",   icon: '🧮', category: 'Utilitaires' },
  { name: 'textStats',    label: 'Analyse de texte',     description: "Compte mots, caractères, phrases",               icon: '📊', category: 'Texte' },
  { name: 'passwordGen',  label: 'Générateur mot de passe', description: "Génère des mots de passe sécurisés",          icon: '🔐', category: 'Sécurité' },
  { name: 'jsonFormat',   label: 'Formateur JSON',       description: "Formate et valide du JSON",                      icon: '{ }', category: 'Dev' },
  { name: 'base64',       label: 'Encodeur Base64',      description: "Encode/décode en Base64",                        icon: '🔤', category: 'Dev' },
  { name: 'urlEncode',    label: 'Encodeur URL',         description: "Encode/décode des URLs",                         icon: '🔗', category: 'Dev' },
  { name: 'colorConvert', label: 'Convertisseur couleur', description: "Convertit HEX ↔ RGB ↔ HSL",                    icon: '🎨', category: 'Design' },
  { name: 'unitConvert',  label: 'Convertisseur unités', description: "Convertit kg/lb, km/miles, °C/°F…",              icon: '📐', category: 'Utilitaires' },
  { name: 'webSearch',    label: 'Recherche web',        description: "Permet à l'agent de simuler une recherche",      icon: '🔍', category: 'Internet' },
]

export function executeTools(toolNames: ToolName[]): string {
  if (!toolNames.length) return ''
  const results: string[] = []

  for (const tool of toolNames) {
    switch (tool) {
      case 'datetime': {
        const now = new Date()
        results.push(`[datetime] Date et heure actuelles : ${now.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}, ${now.toLocaleTimeString('fr-FR')}`)
        break
      }
      case 'calculator':
        results.push(`[calculator] Outil disponible : tu peux effectuer des calculs mathématiques précis. Montre tes calculs étape par étape.`)
        break
      case 'textStats':
        results.push(`[textStats] Outil disponible : tu peux analyser des textes et fournir des statistiques (mots, caractères, lisibilité).`)
        break
      case 'passwordGen':
        results.push(`[passwordGen] Outil disponible : génère des mots de passe sécurisés selon les critères demandés (longueur, majuscules, chiffres, symboles).`)
        break
      case 'jsonFormat':
        results.push(`[jsonFormat] Outil disponible : formate, valide et explique des structures JSON.`)
        break
      case 'base64':
        results.push(`[base64] Outil disponible : encode et décode des chaînes en Base64.`)
        break
      case 'urlEncode':
        results.push(`[urlEncode] Outil disponible : encode et décode des URLs (percent-encoding).`)
        break
      case 'colorConvert':
        results.push(`[colorConvert] Outil disponible : convertis des couleurs entre HEX, RGB et HSL.`)
        break
      case 'unitConvert':
        results.push(`[unitConvert] Outil disponible : convertis des unités (masse, longueur, température, volume, vitesse).`)
        break
      case 'webSearch':
        results.push(`[webSearch] Outil disponible : tu peux indiquer ce que tu rechercherais sur internet et fournir les informations que tu connais sur le sujet.`)
        break
    }
  }

  return results.length ? `\n\n[OUTILS DISPONIBLES]\n${results.join('\n')}` : ''
}
