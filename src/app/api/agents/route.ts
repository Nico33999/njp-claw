import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const mine = searchParams.get('mine') === 'true'
    const category = searchParams.get('category')

    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id

    const where: any = mine && userId
      ? { userId }
      : { OR: [{ isPublic: true }, { isSystem: true }] }

    if (category && category !== 'Tous') where.category = category

    const agents = await prisma.agent.findMany({
      where,
      orderBy: [{ isSystem: 'desc' }, { usageCount: 'desc' }, { createdAt: 'desc' }],
      include: { _count: { select: { chats: true } } },
    })

    return NextResponse.json({ agents })
  } catch {
    return NextResponse.json({ agents: [] })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id

    const body = await req.json()
    const { name, description, emoji, color, category, systemPrompt, tools, isPublic } = body

    if (!name?.trim() || !systemPrompt?.trim()) {
      return NextResponse.json({ error: 'Nom et instructions requis' }, { status: 400 })
    }

    const agent = await prisma.agent.create({
      data: {
        name: name.trim(),
        description: description?.trim() ?? '',
        emoji: emoji ?? '🤖',
        color: color ?? 'from-brand-600 to-accent-500',
        category: category ?? 'Général',
        systemPrompt: systemPrompt.trim(),
        tools: JSON.stringify(tools ?? []),
        isPublic: !!isPublic,
        isSystem: false,
        userId: userId ?? null,
      },
    })

    return NextResponse.json({ agent }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
