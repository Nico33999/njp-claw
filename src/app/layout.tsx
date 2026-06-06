import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'

export const metadata: Metadata = {
  title: 'NJP CLAW — Assistant IA & Builder de sites',
  description: 'Posez n\'importe quelle question, créez des sites web en direct, construisez des applications — sans inscription, gratuitement.',
  keywords: ['NJP CLAW', 'IA', 'chatbot', 'builder', 'site web', 'intelligence artificielle'],
  openGraph: {
    title: 'NJP CLAW',
    description: 'Assistant IA & Builder de sites en direct',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="antialiased min-h-screen bg-zinc-50">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
