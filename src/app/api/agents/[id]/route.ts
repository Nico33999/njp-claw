import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const agent = await prisma.agent.findUnique({
      where: { id: params.id },
      include: { _count: { select: { chats: true } } },
    })
    if (!agent) return NextResponse.json({ error: 'Agent introuvable' }, { status: 404 })
    return NextResponse.json({ agent })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id

    const agent = await prisma.agent.findUnique({ where: { id: params.id } })
    if (!agent) return NextResponse.json({ error: 'Agent introuvable' }, { status: 404 })
    if (agent.isSystem || agent.userId !== userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const body = await req.json()
    const updated = await prisma.agent.update({
      where: { id: params.id },
      data: {
        name: body.name?.trim() ?? agent.name,
        description: body.description?.trim() ?? agent.description,
        emoji: body.emoji ?? agent.emoji,
        color: body.color ?? agent.color,
        category: body.category ?? agent.category,
        systemPrompt: body.systemPrompt?.trim() ?? agent.systemPrompt,
        tools: body.tools ? JSON.stringify(body.tools) : agent.tools,
        isPublic: body.isPublic !== undefined ? body.isPublic : agent.isPublic,
      },
    })
    return NextResponse.json({ agent: updated })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id

    const agent = await prisma.agent.findUnique({ where: { id: params.id } })
    if (!agent) return NextResponse.json({ error: 'Agent introuvable' }, { status: 404 })
    if (agent.isSystem || agent.userId !== userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    await prisma.agent.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
