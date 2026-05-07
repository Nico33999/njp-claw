import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'

export const metadata: Metadata = {
  title: 'NJP CLAW — IA Conversationnelle Propulsée par Meta AI',
  description: 'Accédez à Meta AI gratuitement, sans inscription. Passez à Pro ou Ultimate pour débloquer des modèles plus puissants et des capacités illimitées.',
  keywords: ['NJP CLAW', 'Meta AI', 'Llama', 'IA', 'chatbot', 'intelligence artificielle'],
  openGraph: {
    title: 'NJP CLAW',
    description: 'IA Conversationnelle Propulsée par Meta AI',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <body className="antialiased min-h-screen bg-[#0e1128]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
