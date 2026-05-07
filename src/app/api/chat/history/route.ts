import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id

  if (!userId) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const chats = await prisma.chat.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    take: 50,
    include: { messages: { take: 1, orderBy: { createdAt: 'desc' } } },
  })

  return NextResponse.json({ chats })
}
