import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/Navbar'
import { DashboardClient } from '@/components/DashboardClient'

export const metadata = { title: 'Dashboard — NJP CLAW' }

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login?redirect=/dashboard')

  const userId = (session.user as any).id
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, plan: true, messagesUsed: true, messagesLimit: true, createdAt: true },
  })

  const chatCount = await prisma.chat.count({ where: { userId } })
  const msgCount = await prisma.message.count({ where: { chat: { userId } } })

  return (
    <div className="min-h-screen bg-[#0e1128]">
      <Navbar />
      <DashboardClient user={user as any} stats={{ chatCount, msgCount }} />
    </div>
  )
}
